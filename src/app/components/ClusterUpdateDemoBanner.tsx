import { useClusterUpdateDemoVariant } from "../contexts/ClusterUpdateDemoContext";

/** Sits above the masthead; variant toggle is shared with Cluster Update via context. */
export default function ClusterUpdateDemoBanner() {
  const { demoVariant, setDemoVariant } = useClusterUpdateDemoVariant();

  return (
    <div className="w-full border-b border-[#c4c4c4] dark:border-[rgba(255,255,255,0.12)] bg-[linear-gradient(135deg,rgba(0,102,204,0.06)_0%,rgba(103,83,172,0.06)_100%)] dark:bg-[linear-gradient(135deg,rgba(0,102,204,0.12)_0%,rgba(103,83,172,0.12)_100%)] px-[16px] py-[12px]">
      <div className="flex flex-col gap-[10px] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#6a6e73] dark:text-[#8a8d90] mb-[2px]">
            Prototype demo
          </p>
        </div>
        <div
          className="flex rounded-[999px] p-[3px] bg-[rgba(0,0,0,0.06)] dark:bg-[rgba(255,255,255,0.08)] shrink-0"
          role="group"
          aria-label="Cluster update experience variant"
        >
          <button
            type="button"
            onClick={() => setDemoVariant("agent-only")}
            className={`inline-flex items-center gap-[6px] px-[14px] py-[7px] rounded-[999px] text-[12px] font-semibold font-['Red_Hat_Text:Regular',sans-serif] border-0 cursor-pointer transition-colors whitespace-nowrap ${
              demoVariant === "agent-only"
                ? "bg-white dark:bg-[#2a2a2a] text-[#6753ac] dark:text-[#b2a3e0] shadow-sm"
                : "bg-transparent text-[#4d4d4d] dark:text-[#b0b0b0] hover:text-[#151515] dark:hover:text-white"
            }`}
          >
            <span>Agent only</span>
            <span
              className={`text-[11px] font-medium ${
                demoVariant === "agent-only"
                  ? "text-[#6753ac]/85 dark:text-[#b2a3e0]/90"
                  : "text-[#6a6e73] dark:text-[#8a8d90]"
              }`}
            >
              (OCP 5.0)
            </span>
          </button>
          <button
            type="button"
            onClick={() => setDemoVariant("manual-and-agent")}
            className={`inline-flex items-center gap-[6px] px-[14px] py-[7px] rounded-[999px] text-[12px] font-semibold font-['Red_Hat_Text:Regular',sans-serif] border-0 cursor-pointer transition-colors whitespace-nowrap ${
              demoVariant === "manual-and-agent"
                ? "bg-white dark:bg-[#2a2a2a] text-[#0066cc] dark:text-[#4dabf7] shadow-sm"
                : "bg-transparent text-[#4d4d4d] dark:text-[#b0b0b0] hover:text-[#151515] dark:hover:text-white"
            }`}
          >
            <span>Manual + Agent</span>
            <span
              className={`text-[11px] font-medium ${
                demoVariant === "manual-and-agent"
                  ? "text-[#0066cc]/85 dark:text-[#4dabf7]/90"
                  : "text-[#6a6e73] dark:text-[#8a8d90]"
              }`}
            >
              (OCP 5.1)
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
