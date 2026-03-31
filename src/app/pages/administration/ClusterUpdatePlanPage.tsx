import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router";
import { ChevronDown, ChevronRight, ExternalLink, Sparkles, ArrowRight, CheckCircle, AlertTriangle, HelpCircle, Info, X, Send, Loader2, XCircle, Shield, Bot, Settings, RotateCcw, Play, Pause, Calendar, Bell, Clock, FileText, User, Zap, Eye, RefreshCw } from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs";

type TabKey = "update-plan" | "cluster-operators" | "update-history";

type OperatorIssue = {
  name: string;
  message: string;
  slug: string;
  severity: "critical" | "warning";
};

type VersionEntry = {
  version: string;
  recommended: boolean;
  risk: string;
  riskColor: string;
  features: number;
  bugFixes: number;
  date: string;
  operatorIssues?: OperatorIssue[];
};

type VersionGroup = {
  label: string;
  versions: VersionEntry[];
};

type PrecheckStatus = "idle" | "running" | "passed" | "failed";

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
};

/* ─── Channel-specific version data ─── */
const channelVersions: Record<string, { groups: VersionGroup[]; banner?: { title: string; description: string; link: string } }> = {
  "fast-5.1": {
    banner: {
      title: "OpenShift 5.1 is available!",
      description: "Includes OVN network improvements, enhanced node management, and AI workload scheduling.",
      link: "See what's new in 5.1",
    },
    groups: [
      {
        label: "5.1",
        versions: [
          {
            version: "5.1.10", recommended: true, risk: "Low Risk", riskColor: "#3e8635", features: 4, bugFixes: 12, date: "Mar 22, 2026",
            operatorIssues: [
              { name: "cluster-logging", slug: "cluster-logging-6.4.3-max-ocp-5.0", severity: "critical", message: "openshift-logging/cluster-logging v6.4.3 maximum supported OCP version is 5.0. Update to v6.5+ before upgrading." },
              { name: "cloud-credential", slug: "cloud-credential-iam-update-required", severity: "warning", message: "cloudcredential.operator.openshift.io/cluster object needs updating before upgrade. See Manually Creating IAM." },
            ],
          },
          { version: "5.1.9", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 2, bugFixes: 8, date: "Mar 16, 2026",
            operatorIssues: [
              { name: "cluster-logging", slug: "cluster-logging-6.4.3-max-ocp-5.0", severity: "critical", message: "openshift-logging/cluster-logging v6.4.3 maximum supported OCP version is 5.0. Update to v6.5+ before upgrading." },
            ],
          },
          { version: "5.1.8", recommended: false, risk: "Medium Risk", riskColor: "#c58c00", features: 3, bugFixes: 15, date: "Mar 8, 2026",
            operatorIssues: [
              { name: "cluster-logging", slug: "cluster-logging-6.4.3-max-ocp-5.0", severity: "critical", message: "openshift-logging/cluster-logging v6.4.3 maximum supported OCP version is 5.0. Update to v6.5+ before upgrading." },
              { name: "operator-lifecycle-manager", slug: "olm-4.21-incompatible-5.1", severity: "critical", message: "Incompatible operator-lifecycle-manager version detected. Update to 4.22.0 or higher." },
              { name: "cloud-credential", slug: "cloud-credential-iam-update-required", severity: "warning", message: "cloudcredential.operator.openshift.io/cluster object needs updating before upgrade. See Manually Creating IAM." },
            ],
          },
        ],
      },
      {
        label: "5.0",
        versions: [
          { version: "5.0.8", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 0, bugFixes: 6, date: "Mar 18, 2026" },
          { version: "5.0.7", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 0, bugFixes: 4, date: "Mar 10, 2026" },
        ],
      },
    ],
  },
  "stable-5.1": {
    banner: { title: "OpenShift 5.1 is available!", description: "Stable channel releases are production-ready and fully tested.", link: "See what's new in 5.1" },
    groups: [
      { label: "5.1", versions: [
          { version: "5.1.9", recommended: true, risk: "Low Risk", riskColor: "#3e8635", features: 2, bugFixes: 8, date: "Mar 16, 2026", operatorIssues: [{ name: "cluster-logging", slug: "cluster-logging-6.4.3-max-ocp-5.0", severity: "critical" as const, message: "openshift-logging/cluster-logging v6.4.3 maximum supported OCP version is 5.0. Update to v6.5+ before upgrading." }] },
          { version: "5.1.7", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 1, bugFixes: 10, date: "Feb 28, 2026", operatorIssues: [{ name: "cluster-logging", slug: "cluster-logging-6.4.3-max-ocp-5.0", severity: "critical" as const, message: "openshift-logging/cluster-logging v6.4.3 maximum supported OCP version is 5.0. Update to v6.5+ before upgrading." }] },
        ] },
      { label: "5.0", versions: [
          { version: "5.0.8", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 0, bugFixes: 6, date: "Mar 18, 2026" },
          { version: "5.0.6", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 0, bugFixes: 3, date: "Feb 20, 2026" },
        ] },
    ],
  },
  "candidate-5.1": {
    groups: [{ label: "5.1", versions: [
          { version: "5.1.11-rc.2", recommended: false, risk: "High Risk", riskColor: "#c9190b", features: 6, bugFixes: 3, date: "Mar 28, 2026", operatorIssues: [{ name: "cluster-logging", slug: "cluster-logging-6.4.3-max-ocp-5.0", severity: "critical" as const, message: "openshift-logging/cluster-logging v6.4.3 maximum supported OCP version is 5.0. Update to v6.5+ before upgrading." }, { name: "operator-lifecycle-manager", slug: "olm-candidate-compat", severity: "warning" as const, message: "Candidate channel versions may have incompatible operator dependencies. Review release notes carefully." }] },
          { version: "5.1.11-rc.1", recommended: false, risk: "High Risk", riskColor: "#c9190b", features: 5, bugFixes: 2, date: "Mar 25, 2026", operatorIssues: [{ name: "cluster-logging", slug: "cluster-logging-6.4.3-max-ocp-5.0", severity: "critical" as const, message: "openshift-logging/cluster-logging v6.4.3 maximum supported OCP version is 5.0. Update to v6.5+ before upgrading." }] },
          { version: "5.1.10", recommended: true, risk: "Low Risk", riskColor: "#3e8635", features: 4, bugFixes: 12, date: "Mar 22, 2026", operatorIssues: [{ name: "cluster-logging", slug: "cluster-logging-6.4.3-max-ocp-5.0", severity: "critical" as const, message: "openshift-logging/cluster-logging v6.4.3 maximum supported OCP version is 5.0. Update to v6.5+ before upgrading." }] },
        ] }],
  },
  "eus-5.0": {
    groups: [{ label: "5.0 EUS", versions: [
          { version: "5.0.8", recommended: true, risk: "Low Risk", riskColor: "#3e8635", features: 0, bugFixes: 6, date: "Mar 18, 2026" },
          { version: "5.0.7", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 0, bugFixes: 4, date: "Mar 10, 2026" },
          { version: "5.0.6", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 0, bugFixes: 3, date: "Feb 20, 2026" },
        ] }],
  },
};

const operatorUpdates = [
  { name: "Abot Operator", category: "Catalog" as const, currentVersion: "2.9.1", availableVersion: "3.0.0", status: "Update available", autoUpdate: true, required: false, maxOCP: "5.1", compatible51: true },
  { name: "Airflow Helm Operator", category: "Catalog" as const, currentVersion: "2.0.3", availableVersion: "2.1.0", status: "Update available", autoUpdate: false, required: false, maxOCP: "5.1", compatible51: true },
  { name: "Ansible Automation Platform", category: "Catalog" as const, currentVersion: "3.1.0", availableVersion: null, status: "Up to date", autoUpdate: true, required: false, maxOCP: "5.1", compatible51: true },
  { name: "Cert Manager", category: "Catalog" as const, currentVersion: "1.12.0", availableVersion: "1.13.1", status: "Update available", autoUpdate: true, required: false, maxOCP: "5.1", compatible51: true },
  { name: "Elasticsearch Operator", category: "Catalog" as const, currentVersion: "5.7.2", availableVersion: null, status: "Up to date", autoUpdate: false, required: false, maxOCP: "5.0", compatible51: false },
  { name: "Cluster Logging", category: "Platform" as const, currentVersion: "6.4.3", availableVersion: "6.5.1", status: "Update available", autoUpdate: false, required: true, maxOCP: "5.0", compatible51: false },
  { name: "Operator Lifecycle Manager", category: "Platform" as const, currentVersion: "4.21.0", availableVersion: "4.22.0", status: "Update available", autoUpdate: false, required: true, maxOCP: "5.0", compatible51: false },
];

type UpdateHistoryEntry = {
  version: string;
  status: "Completed" | "Failed" | "Rejected";
  method: "Manual" | "Agent";
  decision: "Approved" | "Auto-approved" | "Rejected" | "N/A";
  initiatedBy: string;
  startedAt: string;
  completedAt: string;
  duration: string;
  preflight: { passed: number; failed: number; total: number };
  compatSummary?: string;
};

const updateHistory: UpdateHistoryEntry[] = [
  { version: "5.0.0", status: "Completed", method: "Agent", decision: "Approved", initiatedBy: "admin@example.com", startedAt: "Mar 1, 2026 02:00 UTC", completedAt: "Mar 1, 2026 03:48 UTC", duration: "1h 48m", preflight: { passed: 6, failed: 0, total: 6 }, compatSummary: "All operators compatible. No API deprecations detected." },
  { version: "4.18.6", status: "Completed", method: "Agent", decision: "Auto-approved", initiatedBy: "cluster-update-agent", startedAt: "Feb 12, 2026 03:00 UTC", completedAt: "Feb 12, 2026 04:32 UTC", duration: "1h 32m", preflight: { passed: 6, failed: 0, total: 6 }, compatSummary: "Z-stream update — all checks passed automatically." },
  { version: "4.18.4", status: "Completed", method: "Manual", decision: "N/A", initiatedBy: "admin@example.com", startedAt: "Jan 22, 2026 02:00 UTC", completedAt: "Jan 22, 2026 03:15 UTC", duration: "1h 15m", preflight: { passed: 5, failed: 1, total: 6 }, compatSummary: "cluster-logging operator warning (non-blocking)." },
  { version: "4.18.2", status: "Completed", method: "Manual", decision: "N/A", initiatedBy: "devops-team@example.com", startedAt: "Dec 15, 2025 03:00 UTC", completedAt: "Dec 15, 2025 04:22 UTC", duration: "1h 22m", preflight: { passed: 6, failed: 0, total: 6 } },
  { version: "4.17.9", status: "Failed", method: "Agent", decision: "Auto-approved", initiatedBy: "cluster-update-agent", startedAt: "Nov 28, 2025 02:00 UTC", completedAt: "Nov 28, 2025 02:45 UTC", duration: "45m", preflight: { passed: 4, failed: 2, total: 6 }, compatSummary: "Operator compatibility check failed. Automatic rollback triggered." },
  { version: "4.17.8", status: "Rejected", method: "Agent", decision: "Rejected", initiatedBy: "admin@example.com", startedAt: "Nov 20, 2025 02:00 UTC", completedAt: "Nov 20, 2025 02:02 UTC", duration: "2m", preflight: { passed: 3, failed: 3, total: 6 }, compatSummary: "Multiple operator incompatibilities. 2 deprecated APIs in use. Admin rejected update plan." },
];

const PRECHECK_ITEMS = [
  { label: "Cluster health", description: "Verifying all cluster components are healthy" },
  { label: "Operator compatibility", description: "Checking installed operators for version compatibility" },
  { label: "API deprecation", description: "Scanning for deprecated API usage" },
  { label: "Storage availability", description: "Ensuring sufficient storage for update" },
  { label: "Certificate validity", description: "Validating cluster certificates" },
  { label: "Node readiness", description: "Confirming all nodes are schedulable and ready" },
];

