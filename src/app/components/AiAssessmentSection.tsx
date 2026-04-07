import { useState } from "react";
import { ChevronDown, ChevronRight, Info, Sparkles } from "lucide-react";

/** Shared AI Assessment card (OCPSTRAT-2701) — Cluster Update and Installed Operators. */
export function AiAssessmentSection({
  openChatbot,
  selectedVersion,
}: {
  openChatbot: (ctx: string) => void;
  selectedVersion: string;
}) {
  const [expanded, setExpanded] = useState(true);

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
          <p className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[16px] leading-[20px]">
            Consolidated AI on the dashboard brings the cluster update experience and Software Catalog together:{" "}
            <span className="text-[#151515] dark:text-white font-medium">platform operators</span> and{" "}
            <span className="text-[#151515] dark:text-white font-medium">catalog operators</span> share the same pre-checks and
            status updates, so readiness is one holistic view—not separate silos.
          </p>

          <div className="rounded-[8px] border-2 border-[#5e40be] dark:border-[#b2a3e0] px-[16px] py-[12px] mb-[16px]">
            <div className="flex items-center gap-[10px]">
              <Info className="size-[16px] text-[#0066cc] dark:text-[#4dabf7] shrink-0" />
              <p className="text-[#151515] dark:text-white text-[14px] font-['Red_Hat_Text:Regular',sans-serif]">
                Version {selectedVersion} Available
              </p>
            </div>
          </div>

          <div className="flex items-center gap-[8px]">
            <button
              onClick={() => openChatbot("ai-precheck")}
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
