import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { CheckCircle, Loader2 } from "lucide-react";

const controlNodes = ["control-0", "control-1", "control-2"];
const workerNodes = ["worker-0", "worker-1", "worker-2", "worker-3", "worker-4", "worker-5", "worker-6", "worker-7", "worker-8", "worker-9", "worker-10", "worker-11"];

export default function ClusterUpdateInProgressPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const version = (location.state as any)?.version || "5.1.10";

  const [progress, setProgress] = useState(0);
  const [updatedWorkers, setUpdatedWorkers] = useState(0);
  const [controlDone, setControlDone] = useState(false);
  const [failed, setFailed] = useState(false);

  // Simulate the update progress
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          return 100;
        }
        return p + 2;
      });
    }, 400);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress >= 20) setControlDone(true);
    const workersDone = Math.min(12, Math.floor((progress - 20) / 6.5));
    if (progress >= 20) setUpdatedWorkers(Math.max(0, workersDone));

    // Simulate failure at worker-7 (optional: remove to always succeed)
    // Comment out the next 2 lines for success path
    // if (progress >= 65) { setFailed(true); }

    if (progress >= 100) {
      setTimeout(() => navigate("/administration/cluster-update/complete", { state: { version } }), 800);
    }
  }, [progress, navigate, version]);

  const estimatedMinutes = Math.max(0, Math.round((100 - progress) * 0.72));
  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (progress / 100) * circumference;

  const getNodeStatus = (node: string, isControl: boolean) => {
    if (isControl) return controlDone ? "updated" : progress >= 5 ? "in-progress" : "pending";
    const idx = workerNodes.indexOf(node);
    if (idx < updatedWorkers) return "updated";
    if (idx === updatedWorkers && controlDone) return "in-progress";
    return "pending";
  };

  if (failed) {
    navigate("/administration/cluster-update/failed", { state: { version } });
    return null;
  }

  return (
    <div className="p-[24px] pb-[48px]">
      <div className="flex items-center justify-between mb-[24px]">
        <h1 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[28px]">
          Updating to {version}
        </h1>
        <button className="bg-transparent border border-[#c9190b] text-[#c9190b] px-[16px] py-[8px] rounded-[8px] cursor-pointer text-[14px] font-['Red_Hat_Text:Regular',sans-serif] font-semibold hover:bg-[rgba(201,25,11,0.05)] transition-colors">
          Pause update
        </button>
      </div>

      {/* Progress Card */}
      <div className="rounded-[16px] border border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] p-[32px] mb-[24px]">
        <div className="flex items-center gap-[40px]">
          {/* Circular progress */}
          <div className="relative shrink-0">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(0,0,0,0.08)" className="dark:stroke-[rgba(255,255,255,0.1)]" strokeWidth="8" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="#0066cc" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={dashOffset}
                transform="rotate(-90 60 60)" className="transition-all duration-300" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[24px]">{progress}%</span>
            </div>
          </div>

          {/* Status details */}
          <div className="flex flex-col gap-[16px]">
            <div className="flex items-center gap-[10px]">
              {controlDone ? (
                <CheckCircle className="size-[18px] text-[#3e8635]" />
              ) : (
                <Loader2 className="size-[18px] text-[#0066cc] animate-spin" />
              )}
              <span className="text-[#151515] dark:text-white text-[14px] font-['Red_Hat_Text:Regular',sans-serif]">
                Control plane: {controlDone ? "Updated" : "Updating..."}
              </span>
            </div>
            <div className="flex items-center gap-[10px]">
              {updatedWorkers >= 12 ? (
                <CheckCircle className="size-[18px] text-[#3e8635]" />
              ) : (
                <Loader2 className="size-[18px] text-[#0066cc] animate-spin" />
              )}
              <span className="text-[#151515] dark:text-white text-[14px] font-['Red_Hat_Text:Regular',sans-serif]">
                Worker nodes: {updatedWorkers} of 12 updated
              </span>
            </div>
            <p className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[13px] font-['Red_Hat_Text:Regular',sans-serif]">
              Estimated time remaining: ~{estimatedMinutes} minutes
            </p>
          </div>
        </div>
      </div>

      {/* Node Rollout Card */}
      <div className="rounded-[16px] border border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] p-[24px]">
        <h2 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[18px] mb-[16px]">Node Rollout</h2>
        <div className="flex flex-wrap gap-[10px]">
          {controlNodes.map((node) => {
            const status = getNodeStatus(node, true);
            return (
              <NodeChip key={node} name={node} status={status} />
            );
          })}
          {workerNodes.map((node) => {
            const status = getNodeStatus(node, false);
            return (
              <NodeChip key={node} name={node} status={status} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NodeChip({ name, status }: { name: string; status: "updated" | "in-progress" | "pending" }) {
  const styles: Record<string, string> = {
    "updated": "bg-[rgba(62,134,53,0.1)] border-[rgba(62,134,53,0.3)] text-[#3e8635]",
    "in-progress": "bg-[rgba(0,102,204,0.1)] border-[rgba(0,102,204,0.3)] text-[#0066cc] dark:text-[#4dabf7]",
    "pending": "bg-[rgba(0,0,0,0.03)] dark:bg-[rgba(255,255,255,0.03)] border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] text-[#8a8d90]",
  };

  return (
    <div className={`flex items-center gap-[6px] px-[12px] py-[6px] rounded-[8px] border text-[13px] font-['Red_Hat_Mono:Regular',sans-serif] ${styles[status]}`}>
      {status === "in-progress" && <Loader2 className="size-[12px] animate-spin" />}
      {status === "updated" && <CheckCircle className="size-[12px]" />}
      {name}
    </div>
  );
}