export default function ClusterUpdatePlanPage() {
  const navigate = useNavigate();
  const [updateMode, setUpdateMode] = useState<"manual" | "agent">("manual");
  const [selectedChannel, setSelectedChannel] = useState("fast-5.1");
  const [showZStreamOnly, setShowZStreamOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("update-plan");
  const [selectedVersion, setSelectedVersion] = useState<string>("5.1.10");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ "5.1": true });
  const [precheckVersion, setPrecheckVersion] = useState<string | null>(null);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatbotContext, setChatbotContext] = useState("");

  const channelData = channelVersions[selectedChannel] ?? channelVersions["fast-5.1"];

  const handleChannelChange = (channel: string) => {
    setSelectedChannel(channel);
    const data = channelVersions[channel];
    if (data) {
      const firstGroup = data.groups[0];
      const newExpanded: Record<string, boolean> = {};
      if (firstGroup) {
        newExpanded[firstGroup.label] = true;
        const rec = firstGroup.versions.find((v) => v.recommended);
        setSelectedVersion(rec ? rec.version : firstGroup.versions[0]?.version ?? "");
      }
      setExpandedGroups(newExpanded);
    }
  };

  const openChatbot = useCallback((context: string) => {
    setChatbotContext(context);
    setChatbotOpen(true);
  }, []);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "update-plan", label: "Update plan" },
    { key: "cluster-operators", label: "Cluster operators" },
    { key: "update-history", label: "Update history" },
  ];

  return (
    <div className="p-[24px] pb-[48px]">
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
            onClick={() => setActiveTab(tab.key)}
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

      {activeTab === "update-plan" && (
        <>
          {/* Update Method */}
          <div className="rounded-[16px] border border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] p-[24px] mb-[16px]">
            <h2 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[18px] mb-[4px]">Update Method</h2>
            <p className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[14px] mb-[16px] font-['Red_Hat_Text:Regular',sans-serif]">Choose how cluster updates are managed</p>
            <div className="grid grid-cols-2 gap-[16px]">
              <button
                onClick={() => setUpdateMode("manual")}
                className={`text-left rounded-[8px] p-[20px] border transition-colors cursor-pointer bg-transparent ${
                  updateMode === "manual"
                    ? "border-[#0066cc] dark:border-[#4dabf7] shadow-[0_0_0_1px_#0066cc] dark:shadow-[0_0_0_1px_#4dabf7]"
                    : "border-[#d2d2d2] dark:border-[rgba(255,255,255,0.15)] hover:border-[#8a8d90] dark:hover:border-[rgba(255,255,255,0.3)]"
                }`}
              >
                <div className="flex items-center gap-[10px] mb-[8px]">
                  <div className={`size-[18px] rounded-full border-2 flex items-center justify-center ${updateMode === "manual" ? "border-[#0066cc] dark:border-[#4dabf7]" : "border-[#8a8d90]"}`}>
                    {updateMode === "manual" && <div className="size-[10px] rounded-full bg-[#0066cc] dark:bg-[#4dabf7]" />}
                  </div>
                  <span className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[15px]">Manual updates</span>
                </div>
                <p className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[13px] font-['Red_Hat_Text:Regular',sans-serif] ml-[28px]">
                  Manually manage version updates for the cluster. You will need to approve each update individually.
                </p>
              </button>
              <button
                onClick={() => setUpdateMode("agent")}
                className={`text-left rounded-[8px] p-[20px] border transition-colors cursor-pointer bg-transparent ${
                  updateMode === "agent"
                    ? "border-[#0066cc] dark:border-[#4dabf7] shadow-[0_0_0_1px_#0066cc] dark:shadow-[0_0_0_1px_#4dabf7]"
                    : "border-[#d2d2d2] dark:border-[rgba(255,255,255,0.15)] hover:border-[#8a8d90] dark:hover:border-[rgba(255,255,255,0.3)]"
                }`}
              >
                <div className="flex items-center gap-[10px] mb-[8px]">
                  <div className={`size-[18px] rounded-full border-2 flex items-center justify-center ${updateMode === "agent" ? "border-[#0066cc] dark:border-[#4dabf7]" : "border-[#8a8d90]"}`}>
                    {updateMode === "agent" && <div className="size-[10px] rounded-full bg-[#0066cc] dark:bg-[#4dabf7]" />}
                  </div>
                  <span className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[15px]">Agent-based updates</span>
                </div>
                <p className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[13px] font-['Red_Hat_Text:Regular',sans-serif] ml-[28px]">
                  Let the AI agent manage updates automatically. It analyzes optimal windows and performs safety checks before updating.
                </p>
              </button>
            </div>
          </div>

          {/* Agent-based mode panel */}
          {updateMode === "agent" && (
            <AgentModePanel openChatbot={openChatbot} setActiveTab={setActiveTab} navigate={navigate} />
          )}

          {/* Cluster Details — AI button removed from here */}
          {updateMode === "manual" && (
            <>
              <div className="rounded-[16px] border border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] p-[24px] mb-[16px]">
                <h2 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[18px] mb-[16px]">Cluster Details</h2>
                <div className="grid grid-cols-2 gap-x-[48px] gap-y-[16px]">
                  <div>
                    <p className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[13px] font-['Red_Hat_Text:Regular',sans-serif] mb-[2px]">Current version</p>
                    <p className="text-[#151515] dark:text-white text-[14px] font-['Red_Hat_Mono:Regular',sans-serif]">5.0.0</p>
                  </div>
                  <div>
                    <p className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[13px] font-['Red_Hat_Text:Regular',sans-serif] mb-[2px]">Upstream update service</p>
                    <a href="https://docs.openshift.com/container-platform/latest/updating/understanding_updates/understanding-update-channels-releases.html#update-service-about_understanding-update-channels-releases" target="_blank" rel="noopener noreferrer" className="text-[#0066cc] dark:text-[#4dabf7] text-[14px] no-underline hover:underline flex items-center gap-[4px] font-['Red_Hat_Text:Regular',sans-serif]">
                      Default update service <ExternalLink className="size-[12px]" />
                    </a>
                  </div>
                  <div>
                    <p className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[13px] font-['Red_Hat_Text:Regular',sans-serif] mb-[2px]">Channel</p>
                    <div className="flex items-center gap-[12px]">
                      <select value={selectedChannel} onChange={(e) => handleChannelChange(e.target.value)}
                        className="bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] rounded-[6px] px-[10px] py-[4px] text-[14px] text-[#151515] dark:text-white font-['Red_Hat_Mono:Regular',sans-serif] cursor-pointer">
                        <option value="fast-5.1">fast-5.1</option>
                        <option value="stable-5.1">stable-5.1</option>
                        <option value="candidate-5.1">candidate-5.1</option>
                        <option value="eus-5.0">eus-5.0</option>
                      </select>
                      <a href="https://docs.openshift.com/container-platform/latest/updating/understanding_updates/understanding-update-channels-releases.html" target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-[4px] text-[#0066cc] dark:text-[#4dabf7] text-[13px] no-underline hover:underline font-['Red_Hat_Text:Regular',sans-serif]">
                        Learn more about channels <ExternalLink className="size-[11px]" />
                      </a>
                    </div>
                  </div>
                  <div>
                    <p className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[13px] font-['Red_Hat_Text:Regular',sans-serif] mb-[2px]">Cluster ID</p>
                    <p className="text-[#151515] dark:text-white text-[14px] font-['Red_Hat_Mono:Regular',sans-serif]">1c182077-5663-426d-92a3-5d26df31f146</p>
                  </div>
                </div>
              </div>

              <AvailableUpdatesSection
                channelData={channelData}
                showZStreamOnly={showZStreamOnly}
                setShowZStreamOnly={setShowZStreamOnly}
                expandedGroups={expandedGroups}
                setExpandedGroups={setExpandedGroups}
                selectedVersion={selectedVersion}
                setSelectedVersion={setSelectedVersion}
                navigate={navigate}
                setActiveTab={setActiveTab}
                setPrecheckVersion={setPrecheckVersion}
                openChatbot={openChatbot}
              />
            </>
          )}
        </>
      )}

      {activeTab === "cluster-operators" && <ClusterOperatorsTab />}
      {activeTab === "update-history" && <UpdateHistoryTab />}

      {/* Pre-check Modal */}
      {precheckVersion && (
        <PrecheckModal
          version={precheckVersion}
          hasOperatorIssues={channelData.groups.flatMap((g: VersionGroup) => g.versions).find((v: VersionEntry) => v.version === precheckVersion)?.operatorIssues?.length > 0}
          onClose={() => setPrecheckVersion(null)}
          onProceed={() => { setPrecheckVersion(null); navigate(`/administration/cluster-update/preflight?version=${precheckVersion}`, { state: { version: precheckVersion } }); }}
        />
      )}

      {/* OLS Chatbot Drawer */}
      {chatbotOpen && (
        <OlsChatbot
          context={chatbotContext}
          selectedVersion={selectedVersion}
          selectedChannel={selectedChannel}
          onClose={() => setChatbotOpen(false)}
        />
      )}
    </div>
  );
}

