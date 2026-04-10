import { useState } from "react";
import { ChevronDown, ChevronRight, Info, Sparkles, ArrowRight } from "@/lib/pfIcons";

export type AiAssessmentVariant = "cluster-update" | "installed-operators";

type InstalledSummary = {
  totalOperators: number;
  updatesAvailable: number;
  clusterTargetVersion: string;
  channelLabel: string;
};

export type ClusterUpdateDemoVariant = "manual-and-agent" | "agent-only";

/** Shared AI Assessment card (OCPSTRAT-2701) — Cluster Update and Installed Operators. */
export function AiAssessmentSection({
  openChatbot,
  selectedVersion,
  variant = "cluster-update",
  installedSummary,
  /** When set on Cluster Update, tunes copy for Manual+Agent (OCP 5.1) vs Agent-only (OCP 5.0) demos. */
  clusterUpdateDemoVariant,
}: {
  openChatbot: (ctx: string) => void;
  selectedVersion: string;
  variant?: AiAssessmentVariant;
  /** Required when variant is installed-operators — drives contextual copy and the info callout. */
  installedSummary?: InstalledSummary;
  clusterUpdateDemoVariant?: ClusterUpdateDemoVariant;
}) {
  const [expanded, setExpanded] = useState(true);

  const precheckContext =
    variant === "installed-operators" ? "installed-operators-precheck" : "ai-precheck";

  return (
    <div className="rounded-[16px] border border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] p-[24px] mb-[16px]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-[8px] bg-transparent border-0 cursor-pointer p-0 hover:opacity-80 transition-opacity w-full text-left"
      >
        {expanded ? (
          <ChevronDown className="size-[16px] text-[#151515] dark:text-white" />
        ) : (
          <ChevronRight className="size-[16px] text-[#151515] dark:text-white" />
        )}
        <h2 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[18px]">AI Assessment</h2>
      </button>

      {expanded && (
        <div className="mt-[16px]">
          {variant === "installed-operators" && installedSummary ? (
            <>
              <p className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[16px] leading-[20px]">
                OpenShift LightSpeed can review your <span className="text-[#151515] dark:text-white font-medium">installed catalog operators</span>{" "}
                against the cluster&apos;s target OpenShift version. Use it to spot compatibility gaps, required updates, and OLM v0 vs cluster
                extension (v1) differences before you approve installs or updates from this list.
              </p>

              <div className="rounded-[8px] border-2 border-[#5e40be] dark:border-[#b2a3e0] px-[16px] py-[12px] mb-[16px]">
                <div className="flex items-center gap-[10px]">
                  <Info className="size-[16px] text-[#0066cc] dark:text-[#4dabf7] shrink-0" />
                  <p className="text-[#151515] dark:text-white text-[14px] font-['Red_Hat_Text:Regular',sans-serif]">
                    Cluster target <span className="font-mono font-semibold">{installedSummary.clusterTargetVersion}</span>
                    <span className="text-[#6a6e73] dark:text-[#8a8d90] font-normal"> · {installedSummary.channelLabel}</span>
                    <span className="block text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-normal mt-[4px]">
                      {installedSummary.totalOperators} operators installed · {installedSummary.updatesAvailable} with updates available
                    </span>
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[16px] leading-[20px]">
                {clusterUpdateDemoVariant === "agent-only" ? (
                  <>
                    In the <span className="text-[#151515] dark:text-white font-medium">OCP 5.0</span> agent-led experience, the update agent
                    proposes plans and drives execution—OpenShift LightSpeed can still run a{" "}
                    <span className="text-[#151515] dark:text-white font-medium">pre-check</span> on cluster and{" "}
                    <span className="text-[#151515] dark:text-white font-medium">operator</span> readiness before you approve, so risks and
                    prerequisites stay visible alongside automated planning.
                  </>
                ) : (
                  <>
                    OpenShift LightSpeed can help you assess whether this{" "}
                    <span className="text-[#151515] dark:text-white font-medium">cluster</span> is ready to move to the target version and how
                    your <span className="text-[#151515] dark:text-white font-medium">operators</span>—both platform and catalog—may be
                    affected. Use a pre-check to surface compatibility risks, blocking work, and follow-up actions before you start the
                    update.
                  </>
                )}
              </p>

              <div className="rounded-[8px] border-2 border-[#5e40be] dark:border-[#b2a3e0] px-[16px] py-[12px] mb-[16px]">
                <div className="flex flex-wrap items-start gap-x-[10px] gap-y-[8px]">
                  <div className="flex items-start gap-[10px] min-w-0 flex-1">
                    <Info className="size-[16px] text-[#0066cc] dark:text-[#4dabf7] shrink-0 mt-[2px]" />
                    <p className="text-[#151515] dark:text-white text-[14px] font-['Red_Hat_Text:Regular',sans-serif] min-w-0">
                      {clusterUpdateDemoVariant === "agent-only" ? (
                        <>
                          Version <span className="font-mono font-semibold">{selectedVersion}</span> available
                        </>
                      ) : (
                        <>
                          Version {selectedVersion} available
                          <span className="text-[#6a6e73] dark:text-[#8a8d90] font-normal"> · OCP 5.1 (manual + agent demo)</span>
                        </>
                      )}
                    </p>
                  </div>
                  <a
                    href="https://docs.redhat.com/en/documentation/openshift_container_platform/5.1/html/release_notes/index"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-[4px] shrink-0 text-[#0066cc] dark:text-[#4dabf7] text-[13px] no-underline hover:underline font-['Red_Hat_Text:Regular',sans-serif] font-medium sm:ml-auto"
                  >
                    See what&apos;s new in 5.1 <ArrowRight className="size-[14px]" aria-hidden />
                  </a>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center gap-[8px]">
            <button
              onClick={() => openChatbot(precheckContext)}
              className="flex items-center gap-[8px] bg-transparent hover:bg-[rgba(0,102,204,0.05)] dark:hover:bg-[rgba(77,171,247,0.08)] text-[#0066cc] dark:text-[#4dabf7] text-[14px] px-[16px] py-[8px] rounded-[999px] border border-[#0066cc] dark:border-[#4dabf7] cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium"
            >
              Pre-check with AI
              <Sparkles className="size-[14px]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
