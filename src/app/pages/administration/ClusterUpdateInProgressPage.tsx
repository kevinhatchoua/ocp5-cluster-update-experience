import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import { CheckCircle, Loader2, Info, MoreVertical, AlertTriangle } from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs";

type TabKey = "update-plan" | "update-history";

interface UpdatingOperator {
  name: string;
  version: string;
  status: "Updating" | "Updated" | "Pending";
  compatibility: "compatible" | "incompatible";
  lastUpdated: string;
}

interface WorkerPool {
  pool: string;
  status: "Updating" | "Updated" | "Pending";
  version: string;
  compatibility: "compatible" | "incompatible";
}

const UPDATING_OPERATORS: UpdatingOperator[] = [
  { name: "Abot Operator-v3.0.0", version: "3.2.5", status: "Updating", compatibility: "compatible", lastUpdated: "Feb 13, 2026, 10:28 AM" },
  { name: "Airflow Helm Operator", version: "3.5", status: "Updating", compatibility: "compatible", lastUpdated: "Feb 13, 2026, 10:28 AM" },
  { name: "Ansible Automation Platform", version: "3.25", status: "Updating", compatibility: "compatible", lastUpdated: "Feb 13, 2026, 10:28 AM" },
  { name: "Bare Metal Event Relay", version: "1.2.0", status: "Pending", compatibility: "compatible", lastUpdated: "Feb 13, 2026, 10:28 AM" },
  { name: "Camel K Operator", version: "2.1.0", status: "Pending", compatibility: "compatible", lastUpdated: "Feb 13, 2026, 10:28 AM" },
];

const WORKER_POOLS: WorkerPool[] = [
  { pool: "worker-east", status: "Updating", version: "4.18.16", compatibility: "compatible" },
  { pool: "worker-west", status: "Pending", version: "4.18.15", compatibility: "compatible" },
];

export default function ClusterUpdateInProgressPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const version = (location.state as any)?.version || "5.1.10";
  const [activeTab, setActiveTab] = useState<TabKey>("update-plan");

  const [operatorProgress, setOperatorProgress] = useState(0);
  const [controlProgress, setControlProgress] = useState(0);
  const [workerProgress, setWorkerProgress] = useState(0);

  useEffect(() => {
    localStorage.setItem("clusterUpdateInProgress", JSON.stringify({ version, startedAt: Date.now() }));
  }, [version]);

  useEffect(() => {
    const timer = setInterval(() => {
      setControlProgress(p => Math.min(100, p + 1.5));
      setOperatorProgress(p => Math.min(100, p + 0.8));
      setWorkerProgress(p => {
        if (controlProgress > 40) return Math.min(100, p + 0.3);
        return p;
      });
    }, 300);
    return () => clearInterval(timer);
  }, [controlProgress]);

  useEffect(() => {
    if (operatorProgress >= 100 && controlProgress >= 100 && workerProgress >= 100) {
      localStorage.removeItem("clusterUpdateInProgress");
      setTimeout(() => navigate("/administration/cluster-update/complete", { state: { version } }), 1200);
    }
  }, [operatorProgress, controlProgress, workerProgress, navigate, version]);

  const opPct = Math.round(operatorProgress);
  const cpPct = Math.round(controlProgress);
  const wnPct = Math.round(workerProgress);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "update-plan", label: "Update plan" },
    { key: "update-history", label: "Update history" },
  ];

  return (
    <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-[24px] pb-[48px]">
      <Breadcrumbs items={[
        { label: "Administration", path: "/administration/cluster-update" },
        { label: "Cluster Update" },
      ]} />

      <h1 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[28px] mb-[16px]">
        Cluster Update
      </h1>

      <div className="border-b border-[#d2d2d2] dark:border-[rgba(255,255,255,0.1)] mb-[24px] flex gap-[0px]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              if (tab.key === "update-plan") return;
              navigate("/administration/cluster-update", { state: { tab: tab.key } });
            }}
            className={`px-[20px] py-[12px] text-[14px] font-['Red_Hat_Text:Regular',sans-serif] border-0 bg-transparent cursor-pointer transition-colors relative ${
              activeTab === tab.key
                ? "text-[#151515] dark:text-white font-medium"
                : "text-[#4d4d4d] dark:text-[#b0b0b0] hover:text-[#151515] dark:hover:text-white"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0066cc] dark:bg-[#4dabf7] rounded-t-[2px]" />
            )}
          </button>
        ))}
      </div>

      {/* Estimated Update Time Banner */}
      <div className="rounded-[12px] border-2 border-[#0066cc] dark:border-[#4dabf7] bg-[#e7f1fa] dark:bg-[rgba(0,102,204,0.08)] px-[20px] py-[16px] mb-[24px]">
        <div className="flex items-start gap-[12px]">
          <Info className="size-[20px] text-[#0066cc] dark:text-[#4dabf7] shrink-0 mt-[2px]" />
          <div className="flex-1">
            <p className="text-[#151515] dark:text-white text-[16px] font-semibold font-['Red_Hat_Display:SemiBold',sans-serif] mb-[4px]">
              Estimated update time 2 hours 12 minutes
            </p>
            <p className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[13px] font-['Red_Hat_Text:Regular',sans-serif] mb-[14px]">
              This is a rough estimate and will vary based on resource availability and usage.
            </p>
            <div className="flex items-center gap-[10px]">
              <button className="bg-[#0066cc] hover:bg-[#004080] text-white text-[13px] px-[16px] py-[7px] rounded-[999px] border-0 cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
                Pause update
              </button>
              <button className="bg-transparent text-[#c9190b] text-[13px] px-[16px] py-[7px] rounded-[999px] border border-[#c9190b] cursor-pointer hover:bg-[rgba(201,25,11,0.05)] transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
                Abort update
              </button>
              <Link to="#" className="text-[#0066cc] dark:text-[#4dabf7] text-[13px] no-underline hover:underline font-['Red_Hat_Text:Regular',sans-serif] font-medium ml-[4px]">
                View logs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cluster ID */}
      <div className="mb-[24px]">
        <p className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[13px] font-['Red_Hat_Text:Regular',sans-serif] mb-[2px]">Cluster ID</p>
        <p className="text-[#151515] dark:text-white text-[14px] font-['Red_Hat_Mono:Regular',sans-serif]">b86leae3-b06c-4ab2-8fa7-54b89a2bf4b2</p>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-3 gap-[24px] mb-[32px]">
        <ProgressSection label="Operators" percentage={opPct} />
        <ProgressSection label="Control Plane" percentage={cpPct} />
        <ProgressSection label="Worker Nodes" percentage={wnPct} />
      </div>

      {/* Operators on this cluster */}
      <div className="rounded-[16px] border border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] mb-[24px] overflow-hidden">
        <div className="px-[24px] py-[16px] border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)]">
          <h2 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[18px]">Operators on this cluster</h2>
        </div>
        <table className="w-full text-[13px] font-['Red_Hat_Text:Regular',sans-serif]">
          <thead>
            <tr className="border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-left text-[11px] text-[#6a6e73] dark:text-[#8a8d90] uppercase tracking-wide">
              <th className="px-[24px] py-[10px] font-medium">Name</th>
              <th className="px-[16px] py-[10px] font-medium">Status</th>
              <th className="px-[16px] py-[10px] font-medium">Version</th>
              <th className="px-[16px] py-[10px] font-medium">Cluster compatibility</th>
              <th className="px-[16px] py-[10px] font-medium">Last updated</th>
              <th className="px-[16px] py-[10px] font-medium w-[48px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {UPDATING_OPERATORS.map((op) => (
              <tr key={op.name} className="border-b border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.05)] last:border-0 hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <td className="px-[24px] py-[12px] font-medium text-[#151515] dark:text-white">{op.name}</td>
                <td className="px-[16px] py-[12px]">
                  <span className={`inline-flex items-center gap-[6px] text-[13px] ${op.status === "Updating" ? "text-[#0066cc] dark:text-[#4dabf7]" : op.status === "Updated" ? "text-[#3e8635]" : "text-[#6a6e73]"}`}>
                    {op.status === "Updating" && <Loader2 className="size-[14px] animate-spin" />}
                    {op.status === "Updated" && <CheckCircle className="size-[14px]" />}
                    {op.status}
                  </span>
                </td>
                <td className="px-[16px] py-[12px] font-mono text-[#4d4d4d] dark:text-[#b0b0b0]">{op.version}</td>
                <td className="px-[16px] py-[12px]">
                  <span className="inline-flex items-center gap-[4px] text-[12px] text-[#3e8635] border border-[#3e8635] rounded-[999px] px-[10px] py-[3px] bg-[rgba(62,134,53,0.04)]">
                    <CheckCircle className="size-[13px]" /> compatible
                  </span>
                </td>
                <td className="px-[16px] py-[12px] text-[#4d4d4d] dark:text-[#b0b0b0]">{op.lastUpdated}</td>
                <td className="px-[16px] py-[12px] text-center">
                  <button className="p-[4px] hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.08)] rounded-[4px] transition-colors bg-transparent border-0 cursor-pointer">
                    <MoreVertical className="size-[16px] text-[#4d4d4d] dark:text-[#b0b0b0]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Worker nodes on this cluster */}
      <div className="rounded-[16px] border border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] mb-[32px] overflow-hidden">
        <div className="px-[24px] py-[16px] border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)]">
          <h2 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[18px]">Worker nodes on this cluster</h2>
        </div>
        <table className="w-full text-[13px] font-['Red_Hat_Text:Regular',sans-serif]">
          <thead>
            <tr className="border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-left text-[11px] text-[#6a6e73] dark:text-[#8a8d90] uppercase tracking-wide">
              <th className="px-[24px] py-[10px] font-medium">Pool</th>
              <th className="px-[16px] py-[10px] font-medium">Status</th>
              <th className="px-[16px] py-[10px] font-medium">Version</th>
              <th className="px-[16px] py-[10px] font-medium">Cluster compatibility</th>
              <th className="px-[16px] py-[10px] font-medium w-[48px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {WORKER_POOLS.map((pool) => (
              <tr key={pool.pool} className="border-b border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.05)] last:border-0 hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <td className="px-[24px] py-[12px] font-medium text-[#151515] dark:text-white">{pool.pool}</td>
                <td className="px-[16px] py-[12px]">
                  <span className={`inline-flex items-center gap-[6px] text-[13px] ${pool.status === "Updating" ? "text-[#0066cc] dark:text-[#4dabf7]" : pool.status === "Updated" ? "text-[#3e8635]" : "text-[#6a6e73]"}`}>
                    {pool.status === "Updating" && <Loader2 className="size-[14px] animate-spin" />}
                    {pool.status === "Updated" && <CheckCircle className="size-[14px]" />}
                    {pool.status}
                  </span>
                </td>
                <td className="px-[16px] py-[12px] font-mono text-[#4d4d4d] dark:text-[#b0b0b0]">{pool.version}</td>
                <td className="px-[16px] py-[12px]">
                  <span className="inline-flex items-center gap-[4px] text-[12px] text-[#3e8635] border border-[#3e8635] rounded-[999px] px-[10px] py-[3px] bg-[rgba(62,134,53,0.04)]">
                    <CheckCircle className="size-[13px]" /> compatible
                  </span>
                </td>
                <td className="px-[16px] py-[12px] text-center">
                  <button className="p-[4px] hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.08)] rounded-[4px] transition-colors bg-transparent border-0 cursor-pointer">
                    <MoreVertical className="size-[16px] text-[#4d4d4d] dark:text-[#b0b0b0]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Abort cluster update */}
      <button
        onClick={() => { localStorage.removeItem("clusterUpdateInProgress"); navigate("/administration/cluster-update/failed", { state: { version } }); }}
        className="bg-[#c9190b] hover:bg-[#a11309] text-white text-[14px] px-[20px] py-[9px] rounded-[999px] border-0 cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium"
      >
        Abort cluster update
      </button>
    </div>
  );
}

function ProgressSection({ label, percentage }: { label: string; percentage: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-[8px]">
        <a href="#" className="text-[#0066cc] dark:text-[#4dabf7] text-[14px] no-underline hover:underline font-['Red_Hat_Text:Regular',sans-serif] font-medium">
          {label}
        </a>
        <span className="text-[#151515] dark:text-white text-[14px] font-['Red_Hat_Text:Regular',sans-serif] font-medium">{percentage}%</span>
      </div>
      <div className="h-[8px] bg-[#e0e0e0] dark:bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#0066cc] rounded-full transition-all duration-500"
          style={{ width: `${Math.max(percentage, percentage > 0 ? 2 : 0)}%` }}
        />
      </div>
    </div>
  );
}