/* ─── Pre-check Modal ─── */
function PrecheckModal({ version, hasOperatorIssues, onClose, onProceed }: { version: string; hasOperatorIssues: boolean; onClose: () => void; onProceed: () => void }) {
  const [status, setStatus] = useState<PrecheckStatus>("idle");
  const [completedChecks, setCompletedChecks] = useState<number>(0);
  const [checkResults, setCheckResults] = useState<("pass" | "fail")[]>([]);

  const runChecks = useCallback(() => {
    setStatus("running");
    setCompletedChecks(0);
    setCheckResults([]);

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setCompletedChecks(i);
      if (i >= PRECHECK_ITEMS.length) {
        clearInterval(interval);
        const results: ("pass" | "fail")[] = PRECHECK_ITEMS.map((_, idx) => {
          if (hasOperatorIssues && idx === 1) return "fail";
          return "pass";
        });
        setCheckResults(results);
        setStatus(results.some((r) => r === "fail") ? "failed" : "passed");
      }
    }, 500);
  }, [hasOperatorIssues]);

  useEffect(() => {
    runChecks();
  }, [runChecks]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#1a1a1a] rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.2)] w-[560px] max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center gap-[10px]">
            <Shield className="size-[20px] text-[#0066cc] dark:text-[#4dabf7]" />
            <h2 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[18px]">
              Update pre-check
            </h2>
          </div>
          <button onClick={onClose} className="bg-transparent border-0 cursor-pointer text-[#4d4d4d] dark:text-[#b0b0b0] hover:text-[#151515] dark:hover:text-white p-[4px]">
            <X className="size-[18px]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-[24px] py-[20px] overflow-y-auto flex-1">
          <p className="text-[14px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[20px]">
            Running pre-flight checks for update to <span className="font-semibold text-[#151515] dark:text-white font-['Red_Hat_Mono:Regular',sans-serif]">{version}</span>
          </p>

          <div className="space-y-[12px]">
            {PRECHECK_ITEMS.map((check, idx) => {
              const isDone = idx < completedChecks;
              const isRunning = status === "running" && idx === completedChecks;
              const result = checkResults[idx];

              return (
                <div key={idx} className="flex items-start gap-[12px]">
                  <div className="mt-[2px]">
                    {isRunning && <Loader2 className="size-[16px] text-[#0066cc] dark:text-[#4dabf7] animate-spin" />}
                    {isDone && result === "pass" && <CheckCircle className="size-[16px] text-[#3e8635]" />}
                    {isDone && result === "fail" && <XCircle className="size-[16px] text-[#c9190b]" />}
                    {!isDone && !isRunning && <div className="size-[16px] rounded-full border-2 border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)]" />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-[14px] font-['Red_Hat_Text:Regular',sans-serif] ${isDone ? (result === "fail" ? "text-[#c9190b] font-medium" : "text-[#151515] dark:text-white") : "text-[#4d4d4d] dark:text-[#b0b0b0]"}`}>
                      {check.label}
                    </p>
                    <p className="text-[12px] text-[#6a6e73] dark:text-[#8a8d90] font-['Red_Hat_Text:Regular',sans-serif]">{check.description}</p>
                    {isDone && result === "fail" && (
                      <p className="text-[12px] text-[#c9190b] font-['Red_Hat_Text:Regular',sans-serif] mt-[2px]">
                        Incompatible operators detected. Resolve before proceeding.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Result banner */}
          {status === "passed" && (
            <div className="mt-[20px] rounded-[8px] bg-[rgba(62,134,53,0.08)] border border-[rgba(62,134,53,0.2)] p-[14px] flex items-center gap-[10px]">
              <CheckCircle className="size-[18px] text-[#3e8635] shrink-0" />
              <p className="text-[14px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">
                All pre-flight checks passed. The cluster is ready to update to <span className="font-semibold font-['Red_Hat_Mono:Regular',sans-serif]">{version}</span>.
              </p>
            </div>
          )}
          {status === "failed" && (
            <div className="mt-[20px] rounded-[8px] bg-[rgba(201,25,11,0.06)] border border-[rgba(201,25,11,0.2)] p-[14px] flex items-start gap-[10px]">
              <AlertTriangle className="size-[18px] text-[#c9190b] shrink-0 mt-[1px]" />
              <div>
                <p className="text-[14px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] mb-[4px]">
                  Pre-flight checks failed. Resolve the issues before updating.
                </p>
                <a href="https://docs.openshift.com/container-platform/latest/support/troubleshooting/troubleshooting-operator-issues.html" target="_blank" rel="noopener noreferrer" className="flex items-center gap-[4px] text-[#0066cc] dark:text-[#4dabf7] text-[13px] no-underline hover:underline font-['Red_Hat_Text:Regular',sans-serif]">
                  View logs <ExternalLink className="size-[11px]" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-[12px] px-[24px] py-[16px] border-t border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)]">
          <button onClick={onClose}
            className="bg-transparent text-[#151515] dark:text-white text-[14px] px-[16px] py-[8px] rounded-[6px] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] cursor-pointer hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors font-['Red_Hat_Text:Regular',sans-serif]">
            Close
          </button>
          {status === "passed" && (
            <button onClick={onProceed}
              className="bg-[#0066cc] hover:bg-[#004080] text-white text-[14px] px-[16px] py-[8px] rounded-[6px] border-0 cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
              Update to {version}
            </button>
          )}
          {status === "failed" && (
            <button onClick={runChecks}
              className="flex items-center gap-[6px] bg-transparent text-[#0066cc] dark:text-[#4dabf7] text-[14px] px-[16px] py-[8px] rounded-[6px] border border-[#0066cc] dark:border-[#4dabf7] cursor-pointer hover:bg-[#0066cc]/5 transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
              <RotateCcw className="size-[14px]" /> Re-run checks
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── OLS Chatbot Drawer ─── */
function OlsChatbot({ context, selectedVersion, selectedChannel, onClose }: { context: string; selectedVersion: string; selectedChannel: string; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const initial: ChatMessage[] = [
      { role: "assistant", text: `Hello! I'm OpenShift Lightspeed, your AI assistant for cluster operations.\n\nI can see your cluster is currently on version **5.0.0** using the **${selectedChannel}** channel, and you're considering an update to **${selectedVersion}**.` },
    ];
    if (context === "recommendations") {
      initial.push({ role: "assistant", text: `Based on your cluster's workload profile and update history, here are my recommendations:\n\n• **Recommended version**: ${selectedVersion} — Low risk with strong community adoption\n• **Best update window**: Weekdays 2:00-4:00 AM UTC based on your traffic patterns\n• **Pre-update actions**: Update cluster-logging operator to v6.5+ before proceeding\n• **Estimated downtime**: ~2 minutes for API server restart` });
    } else if (context === "agent-config") {
      initial.push({ role: "assistant", text: "I can help you configure the agent-based update strategy. The agent will:\n\n• **Analyze workload patterns** to find optimal update windows\n• **Run pre-flight checks** automatically before each update\n• **Coordinate operator updates** in the correct dependency order\n• **Monitor rollout health** and trigger automatic rollback if issues are detected\n\nWould you like to configure the update schedule, set rollback thresholds, or review the current agent policy?" });
    } else if (context === "agent-monitor") {
      initial.push({ role: "assistant", text: "The update agent is currently monitoring your cluster. Here's what I can help with:\n\n• View the current agent status and decision log\n• Explain why the agent chose a specific update window\n• Review rollback criteria and thresholds\n• Adjust agent behavior for upcoming maintenance windows\n\nWhat would you like to know?" });
    } else if (context === "agent-precheck") {
      initial.push({ role: "assistant", text: `Starting AI-powered pre-check for update to **${selectedVersion}**...\n\n✅ **Cluster Health** — All components healthy\n✅ **Node Status** — 6/6 nodes Ready\n✅ **Storage Health** — 85% available, all PVs bound\n✅ **Network Health** — OVN verified, no packet loss\n✅ **Certificates** — Valid for >90 days\n✅ **etcd** — Quorum established\n\n⚠️ **Operator Compatibility** — 2 operators need attention:\n• cluster-logging v6.4.3 (max OCP 5.0) → Update to v6.5.1+\n• elasticsearch-operator v5.7.2 (max OCP 5.0) → Update to v5.8.0+\n\n**Next steps:**\n1. Update the incompatible operators from the Cluster Operators tab\n2. Re-run the pre-check to confirm all clear\n3. Approve the update plan to proceed\n\nWould you like me to start the operator updates automatically?` });
    } else if (context === "compatibility-analysis") {
      initial.push({ role: "assistant", text: `I've analyzed the compatibility profile for updating to **${selectedVersion}** on the **${selectedChannel}** channel. Here's what I found:\n\n**Operator Issues:**\n• **Cluster Logging v6.4.3** — max supported OCP is 5.0. You need v6.5.1+ before upgrading.\n• **Elasticsearch Operator v5.7.2** — max supported OCP is 5.0. Upgrade to v5.8.0+.\n• **OLM v4.21.0** — recommended to update to v4.22.0 for full 5.1 support.\n\n**API Deprecations:**\n• \`flowcontrol.apiserver.k8s.io/v1beta2\` — migrate to \`v1\` before 5.2.\n\n**Recommendation:** Update the 2 incompatible operators first, then approve the update plan. I can generate a step-by-step remediation runbook if needed.` });
    }
    return initial;
  });
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", text: "I'm analyzing your cluster configuration and update path. Based on the current state, I recommend resolving any operator compatibility issues before proceeding with the update. Would you like me to generate a step-by-step remediation plan?" }]);
    }, 1200);
  };

  return (
    <div className="fixed top-0 right-0 bottom-0 w-[420px] z-[90] bg-white dark:bg-[#1a1a1a] shadow-[-4px_0_24px_rgba(0,0,0,0.15)] flex flex-col border-l border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)]">
      {/* Header */}
      <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] bg-[#151515] text-white">
        <div className="flex items-center gap-[10px]">
          <div className="size-[32px] rounded-[8px] bg-[#ee0000] flex items-center justify-center">
            <Bot className="size-[18px] text-white" />
          </div>
          <div>
            <p className="text-[14px] font-semibold font-['Red_Hat_Display:SemiBold',sans-serif]">OpenShift Lightspeed</p>
            <p className="text-[11px] text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">AI-powered cluster assistant</p>
          </div>
        </div>
        <button onClick={onClose} className="bg-transparent border-0 cursor-pointer text-[#b0b0b0] hover:text-white p-[4px]">
          <X className="size-[18px]" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-[16px] space-y-[16px]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-[12px] px-[14px] py-[10px] text-[13px] font-['Red_Hat_Text:Regular',sans-serif] leading-[1.5] whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-[#0066cc] text-white rounded-br-[4px]"
                : "bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.05)] text-[#151515] dark:text-white rounded-bl-[4px]"
            }`}>
              {msg.text.split("**").map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-[16px] py-[12px] border-t border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)]">
        <div className="flex items-center gap-[8px] bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.05)] rounded-[8px] px-[12px] py-[8px] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.1)] focus-within:border-[#0066cc] dark:focus-within:border-[#4dabf7] transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask about your cluster update..."
            className="flex-1 bg-transparent border-0 outline-none text-[14px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] placeholder:text-[#8a8d90]"
          />
          <button onClick={sendMessage} disabled={!input.trim()}
            className={`bg-transparent border-0 p-[4px] cursor-pointer transition-colors ${input.trim() ? "text-[#0066cc] dark:text-[#4dabf7]" : "text-[#d2d2d2]"}`}>
            <Send className="size-[16px]" />
          </button>
        </div>
        <p className="text-[11px] text-[#8a8d90] font-['Red_Hat_Text:Regular',sans-serif] mt-[6px] text-center">
          Powered by OpenShift Lightspeed (OLS)
        </p>
      </div>
    </div>
  );
}

/* ─── Toggle Switch ─── */
function Toggle({ enabled, onChange, disabled }: { enabled: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button onClick={onChange} disabled={disabled}
      className={`relative w-[36px] h-[20px] rounded-full border-0 cursor-pointer transition-colors shrink-0 ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${enabled ? "bg-[#0066cc]" : "bg-[#8a8d90]"}`}>
      <div className={`absolute top-[2px] size-[16px] rounded-full bg-white transition-transform ${enabled ? "left-[18px]" : "left-[2px]"}`} />
    </button>
  );
}

/* ─── Agent Mode Panel ─── */
function AgentModePanel({ openChatbot, setActiveTab, navigate }: { openChatbot: (ctx: string) => void; setActiveTab: (tab: TabKey) => void; navigate: ReturnType<typeof useNavigate> }) {
  const [agentStatus, setAgentStatus] = useState<"idle" | "active" | "paused">("idle");
  const [configTab, setConfigTab] = useState<"actions" | "compliance" | "scheduling" | "notifications">("actions");

  const [autoPreflight, setAutoPreflight] = useState(true);
  const [autoRollback, setAutoRollback] = useState(true);
  const [autoOperatorUpdate, setAutoOperatorUpdate] = useState(false);
  const [autoRiskMitigation, setAutoRiskMitigation] = useState(true);

  const [windowDay, setWindowDay] = useState("weekdays");
  const [windowStart, setWindowStart] = useState("02:00");
  const [windowEnd, setWindowEnd] = useState("05:00");
  const [windowTz, setWindowTz] = useState("UTC");
  const [minNodesUp, setMinNodesUp] = useState("2");
  const [maxUnavailablePercent, setMaxUnavailablePercent] = useState("10");
  const [requireApproval, setRequireApproval] = useState(true);

  const [scheduleMode, setScheduleMode] = useState<"optimal" | "fixed" | "custom">("optimal");
  const [fixedDate, setFixedDate] = useState("2026-04-02");
  const [fixedTime, setFixedTime] = useState("02:00");

  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySlack, setNotifySlack] = useState(false);
  const [notifyOnPlan, setNotifyOnPlan] = useState(true);
  const [notifyOnStart, setNotifyOnStart] = useState(true);
  const [notifyOnComplete, setNotifyOnComplete] = useState(true);
  const [notifyOnFailure, setNotifyOnFailure] = useState(true);

  const [planDecision, setPlanDecision] = useState<"pending" | "approved" | "rejected" | null>("pending");
  const [showRiskAcceptModal, setShowRiskAcceptModal] = useState(false);
  const [acceptedSlugs, setAcceptedSlugs] = useState<Set<string>>(new Set());

  const agentPreflightChecks = [
    { label: "Cluster Health", status: "pass" as const, detail: "All cluster components reporting healthy" },
    { label: "Node Status", status: "pass" as const, detail: "6/6 nodes Ready, schedulable" },
    { label: "Storage Health", status: "pass" as const, detail: "85% capacity available, all PVs bound" },
    { label: "Network Health", status: "pass" as const, detail: "SDN/OVN connectivity verified, no packet loss" },
    { label: "Certificate Validity", status: "pass" as const, detail: "All certificates valid for >90 days" },
    { label: "etcd Health", status: "pass" as const, detail: "Quorum established, all members healthy" },
  ];

  const compatAnalysis = {
    operators: [
      { name: "Cluster Logging", category: "Platform" as const, slug: "cluster-logging-6.4.3-max-ocp-5.0", currentVersion: "6.4.3", status: "incompatible" as const, maxOCP: "5.0", action: "Update to v6.5.1+", docUrl: "https://docs.openshift.com/container-platform/latest/logging/cluster-logging-upgrading.html" },
      { name: "Elasticsearch Operator", category: "Catalog" as const, slug: "elasticsearch-5.7.2-max-ocp-5.0", currentVersion: "5.7.2", status: "incompatible" as const, maxOCP: "5.0", action: "Update to v5.8.0+", docUrl: "https://docs.openshift.com/container-platform/latest/logging/log_storage/installing-log-storage.html" },
      { name: "Cert Manager", category: "Catalog" as const, slug: null, currentVersion: "1.12.0", status: "compatible" as const, maxOCP: "5.1", action: null, docUrl: null },
      { name: "Ansible Automation Platform", category: "Catalog" as const, slug: null, currentVersion: "3.1.0", status: "compatible" as const, maxOCP: "5.1", action: null, docUrl: null },
      { name: "Operator Lifecycle Manager", category: "Platform" as const, slug: "olm-4.21-incompatible-5.1", currentVersion: "4.21.0", status: "warning" as const, maxOCP: "5.0", action: "Update to v4.22.0", docUrl: "https://docs.openshift.com/container-platform/latest/operators/admin/olm-upgrading-operators.html" },
    ],
    apiDeprecations: [
      { api: "flowcontrol.apiserver.k8s.io/v1beta2", replacement: "flowcontrol.apiserver.k8s.io/v1", severity: "warning" as const, docUrl: "https://docs.openshift.com/container-platform/latest/updating/preparing_for_updates/updating-cluster-prepare.html#updating-cluster-prepare-apis" },
    ],
    crIncompatibilities: [] as { resource: string; detail: string }[],
  };

  const scheduledExecution = {
    optimalWindow: "Wed Apr 2, 2026 02:00–05:00 UTC",
    estimatedDuration: "1h 45m",
    riskLevel: "Low" as const,
    rollbackStrategy: autoRollback ? "Automatic — revert within 30 minutes if health checks fail" : "Manual — operator must initiate rollback",
  };

  const configTabs = [
    { key: "actions" as const, label: "Automatic actions", icon: Zap },
    { key: "compliance" as const, label: "Compliance & policy", icon: Shield },
    { key: "scheduling" as const, label: "Scheduling", icon: Calendar },
    { key: "notifications" as const, label: "Notifications", icon: Bell },
  ];

  const incompatibleOps = compatAnalysis.operators.filter(o => o.status === "incompatible");
  const warningOps = compatAnalysis.operators.filter(o => o.status === "warning");

  return (
    <div className="space-y-[16px] mb-[16px]">
      {/* Agent Status Bar */}
      <div className="rounded-[16px] border border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] p-[20px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[12px]">
            <div className={`size-[10px] rounded-full ${agentStatus === "active" ? "bg-[#3e8635] animate-pulse" : agentStatus === "paused" ? "bg-[#c58c00]" : "bg-[#8a8d90]"}`} />
            <Bot className="size-[20px] text-[#6753ac]" />
            <span className="text-[15px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white">
              {agentStatus === "active" ? "Update Agent Active" : agentStatus === "paused" ? "Update Agent Paused" : "Update Agent Ready"}
            </span>
            {agentStatus === "active" && (
              <span className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">
                Target: <span className="font-['Red_Hat_Mono:Regular',sans-serif] text-[#151515] dark:text-white">5.1.10</span> &middot; Next check: <span className="font-['Red_Hat_Mono:Regular',sans-serif] text-[#151515] dark:text-white">Tomorrow 02:00 UTC</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-[8px]">
            {agentStatus === "idle" && (
              <>
                <button onClick={() => openChatbot("agent-precheck")}
                  className="flex items-center gap-[6px] bg-transparent text-[#0066cc] dark:text-[#4dabf7] text-[13px] px-[12px] py-[6px] rounded-[6px] border border-[#0066cc] dark:border-[#4dabf7] cursor-pointer hover:bg-[#0066cc]/5 transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
                  Update pre-check with AI <Sparkles className="size-[13px]" />
                </button>
                <button onClick={() => { setAgentStatus("active"); openChatbot("agent-start"); }} className="flex items-center gap-[6px] bg-[#0066cc] hover:bg-[#004080] text-white text-[13px] px-[14px] py-[6px] rounded-[6px] border-0 cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
                  Start update with AI <Sparkles className="size-[13px]" />
                </button>
              </>
            )}
            {agentStatus === "active" && (
              <>
                <button onClick={() => setAgentStatus("paused")} className="flex items-center gap-[6px] bg-transparent text-[#151515] dark:text-white text-[13px] px-[14px] py-[6px] rounded-[6px] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] cursor-pointer hover:bg-[rgba(0,0,0,0.03)] transition-colors font-['Red_Hat_Text:Regular',sans-serif]">
                  <Pause className="size-[13px]" /> Pause agent
                </button>
                <button onClick={() => setAgentStatus("idle")} className="flex items-center gap-[6px] bg-transparent text-[#c9190b] text-[13px] px-[14px] py-[6px] rounded-[6px] border border-[#c9190b]/40 cursor-pointer hover:bg-[#c9190b]/5 transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
                  Cancel update
                </button>
              </>
            )}
            {agentStatus === "paused" && (
              <>
                <button onClick={() => setAgentStatus("active")} className="flex items-center gap-[6px] bg-[#0066cc] hover:bg-[#004080] text-white text-[13px] px-[14px] py-[6px] rounded-[6px] border-0 cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
                  <Play className="size-[13px]" /> Resume agent
                </button>
                <button onClick={() => setAgentStatus("idle")} className="flex items-center gap-[6px] bg-transparent text-[#c9190b] text-[13px] px-[14px] py-[6px] rounded-[6px] border border-[#c9190b]/40 cursor-pointer hover:bg-[#c9190b]/5 transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
                  Cancel update
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Agent Configuration — Tabbed */}
      <div className="rounded-[16px] border border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] overflow-hidden">
        <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] bg-[#fafafa] dark:bg-[rgba(255,255,255,0.02)]">
          <div className="flex items-center gap-[10px]">
            <Settings className="size-[18px] text-[#6753ac]" />
            <h2 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[16px]">Agent Configuration</h2>
          </div>
          <button onClick={() => openChatbot("agent-config")}
            className="flex items-center gap-[6px] bg-transparent text-[#0066cc] dark:text-[#4dabf7] text-[12px] px-[10px] py-[5px] rounded-[6px] border border-[#0066cc] dark:border-[#4dabf7] cursor-pointer hover:bg-[#0066cc]/5 transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
            AI setup assistant <Sparkles className="size-[12px]" />
          </button>
        </div>

        <div className="flex border-b border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)]">
          {configTabs.map((t) => (
            <button key={t.key} onClick={() => setConfigTab(t.key)}
              className={`flex items-center gap-[6px] px-[16px] py-[10px] text-[13px] font-['Red_Hat_Text:Regular',sans-serif] border-0 bg-transparent cursor-pointer transition-colors relative ${configTab === t.key ? "text-[#151515] dark:text-white font-medium" : "text-[#4d4d4d] dark:text-[#b0b0b0] hover:text-[#151515] dark:hover:text-white"}`}>
              <t.icon className="size-[14px]" />
              {t.label}
              {configTab === t.key && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0066cc] dark:bg-[#4dabf7]" />}
            </button>
          ))}
        </div>

        <div className="p-[24px]">
          {/* Automatic Actions */}
          {configTab === "actions" && (
            <div className="space-y-[12px]">
              <div className="flex items-center justify-between bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] rounded-[8px] px-[16px] py-[12px]">
                <div>
                  <p className="text-[14px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] font-medium">Automatic pre-flight checks</p>
                  <p className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">Run all health and compatibility checks before each update attempt</p>
                </div>
                <Toggle enabled={autoPreflight} onChange={() => setAutoPreflight(!autoPreflight)} />
              </div>
              <div className="flex items-center justify-between bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] rounded-[8px] px-[16px] py-[12px]">
                <div>
                  <p className="text-[14px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] font-medium">Automatic rollback on failure</p>
                  <p className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">Revert to previous version if health checks fail within 30 minutes of update completion</p>
                </div>
                <Toggle enabled={autoRollback} onChange={() => setAutoRollback(!autoRollback)} />
              </div>
              <div className="flex items-center justify-between bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] rounded-[8px] px-[16px] py-[12px]">
                <div>
                  <p className="text-[14px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] font-medium">Automatic risk mitigation</p>
                  <p className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">Agent attempts to resolve known risks (e.g., drain failing nodes) before proceeding</p>
                </div>
                <Toggle enabled={autoRiskMitigation} onChange={() => setAutoRiskMitigation(!autoRiskMitigation)} />
              </div>
              <div className="flex items-center justify-between bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] rounded-[8px] px-[16px] py-[12px]">
                <div>
                  <p className="text-[14px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] font-medium">Automatic operator updates</p>
                  <p className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">Update dependent operators to compatible versions before cluster update</p>
                </div>
                <Toggle enabled={autoOperatorUpdate} onChange={() => setAutoOperatorUpdate(!autoOperatorUpdate)} />
              </div>
            </div>
          )}

          {/* Compliance & Policy */}
          {configTab === "compliance" && (
            <div className="space-y-[16px]">
              <div>
                <h3 className="text-[14px] font-semibold text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] mb-[12px]">Optimal Update Window</h3>
                <div className="grid grid-cols-4 gap-[12px]">
                  <div>
                    <label className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[4px] block">Days</label>
                    <select value={windowDay} onChange={(e) => setWindowDay(e.target.value)} className="w-full bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] rounded-[6px] px-[10px] py-[7px] text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] cursor-pointer">
                      <option value="weekdays">Weekdays</option>
                      <option value="weekends">Weekends</option>
                      <option value="any">Any day</option>
                      <option value="tue-thu">Tue–Thu</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[4px] block">Start time</label>
                    <input type="time" value={windowStart} onChange={(e) => setWindowStart(e.target.value)} className="w-full bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] rounded-[6px] px-[10px] py-[7px] text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Mono:Regular',sans-serif]" />
                  </div>
                  <div>
                    <label className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[4px] block">End time</label>
                    <input type="time" value={windowEnd} onChange={(e) => setWindowEnd(e.target.value)} className="w-full bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] rounded-[6px] px-[10px] py-[7px] text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Mono:Regular',sans-serif]" />
                  </div>
                  <div>
                    <label className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[4px] block">Timezone</label>
                    <select value={windowTz} onChange={(e) => setWindowTz(e.target.value)} className="w-full bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] rounded-[6px] px-[10px] py-[7px] text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] cursor-pointer">
                      <option value="UTC">UTC</option>
                      <option value="US/Eastern">US/Eastern</option>
                      <option value="US/Pacific">US/Pacific</option>
                      <option value="Europe/London">Europe/London</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] pt-[16px]">
                <h3 className="text-[14px] font-semibold text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] mb-[12px]">Compliance Rules</h3>
                <div className="grid grid-cols-2 gap-[12px]">
                  <div className="bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] rounded-[8px] px-[14px] py-[10px]">
                    <label className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[4px] block">Minimum nodes available during z-stream updates</label>
                    <select value={minNodesUp} onChange={(e) => setMinNodesUp(e.target.value)} className="w-full bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] rounded-[6px] px-[10px] py-[6px] text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] cursor-pointer">
                      <option value="1">At least 1 node</option>
                      <option value="2">At least 2 nodes</option>
                      <option value="3">At least 3 nodes</option>
                      <option value="50%">At least 50% of nodes</option>
                    </select>
                  </div>
                  <div className="bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] rounded-[8px] px-[14px] py-[10px]">
                    <label className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[4px] block">Max unavailable nodes (percentage)</label>
                    <select value={maxUnavailablePercent} onChange={(e) => setMaxUnavailablePercent(e.target.value)} className="w-full bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] rounded-[6px] px-[10px] py-[6px] text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] cursor-pointer">
                      <option value="10">10%</option>
                      <option value="20">20%</option>
                      <option value="25">25%</option>
                      <option value="33">33%</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] rounded-[8px] px-[14px] py-[10px] mt-[12px]">
                  <div>
                    <p className="text-[14px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] font-medium">Require explicit approval for minor version updates</p>
                    <p className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">Z-stream updates may auto-approve if all checks pass; minor updates always require admin approval</p>
                  </div>
                  <Toggle enabled={requireApproval} onChange={() => setRequireApproval(!requireApproval)} />
                </div>
              </div>
            </div>
          )}

          {/* Scheduling */}
          {configTab === "scheduling" && (
            <div className="space-y-[16px]">
              <div className="space-y-[8px]">
                {(["optimal", "fixed", "custom"] as const).map((mode) => (
                  <button key={mode} onClick={() => setScheduleMode(mode)}
                    className={`flex items-start gap-[12px] w-full text-left rounded-[8px] p-[14px] border transition-colors cursor-pointer bg-transparent ${scheduleMode === mode ? "border-[#0066cc] dark:border-[#4dabf7] bg-[#e7f1fa]/30 dark:bg-[rgba(43,154,243,0.04)]" : "border-[#d2d2d2] dark:border-[rgba(255,255,255,0.1)] hover:border-[#8a8d90]"}`}>
                    <div className={`mt-[2px] size-[18px] rounded-full border-2 flex items-center justify-center shrink-0 ${scheduleMode === mode ? "border-[#0066cc] dark:border-[#4dabf7]" : "border-[#8a8d90]"}`}>
                      {scheduleMode === mode && <div className="size-[10px] rounded-full bg-[#0066cc] dark:bg-[#4dabf7]" />}
                    </div>
                    <div>
                      <p className="text-[14px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] font-medium">
                        {mode === "optimal" ? "AI-recommended optimal window" : mode === "fixed" ? "Fixed schedule" : "Custom time slot"}
                      </p>
                      <p className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mt-[2px]">
                        {mode === "optimal" ? "Agent analyzes workload patterns, traffic, and resource utilization to select the lowest-impact window" : mode === "fixed" ? "Specify an exact date and time for the next update" : "Define recurring time slots and let the agent pick within them"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              {scheduleMode === "fixed" && (
                <div className="grid grid-cols-2 gap-[12px] mt-[8px]">
                  <div>
                    <label className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[4px] block">Date</label>
                    <input type="date" value={fixedDate} onChange={(e) => setFixedDate(e.target.value)} className="w-full bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] rounded-[6px] px-[10px] py-[7px] text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Mono:Regular',sans-serif]" />
                  </div>
                  <div>
                    <label className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[4px] block">Time ({windowTz})</label>
                    <input type="time" value={fixedTime} onChange={(e) => setFixedTime(e.target.value)} className="w-full bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] rounded-[6px] px-[10px] py-[7px] text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Mono:Regular',sans-serif]" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notifications */}
          {configTab === "notifications" && (
            <div className="space-y-[16px]">
              <div>
                <h3 className="text-[14px] font-semibold text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] mb-[10px]">Notification Channels</h3>
                <div className="grid grid-cols-2 gap-[12px]">
                  <div className="flex items-center justify-between bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] rounded-[8px] px-[14px] py-[10px]">
                    <span className="text-[14px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">Email notifications</span>
                    <Toggle enabled={notifyEmail} onChange={() => setNotifyEmail(!notifyEmail)} />
                  </div>
                  <div className="flex items-center justify-between bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] rounded-[8px] px-[14px] py-[10px]">
                    <span className="text-[14px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">Slack / Webhook</span>
                    <Toggle enabled={notifySlack} onChange={() => setNotifySlack(!notifySlack)} />
                  </div>
                </div>
              </div>
              <div className="border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] pt-[16px]">
                <h3 className="text-[14px] font-semibold text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] mb-[10px]">Alert Events</h3>
                <div className="grid grid-cols-2 gap-[8px]">
                  {[
                    { label: "Update plan generated", state: notifyOnPlan, toggle: () => setNotifyOnPlan(!notifyOnPlan) },
                    { label: "Update started", state: notifyOnStart, toggle: () => setNotifyOnStart(!notifyOnStart) },
                    { label: "Update completed", state: notifyOnComplete, toggle: () => setNotifyOnComplete(!notifyOnComplete) },
                    { label: "Update failed / rollback triggered", state: notifyOnFailure, toggle: () => setNotifyOnFailure(!notifyOnFailure) },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] rounded-[8px] px-[14px] py-[10px]">
                      <span className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">{item.label}</span>
                      <Toggle enabled={item.state} onChange={item.toggle} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Agent Proposed Update Plan */}
      {(agentStatus === "active" || agentStatus === "paused") && (
        <div className="rounded-[16px] border border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] overflow-hidden">
          <div className="px-[24px] py-[16px] border-b border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] bg-[#fafafa] dark:bg-[rgba(255,255,255,0.02)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[10px]">
                <FileText className="size-[18px] text-[#6753ac]" />
                <h2 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[16px]">Agent&apos;s Proposed Update Plan</h2>
                {planDecision === "pending" && <span className="text-[11px] px-[8px] py-[2px] rounded-full bg-[#e7f1fa] text-[#0066cc] font-semibold font-['Red_Hat_Text:Regular',sans-serif]">Pending approval</span>}
                {planDecision === "approved" && <span className="text-[11px] px-[8px] py-[2px] rounded-full bg-[rgba(62,134,53,0.1)] text-[#3e8635] font-semibold font-['Red_Hat_Text:Regular',sans-serif]">Approved</span>}
                {planDecision === "rejected" && <span className="text-[11px] px-[8px] py-[2px] rounded-full bg-[rgba(201,25,11,0.1)] text-[#c9190b] font-semibold font-['Red_Hat_Text:Regular',sans-serif]">Rejected</span>}
              </div>
              <span className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">Generated Mar 30, 2026 02:15 UTC</span>
            </div>
          </div>

          <div className="p-[24px] space-y-[20px]">
            {/* Pre-Flight Checks Module */}
            <div>
              <div className="flex items-center gap-[8px] mb-[12px]">
                <Shield className="size-[16px] text-[#3e8635]" />
                <h3 className="text-[15px] font-semibold text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">Pre-Flight Checks</h3>
                <span className="text-[12px] text-[#3e8635] font-semibold px-[8px] py-[1px] rounded-full bg-[rgba(62,134,53,0.1)] font-['Red_Hat_Text:Regular',sans-serif]">
                  {agentPreflightChecks.filter(c => c.status === "pass").length}/{agentPreflightChecks.length} passed
                </span>
              </div>
              <div className="grid grid-cols-3 gap-[8px]">
                {agentPreflightChecks.map((check) => (
                  <div key={check.label} className="flex items-start gap-[8px] bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] rounded-[8px] px-[12px] py-[10px]">
                    <CheckCircle className="size-[14px] text-[#3e8635] shrink-0 mt-[1px]" />
                    <div>
                      <p className="text-[13px] text-[#151515] dark:text-white font-medium font-['Red_Hat_Text:Regular',sans-serif]">{check.label}</p>
                      <p className="text-[11px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mt-[2px]">{check.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compatibility Analysis Module */}
            <div className="border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] pt-[20px]">
              <div className="flex items-center justify-between mb-[12px]">
                <div className="flex items-center gap-[8px]">
                  <Eye className="size-[16px] text-[#c58c00]" />
                  <h3 className="text-[15px] font-semibold text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">Compatibility Analysis</h3>
                  {incompatibleOps.length > 0 && (
                    <span className="text-[12px] text-[#c9190b] font-semibold px-[8px] py-[1px] rounded-full bg-[rgba(201,25,11,0.1)] font-['Red_Hat_Text:Regular',sans-serif]">
                      {incompatibleOps.length} issue{incompatibleOps.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <button onClick={() => openChatbot("compatibility-analysis")}
                  className="flex items-center gap-[6px] bg-transparent text-[#0066cc] dark:text-[#4dabf7] text-[12px] px-[10px] py-[5px] rounded-[6px] border border-[#0066cc] dark:border-[#4dabf7] cursor-pointer hover:bg-[#0066cc]/5 transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
                  AI compatibility check <Sparkles className="size-[12px]" />
                </button>
              </div>

              {/* Operator Compatibility */}
              <div className="mb-[12px]">
                <p className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[8px] font-semibold uppercase tracking-wide">Operator Compatibility Status</p>
                <div className="border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.1)] rounded-[8px] overflow-hidden">
                  <div className="grid grid-cols-[1fr_65px_80px_60px_80px_1fr_100px] gap-[8px] px-[12px] py-[6px] text-[11px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] border-b border-[#d2d2d2] dark:border-[rgba(255,255,255,0.1)]">
                    <span>Operator</span><span>Type</span><span>Version</span><span>Max OCP</span><span>Status</span><span>Required Action</span><span>Resolution</span>
                  </div>
                  {compatAnalysis.operators.map((op) => (
                    <div key={op.name} className={`grid grid-cols-[1fr_65px_80px_60px_80px_1fr_100px] gap-[8px] items-center px-[12px] py-[8px] border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] last:border-0 ${op.status === "incompatible" ? "bg-[rgba(201,25,11,0.02)]" : ""}`}>
                      <span className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">{op.name}</span>
                      <span className={`text-[10px] px-[4px] py-[1px] rounded-[3px] font-semibold w-fit font-['Red_Hat_Text:Regular',sans-serif] ${op.category === "Platform" ? "bg-[rgba(94,64,190,0.1)] text-[#5e40be]" : "bg-[rgba(0,102,204,0.1)] text-[#0066cc]"}`}>
                        {op.category}
                      </span>
                      <span className="text-[12px] font-['Red_Hat_Mono:Regular',sans-serif] text-[#151515] dark:text-white">{op.currentVersion}</span>
                      <span className="text-[12px] font-['Red_Hat_Mono:Regular',sans-serif] text-[#4d4d4d] dark:text-[#b0b0b0]">{op.maxOCP}</span>
                      <span>
                        {op.status === "compatible" && <span className="flex items-center gap-[3px] text-[11px] text-[#3e8635] font-semibold"><CheckCircle className="size-[10px]" /> OK</span>}
                        {op.status === "incompatible" && <span className="flex items-center gap-[3px] text-[11px] text-[#c9190b] font-semibold"><XCircle className="size-[10px]" /> Blocked</span>}
                        {op.status === "warning" && <span className="flex items-center gap-[3px] text-[11px] text-[#c58c00] font-semibold"><AlertTriangle className="size-[10px]" /> Warn</span>}
                      </span>
                      <span className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">{op.action ?? "—"}</span>
                      <span>
                        {op.action ? (
                          <div className="flex items-center gap-[6px]">
                            <button onClick={() => setActiveTab("cluster-operators")} className="bg-transparent border-0 p-0 text-[#0066cc] dark:text-[#4dabf7] text-[11px] cursor-pointer hover:underline font-['Red_Hat_Text:Regular',sans-serif] font-medium whitespace-nowrap">
                              Update now
                            </button>
                            {op.docUrl && (
                              <a href={op.docUrl} target="_blank" rel="noopener noreferrer" className="text-[#4d4d4d] dark:text-[#b0b0b0] hover:text-[#0066cc] dark:hover:text-[#4dabf7]" title="View documentation">
                                <ExternalLink className="size-[11px]" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#3e8635]">No action needed</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resolution summary when issues exist */}
              {(incompatibleOps.length > 0 || warningOps.length > 0) && (
                <div className="rounded-[8px] border border-[#c58c00]/30 bg-[#fdf7e7] dark:bg-[rgba(197,140,0,0.06)] p-[14px] mb-[12px]">
                  <div className="flex items-start gap-[10px]">
                    <AlertTriangle className="size-[16px] text-[#c58c00] shrink-0 mt-[1px]" />
                    <div className="flex-1">
                      <p className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] font-semibold mb-[8px]">
                        {incompatibleOps.length} blocking issue{incompatibleOps.length !== 1 ? "s" : ""} must be resolved before this update can proceed
                      </p>
                      <div className="space-y-[6px] mb-[12px]">
                        {compatAnalysis.operators.filter(o => o.status !== "compatible").map((op) => (
                          <div key={op.name} className="flex items-center gap-[8px] text-[12px] font-['Red_Hat_Text:Regular',sans-serif]">
                            {op.status === "incompatible" ? <XCircle className="size-[12px] text-[#c9190b] shrink-0" /> : <AlertTriangle className="size-[12px] text-[#c58c00] shrink-0" />}
                            <span className="text-[#151515] dark:text-white font-medium">{op.name}</span>
                            <span className="text-[#4d4d4d] dark:text-[#b0b0b0]">→</span>
                            <span className="text-[#151515] dark:text-white font-['Red_Hat_Mono:Regular',sans-serif]">{op.action}</span>
                            {op.docUrl && (
                              <a href={op.docUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-[3px] text-[#0066cc] dark:text-[#4dabf7] no-underline hover:underline">
                                Docs <ExternalLink className="size-[10px]" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-[8px]">
                        <button onClick={() => setActiveTab("cluster-operators")}
                          className="bg-[#0066cc] hover:bg-[#004080] text-white text-[12px] px-[12px] py-[5px] rounded-[6px] border-0 cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
                          Go to cluster operators
                        </button>
                        <button onClick={() => openChatbot("compatibility-analysis")}
                          className="flex items-center gap-[5px] bg-transparent text-[#0066cc] dark:text-[#4dabf7] text-[12px] px-[12px] py-[5px] rounded-[6px] border border-[#0066cc] dark:border-[#4dabf7] cursor-pointer hover:bg-[#0066cc]/5 transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
                          Get AI remediation plan <Sparkles className="size-[11px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* API Deprecations */}
              <div className="grid grid-cols-2 gap-[12px]">
                <div>
                  <p className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[8px] font-semibold uppercase tracking-wide">API Deprecations</p>
                  {compatAnalysis.apiDeprecations.length > 0 ? (
                    <div className="space-y-[6px]">
                      {compatAnalysis.apiDeprecations.map((dep, i) => (
                        <div key={i} className="bg-[#fdf7e7] dark:bg-[rgba(197,140,0,0.06)] rounded-[6px] px-[12px] py-[8px] border border-[#c58c00]/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-[6px]">
                              <AlertTriangle className="size-[12px] text-[#c58c00] shrink-0" />
                              <span className="text-[12px] font-['Red_Hat_Mono:Regular',sans-serif] text-[#151515] dark:text-white">{dep.api}</span>
                            </div>
                            {dep.docUrl && (
                              <a href={dep.docUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-[3px] text-[#0066cc] dark:text-[#4dabf7] text-[10px] no-underline hover:underline font-['Red_Hat_Text:Regular',sans-serif]">
                                How to fix <ExternalLink className="size-[9px]" />
                              </a>
                            )}
                          </div>
                          <p className="text-[11px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mt-[4px] ml-[18px]">
                            Replace with <span className="font-['Red_Hat_Mono:Regular',sans-serif] text-[#151515] dark:text-white">{dep.replacement}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-[6px] text-[12px] text-[#3e8635] font-['Red_Hat_Text:Regular',sans-serif]">
                      <CheckCircle className="size-[12px]" /> No deprecated APIs detected
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[8px] font-semibold uppercase tracking-wide">Custom Resource Incompatibilities</p>
                  {compatAnalysis.crIncompatibilities.length > 0 ? (
                    <div className="space-y-[6px]">
                      {compatAnalysis.crIncompatibilities.map((cr, i) => (
                        <div key={i} className="bg-[rgba(201,25,11,0.04)] rounded-[6px] px-[12px] py-[8px] border border-[#c9190b]/20">
                          <span className="text-[12px] font-['Red_Hat_Mono:Regular',sans-serif] text-[#c9190b]">{cr.resource}</span>
                          <p className="text-[11px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mt-[2px]">{cr.detail}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-[6px] text-[12px] text-[#3e8635] font-['Red_Hat_Text:Regular',sans-serif]">
                      <CheckCircle className="size-[12px]" /> No CR incompatibilities found
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Scheduled Execution Module */}
            <div className="border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] pt-[20px]">
              <div className="flex items-center gap-[8px] mb-[12px]">
                <Clock className="size-[16px] text-[#0066cc]" />
                <h3 className="text-[15px] font-semibold text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">Scheduled Execution</h3>
              </div>
              <div className="grid grid-cols-4 gap-[12px]">
                <div className="bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] rounded-[8px] px-[14px] py-[10px]">
                  <p className="text-[11px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[4px]">Optimal Window</p>
                  <p className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Mono:Regular',sans-serif] font-medium">{scheduledExecution.optimalWindow}</p>
                </div>
                <div className="bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] rounded-[8px] px-[14px] py-[10px]">
                  <p className="text-[11px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[4px]">Estimated Duration</p>
                  <p className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Mono:Regular',sans-serif] font-medium">{scheduledExecution.estimatedDuration}</p>
                </div>
                <div className="bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] rounded-[8px] px-[14px] py-[10px]">
                  <p className="text-[11px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[4px]">Risk Level</p>
                  <span className={`text-[12px] px-[8px] py-[2px] rounded-[4px] font-semibold ${scheduledExecution.riskLevel === "Low" ? "bg-[rgba(62,134,53,0.1)] text-[#3e8635]" : scheduledExecution.riskLevel === "Medium" ? "bg-[rgba(197,140,0,0.1)] text-[#c58c00]" : "bg-[rgba(201,25,11,0.1)] text-[#c9190b]"}`}>
                    {scheduledExecution.riskLevel} Risk
                  </span>
                </div>
                <div className="bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] rounded-[8px] px-[14px] py-[10px]">
                  <p className="text-[11px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[4px]">Rollback Strategy</p>
                  <p className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">{autoRollback ? "Automatic" : "Manual"}</p>
                </div>
              </div>
              <p className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mt-[8px]">
                {scheduledExecution.rollbackStrategy}
              </p>
            </div>

            {/* Explicit Decision Workflow */}
            {incompatibleOps.length > 0 && (
              <div className="rounded-[8px] border-2 border-[#c9190b]/40 bg-[rgba(201,25,11,0.03)] dark:bg-[rgba(201,25,11,0.06)] p-[14px]">
                <div className="flex items-start gap-[10px]">
                  <XCircle className="size-[16px] text-[#c9190b] shrink-0 mt-[1px]" />
                  <div className="flex-1">
                    <p className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] font-semibold mb-[6px]">
                      Resolve {incompatibleOps.length} blocking issue{incompatibleOps.length !== 1 ? "s" : ""} before approving
                    </p>
                    <p className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[10px]">
                      The following operators are incompatible with the target version and must be updated first. You can also choose to accept risks and proceed.
                    </p>
                    <div className="space-y-[4px] mb-[12px]">
                      {incompatibleOps.map((op) => (
                        <div key={op.name} className="flex items-center gap-[6px] text-[12px] font-['Red_Hat_Text:Regular',sans-serif]">
                          <span className="text-[#c9190b]">&#x2022;</span>
                          <span className="text-[#151515] dark:text-white font-medium">{op.name} {op.currentVersion}</span>
                          <span className="text-[#4d4d4d] dark:text-[#b0b0b0]">→ {op.action}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-[8px]">
                      <button onClick={() => setActiveTab("cluster-operators")}
                        className="bg-[#0066cc] hover:bg-[#004080] text-white text-[12px] px-[12px] py-[5px] rounded-[6px] border-0 cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
                        Resolve in cluster operators
                      </button>
                      <button onClick={() => openChatbot("compatibility-analysis")}
                        className="flex items-center gap-[5px] bg-transparent text-[#0066cc] dark:text-[#4dabf7] text-[12px] px-[12px] py-[5px] rounded-[6px] border border-[#0066cc] dark:border-[#4dabf7] cursor-pointer hover:bg-[#0066cc]/5 transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
                        Get AI remediation plan <Sparkles className="size-[11px]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {incompatibleOps.length === 0 && warningOps.length > 0 && (
              <div className="rounded-[8px] border-2 border-[#5e40be] bg-white dark:bg-[rgba(94,64,190,0.06)] p-[14px]">
                <div className="flex items-start gap-[10px]">
                  <Info className="size-[16px] text-[#5e40be] shrink-0 mt-[1px]" />
                  <div>
                    <p className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">
                      <span className="font-semibold">Acknowledged risks:</span> Approving this plan will set <span className="font-['Red_Hat_Mono:Regular',sans-serif] text-[#5e40be]">desiredUpdate.acceptedRisks</span>.
                      {warningOps.length > 0 && ` ${warningOps.length} warning${warningOps.length > 1 ? "s" : ""} will be logged but won't block the update.`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] pt-[20px] flex items-center justify-between">
              <p className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">
                Target: <span className="font-['Red_Hat_Mono:Regular',sans-serif] text-[#151515] dark:text-white font-medium">5.0.0 → 5.1.10</span>
              </p>
              <div className="flex items-center gap-[10px]">
                <button onClick={() => setPlanDecision("rejected")}
                  className={`text-[14px] px-[16px] py-[8px] rounded-[6px] border cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium ${planDecision === "rejected" ? "bg-[rgba(201,25,11,0.1)] text-[#c9190b] border-[#c9190b]" : "bg-transparent text-[#c9190b] border-[#c9190b] hover:bg-[rgba(201,25,11,0.05)]"}`}>
                  Reject plan
                </button>
                <button onClick={() => { setScheduleMode("fixed"); setConfigTab("scheduling"); }}
                  className="bg-transparent text-[#151515] dark:text-white text-[14px] px-[16px] py-[8px] rounded-[6px] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] cursor-pointer hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors font-['Red_Hat_Text:Regular',sans-serif]">
                  Modify schedule
                </button>
                {incompatibleOps.length > 0 ? (
                  <div className="relative group">
                    <button disabled
                      className="text-[14px] px-[16px] py-[8px] rounded-[6px] border-0 transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium bg-[#d2d2d2] text-[#6a6e73] cursor-not-allowed">
                      Approve plan
                    </button>
                    <div className="absolute bottom-full right-0 mb-[6px] hidden group-hover:block z-10">
                      <div className="bg-[#151515] text-white text-[11px] px-[10px] py-[6px] rounded-[6px] shadow-lg whitespace-nowrap font-['Red_Hat_Text:Regular',sans-serif]">
                        Resolve {incompatibleOps.length} blocking issue{incompatibleOps.length !== 1 ? "s" : ""} to approve
                      </div>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setPlanDecision("approved")}
                    className={`text-[14px] px-[16px] py-[8px] rounded-[6px] border-0 cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium ${planDecision === "approved" ? "bg-[#3e8635] text-white" : "bg-[#0066cc] hover:bg-[#004080] text-white"}`}>
                    {planDecision === "approved" ? "✓ Plan approved" : "Approve plan"}
                  </button>
                )}
                {incompatibleOps.length > 0 && (
                  <button onClick={() => setShowRiskAcceptModal(true)}
                    className="text-[14px] px-[16px] py-[8px] rounded-[6px] border border-[#c58c00] text-[#c58c00] bg-transparent cursor-pointer hover:bg-[rgba(197,140,0,0.05)] transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
                    Accept risks &amp; approve
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Per-risk acceptance modal */}
      {showRiskAcceptModal && (() => {
        const allRisks = [
          ...incompatibleOps.map((op) => ({ slug: op.slug!, name: op.name, severity: "critical" as const, detail: `${op.name} ${op.currentVersion} (max OCP ${op.maxOCP}) — ${op.action}` })),
          ...warningOps.map((op) => ({ slug: op.slug!, name: op.name, severity: "warning" as const, detail: `${op.name} ${op.currentVersion} (max OCP ${op.maxOCP}) — ${op.action}` })),
        ];
        const allAccepted = allRisks.every((r) => acceptedSlugs.has(r.slug));
        const toggleSlug = (slug: string) => {
          setAcceptedSlugs((prev) => { const next = new Set(prev); if (next.has(slug)) next.delete(slug); else next.add(slug); return next; });
        };
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-[12px] shadow-2xl w-[560px] max-h-[80vh] overflow-auto">
              <div className="flex items-center justify-between px-[24px] py-[18px] border-b border-[#d2d2d2] dark:border-[rgba(255,255,255,0.1)]">
                <h3 className="text-[16px] font-semibold text-[#151515] dark:text-white font-['Red_Hat_Display:SemiBold',sans-serif]">Accept known risks</h3>
                <button onClick={() => setShowRiskAcceptModal(false)} className="bg-transparent border-0 cursor-pointer text-[#4d4d4d] dark:text-[#b0b0b0] hover:text-[#151515] dark:hover:text-white">
                  <X className="size-[18px]" />
                </button>
              </div>

              <div className="px-[24px] py-[16px]">
                <div className="flex items-start gap-[10px] bg-[#fdf7e7] dark:bg-[rgba(197,140,0,0.06)] rounded-[8px] px-[14px] py-[10px] mb-[16px] border border-[#c58c00]/30">
                  <AlertTriangle className="size-[16px] text-[#c58c00] shrink-0 mt-[1px]" />
                  <p className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">
                    Acknowledging these risks will set <span className="font-['Red_Hat_Mono:Regular',sans-serif] text-[#5e40be]">desiredUpdate.acceptedRisks</span> on the ClusterVersion resource.
                    The update will proceed despite known incompatibilities.
                  </p>
                </div>

                <p className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[12px] font-semibold uppercase tracking-wide">
                  {allRisks.length} risk{allRisks.length !== 1 ? "s" : ""} identified
                </p>

                <div className="space-y-[8px] mb-[16px]">
                  {allRisks.map((risk) => (
                    <label key={risk.slug} className={`flex items-start gap-[10px] rounded-[8px] p-[12px] border cursor-pointer transition-colors ${acceptedSlugs.has(risk.slug) ? "border-[#0066cc] bg-[#e7f1fa]/30 dark:bg-[rgba(43,154,243,0.04)]" : "border-[#d2d2d2] dark:border-[rgba(255,255,255,0.1)] hover:border-[#8a8d90]"}`}>
                      <input type="checkbox" checked={acceptedSlugs.has(risk.slug)} onChange={() => toggleSlug(risk.slug)}
                        className="size-[16px] mt-[2px] cursor-pointer accent-[#0066cc] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-[6px] mb-[4px]">
                          {risk.severity === "critical" ? <XCircle className="size-[12px] text-[#c9190b] shrink-0" /> : <AlertTriangle className="size-[12px] text-[#c58c00] shrink-0" />}
                          <span className="text-[13px] text-[#151515] dark:text-white font-medium font-['Red_Hat_Text:Regular',sans-serif]">{risk.name}</span>
                          <span className={`text-[10px] px-[5px] py-[1px] rounded-[3px] font-semibold ${risk.severity === "critical" ? "bg-[rgba(201,25,11,0.1)] text-[#c9190b]" : "bg-[rgba(197,140,0,0.1)] text-[#c58c00]"}`}>
                            {risk.severity}
                          </span>
                        </div>
                        <p className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">{risk.detail}</p>
                        <p className="text-[11px] text-[#6a6e73] dark:text-[#8a8d90] font-['Red_Hat_Mono:Regular',sans-serif] mt-[4px]">slug: {risk.slug}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between px-[24px] py-[16px] border-t border-[#d2d2d2] dark:border-[rgba(255,255,255,0.1)]">
                <button onClick={() => setShowRiskAcceptModal(false)}
                  className="bg-transparent text-[#4d4d4d] dark:text-[#b0b0b0] text-[14px] px-[16px] py-[8px] rounded-[6px] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] cursor-pointer hover:bg-[rgba(0,0,0,0.03)] transition-colors font-['Red_Hat_Text:Regular',sans-serif]">
                  Cancel
                </button>
                <button disabled={!allAccepted}
                  onClick={() => { setPlanDecision("approved"); setShowRiskAcceptModal(false); }}
                  className={`text-[14px] px-[16px] py-[8px] rounded-[6px] border-0 transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium ${allAccepted ? "bg-[#0066cc] hover:bg-[#004080] text-white cursor-pointer" : "bg-[#d2d2d2] text-[#6a6e73] cursor-not-allowed"}`}>
                  Accept {allRisks.length} risk{allRisks.length !== 1 ? "s" : ""} &amp; approve plan
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ─── Tooltip component ─── */
function InfoTooltip() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative inline-flex" ref={ref}>
      <button onClick={() => setOpen(!open)} className="bg-transparent border-0 cursor-pointer p-[2px] text-[#6a6e73] dark:text-[#b0b0b0] hover:text-[#0066cc] dark:hover:text-[#4dabf7] transition-colors" aria-label="Learn more about available updates">
        <HelpCircle className="size-[16px]" />
      </button>
      {open && (
        <div className="absolute top-[28px] left-1/2 -translate-x-1/2 z-50 w-[320px] bg-white dark:bg-[#1a1a1a] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.15)] rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] p-[16px]">
          <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-[12px] h-[12px] bg-white dark:bg-[#1a1a1a] border-l border-t border-[#d2d2d2] dark:border-[rgba(255,255,255,0.15)] rotate-45" />
          <p className="text-[#151515] dark:text-white text-[13px] font-['Red_Hat_Text:Regular',sans-serif] mb-[8px]">
            Available updates are determined by your selected channel and the cluster's current version. Versions are tested for upgrade compatibility and risk is assessed based on known issues.
          </p>
          <a href="https://docs.openshift.com/container-platform/latest/updating/understanding_updates/intro-to-updates.html" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-[4px] text-[#0066cc] dark:text-[#4dabf7] text-[13px] no-underline hover:underline font-['Red_Hat_Text:Regular',sans-serif]">
            View documentation <ExternalLink className="size-[11px]" />
          </a>
        </div>
      )}
    </div>
  );
}

/* ─── Available Updates Section ─── */
function AvailableUpdatesSection({
  channelData, showZStreamOnly, setShowZStreamOnly,
  expandedGroups, setExpandedGroups,
  selectedVersion, setSelectedVersion, navigate, setActiveTab, setPrecheckVersion, openChatbot,
}: any) {
  const [updateAllOps, setUpdateAllOps] = useState(false);
  const filteredGroups: VersionGroup[] = showZStreamOnly
    ? channelData.groups.filter((g: VersionGroup) => g.label.startsWith("5.0"))
    : channelData.groups;

  return (
    <div>
      <div className="flex items-center justify-between mb-[16px]">
        <div className="flex items-center gap-[6px]">
          <h2 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[18px]">Available Updates</h2>
          <InfoTooltip />
        </div>
        <div className="flex items-center gap-[12px]">
          <div className="flex items-center gap-[8px]">
            <span className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[13px] font-['Red_Hat_Text:Regular',sans-serif]">Show only 5.0 Z-stream updates</span>
            <button onClick={() => setShowZStreamOnly(!showZStreamOnly)}
              className={`relative w-[36px] h-[20px] rounded-full border-0 cursor-pointer transition-colors ${showZStreamOnly ? "bg-[#0066cc]" : "bg-[#8a8d90]"}`}>
              <div className={`absolute top-[2px] size-[16px] rounded-full bg-white transition-transform ${showZStreamOnly ? "left-[18px]" : "left-[2px]"}`} />
            </button>
          </div>
          <button onClick={() => openChatbot("recommendations")}
            className="flex items-center gap-[8px] bg-transparent text-[#0066cc] dark:text-[#4dabf7] text-[13px] px-[12px] py-[6px] rounded-[6px] border border-[#0066cc] dark:border-[#4dabf7] cursor-pointer hover:bg-[#0066cc]/5 dark:hover:bg-[#4dabf7]/10 transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
            AI recommendations
            <Sparkles className="size-[13px]" />
          </button>
        </div>
      </div>

      {!showZStreamOnly && channelData.banner && (
        <div className="flex items-center gap-[12px] bg-white dark:bg-[rgba(94,64,190,0.06)] px-[16px] py-[12px] mb-[20px] rounded-[16px] border-2 border-[#5e40be]" role="status">
          <Info className="size-[18px] text-[#5e40be] dark:text-[#b2a3e0] shrink-0" />
          <p className="text-[#151515] dark:text-white text-[14px] font-['Red_Hat_Text:Regular',sans-serif] flex-1">
            <span className="font-medium">{channelData.banner.title}</span> {channelData.banner.description}
          </p>
          <a href="https://docs.openshift.com/container-platform/latest/release_notes/ocp-4-18-release-notes.html" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-[4px] text-[#0066cc] dark:text-[#4dabf7] text-[13px] no-underline hover:underline whitespace-nowrap font-['Red_Hat_Text:Regular',sans-serif] font-medium">
            {channelData.banner.link} <ArrowRight className="size-[14px]" />
          </a>
        </div>
      )}

      {filteredGroups.length === 0 && (
        <p className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[14px] font-['Red_Hat_Text:Regular',sans-serif] py-[20px]">No updates available for this channel and filter combination.</p>
      )}

      {filteredGroups.map((group: VersionGroup) => (
        <VersionGroupComponent key={group.label} label={group.label} versions={group.versions}
          expanded={!!expandedGroups[group.label]}
          setExpanded={(val: boolean) => setExpandedGroups((prev: Record<string, boolean>) => ({ ...prev, [group.label]: val }))}
          selectedVersion={selectedVersion} setSelectedVersion={setSelectedVersion} navigate={navigate} setActiveTab={setActiveTab} setPrecheckVersion={setPrecheckVersion}
          updateAllOps={updateAllOps} setUpdateAllOps={setUpdateAllOps} />
      ))}
    </div>
  );
}

/* ─── Version Group ─── */
const COL_TEMPLATE = "32px 140px 180px 100px 140px auto";

function VersionGroupComponent({ label, versions, expanded, setExpanded, selectedVersion, setSelectedVersion, navigate, setActiveTab, setPrecheckVersion, updateAllOps, setUpdateAllOps }: any) {
  const [showManualRiskModal, setShowManualRiskModal] = useState(false);
  const [manualAcceptedSlugs, setManualAcceptedSlugs] = useState<Set<string>>(new Set());
  const [riskModalVersion, setRiskModalVersion] = useState<string | null>(null);

  return (
    <div className="mb-[8px]">
      <button onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-[8px] bg-transparent border-0 cursor-pointer p-[8px] -ml-[8px] hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.03)] rounded-[6px] transition-colors w-full text-left">
        {expanded ? <ChevronDown className="size-[16px] text-[#4d4d4d] dark:text-[#b0b0b0]" /> : <ChevronRight className="size-[16px] text-[#4d4d4d] dark:text-[#b0b0b0]" />}
        <span className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[15px]">{label}</span>
        <span className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[13px] font-['Red_Hat_Text:Regular',sans-serif]">{versions.length} releases</span>
      </button>

      {expanded && (
        <div className="mt-[4px]">
          <div className="grid gap-[8px] px-[12px] py-[8px] text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] border-b border-[#d2d2d2] dark:border-[rgba(255,255,255,0.1)]"
            style={{ gridTemplateColumns: COL_TEMPLATE }}>
            <span /><span>Version</span><span>Details</span><span>Assessment</span><span>Date</span><span />
          </div>
          {versions.map((v: VersionEntry) => {
            const isSelected = selectedVersion === v.version;
            const hasIssues = isSelected && v.operatorIssues && v.operatorIssues.length > 0;
            return (
              <div key={v.version}>
                <div onClick={() => setSelectedVersion(v.version)}
                  className={`grid gap-[8px] items-center px-[12px] py-[10px] w-full text-left cursor-pointer transition-colors ${!hasIssues ? "border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)]" : ""} ${isSelected ? "bg-[#e7f1fa] dark:bg-[rgba(43,154,243,0.08)]" : "hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)]"}`}
                  style={{ gridTemplateColumns: COL_TEMPLATE }}>
                  <div className="flex items-center justify-center">
                    <div className={`size-[18px] rounded-full border-2 flex items-center justify-center ${isSelected ? "border-[#0066cc] dark:border-[#4dabf7]" : "border-[#8a8d90]"}`}>
                      {isSelected && <div className="size-[10px] rounded-full bg-[#0066cc] dark:bg-[#4dabf7]" />}
                    </div>
                  </div>
                  <div className="flex flex-col gap-[2px]">
                    <div className="flex items-center gap-[8px]">
                      <Link to={`/administration/cluster-update/version/${v.version}`} onClick={(e) => e.stopPropagation()}
                        className="text-[#0066cc] dark:text-[#4dabf7] text-[14px] no-underline hover:underline font-['Red_Hat_Mono:Regular',sans-serif]">{v.version}</Link>
                      {v.recommended && <span className="bg-[#e7f1fa] dark:bg-[rgba(43,154,243,0.15)] text-[#0066cc] dark:text-[#4dabf7] text-[11px] px-[8px] py-[2px] rounded-full font-semibold">Recommended</span>}
                    </div>
                  </div>
                  <span className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">{v.features} features &middot; {v.bugFixes} bug fixes</span>
                  <div>
                    <span className="text-[12px] px-[8px] py-[2px] rounded-[4px] font-semibold" style={{
                      backgroundColor: v.riskColor === "#3e8635" ? "rgba(62,134,53,0.1)" : v.riskColor === "#c9190b" ? "rgba(201,25,11,0.1)" : "rgba(197,140,0,0.1)", color: v.riskColor }}>
                      {v.risk}
                    </span>
                  </div>
                  <div className="flex flex-col gap-[2px]">
                    <span className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">{v.date}</span>
                    <a href="https://docs.openshift.com/container-platform/latest/release_notes/ocp-4-18-release-notes.html" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-[4px] text-[#0066cc] dark:text-[#4dabf7] text-[12px] no-underline hover:underline font-['Red_Hat_Text:Regular',sans-serif]">
                      Release notes <ExternalLink className="size-[11px]" />
                    </a>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    {isSelected && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); setPrecheckVersion(v.version); }}
                          className="bg-transparent text-[#0066cc] dark:text-[#4dabf7] text-[12px] px-[10px] py-[5px] rounded-[6px] border border-[#0066cc] dark:border-[#4dabf7] cursor-pointer hover:bg-[#0066cc]/5 transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium whitespace-nowrap">
                          Update pre-check
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/administration/cluster-update/preflight?version=${v.version}`, { state: { version: v.version } }); }}
                          className="bg-[#0066cc] hover:bg-[#004080] text-white text-[12px] px-[10px] py-[5px] rounded-[6px] border-0 cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium whitespace-nowrap">
                          Update to {v.version}
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {hasIssues && (
                  <div className="border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] bg-[#e7f1fa]/50 dark:bg-[rgba(43,154,243,0.04)]">
                    <div className="mx-[12px] my-[10px] rounded-[8px] border-l-[4px] border-l-[#c58c00] border border-[#c58c00]/30 bg-[#fdf7e7] dark:bg-[rgba(197,140,0,0.08)] p-[14px]">
                      <div className="flex items-start gap-[10px]">
                        <AlertTriangle className="size-[16px] text-[#c58c00] shrink-0 mt-[1px]" />
                        <div className="flex-1">
                          <p className="font-['Red_Hat_Text:Regular',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px] mb-[6px]">
                            This cluster should not be updated to {v.version} until the following issues are resolved.
                          </p>
                          <ul className="list-disc pl-[18px] space-y-[3px] text-[12px] font-['Red_Hat_Text:Regular',sans-serif] text-[#4d4d4d] dark:text-[#b0b0b0] mb-[8px]">
                            {v.operatorIssues!.map((issue, i) => (
                              <li key={i}><span className="text-[#151515] dark:text-white font-medium">{issue.name}:</span> {issue.message}</li>
                            ))}
                          </ul>
                          <div className="flex items-center gap-[16px] flex-wrap">
                            <div className="flex items-center gap-[6px]">
                              <Toggle enabled={updateAllOps} onChange={() => setUpdateAllOps(!updateAllOps)} />
                              <span className="text-[12px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">Update all operators</span>
                            </div>
                            <button onClick={() => setActiveTab("cluster-operators")}
                              className="bg-transparent border-0 p-0 text-[#0066cc] dark:text-[#4dabf7] text-[12px] cursor-pointer hover:underline font-['Red_Hat_Text:Regular',sans-serif]">
                              View cluster operators
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setRiskModalVersion(v.version); setManualAcceptedSlugs(new Set()); setShowManualRiskModal(true); }}
                              className="bg-transparent border border-[#0066cc] dark:border-[#4dabf7] text-[#0066cc] dark:text-[#4dabf7] text-[12px] px-[10px] py-[4px] rounded-[6px] cursor-pointer hover:bg-[#0066cc]/5 transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
                              Accept risks &amp; update
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Risk Acceptance Modal */}
      {showManualRiskModal && riskModalVersion && (() => {
        const ver = versions.find((v: VersionEntry) => v.version === riskModalVersion);
        if (!ver?.operatorIssues?.length) return null;
        const allRisks = ver.operatorIssues.map((issue: any) => ({
          slug: issue.slug,
          name: issue.name,
          severity: issue.severity,
          detail: issue.message,
        }));
        const allAccepted = allRisks.every((r: any) => manualAcceptedSlugs.has(r.slug));
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowManualRiskModal(false)}>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.2)] max-w-[520px] w-full mx-[16px] max-h-[80vh] flex flex-col" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)]">
                <h3 className="text-[16px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white">Accept known risks</h3>
                <button onClick={() => setShowManualRiskModal(false)} className="bg-transparent border-0 cursor-pointer text-[#6a6e73] hover:text-[#151515] dark:hover:text-white p-[4px]">
                  <X className="size-[16px]" />
                </button>
              </div>
              <div className="px-[24px] py-[16px] overflow-y-auto flex-1">
                <div className="flex items-start gap-[10px] bg-[#fdf7e7] dark:bg-[rgba(197,140,0,0.06)] rounded-[8px] px-[14px] py-[10px] mb-[16px] border border-[#c58c00]/30">
                  <AlertTriangle className="size-[16px] text-[#c58c00] shrink-0 mt-[1px]" />
                  <p className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">
                    Acknowledging these risks will set <span className="font-['Red_Hat_Mono:Regular',sans-serif] text-[#5e40be]">desiredUpdate.acceptedRisks</span> on the ClusterVersion resource. The update to <span className="font-semibold">{riskModalVersion}</span> will proceed despite known incompatibilities.
                  </p>
                </div>
                <p className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] uppercase tracking-[0.5px] font-semibold mb-[10px]">{allRisks.length} risk{allRisks.length !== 1 ? "s" : ""} identified</p>
                <div className="space-y-[10px]">
                  {allRisks.map((risk: any) => (
                    <label key={risk.slug} className={`flex items-start gap-[12px] p-[14px] rounded-[8px] border cursor-pointer transition-colors ${manualAcceptedSlugs.has(risk.slug) ? "border-[#0066cc] bg-[#e7f1fa]/30 dark:bg-[rgba(43,154,243,0.06)]" : "border-[#d2d2d2] dark:border-[rgba(255,255,255,0.15)] hover:border-[#8a8d90]"}`}>
                      <input type="checkbox" checked={manualAcceptedSlugs.has(risk.slug)}
                        onChange={() => { setManualAcceptedSlugs((prev) => { const next = new Set(prev); if (next.has(risk.slug)) next.delete(risk.slug); else next.add(risk.slug); return next; }); }}
                        className="mt-[2px] size-[16px] accent-[#0066cc] cursor-pointer shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-[6px] mb-[4px]">
                          {risk.severity === "critical" ? <XCircle className="size-[12px] text-[#c9190b] shrink-0" /> : <AlertTriangle className="size-[12px] text-[#c58c00] shrink-0" />}
                          <span className="text-[13px] text-[#151515] dark:text-white font-medium font-['Red_Hat_Text:Regular',sans-serif]">{risk.name}</span>
                          <span className={`text-[10px] px-[5px] py-[1px] rounded-[3px] font-semibold ${risk.severity === "critical" ? "bg-[rgba(201,25,11,0.1)] text-[#c9190b]" : "bg-[rgba(197,140,0,0.1)] text-[#c58c00]"}`}>
                            {risk.severity}
                          </span>
                        </div>
                        <p className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">{risk.detail}</p>
                        <p className="text-[11px] text-[#6a6e73] dark:text-[#8a8d90] font-['Red_Hat_Mono:Regular',sans-serif] mt-[4px]">slug: {risk.slug}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between px-[24px] py-[16px] border-t border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)]">
                <button onClick={() => setShowManualRiskModal(false)}
                  className="text-[14px] px-[16px] py-[8px] rounded-[6px] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] bg-transparent text-[#151515] dark:text-white cursor-pointer hover:bg-[rgba(0,0,0,0.03)] transition-colors font-['Red_Hat_Text:Regular',sans-serif]">
                  Cancel
                </button>
                <button disabled={!allAccepted}
                  onClick={() => { setShowManualRiskModal(false); navigate(`/administration/cluster-update/preflight?version=${riskModalVersion}`, { state: { version: riskModalVersion, acceptedRisks: allRisks.map((r: any) => r.slug) } }); }}
                  className={`text-[14px] px-[16px] py-[8px] rounded-[6px] border-0 transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium ${allAccepted ? "bg-[#0066cc] hover:bg-[#004080] text-white cursor-pointer" : "bg-[#d2d2d2] text-[#6a6e73] cursor-not-allowed"}`}>
                  Accept {allRisks.length} risk{allRisks.length !== 1 ? "s" : ""} &amp; update to {riskModalVersion}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ─── Cluster Operators Tab ─── */
function ClusterOperatorsTab() {
  const [selectedOps, setSelectedOps] = useState<Set<number>>(() => {
    const initial = new Set<number>();
    operatorUpdates.forEach((op, i) => { if (op.required) initial.add(i); });
    return initial;
  });
  const updatable = operatorUpdates.filter((op) => op.availableVersion !== null);
  const allSelected = updatable.every((_, i) => { const idx = operatorUpdates.indexOf(updatable[i]!); return selectedOps.has(idx); });
  const toggleOp = (idx: number) => { if (operatorUpdates[idx].required) return; setSelectedOps((prev) => { const next = new Set(prev); if (next.has(idx)) next.delete(idx); else next.add(idx); return next; }); };
  const toggleAll = () => { if (allSelected) { setSelectedOps((prev) => { const next = new Set<number>(); prev.forEach((i) => { if (operatorUpdates[i].required) next.add(i); }); return next; }); } else { const next = new Set<number>(); operatorUpdates.forEach((op, i) => { if (op.availableVersion) next.add(i); }); setSelectedOps(next); } };
  const selectedCount = [...selectedOps].filter((i) => operatorUpdates[i].availableVersion).length;
  const incompatibleCount = operatorUpdates.filter((op) => !op.compatible51).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-[16px]">
        <div>
          <h2 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[18px]">Cluster Operators</h2>
          <p className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mt-[4px]">{updatable.length} of {operatorUpdates.length} operators have updates available</p>
        </div>
        <div className="flex items-center gap-[12px]">
          {selectedCount > 0 && <span className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">{selectedCount} selected</span>}
          <button disabled={selectedCount === 0}
            className={`flex items-center gap-[6px] text-[14px] px-[16px] py-[8px] rounded-[6px] border-0 cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium ${selectedCount > 0 ? "bg-[#0066cc] hover:bg-[#004080] text-white" : "bg-[#d2d2d2] text-[#6a6e73] cursor-not-allowed"}`}>
            Update selected operators
          </button>
        </div>
      </div>

      {/* Compatibility warning */}
      {incompatibleCount > 0 && (
        <div className="flex items-start gap-[10px] bg-[#fdf7e7] dark:bg-[rgba(197,140,0,0.08)] rounded-[8px] px-[14px] py-[10px] mb-[12px] border border-[#c58c00]/30">
          <AlertTriangle className="size-[16px] text-[#c58c00] shrink-0 mt-[1px]" />
          <div>
            <p className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">
              <span className="font-semibold">{incompatibleCount} operator{incompatibleCount > 1 ? "s" : ""}</span> currently installed {incompatibleCount > 1 ? "are" : "is"} not compatible with OCP 5.1.
              These operators must be updated to compatible versions before the cluster can be upgraded to 5.1.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-start gap-[10px] bg-[#e7f1fa] dark:bg-[rgba(43,154,243,0.08)] rounded-[8px] px-[14px] py-[10px] mb-[16px] border border-[#bee1f4] dark:border-[rgba(43,154,243,0.15)]">
        <Info className="size-[16px] text-[#0066cc] dark:text-[#4dabf7] shrink-0 mt-[1px]" />
        <p className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">
          Operators marked as <span className="font-semibold">Required</span> must be updated before the cluster can be upgraded to the next minor version. These cannot be deselected.
        </p>
      </div>
      <div className="border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.1)] rounded-[8px] overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_80px_100px_120px_120px_130px_90px] gap-[8px] px-[16px] py-[10px] text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] border-b border-[#d2d2d2] dark:border-[rgba(255,255,255,0.1)]">
          <span className="flex items-center justify-center"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="size-[15px] cursor-pointer accent-[#0066cc]" /></span>
          <span>Operator</span><span>Type</span><span>Current</span><span>Available</span><span>OCP compat.</span><span>Status</span><span>Auto-update</span>
        </div>
        {operatorUpdates.map((op, i) => (
          <div key={i} className={`grid grid-cols-[40px_1fr_80px_100px_120px_120px_130px_90px] gap-[8px] items-center px-[16px] py-[12px] border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] last:border-0 hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] ${selectedOps.has(i) ? "bg-[#e7f1fa]/40 dark:bg-[rgba(43,154,243,0.04)]" : ""}`}>
            <span className="flex items-center justify-center">
              {op.availableVersion ? <input type="checkbox" checked={selectedOps.has(i)} onChange={() => toggleOp(i)} disabled={op.required} className="size-[15px] cursor-pointer accent-[#0066cc] disabled:cursor-not-allowed" /> : <span />}
            </span>
            <span className="flex items-center gap-[8px] flex-wrap">
              <span className="text-[#0066cc] dark:text-[#4dabf7] text-[14px] font-['Red_Hat_Text:Regular',sans-serif]">{op.name}</span>
              {op.required && <span className="bg-[#fdf7e7] dark:bg-[rgba(197,140,0,0.15)] text-[#c58c00] text-[11px] px-[6px] py-[1px] rounded-[4px] font-semibold border border-[#c58c00]/30">Required</span>}
            </span>
            <span className={`text-[11px] px-[6px] py-[2px] rounded-[4px] font-semibold w-fit font-['Red_Hat_Text:Regular',sans-serif] ${op.category === "Platform" ? "bg-[rgba(94,64,190,0.1)] text-[#5e40be]" : "bg-[rgba(0,102,204,0.1)] text-[#0066cc] dark:text-[#4dabf7]"}`}>
              {op.category}
            </span>
            <span className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Mono:Regular',sans-serif]">{op.currentVersion}</span>
            <span className="text-[13px] font-['Red_Hat_Mono:Regular',sans-serif]">{op.availableVersion ? <span className="text-[#0066cc] dark:text-[#4dabf7]">{op.availableVersion}</span> : <span className="text-[#4d4d4d] dark:text-[#b0b0b0]">&mdash;</span>}</span>
            <span>
              {op.compatible51 ? (
                <span className="flex items-center gap-[4px] text-[11px] px-[6px] py-[2px] rounded-[4px] font-semibold bg-[rgba(62,134,53,0.1)] text-[#3e8635] w-fit">
                  <CheckCircle className="size-[10px]" /> ≤ {op.maxOCP}
                </span>
              ) : (
                <span className="flex items-center gap-[4px] text-[11px] px-[6px] py-[2px] rounded-[4px] font-semibold bg-[rgba(201,25,11,0.08)] text-[#c9190b] w-fit">
                  <XCircle className="size-[10px]" /> ≤ {op.maxOCP}
                </span>
              )}
            </span>
            <span>{op.status === "Update available" ? <span className="text-[12px] px-[8px] py-[2px] rounded-[4px] font-semibold bg-[rgba(0,102,204,0.1)] text-[#0066cc] dark:text-[#4dabf7]">{op.status}</span> : <span className="text-[12px] px-[8px] py-[2px] rounded-[4px] font-semibold bg-[rgba(62,134,53,0.1)] text-[#3e8635]">{op.status}</span>}</span>
            <span className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">{op.autoUpdate ? "Yes" : "No"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Update History Tab ─── */
function UpdateHistoryTab() {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [filterMethod, setFilterMethod] = useState<"all" | "Manual" | "Agent">("all");

  const filtered = filterMethod === "all" ? updateHistory : updateHistory.filter((e) => e.method === filterMethod);

  return (
    <div>
      <div className="flex items-center justify-between mb-[16px]">
        <h2 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[18px]">Update History</h2>
        <div className="flex items-center gap-[8px]">
          {(["all", "Manual", "Agent"] as const).map((f) => (
            <button key={f} onClick={() => setFilterMethod(f)}
              className={`text-[13px] px-[12px] py-[5px] rounded-[6px] border cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] ${filterMethod === f ? "bg-[#0066cc] text-white border-[#0066cc]" : "bg-transparent text-[#4d4d4d] dark:text-[#b0b0b0] border-[#d2d2d2] dark:border-[rgba(255,255,255,0.15)] hover:border-[#8a8d90]"}`}>
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>
      </div>
      <div className="border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.1)] rounded-[8px] overflow-hidden">
        <div className="grid grid-cols-[90px_100px_72px_100px_1fr_140px_72px] gap-[8px] px-[16px] py-[10px] text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] border-b border-[#d2d2d2] dark:border-[rgba(255,255,255,0.1)]">
          <span>Version</span><span>Status</span><span>Method</span><span>Decision</span><span>Initiated by</span><span>Date</span><span>Pre-flight</span>
        </div>
        {filtered.map((entry, i) => {
          const isExpanded = expandedRow === i;
          return (
            <div key={i}>
              <div onClick={() => setExpandedRow(isExpanded ? null : i)}
                className={`grid grid-cols-[90px_100px_72px_100px_1fr_140px_72px] gap-[8px] items-center px-[16px] py-[12px] border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] cursor-pointer transition-colors ${isExpanded ? "bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)]" : "hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)]"}`}>
                <span className="text-[14px] text-[#151515] dark:text-white font-['Red_Hat_Mono:Regular',sans-serif]">{entry.version}</span>
                <span>
                  {entry.status === "Completed" && <span className="flex items-center gap-[3px] text-[11px] px-[6px] py-[2px] rounded-[4px] font-semibold bg-[rgba(62,134,53,0.1)] text-[#3e8635] w-fit"><CheckCircle className="size-[10px]" /> Done</span>}
                  {entry.status === "Failed" && <span className="flex items-center gap-[3px] text-[11px] px-[6px] py-[2px] rounded-[4px] font-semibold bg-[rgba(201,25,11,0.1)] text-[#c9190b] w-fit"><XCircle className="size-[10px]" /> Failed</span>}
                  {entry.status === "Rejected" && <span className="flex items-center gap-[3px] text-[11px] px-[6px] py-[2px] rounded-[4px] font-semibold bg-[rgba(201,25,11,0.1)] text-[#c9190b] w-fit"><X className="size-[10px]" /> Rejected</span>}
                </span>
                <span>
                  {entry.method === "Agent" ? (
                    <span className="flex items-center gap-[3px] text-[11px] text-[#6753ac] font-semibold"><Bot className="size-[11px]" /> Agent</span>
                  ) : (
                    <span className="flex items-center gap-[3px] text-[11px] text-[#4d4d4d] dark:text-[#b0b0b0]"><User className="size-[11px]" /> Manual</span>
                  )}
                </span>
                <span>
                  {entry.decision === "Approved" && <span className="text-[11px] px-[6px] py-[2px] rounded-[4px] font-semibold bg-[rgba(62,134,53,0.1)] text-[#3e8635]">Approved</span>}
                  {entry.decision === "Auto-approved" && <span className="text-[11px] px-[6px] py-[2px] rounded-[4px] font-semibold bg-[#e7f1fa] text-[#0066cc]">Auto</span>}
                  {entry.decision === "Rejected" && <span className="text-[11px] px-[6px] py-[2px] rounded-[4px] font-semibold bg-[rgba(201,25,11,0.1)] text-[#c9190b]">Rejected</span>}
                  {entry.decision === "N/A" && <span className="text-[11px] text-[#8a8d90]">—</span>}
                </span>
                <span className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] truncate" title={entry.initiatedBy}>{entry.initiatedBy}</span>
                <span className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">{entry.startedAt.split(" ").slice(0, 3).join(" ")}</span>
                <span>
                  <span className={`text-[11px] px-[6px] py-[2px] rounded-[4px] font-semibold ${entry.preflight.failed === 0 ? "bg-[rgba(62,134,53,0.1)] text-[#3e8635]" : "bg-[rgba(201,25,11,0.1)] text-[#c9190b]"}`}>
                    {entry.preflight.passed}/{entry.preflight.total}
                  </span>
                </span>
              </div>

              {/* Expanded detail row */}
              {isExpanded && (
                <div className="px-[16px] py-[16px] border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] bg-[#fafafa] dark:bg-[rgba(255,255,255,0.02)]">
                  <div className="grid grid-cols-3 gap-[16px] mb-[12px]">
                    <div>
                      <p className="text-[11px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[2px]">Started</p>
                      <p className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Mono:Regular',sans-serif]">{entry.startedAt}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[2px]">Completed</p>
                      <p className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Mono:Regular',sans-serif]">{entry.completedAt}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[2px]">Duration</p>
                      <p className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Mono:Regular',sans-serif]">{entry.duration}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-[16px]">
                    <div>
                      <p className="text-[11px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[2px]">Pre-flight Summary</p>
                      <div className="flex items-center gap-[8px]">
                        <span className="text-[13px] font-['Red_Hat_Text:Regular',sans-serif]">
                          <span className="text-[#3e8635] font-semibold">{entry.preflight.passed} passed</span>
                          {entry.preflight.failed > 0 && <span className="text-[#c9190b] font-semibold"> · {entry.preflight.failed} failed</span>}
                          <span className="text-[#4d4d4d] dark:text-[#b0b0b0]"> of {entry.preflight.total} checks</span>
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[2px]">Compatibility Summary</p>
                      <p className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">{entry.compatSummary ?? "No compatibility data recorded"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
