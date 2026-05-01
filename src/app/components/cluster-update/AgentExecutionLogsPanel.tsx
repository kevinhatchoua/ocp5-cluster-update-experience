import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Button,
  Content,
  Flex,
  Switch,
  Title,
} from "@patternfly/react-core";
import { X } from "@/lib/pfIcons";
import { ClusterUpdateAiImportantPrivacyPanelNotice } from "../lightspeed/LightspeedLegalCopy";

/** Simulated agent analysis lines (tool_use / thinking), aligned with console-style agent output. */
const AGENT_ANALYSIS_LINES: string[] = [
  "2026-04-15T17:28:02.184231891Z [sdk:analysis] thinking: Need ClusterVersion, channel, and PLCC data before proposing target.",
  '2026-04-15T17:28:14.552109004Z [sdk:analysis] tool_use: Bash({"cmd":"curl -sSk https://api.openshift.com/api/upgrades_info/v1/graph?channel=fast-5.1"})',
  "2026-04-15T17:28:18.901442221Z [sdk:analysis] thinking: Parsing Cincinnati graph for edges into 5.1.10.",
  '2026-04-15T17:29:44.112883554Z [sdk:analysis] tool_use: Bash({"cmd":"oc get clusterversion -o json"})',
  "2026-04-15T17:30:16.124654354Z [sdk:analysis] thinking: Now I have all the data I need. Checking container-security-operator PLCC entry for the target payload.",
  '2026-04-15T17:30:42.008221441Z [sdk:analysis] tool_use: Bash({"cmd":"oc get operators -A -o json | python3 -c \"import sys,json;…\"" })',
  "2026-04-15T17:31:05.661098773Z [sdk:analysis] thinking: Compatibility summary built; emitting proposed plan with maintenance window and risk score.",
];

/**
 * Platform cluster operator reconcile order (no run-level grouping) — must complete before catalog operators in logs.
 * Names align with OpenShift clusteroperator resources.
 */
const PLATFORM_CLUSTER_OPERATORS = [
  "config-operator",
  "etcd",
  "kube-apiserver",
  "kube-controller-manager",
  "kube-scheduler",
  "cloud-controller-manager",
  "control-plane-machine-set",
  "machine-api",
  "baremetal",
  "cloud-credential",
  "authentication",
  "cluster-autoscaler",
  "csi-snapshot-controller",
  "image-registry",
  "ingress",
  "kube-storage-version-migrator",
  "machine-approver",
  "monitoring",
  "node-tuning",
  "openshift-apiserver",
  "openshift-controller-manager",
  "openshift-samples",
  "storage",
  "console",
  "insights",
  "operator-lifecycle-manager",
  "operator-lifecycle-manager-catalog",
  "operator-lifecycle-manager-packageserver",
  "marketplace",
  "service-ca",
  "network",
  "dns",
  "machine-config",
] as const;

