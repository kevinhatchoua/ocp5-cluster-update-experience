import { useState, useEffect, useCallback, useMemo, Fragment } from "react";
import { CheckCircle, Info, AlertCircle, MoreVertical, ExternalLink, Layers, ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router";
import Breadcrumbs from "../../components/Breadcrumbs";
import FavoriteButton from "../../components/FavoriteButton";
import { useChat } from "../../contexts/ChatContext";
import { BulkUpdateModal } from "../../components/OperatorUpdateModals";
import { AiAssessmentSection } from "../../components/AiAssessmentSection";
import { OlsChatbot } from "../../components/OlsChatbot";

const CLUSTER_TARGET_VERSION = "5.1.10";
const CLUSTER_CHANNEL = "fast-5.1";

type LifecycleApi = "v0" | "v1";

type InstalledOperatorRow = {
  name: string;
  lifecycleApi: LifecycleApi;
  status: string;
  statusType: "warning" | "success" | "neutral";
  /** Explains nuanced status (e.g. V1 discovery, OLM channel differences). */
  statusNote?: string;
  version: string;
  newVersion: string | null;
  updatePlan: string;
  clusterCompatibility: string;
  support: string;
  supportBadge: string;
  supportType: "danger" | "success";
  lastUpdated: string;
  required?: boolean;
};

export default function InstalledOperatorsPage() {
  const [selectedOperators, setSelectedOperators] = useState<string[]>([]);
  const [openKebabIndex, setOpenKebabIndex] = useState<string | null>(null);
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [lifecycleFilter, setLifecycleFilter] = useState<"all" | LifecycleApi>("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatbotContext, setChatbotContext] = useState("");
  const navigate = useNavigate();
  const { setCurrentPage } = useChat();

  const openChatbot = useCallback((context: string) => {
    setChatbotContext(context);
    setChatbotOpen(true);
  }, []);

  const handleChatAction = useCallback(
    (actionId: string) => {
      if (actionId === "view-plan" || actionId === "view-history") {
        navigate("/administration/cluster-update");
      }
    },
    [navigate]
  );

  // Set current page context for AI
  useEffect(() => {
    setCurrentPage('/ecosystem/installed-operators');
  }, [setCurrentPage]);

  const operators: InstalledOperatorRow[] = [
    {
      name: "Abot Operator-v3.0.0",
      lifecycleApi: "v0",
      status: "Update available",
      statusType: "warning",
      statusNote: "Classic Subscription status",
      version: "3.0.0",
      newVersion: "3.1.0",
      updatePlan: "Manual",
      clusterCompatibility: "Compatible",
      support: "Nov 13, 2025",
      supportBadge: "End of life",
      supportType: "danger",
      lastUpdated: "Jun 13, 2025, 10:28 AM",
      required: true,
    },
    {
      name: "Airflow Helm Operator",
      lifecycleApi: "v0",
      status: "Update available",
      statusType: "warning",
      statusNote: "Classic Subscription status",
      version: "5.7.2",
      newVersion: "5.7.3",
      updatePlan: "Manual",
      clusterCompatibility: "Compatible",
      support: "May 10, 2028",
      supportBadge: "2 years, 8 months",
      supportType: "success",
      lastUpdated: "Jun 13, 2025, 10:28 AM",
      required: true,
    },
    {
      name: "Ansible Automation Platform",
      lifecycleApi: "v0",
      status: "Update available",
      statusType: "warning",
      statusNote: "Classic Subscription status",
      version: "1.5.0",
      newVersion: "1.6.0",
      updatePlan: "Automatic",
      clusterCompatibility: "Compatible",
      support: "May 10, 2028",
      supportBadge: "2 years, 8 months",
      supportType: "success",
      lastUpdated: "Jun 13, 2025, 10:28 AM",
      required: false,
    },
    {
      name: "Bare Metal Event Relay",
      lifecycleApi: "v0",
      status: "Update available",
      statusType: "warning",
      statusNote: "Classic Subscription status",
      version: "1.1.1",
      newVersion: "1.2.0",
      updatePlan: "Automatic",
      clusterCompatibility: "Compatible",
      support: "Jun 13, 2026",
      supportBadge: "End of life",
      supportType: "danger",
      lastUpdated: "Jun 13, 2025, 10:28 AM",
      required: false,
    },
    {
      name: "Camel K Operator",
      lifecycleApi: "v0",
      status: "Up to date",
      statusType: "success",
      statusNote: "Classic Subscription status",
      version: "2.1.0",
      newVersion: null,
      updatePlan: "Manual",
      clusterCompatibility: "Compatible",
      support: "May 1, 2028",
      supportBadge: "2 years, 8 months",
      supportType: "success",
      lastUpdated: "Jun 13, 2025, 10:28 AM",
      required: false,
    },
    {
      name: "OpenShift GitOps (cluster extension)",
      lifecycleApi: "v1",
      status: "Healthy",
      statusType: "success",
      statusNote: "Extension status · OLM v1",
      version: "1.12.0",
      newVersion: null,
      updatePlan: "Automatic",
      clusterCompatibility: "Compatible",
      support: "May 10, 2028",
      supportBadge: "Full support",
      supportType: "success",
      lastUpdated: "Jun 12, 2025, 4:02 PM",
      required: false,
    },
    {
      name: "Sample observability bundle",
      lifecycleApi: "v1",
      status: "Conditions pending",
      statusType: "neutral",
      statusNote: "V1 discovery in progress — update availability TBD",
      version: "0.4.1",
      newVersion: null,
      updatePlan: "Automatic",
      clusterCompatibility: "Unknown",
      support: "Community",
      supportBadge: "Self-support",
      supportType: "danger",
      lastUpdated: "Jun 11, 2025, 9:15 AM",
      required: false,
    },
  ];

  const filteredOperators = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return operators.filter((op) => {
      if (lifecycleFilter !== "all" && op.lifecycleApi !== lifecycleFilter) return false;
      if (q && !op.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [operators, searchTerm, lifecycleFilter]);

  const v0Count = operators.filter((o) => o.lifecycleApi === "v0").length;
  const v1Count = operators.filter((o) => o.lifecycleApi === "v1").length;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOperators(filteredOperators.map((op) => op.name));
    } else {
      setSelectedOperators([]);
    }
  };

  const handleSelectOperator = (name: string) => {
    if (selectedOperators.includes(name)) {
      setSelectedOperators(selectedOperators.filter(n => n !== name));
    } else {
      setSelectedOperators([...selectedOperators, name]);
    }
  };

  return (
    <div className="flex h-full relative min-w-0">
      <div className="flex-1 min-w-0 overflow-y-auto">
      <div className="p-[24px]">
        <Breadcrumbs
          items={[
            { label: "Home", path: "/" },
            { label: "Ecosystem", path: "/ecosystem" },
            { label: "Installed Operators" },
          ]}
        />

        <div className="mb-[24px]">
          <div className="flex items-center justify-between mb-[8px]">
            <h1 className="font-['Red_Hat_Display_VF:Medium',sans-serif] font-medium leading-[36.4px] text-[#151515] dark:text-white text-[28px]">
              Installed Operators
            </h1>
            <FavoriteButton name="Installed Operators" path="/ecosystem/installed-operators" />
          </div>
          <p className="text-[14px] text-[#4d4d4d] dark:text-[#b0b0b0]">
            One list for <span className="text-[#151515] dark:text-white font-medium">OLM v0</span> and{" "}
            <span className="text-[#151515] dark:text-white font-medium">OLM v1</span> (cluster extensions). Priority columns stay
            visible; expand a row for update plan, timestamps, and full compatibility text.
          </p>
        </div>

        <AiAssessmentSection openChatbot={openChatbot} selectedVersion={CLUSTER_TARGET_VERSION} />

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-[16px] mb-[24px]">
          <div className="bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(255,255,255,0.05)] rounded-[16px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.06)] p-[20px] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-[12px] mb-[8px]">
              <CheckCircle className="size-[24px] text-[#3e8635] dark:text-[#5ba352]" />
              <p className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[13px]">Total installed</p>
            </div>
            <p className="font-['Red_Hat_Display:Bold',sans-serif] font-bold text-[#151515] dark:text-white text-[32px]">
              {operators.length}
            </p>
            <p className="text-[11px] text-[#6a6e73] dark:text-[#8a8d90] mt-[6px]">
              {v0Count} OLM v0 · {v1Count} OLM v1
            </p>
          </div>
          <div className="bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(255,255,255,0.05)] rounded-[16px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.06)] p-[20px] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-[12px] mb-[8px]">
              <Info className="size-[24px] text-[#2b9af3] dark:text-[#73bcf7]" />
              <p className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[13px]">Available Updates</p>
            </div>
            <p className="font-['Red_Hat_Display:Bold',sans-serif] font-bold text-[#2b9af3] dark:text-[#73bcf7] text-[32px]">
              {operators.filter((o) => o.newVersion).length}
            </p>
          </div>
          <div className="bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(255,255,255,0.05)] rounded-[16px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.06)] p-[20px] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-[12px] mb-[8px]">
              <AlertCircle className="size-[24px] text-[#f0ab00] dark:text-[#f4c145]" />
              <p className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[13px]">End of Life Support</p>
            </div>
            <p className="font-['Red_Hat_Display:Bold',sans-serif] font-bold text-[#f0ab00] dark:text-[#f4c145] text-[32px]">
              {operators.filter((o) => o.supportBadge === "End of life").length}
            </p>
          </div>
          <div className="bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(255,255,255,0.05)] rounded-[16px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.06)] p-[20px] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-[12px] mb-[8px]">
              <Layers className="size-[24px] text-[#6753ac] dark:text-[#b2a3e0]" />
              <p className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[13px]">OLM v1 extensions</p>
            </div>
            <p className="font-['Red_Hat_Display:Bold',sans-serif] font-bold text-[#6753ac] dark:text-[#b2a3e0] text-[32px]">
              {v1Count}
            </p>
            <p className="text-[11px] text-[#6a6e73] dark:text-[#8a8d90] mt-[6px]">Icon in table</p>
          </div>
        </div>

        {/* Lifecycle filter (replaces separate v0 / v1 tabs) */}
        <div className="flex flex-wrap items-center gap-[10px] mb-[16px]">
          <span className="text-[13px] text-[#6a6e73] dark:text-[#8a8d90] font-['Red_Hat_Text:Regular',sans-serif]">Show:</span>
          {(["all", "v0", "v1"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setLifecycleFilter(key)}
              className={`px-[14px] py-[6px] rounded-[999px] text-[13px] font-['Red_Hat_Text:Regular',sans-serif] font-medium border transition-colors ${
                lifecycleFilter === key
                  ? "bg-[#0066cc] dark:bg-[#4dabf7] text-white border-[#0066cc] dark:border-[#4dabf7]"
                  : "bg-transparent text-[#151515] dark:text-[#b0b0b0] border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] hover:border-[#8a8d90]"
              }`}
            >
              {key === "all" ? "All operators" : key === "v0" ? "OLM v0 only" : "OLM v1 only"}
            </button>
          ))}
          <span className="hidden sm:inline text-[12px] text-[#6a6e73] dark:text-[#8a8d90] ml-[8px]">
            <Layers className="size-[14px] inline align-text-bottom text-[#6753ac] mr-[4px]" aria-hidden />
            = cluster extension (OLM v1 managed)
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-[12px] mb-[20px]">
          <input
            type="text"
            placeholder="Find by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[280px] px-[12px] py-[10px] bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[rgba(0,0,0,0.2)] dark:border-[rgba(255,255,255,0.2)] rounded-[8px] text-[13px] text-[#151515] dark:text-white placeholder:text-[#4d4d4d] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-[#0066cc] dark:focus:ring-[#4dabf7]"
          />
          <button className="bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[rgba(0,0,0,0.2)] dark:border-[rgba(255,255,255,0.2)] text-[#151515] dark:text-white px-[16px] py-[10px] rounded-[8px] font-semibold text-[14px] hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.08)] transition-colors">
            Type
          </button>
          <button
            onClick={() => setIsBulkUpdateModalOpen(true)}
            disabled={selectedOperators.length === 0}
            className={`px-[16px] py-[10px] rounded-[8px] font-semibold text-[14px] transition-all ${
              selectedOperators.length === 0
                ? 'bg-[#d2d2d2] dark:bg-[#4d4d4d] text-[#8a8d90] dark:text-[#8a8d90] cursor-not-allowed'
                : 'bg-[#0066cc] hover:bg-[#004080] dark:bg-[#4dabf7] dark:hover:bg-[#339af0] text-white cursor-pointer'
            }`}
          >
            Approve update
          </button>
          <Link
            to="/ecosystem/software-catalog"
            className="text-[#0066cc] dark:text-[#4dabf7] hover:underline font-semibold text-[14px] no-underline flex items-center gap-[4px]"
          >
            Browse Software Catalog
            <ExternalLink className="size-[14px]" />
          </Link>
          <button className="text-[#0066cc] dark:text-[#4dabf7] hover:underline font-semibold text-[14px]">
            <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
              <path d="M4 4h12v12H4z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M4 4h6v6H4z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        {/* Unified table — primary columns only; secondary fields in expandable panel */}
        <div className="bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(255,255,255,0.05)] rounded-[24px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08)] overflow-hidden border border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)]">
          <div className="px-[20px] py-[12px] border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.03)]">
            <p className="text-[12px] text-[#6a6e73] dark:text-[#8a8d90] font-['Red_Hat_Text:Regular',sans-serif]">
              <span className="font-medium text-[#151515] dark:text-white">Status column:</span> “Update available” reflects classic Subscription
              conditions (v0). For OLM v1, status may surface from extension conditions — some rows show discovery or pending states until
              parity is reached.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b-2 border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)]">
                  <th className="text-left py-[14px] px-[16px] w-[44px]">
                    <input
                      type="checkbox"
                      checked={filteredOperators.length > 0 && selectedOperators.length === filteredOperators.length}
                      onChange={handleSelectAll}
                      className="size-[16px] cursor-pointer"
                      title="Select all in view"
                    />
                  </th>
                  <th className="text-left py-[14px] px-[8px] w-[40px]" aria-label="OLM API">
                    <span className="sr-only">OLM API</span>
                  </th>
                  <th className="text-left py-[14px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px]">
                    Operator
                  </th>
                  <th className="text-left py-[14px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px] min-w-[160px]">
                    Status
                  </th>
                  <th className="text-left py-[14px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px]">
                    Version
                  </th>
                  <th className="text-left py-[14px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px] min-w-[180px]">
                    Cluster &amp; support
                  </th>
                  <th className="w-[44px] py-[14px] px-[4px]" aria-label="Expand details">
                    <span className="sr-only">Details</span>
                  </th>
                  <th className="text-left py-[14px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px] w-[52px]">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOperators.map((op, index) => (
                  <Fragment key={op.name}>
                  <tr
                    className={`border-b border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.05)] hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] transition-colors ${
                      index === filteredOperators.length - 1 && expandedRow !== op.name ? "border-b-0" : ""
                    }`}
                  >
                    <td className="py-[12px] px-[16px] align-top">
                      <input
                        type="checkbox"
                        checked={selectedOperators.includes(op.name)}
                        onChange={() => handleSelectOperator(op.name)}
                        className="size-[16px] cursor-pointer mt-[4px]"
                      />
                    </td>
                    <td className="py-[12px] px-[8px] align-top">
                      {op.lifecycleApi === "v1" ? (
                        <span
                          className="inline-flex mt-[2px]"
                          title="OLM v1 — cluster extension (managed lifecycle)"
                        >
                          <Layers className="size-[18px] text-[#6753ac] dark:text-[#b2a3e0]" aria-hidden />
                        </span>
                      ) : (
                        <span className="inline-block w-[18px] h-[18px] mt-[2px]" aria-hidden />
                      )}
                    </td>
                    <td className="py-[12px] px-[12px] align-top max-w-[280px]">
                      <div className="flex flex-wrap items-center gap-[8px] gap-y-[4px]">
                        <Link
                          to={`/ecosystem/installed-operators/${encodeURIComponent(op.name)}`}
                          className="font-['Red_Hat_Text:Medium',sans-serif] font-medium text-[#0066cc] dark:text-[#4dabf7] text-[14px] hover:underline no-underline break-words"
                        >
                          {op.name}
                        </Link>
                        {op.required && (
                          <span className="px-[8px] py-[2px] bg-[#f0ab00] text-white rounded-[4px] text-[11px] font-semibold shrink-0">
                            Required
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-[12px] px-[12px] align-top">
                      <div className="flex flex-col gap-[4px] max-w-[220px]">
                        <span
                          className={`px-[10px] py-[4px] rounded-[999px] text-[12px] font-semibold inline-flex items-center gap-[6px] w-fit ${
                            op.statusType === "warning"
                              ? "bg-[#e7f6fd] dark:bg-[rgba(43,154,243,0.15)] text-[#2b9af3] dark:text-[#73bcf7]"
                              : op.statusType === "neutral"
                                ? "bg-[#f0f0f0] dark:bg-[rgba(255,255,255,0.08)] text-[#6a6e73] dark:text-[#b0b0b0]"
                                : "bg-[#f3faf2] dark:bg-[rgba(62,134,53,0.15)] text-[#3e8635] dark:text-[#5ba352]"
                          }`}
                        >
                          <span className="size-[6px] rounded-full bg-current shrink-0" />
                          {op.status}
                        </span>
                        {op.statusNote && (
                          <span className="text-[11px] leading-[14px] text-[#6a6e73] dark:text-[#8a8d90] font-['Red_Hat_Text:Regular',sans-serif]">
                            {op.statusNote}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-[12px] px-[12px] align-top text-[14px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">
                      <span className="font-mono text-[13px]">{op.version}</span>
                      {op.newVersion && (
                        <span className="block text-[12px] text-[#2b9af3] dark:text-[#73bcf7] mt-[4px]">
                          → {op.newVersion} available
                        </span>
                      )}
                    </td>
                    <td className="py-[12px] px-[12px] align-top">
                      <div className="flex items-start gap-[8px] max-w-[220px]">
                        {op.clusterCompatibility === "Compatible" ? (
                          <CheckCircle className="size-[16px] text-[#3e8635] dark:text-[#5ba352] shrink-0 mt-[2px]" aria-hidden />
                        ) : (
                          <AlertTriangle className="size-[16px] text-[#f0ab00] shrink-0 mt-[2px]" aria-hidden />
                        )}
                        <div className="min-w-0">
                          <p className="text-[13px] text-[#151515] dark:text-white font-medium leading-[18px] truncate">
                            {op.clusterCompatibility}
                          </p>
                          <p
                            className={`text-[11px] font-semibold mt-[2px] truncate ${
                              op.supportBadge === "End of life" || op.supportType === "danger"
                                ? "text-[#f0ab00] dark:text-[#f4c145]"
                                : "text-[#3e8635] dark:text-[#5ba352]"
                            }`}
                          >
                            {op.supportBadge}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-[12px] px-[4px] align-top">
                      <button
                        type="button"
                        className="p-[6px] rounded-[6px] hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.08)] text-[#6a6e73] mt-[2px]"
                        aria-expanded={expandedRow === op.name}
                        onClick={() => setExpandedRow((prev) => (prev === op.name ? null : op.name))}
                        title={expandedRow === op.name ? "Hide secondary details" : "Show update plan, timestamps, support dates"}
                      >
                        {expandedRow === op.name ? (
                          <ChevronDown className="size-[18px]" />
                        ) : (
                          <ChevronRight className="size-[18px]" />
                        )}
                      </button>
                    </td>
                    <td className="py-[12px] px-[12px] align-top">
                      <div className="relative">
                        <button
                          className="p-[4px] hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.08)] rounded-[4px] transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenKebabIndex(openKebabIndex === op.name ? null : op.name);
                          }}
                        >
                          <MoreVertical className="size-[16px] text-[#4d4d4d] dark:text-[#b0b0b0]" />
                        </button>

                        {openKebabIndex === op.name && (
                          <>
                            <div 
                              className="fixed inset-0 z-[9998]" 
                              onClick={() => setOpenKebabIndex(null)}
                            />
                            <div className="absolute right-0 mt-[4px] w-[220px] bg-white dark:bg-[#1f1f1f] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] rounded-[8px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.12)] z-[9999] py-[4px]">
                              <button
                                className="w-full text-left px-[16px] py-[8px] text-[14px] text-[#151515] dark:text-white hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                                onClick={() => {
                                  navigate(`/ecosystem/installed-operators/${encodeURIComponent(op.name)}`);
                                  setOpenKebabIndex(null);
                                }}
                              >
                                View details
                              </button>
                              {op.newVersion && (
                                <button
                                  className="w-full text-left px-[16px] py-[8px] text-[14px] text-[#151515] dark:text-white hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                                  onClick={() => {
                                    // Update operator logic
                                    setOpenKebabIndex(null);
                                  }}
                                >
                                  Update to {op.newVersion}
                                </button>
                              )}
                              <button
                                className="w-full text-left px-[16px] py-[8px] text-[14px] text-[#151515] dark:text-white hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                                onClick={() => {
                                  navigate(`/ecosystem/installed-operators/${encodeURIComponent(op.name)}/subscription`);
                                  setOpenKebabIndex(null);
                                }}
                              >
                                Edit subscription
                              </button>
                              <button
                                className="w-full text-left px-[16px] py-[8px] text-[14px] text-[#151515] dark:text-white hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                                onClick={() => {
                                  navigate(`/ecosystem/installed-operators/${encodeURIComponent(op.name)}/yaml`);
                                  setOpenKebabIndex(null);
                                }}
                              >
                                View YAML
                              </button>
                              <button
                                className="w-full text-left px-[16px] py-[8px] text-[14px] text-[#151515] dark:text-white hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                                onClick={() => {
                                  navigate(`/ecosystem/installed-operators/${encodeURIComponent(op.name)}/logs`);
                                  setOpenKebabIndex(null);
                                }}
                              >
                                View logs
                              </button>
                              <div className="my-[4px] h-[1px] bg-[rgba(0,0,0,0.1)] dark:bg-[rgba(255,255,255,0.1)]" />
                              <button
                                className="w-full text-left px-[16px] py-[8px] text-[14px] text-[#151515] dark:text-white hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                                onClick={() => {
                                  // Check compatibility logic
                                  setOpenKebabIndex(null);
                                }}
                              >
                                Check compatibility
                              </button>
                              <button
                                className="w-full text-left px-[16px] py-[8px] text-[14px] text-[#151515] dark:text-white hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                                onClick={() => {
                                  navigate(`/ecosystem/installed-operators/${encodeURIComponent(op.name)}/events`);
                                  setOpenKebabIndex(null);
                                }}
                              >
                                View events
                              </button>
                              <button
                                className="w-full text-left px-[16px] py-[8px] text-[14px] text-[#151515] dark:text-white hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                                onClick={() => {
                                  // Pause updates logic
                                  setOpenKebabIndex(null);
                                }}
                              >
                                {op.updatePlan === 'Automatic' ? 'Pause automatic updates' : 'Enable automatic updates'}
                              </button>
                              <div className="my-[4px] h-[1px] bg-[rgba(0,0,0,0.1)] dark:bg-[rgba(255,255,255,0.1)]" />
                              <button
                                className="w-full text-left px-[16px] py-[8px] text-[14px] text-[#151515] dark:text-white hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                                onClick={() => {
                                  window.open(`https://docs.openshift.com/container-platform/operators/${op.name}`, '_blank');
                                  setOpenKebabIndex(null);
                                }}
                              >
                                View documentation
                              </button>
                              <div className="my-[4px] h-[1px] bg-[rgba(0,0,0,0.1)] dark:bg-[rgba(255,255,255,0.1)]" />
                              <button
                                className="w-full text-left px-[16px] py-[8px] text-[14px] text-[#c9190b] dark:text-[#ff6b6b] hover:bg-[rgba(201,25,11,0.05)] dark:hover:bg-[rgba(255,107,107,0.05)] transition-colors"
                                onClick={() => {
                                  // Uninstall logic
                                  setOpenKebabIndex(null);
                                }}
                              >
                                Uninstall
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedRow === op.name && (
                    <tr className="bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.03)] border-b border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.05)]">
                      <td colSpan={8} className="px-[16px] py-[14px] pl-[24px] sm:pl-[52px]">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6a6e73] dark:text-[#8a8d90] mb-[10px] font-['Red_Hat_Text:Regular',sans-serif]">
                          Secondary details (hidden by default to reduce clutter)
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px] text-[13px] font-['Red_Hat_Text:Regular',sans-serif]">
                          <div>
                            <p className="text-[11px] text-[#6a6e73] dark:text-[#8a8d90] mb-[4px]">Lifecycle API</p>
                            <p className="text-[#151515] dark:text-white">
                              {op.lifecycleApi === "v1" ? "OLM v1 (cluster extension)" : "OLM v0 (classic Subscription)"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-[#6a6e73] dark:text-[#8a8d90] mb-[4px]">Update plan</p>
                            <p className="text-[#151515] dark:text-white">{op.updatePlan}</p>
                          </div>
                          <div>
                            <p className="text-[11px] text-[#6a6e73] dark:text-[#8a8d90] mb-[4px]">Last reconciled</p>
                            <p className="text-[#151515] dark:text-white">{op.lastUpdated}</p>
                          </div>
                          <div>
                            <p className="text-[11px] text-[#6a6e73] dark:text-[#8a8d90] mb-[4px]">Support end date</p>
                            <p className="text-[#151515] dark:text-white">{op.support}</p>
                          </div>
                        </div>
                        <p className="text-[12px] text-[#6a6e73] dark:text-[#8a8d90] mt-[12px] leading-[18px]">
                          Compatibility evaluated against cluster target <span className="font-mono text-[#151515] dark:text-white">{CLUSTER_TARGET_VERSION}</span>.
                          Full support policy and vendor terms stay in operator details.
                        </p>
                      </td>
                    </tr>
                  )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>

      {chatbotOpen && (
        <OlsChatbot
          context={chatbotContext}
          selectedVersion={CLUSTER_TARGET_VERSION}
          selectedChannel={CLUSTER_CHANNEL}
          onClose={() => setChatbotOpen(false)}
          onAction={handleChatAction}
        />
      )}

      {/* Modals */}
      <BulkUpdateModal
        isOpen={isBulkUpdateModalOpen}
        onClose={() => setIsBulkUpdateModalOpen(false)}
        selectedOperators={selectedOperators}
        operators={operators}
      />
    </div>
  );
}