import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Button,
  Content,
  Flex,
  Switch,
  Title,
} from "@patternfly/react-core";
import { X } from "@/lib/pfIcons";

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

const CLUSTER_PROGRESS_LINES: { ts: string; level: string; msg: string }[] = [
  { ts: "00:00:01", level: "info", msg: "ClusterVersion operator initiated update to {version}" },
  { ts: "00:00:02", level: "info", msg: "Setting desiredUpdate.version={version}, channel=fast-5.1" },
  { ts: "00:00:03", level: "info", msg: "Reconciling ClusterVersion: status=Progressing" },
  { ts: "00:00:05", level: "info", msg: "Downloading release image quay.io/openshift-release-dev/ocp-release:{version}-x86_64" },
  { ts: "00:00:12", level: "info", msg: "Release image verified. Signature OK." },
  { ts: "00:00:14", level: "info", msg: "Beginning control plane update…" },
  { ts: "00:00:16", level: "info", msg: "Updating kube-apiserver to {version}" },
  { ts: "00:00:24", level: "info", msg: "kube-apiserver rollout progressing (1/3 nodes updated)" },
  { ts: "00:00:38", level: "info", msg: "kube-apiserver rollout progressing (2/3 nodes updated)" },
  { ts: "00:00:52", level: "info", msg: "kube-apiserver rollout complete" },
  { ts: "00:01:01", level: "info", msg: "Updating kube-controller-manager to {version}" },
  { ts: "00:01:15", level: "info", msg: "kube-controller-manager rollout complete" },
  { ts: "00:01:20", level: "info", msg: "Updating kube-scheduler to {version}" },
  { ts: "00:01:32", level: "info", msg: "kube-scheduler rollout complete" },
  { ts: "00:01:35", level: "info", msg: "Updating etcd to {version}" },
  { ts: "00:01:55", level: "warn", msg: "etcd member etcd-master-2 slow: latency 218ms exceeds threshold" },
  { ts: "00:02:10", level: "info", msg: "etcd rollout complete" },
  { ts: "00:02:12", level: "info", msg: "Control plane update complete. Starting operator updates…" },
  { ts: "00:02:14", level: "info", msg: "Updating operator: Abot Operator-v3.0.0 → 3.2.5" },
  { ts: "00:02:20", level: "info", msg: "Updating operator: Airflow Helm Operator → 3.5" },
  { ts: "00:02:28", level: "info", msg: "Updating operator: Ansible Automation Platform → 3.25" },
  { ts: "00:02:35", level: "warn", msg: "Operator Bare Metal Event Relay: waiting for dependency resolution" },
  { ts: "00:02:48", level: "info", msg: "Operator Abot Operator-v3.0.0 update complete" },
  { ts: "00:03:02", level: "info", msg: "Operator Airflow Helm Operator update complete" },
  { ts: "00:03:10", level: "info", msg: "Operator Ansible Automation Platform update complete" },
  { ts: "00:03:18", level: "info", msg: "Beginning worker node updates…" },
  { ts: "00:03:20", level: "info", msg: "Cordoning worker-east-1. Draining pods…" },
  { ts: "00:03:45", level: "info", msg: "Worker worker-east-1 drained. Applying update…" },
  { ts: "00:04:10", level: "info", msg: "Worker worker-east-1 rebooting with new OS image" },
  { ts: "00:04:55", level: "info", msg: "Worker worker-east-1 update complete. Uncordoning." },
];

export interface AgentExecutionLogsPanelProps {
  version: string;
  onClose: () => void;
  /** When false, panel is not mounted (parent controls visibility). */
  isOpen: boolean;
}

/**
 * Slide-over panel: agent analysis (tool_use / thinking) plus cluster update progress lines.
 * Answers “how do I see agent execution details?” from update flows.
 */
export default function AgentExecutionLogsPanel({ version, onClose, isOpen }: AgentExecutionLogsPanelProps) {
  const [visibleCount, setVisibleCount] = useState(1);
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logScrollRef = useRef<HTMLDivElement>(null);

  const totalLines =
    AGENT_ANALYSIS_LINES.length +
    CLUSTER_PROGRESS_LINES.length;

  useEffect(() => {
    if (isOpen) {
      setVisibleCount(1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    if (visibleCount >= totalLines) return;
    const timer = setTimeout(() => setVisibleCount((c) => Math.min(totalLines, c + 1)), 420);
    return () => clearTimeout(timer);
  }, [isOpen, visibleCount, totalLines]);

  useEffect(() => {
    if (!isOpen || !autoScroll) return;
    const el = logScrollRef.current;
    if (!el) return;
    /** Scroll the log container; instant scroll after layout — smooth scroll fights rapid stream updates and fails if overflow never activates. */
    const scrollToBottom = () => {
      el.scrollTop = el.scrollHeight;
    };
    scrollToBottom();
    requestAnimationFrame(() => {
      scrollToBottom();
      requestAnimationFrame(scrollToBottom);
    });
  }, [visibleCount, isOpen, autoScroll]);

  if (!isOpen) return null;

  const clusterFmt = (msg: string) => msg.replace(/\{version\}/g, version);

  const agentSlice = AGENT_ANALYSIS_LINES.slice(0, Math.min(visibleCount, AGENT_ANALYSIS_LINES.length));
  const clusterIdxStart = Math.max(0, visibleCount - AGENT_ANALYSIS_LINES.length);
  const clusterSlice = CLUSTER_PROGRESS_LINES.slice(0, clusterIdxStart).map((e) => ({
    ...e,
    msg: clusterFmt(e.msg),
  }));

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
            <Content component="p" className="ocs-update-details-panel__subtitle pf-v6-u-mt-sm" style={{ marginBottom: 0 }}>
              Agent analysis output (tool use and reasoning) and cluster update activity. Prototype sample data.
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
          {visibleCount < totalLines ? (
            <div
              className="ocs-update-details-panel__agent-status mt-[var(--pf-t--global--spacer--sm)] pt-[var(--pf-t--global--spacer--sm)]"
              aria-live="polite"
              aria-busy="true"
            >
              <span className="ocs-update-details-panel__agent-status-text">Agent is analyzing cluster data</span>
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
  );

  return createPortal(panel, document.body);
}