function formatElapsedSec(totalSec: number): string {
  const mm = Math.floor(totalSec / 60);
  const ss = totalSec % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function buildClusterProgressLines(): { ts: string; level: string; msg: string }[] {
  const rows: { ts: string; level: string; msg: string }[] = [];
  let elapsed = 1;

  const push = (level: string, msg: string, stepSec = 2) => {
    rows.push({ ts: formatElapsedSec(elapsed), level, msg });
    elapsed += stepSec;
  };

  push("info", "ClusterVersion operator initiated update to {version}", 1);
  push("info", "Setting desiredUpdate.version={version}, channel=fast-5.1", 1);
  push("info", "Reconciling ClusterVersion: status=Progressing", 2);
  push("info", "Downloading release image quay.io/openshift-release-dev/ocp-release:{version}-x86_64", 7);
  push("info", "Release image verified. Signature OK.", 2);
  push("info", "Beginning cluster operator updates (platform payload order; catalog operators follow).", 2);

  for (const name of PLATFORM_CLUSTER_OPERATORS) {
    push("info", `Updating cluster operator: ${name}`, 2);
    push("info", `Cluster operator ${name}: reconcile complete`, 1);
  }

  push(
    "info",
    "All platform cluster operators reconciled. Beginning catalog operator and subscription updates…",
    3,
  );

  push("info", "Updating catalog operator: Abot Operator-v3.0.0 → 3.2.5", 2);
  push("info", "Updating catalog operator: Airflow Helm Operator → 3.5", 2);
  push("info", "Updating catalog operator: Ansible Automation Platform → 3.25", 2);
  push("warn", "Catalog operator Bare Metal Event Relay: waiting for dependency resolution", 2);
  push("info", "Catalog operator Abot Operator-v3.0.0 update complete", 2);
  push("info", "Catalog operator Airflow Helm Operator update complete", 2);
  push("info", "Catalog operator Ansible Automation Platform update complete", 2);
  push("info", "Catalog operator Bare Metal Event Relay: dependency resolved; update complete", 2);

  push("info", "Beginning worker node updates…", 3);
  push("info", "Cordoning worker-east-1. Draining pods…", 3);
  push("info", "Worker worker-east-1 drained. Applying update…", 4);
  push("info", "Worker worker-east-1 rebooting with new OS image", 5);
  push("info", "Worker worker-east-1 update complete. Uncordoning.", 3);
  push("info", "Node worker-east-1 Ready. Continuing worker pool rollout…", 2);
  push("info", "Cordoning worker-east-2. Draining pods…", 3);
  push("info", "Worker worker-east-2 drained. Applying update…", 4);
  push("info", "Worker worker-east-2 rebooting with new OS image", 5);
  push("info", "Worker worker-east-2 update complete. Uncordoning.", 3);
  push("info", "MachineConfigPool worker: all nodes updated and Ready", 2);
  push("info", "Cluster operators: Available=True, Progressing=False", 3);
  push("info", "ClusterVersion: status=Available; desired version {version} reconciled", 3);
  push("info", "Cluster update finished successfully. OpenShift {version} is active.", 3);

  return rows;
}

const CLUSTER_PROGRESS_LINES: { ts: string; level: string; msg: string }[] = buildClusterProgressLines();

/** Last N lines declare full cluster success — withheld until UI progress catches up (in-progress page). */
export const CLUSTER_PROGRESS_FINALE_LINE_COUNT = 4;

export const CLUSTER_PROGRESS_BODY_LINES = CLUSTER_PROGRESS_LINES.slice(0, -CLUSTER_PROGRESS_FINALE_LINE_COUNT);

const CLUSTER_PROGRESS_FINALE_LINES = CLUSTER_PROGRESS_LINES.slice(-CLUSTER_PROGRESS_FINALE_LINE_COUNT);

/** Rotating activity lines while cluster UI is still catching up (inserted after body, before finale). */
const ACTIVITY_PULSE_MESSAGES = [
  "Cluster operators reconciling; operands progressing…",
  "MachineConfigPools and DaemonSets still rolling…",
  "Monitoring ClusterVersion Progressing status…",
  "Worker pools: cordon/drain cycle in progress…",
  "Verifying API availability and etcd quorum…",
  "Catalog subscriptions reconciling after platform sync…",
];

function formatActivityTs(holdIndex: number): string {
  const baseSec = 6 * 60 + 49;
  const t = baseSec + holdIndex;
  const mm = Math.floor(t / 60);
  const ss = t % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function activityPulseEntry(holdIndex: number): { ts: string; level: string; msg: string } {
  return {
    ts: formatActivityTs(holdIndex),
    level: "info",
    msg: ACTIVITY_PULSE_MESSAGES[holdIndex % ACTIVITY_PULSE_MESSAGES.length],
  };
}

export interface AgentExecutionLogsPanelProps {
  version: string;
  onClose: () => void;
  /** When false, panel is not mounted (parent controls visibility). */
  isOpen: boolean;
  /**
   * When false, finale lines stay queued until the cluster UI reports full completion (all phases done).
   * Default true — full stream for update-plan / approvals.
   */
  releaseCompletionLogLines?: boolean;
}

/**
 * Slide-over panel: agent analysis (tool_use / thinking) plus cluster update progress lines.
 * Answers “how do I see agent execution details?” from update flows.
 */
export default function AgentExecutionLogsPanel({
  version,
  onClose,
  isOpen,
  releaseCompletionLogLines = true,
}: AgentExecutionLogsPanelProps) {
  const agentLen = AGENT_ANALYSIS_LINES.length;
  const bodyLen = CLUSTER_PROGRESS_BODY_LINES.length;
  const finaleLen = CLUSTER_PROGRESS_FINALE_LINE_COUNT;

  const [visibleCount, setVisibleCount] = useState(1);
  const [autoScroll, setAutoScroll] = useState(true);
  /** When panel opens on in-progress page, stream uses body + rolling activity lines until UI completes. */
  const [useHoldLayout, setUseHoldLayout] = useState(false);
  /** Frozen count of activity lines once cluster UI reports complete (hold mode). */
  const pulseFrozenRef = useRef<number | null>(null);
  const prevIsOpenRef = useRef(false);

  const autoScrollRef = useRef(autoScroll);
  autoScrollRef.current = autoScroll;
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logScrollRef = useRef<HTMLDivElement>(null);
  const logContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setVisibleCount(1);
      pulseFrozenRef.current = null;
      setUseHoldLayout(!releaseCompletionLogLines);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, releaseCompletionLogLines]);

  const streamEndVisible = useMemo(() => {
    if (!useHoldLayout) {
      return agentLen + CLUSTER_PROGRESS_LINES.length;
    }
    if (!releaseCompletionLogLines) {
      return Number.MAX_SAFE_INTEGER;
    }
    if (pulseFrozenRef.current === null) {
      const slots = Math.max(0, visibleCount - agentLen);
      pulseFrozenRef.current = Math.max(0, slots - bodyLen);
    }
    return agentLen + bodyLen + (pulseFrozenRef.current ?? 0) + finaleLen;
  }, [useHoldLayout, releaseCompletionLogLines, visibleCount, agentLen, bodyLen, finaleLen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    if (visibleCount >= streamEndVisible) return;
    const timer = setTimeout(() => setVisibleCount((c) => Math.min(streamEndVisible, c + 1)), 420);
    return () => clearTimeout(timer);
  }, [isOpen, visibleCount, streamEndVisible]);

  /** Layout phase: scrollHeight matches new DOM before paint (effect ran too late for “live” stream). */
  useLayoutEffect(() => {
    if (!isOpen || !autoScroll) return;
    const el = logScrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    logsEndRef.current?.scrollIntoView({ block: "end", behavior: "auto" });
  }, [visibleCount, isOpen, autoScroll]);

  /** Content height grows inside a fixed-height overflow:auto shell — border box of the shell does not resize, so observe inner column and re-stick to bottom when it grows (fonts, streaming lines). */
  useEffect(() => {
    if (!isOpen || typeof ResizeObserver === "undefined") return;
    const inner = logContentRef.current;
    const outer = logScrollRef.current;
    if (!inner || !outer) return;
    const ro = new ResizeObserver(() => {
      if (!autoScrollRef.current) return;
      outer.scrollTop = outer.scrollHeight;
    });
    ro.observe(inner);
    return () => ro.disconnect();
  }, [isOpen]);

  const clusterFmt = (msg: string) => msg.replace(/\{version\}/g, version);

  const agentSlice = AGENT_ANALYSIS_LINES.slice(0, Math.min(visibleCount, agentLen));

  const clusterSlice = useMemo(() => {
    const clusterIdxStart = Math.max(0, visibleCount - agentLen);
    if (!useHoldLayout) {
      return CLUSTER_PROGRESS_LINES.slice(0, clusterIdxStart).map((e) => ({
        ...e,
        msg: clusterFmt(e.msg),
      }));
    }

    const rows: { ts: string; level: string; msg: string }[] = [];
    const bodyShown = Math.min(clusterIdxStart, bodyLen);
    rows.push(
      ...CLUSTER_PROGRESS_BODY_LINES.slice(0, bodyShown).map((e) => ({
        ...e,
        msg: clusterFmt(e.msg),
      })),
    );

    let rem = clusterIdxStart - bodyShown;
    if (rem <= 0) return rows;

    if (!releaseCompletionLogLines) {
      for (let i = 0; i < rem; i++) {
        rows.push(activityPulseEntry(i));
      }
      return rows;
    }

    const pulseCap = pulseFrozenRef.current ?? 0;
    const pulseRows = Math.min(rem, pulseCap);
    for (let i = 0; i < pulseRows; i++) {
      rows.push(activityPulseEntry(i));
    }
    rem -= pulseRows;
    if (rem <= 0) return rows;

    rows.push(
      ...CLUSTER_PROGRESS_FINALE_LINES.slice(0, Math.min(rem, finaleLen)).map((e) => ({
        ...e,
        msg: clusterFmt(e.msg),
      })),
    );
    return rows;
  }, [
    useHoldLayout,
    visibleCount,
    agentLen,
    bodyLen,
    finaleLen,
    releaseCompletionLogLines,
    version,
  ]);

  if (!isOpen) return null;

  /** Portaled like {@link LightSpeedPanel}: avoids nested glass/opacity under `#root`. */
  const panel = (
    <div
      className="fixed inset-0 z-[1100] flex items-stretch justify-end"
      role="dialog"
      aria-label="Update details and agent analysis logs"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      {/** min-h-0: flex item must shrink below content min-height so inner flex-1 + overflow-y-auto creates a scroll region */}
      <div className="ocs-update-details-panel relative flex h-full max-h-dvh min-h-0 w-[min(640px,92vw)] min-w-0 flex-col self-stretch overflow-hidden">
        <div className="ocs-update-details-panel__chrome flex shrink-0 items-start justify-between gap-[var(--pf-t--global--spacer--md)] border-b border-[var(--pf-t--global--border--color--default)] px-[var(--pf-t--global--spacer--lg)] py-[var(--pf-t--global--spacer--md)]">
          <div>
            <Title headingLevel="h2" size="lg" className="ocs-update-details-panel__title">
              Update details
            </Title>
            <Content
              component="div"
              className="ocs-update-details-panel__subtitle pf-v6-u-mt-sm"
              style={{ marginBottom: 0 }}
            >
              <ClusterUpdateAiImportantPrivacyPanelNotice />
            </Content>
          </div>
          <Button variant="plain" onClick={onClose} aria-label="Close update details">
            <X className="size-[18px]" aria-hidden />
          </Button>
        </div>

        <div className="ocs-update-details-panel__chrome flex shrink-0 flex-wrap items-center gap-x-[var(--pf-t--global--spacer--lg)] gap-y-[var(--pf-t--global--spacer--sm)] border-b border-[var(--pf-t--global--border--color--default)] px-[var(--pf-t--global--spacer--lg)] py-[var(--pf-t--global--spacer--sm)]">
          <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
            <span className="inline-block size-2 shrink-0 rounded-full bg-[var(--pf-t--global--palette--green--40)]" aria-hidden />
            <span className="ocs-update-details-panel__toolbar-label text-sm font-semibold">Live</span>
          </Flex>
          <Switch
            id="agent-logs-autoscroll"
            label="Auto-scroll"
            isChecked={autoScroll}
            onChange={(_e, checked) => setAutoScroll(checked)}
          />
        </div>

        <div
          ref={logScrollRef}
          className="ocs-update-details-panel__log-well min-h-0 flex-1 overflow-y-auto overscroll-contain p-[var(--pf-t--global--spacer--md)] font-[family-name:var(--pf-t--global--FontFamily--mono)] text-[0.75rem] leading-relaxed"
          style={{ WebkitOverflowScrolling: "touch" }}
          tabIndex={0}
          aria-label="Agent and cluster update log output"
        >
          <div ref={logContentRef}>
            {agentSlice.map((line, i) => (
              <div key={`a-${i}`} className="break-words pb-[var(--pf-t--global--spacer--xs)]">
                {line}
              </div>
            ))}
            {clusterSlice.map((entry, i) => (
              <div key={`c-${i}`} className="flex flex-wrap gap-x-[var(--pf-t--global--spacer--sm)] pb-[var(--pf-t--global--spacer--xs)]">
                <span className="ocs-update-details-panel__log-ts shrink-0 tabular-nums">{entry.ts}</span>
                <span className="ocs-update-details-panel__log-level shrink-0 font-semibold">{entry.level.toUpperCase()}</span>
                <span className="min-w-0 break-words">{entry.msg}</span>
              </div>
            ))}
            {visibleCount < streamEndVisible ? (
              <div
                className="ocs-update-details-panel__agent-status mt-[var(--pf-t--global--spacer--sm)] pt-[var(--pf-t--global--spacer--sm)]"
                aria-live="polite"
                aria-busy="true"
              >
                <span className="ocs-update-details-panel__agent-status-text">
                  {useHoldLayout && !releaseCompletionLogLines ? "Live cluster activity…" : "Streaming cluster activity…"}
                </span>
                <span className="ocs-update-details-panel__agent-dots" aria-hidden>
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            ) : null}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}
