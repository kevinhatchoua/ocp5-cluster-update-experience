import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, AlertTriangle, MoreVertical, X, ExternalLink, Info, Shield, Clock, Search, SlidersHorizontal } from "lucide-react";
import { Link, useNavigate } from "react-router";
import Breadcrumbs from "../../components/Breadcrumbs";
import FavoriteButton from "../../components/FavoriteButton";
import { useChat } from "../../contexts/ChatContext";

type SupportStatus = "supported" | "ending-soon" | "eol";
type CompatStatus = "compatible" | "incompatible";

interface Operator {
  name: string;
  description: string;
  namespace: string;
  managedNamespaces: string;
  status: "Succeeded" | "Degraded" | "Pending";
  version: string;
  lastUpdated: string;
  providedAPIs: string[];
  clusterCompat: CompatStatus;
  compatDetail: string;
  maxOcpVersion: string;
  supportEnd: string;
  supportRemaining: string;
  supportStatus: SupportStatus;
}

const operators: Operator[] = [
  {
    name: "Package Server",
    description: "OLM component provided by Red Hat",
    namespace: "openshift-operator-lifecycle-manager",
    managedNamespaces: "openshift-operator-lifecycle-manager",
    status: "Succeeded",
    version: "0.23.0",
    lastUpdated: "Apr 2, 2026, 9:10 AM",
    providedAPIs: ["PackageManifest"],
    clusterCompat: "compatible",
    compatDetail: "Tested up to OCP 5.2",
    maxOcpVersion: "5.2",
    supportEnd: "Mar 15, 2028",
    supportRemaining: "1 yr, 11 mo",
    supportStatus: "supported",
  },
  {
    name: "cluster-logging",
    description: "Cluster logging stack provided by Red Hat",
    namespace: "openshift-logging",
    managedNamespaces: "All namespaces",
    status: "Succeeded",
    version: "6.4.3",
    lastUpdated: "Mar 20, 2026, 2:15 PM",
    providedAPIs: ["ClusterLogging", "ClusterLogForwarder"],
    clusterCompat: "incompatible",
    compatDetail: "Max supported OCP version is 5.0. Update to v6.5.0 for 5.1 compatibility.",
    maxOcpVersion: "5.0",
    supportEnd: "Jun 30, 2026",
    supportRemaining: "2 mo",
    supportStatus: "ending-soon",
  },
  {
    name: "elasticsearch-operator",
    description: "Elasticsearch for cluster logging",
    namespace: "openshift-operators-redhat",
    managedNamespaces: "All namespaces",
    status: "Succeeded",
    version: "5.8.14",
    lastUpdated: "Mar 18, 2026, 11:00 AM",
    providedAPIs: ["Elasticsearch", "Kibana"],
    clusterCompat: "compatible",
    compatDetail: "Tested up to OCP 5.1",
    maxOcpVersion: "5.1",
    supportEnd: "Dec 31, 2025",
    supportRemaining: "Ended",
    supportStatus: "eol",
  },
  {
    name: "cloud-credential-operator",
    description: "Manages cloud provider credentials",
    namespace: "openshift-cloud-credential-operator",
    managedNamespaces: "openshift-cloud-credential-operator",
    status: "Degraded",
    version: "5.0.0",
    lastUpdated: "Apr 1, 2026, 8:30 AM",
    providedAPIs: ["CredentialsRequest"],
    clusterCompat: "incompatible",
    compatDetail: "MissingUpgradeableAnnotation: cloudcredential.openshift.io/upgradeable-to needs updating before upgrade.",
    maxOcpVersion: "5.0",
    supportEnd: "Sep 30, 2027",
    supportRemaining: "1 yr, 5 mo",
    supportStatus: "supported",
  },
  {
    name: "compliance-operator",
    description: "OpenShift Compliance Operator",
    namespace: "openshift-compliance",
    managedNamespaces: "All namespaces",
    status: "Succeeded",
    version: "1.6.0",
    lastUpdated: "Mar 25, 2026, 4:20 PM",
    providedAPIs: ["ComplianceScan", "ComplianceSuite", "ScanSetting"],
    clusterCompat: "compatible",
    compatDetail: "Tested up to OCP 5.2",
    maxOcpVersion: "5.2",
    supportEnd: "Jan 15, 2029",
    supportRemaining: "2 yr, 9 mo",
    supportStatus: "supported",
  },
  {
    name: "kiali-ossm",
    description: "Kiali for OpenShift Service Mesh",
    namespace: "openshift-operators",
    managedNamespaces: "All namespaces",
    status: "Succeeded",
    version: "1.89.3",
    lastUpdated: "Mar 22, 2026, 10:05 AM",
    providedAPIs: ["Kiali"],
    clusterCompat: "compatible",
    compatDetail: "Tested up to OCP 5.1",
    maxOcpVersion: "5.1",
    supportEnd: "Aug 1, 2027",
    supportRemaining: "1 yr, 3 mo",
    supportStatus: "supported",
  },
  {
    name: "jaeger-product",
    description: "Red Hat distributed tracing",
    namespace: "openshift-distributed-tracing",
    managedNamespaces: "All namespaces",
    status: "Succeeded",
    version: "1.62.0",
    lastUpdated: "Mar 15, 2026, 3:45 PM",
    providedAPIs: ["Jaeger"],
    clusterCompat: "compatible",
    compatDetail: "Tested up to OCP 5.1",
    maxOcpVersion: "5.1",
    supportEnd: "Nov 30, 2025",
    supportRemaining: "Ended",
    supportStatus: "eol",
  },
  {
    name: "web-terminal",
    description: "Web Terminal Operator",
    namespace: "openshift-operators",
    managedNamespaces: "All namespaces",
    status: "Succeeded",
    version: "1.11.0",
    lastUpdated: "Mar 28, 2026, 9:00 AM",
    providedAPIs: ["DevWorkspace"],
    clusterCompat: "compatible",
    compatDetail: "Tested up to OCP 5.2",
    maxOcpVersion: "5.2",
    supportEnd: "Apr 30, 2028",
    supportRemaining: "2 yr",
    supportStatus: "supported",
  },
];

function CompatTooltip({ status, detail, children }: { status: CompatStatus; detail: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute z-50 bottom-full left-0 mb-[8px] w-[260px] bg-[#151515] text-white text-[12px] rounded-[8px] px-[12px] py-[10px] shadow-lg leading-[1.5] pointer-events-none">
          <p className="text-[#d2d2d2]">{detail}</p>
          <div className="absolute bottom-[-4px] left-[16px] size-[8px] bg-[#151515] rotate-45" />
        </div>
      )}
    </div>
  );
}

function SupportTooltip({ endDate, status, children }: { endDate: string; status: SupportStatus; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute z-50 bottom-full left-0 mb-[8px] w-[200px] bg-[#151515] text-white text-[12px] rounded-[8px] px-[12px] py-[10px] shadow-lg leading-[1.5] pointer-events-none">
          <p className="text-[#d2d2d2]">{status === "eol" ? `Support ended ${endDate}` : `Support ends ${endDate}`}</p>
          <div className="absolute bottom-[-4px] left-[16px] size-[8px] bg-[#151515] rotate-45" />
        </div>
      )}
    </div>
  );
}

type ColumnKey = "name" | "namespace" | "managedNamespaces" | "status" | "lastUpdated" | "providedAPIs" | "clusterCompat" | "support";

const ALL_COLUMNS: { key: ColumnKey; label: string; alwaysOn?: boolean; gridSize: string }[] = [
  { key: "name", label: "Name", alwaysOn: true, gridSize: "minmax(160px,1.4fr)" },
  { key: "namespace", label: "Namespace", gridSize: "minmax(130px,1fr)" },
  { key: "managedNamespaces", label: "Managed Namespaces", gridSize: "minmax(120px,1fr)" },
  { key: "status", label: "Status", gridSize: "100px" },
  { key: "lastUpdated", label: "Last updated", gridSize: "minmax(110px,0.8fr)" },
  { key: "providedAPIs", label: "Provided APIs", gridSize: "minmax(100px,0.7fr)" },
  { key: "clusterCompat", label: "Cluster Compatibility", gridSize: "minmax(120px,0.8fr)" },
  { key: "support", label: "Support", gridSize: "minmax(100px,0.7fr)" },
];

const DEFAULT_VISIBLE: ColumnKey[] = ["name", "namespace", "managedNamespaces", "status", "lastUpdated", "providedAPIs", "clusterCompat", "support"];

function buildGrid(visibleKeys: ColumnKey[]): string {
  const cols = ALL_COLUMNS.filter((c) => visibleKeys.includes(c.key)).map((c) => c.gridSize);
  return ["40px", ...cols, "40px"].join(" ");
}

export default function InstalledOperatorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openKebabIndex, setOpenKebabIndex] = useState<number | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(DEFAULT_VISIBLE);
  const [showManageCols, setShowManageCols] = useState(false);
  const [pendingColumns, setPendingColumns] = useState<ColumnKey[]>(DEFAULT_VISIBLE);
  const navigate = useNavigate();
  const { setCurrentPage } = useChat();

  useEffect(() => {
    setCurrentPage("/ecosystem/installed-operators");
  }, [setCurrentPage]);

  const filtered = operators.filter((op) =>
    !searchTerm || op.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-[24px] pb-[48px]">
        <Breadcrumbs items={[{ label: "Ecosystem", path: "/ecosystem" }, { label: "Installed Operators" }]} />

        <div className="flex items-center justify-between mb-[4px]">
          <h1 className="font-['Red_Hat_Display',sans-serif] font-semibold text-[#151515] dark:text-white text-[28px]">Installed Operators</h1>
          <FavoriteButton name="Installed Operators" path="/ecosystem/installed-operators" />
        </div>
        <p className="text-[14px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text',sans-serif] mb-[20px]">
          Installed Operators are represented by ClusterServiceVersions within this namespace. For more information, see the{" "}
          <a href="https://docs.openshift.com/container-platform/latest/operators/understanding/olm-understanding-operatorhub.html" target="_blank" rel="noopener noreferrer" className="text-[#0066cc] dark:text-[#4dabf7] no-underline hover:underline inline-flex items-center gap-[3px]">
            Understanding Operators documentation <ExternalLink className="size-[11px]" />
          </a>
        </p>

        {/* Toolbar */}
        <div className="flex items-center gap-[8px] mb-[16px]">
          <div className="flex">
            <select className="bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] rounded-l-[4px] border-r-0 px-[10px] py-[6px] text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text',sans-serif] cursor-pointer">
              <option>Name</option>
            </select>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[200px] px-[10px] py-[6px] bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] rounded-r-[4px] text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text',sans-serif] focus:outline-none focus:border-[#0066cc] transition-colors"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-[6px] top-1/2 -translate-y-1/2 bg-transparent border-0 cursor-pointer p-0 text-[#6a6e73] hover:text-[#151515]">
                  <X className="size-[12px]" />
                </button>
              )}
            </div>
          </div>
          <button className="bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] rounded-[4px] p-[6px] cursor-pointer hover:bg-[rgba(0,0,0,0.03)] transition-colors" title="Search">
            <Search className="size-[14px] text-[#6a6e73]" />
          </button>
          <button
            onClick={() => { setPendingColumns([...visibleColumns]); setShowManageCols(true); }}
            className="bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] rounded-[4px] p-[6px] cursor-pointer hover:bg-[rgba(0,0,0,0.03)] transition-colors"
            title="Manage columns"
          >
            <SlidersHorizontal className="size-[14px] text-[#6a6e73]" />
          </button>
        </div>

        {/* Manage Columns Modal */}
        {showManageCols && (
          <>
            <div className="fixed inset-0 bg-black/50 z-[10000]" onClick={() => setShowManageCols(false)} />
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[10001] w-[480px] max-h-[80vh] bg-white dark:bg-[#1a1a1a] rounded-[16px] border border-[#e0e0e0] dark:border-[rgba(255,255,255,0.12)] shadow-2xl flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[#e0e0e0] dark:border-[rgba(255,255,255,0.08)]">
                <h2 className="text-[16px] font-semibold text-[#151515] dark:text-white font-['Red_Hat_Display',sans-serif]">Manage columns</h2>
                <button onClick={() => setShowManageCols(false)} className="bg-transparent border-0 cursor-pointer p-[4px] hover:opacity-70 transition-opacity">
                  <X className="size-[16px] text-[#6a6e73]" />
                </button>
              </div>

              <div className="px-[24px] py-[16px] overflow-y-auto flex-1">
                <p className="text-[13px] text-[#6a6e73] dark:text-[#b0b0b0] font-['Red_Hat_Text',sans-serif] mb-[16px]">Selected columns will appear in the table. Drag to reorder.</p>

                <div className="flex items-center gap-[8px] mb-[12px] pb-[12px] border-b border-[#e0e0e0] dark:border-[rgba(255,255,255,0.08)]">
                  <input
                    type="checkbox"
                    checked={pendingColumns.length === ALL_COLUMNS.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPendingColumns(ALL_COLUMNS.map((c) => c.key));
                      } else {
                        setPendingColumns(ALL_COLUMNS.filter((c) => c.alwaysOn).map((c) => c.key));
                      }
                    }}
                    className="size-[16px] accent-[#0066cc] cursor-pointer"
                  />
                  <span className="text-[13px] font-medium text-[#151515] dark:text-white font-['Red_Hat_Text',sans-serif]">Select all ({pendingColumns.length} of {ALL_COLUMNS.length})</span>
                </div>

                <div className="flex flex-col gap-[2px]">
                  {ALL_COLUMNS.map((col) => (
                    <label key={col.key} className={`flex items-center gap-[8px] px-[8px] py-[8px] rounded-[6px] cursor-pointer transition-colors ${col.alwaysOn ? "opacity-70" : "hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.04)]"}`}>
                      <input
                        type="checkbox"
                        checked={pendingColumns.includes(col.key)}
                        disabled={col.alwaysOn}
                        onChange={() => {
                          if (col.alwaysOn) return;
                          setPendingColumns((prev) =>
                            prev.includes(col.key) ? prev.filter((k) => k !== col.key) : [...prev, col.key]
                          );
                        }}
                        className="size-[16px] accent-[#0066cc] cursor-pointer disabled:cursor-not-allowed"
                      />
                      <span className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text',sans-serif]">{col.label}</span>
                      {col.alwaysOn && <span className="text-[11px] text-[#6a6e73] ml-auto">Required</span>}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between px-[24px] py-[16px] border-t border-[#e0e0e0] dark:border-[rgba(255,255,255,0.08)]">
                <button
                  onClick={() => setPendingColumns([...DEFAULT_VISIBLE])}
                  className="text-[13px] text-[#0066cc] dark:text-[#4dabf7] bg-transparent border-0 cursor-pointer hover:underline font-['Red_Hat_Text',sans-serif]"
                >
                  Restore defaults
                </button>
                <div className="flex items-center gap-[8px]">
                  <button
                    onClick={() => setShowManageCols(false)}
                    className="px-[16px] py-[6px] text-[13px] text-[#151515] dark:text-white bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] rounded-[999px] cursor-pointer hover:bg-[rgba(0,0,0,0.03)] transition-colors font-['Red_Hat_Text',sans-serif]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { setVisibleColumns([...pendingColumns]); setShowManageCols(false); }}
                    className="px-[16px] py-[6px] text-[13px] text-white bg-[#0066cc] hover:bg-[#004080] border-0 rounded-[999px] cursor-pointer transition-colors font-['Red_Hat_Text',sans-serif] font-medium"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Table */}
        <div className="rounded-[16px] border border-[#e0e0e0] dark:border-[rgba(255,255,255,0.08)] overflow-hidden bg-white/90 dark:bg-[#1a1a1a]/90 no-glass:bg-white no-glass:dark:bg-[#1a1a1a] backdrop-blur-xl no-glass:backdrop-blur-none shadow-[0px_4px_10px_0px_rgba(41,41,41,0.06)]">
          {/* Header */}
          <div className="grid items-center border-b border-[#d2d2d2] dark:border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.03)]" style={{ gridTemplateColumns: buildGrid(visibleColumns) }}>
            <div />
            {ALL_COLUMNS.filter((c) => visibleColumns.includes(c.key)).map((col) => {
              const sortable = col.key === "name" || col.key === "namespace" || col.key === "managedNamespaces";
              return (
                <div key={col.key} className={`py-[10px] px-[10px] text-[12px] font-semibold text-[#151515] dark:text-white font-['Red_Hat_Text',sans-serif] ${sortable ? "flex items-center gap-[4px] cursor-pointer select-none" : ""}`}>
                  {col.label} {sortable && <span className="text-[#6a6e73]">↕</span>}
                </div>
              );
            })}
            <div />
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="py-[40px] text-center text-[13px] text-[#6a6e73] font-['Red_Hat_Text',sans-serif]">No operators match your search.</div>
          ) : (
            filtered.map((op, idx) => (
              <div
                key={op.name}
                className="grid items-center border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] last:border-b-0 hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                style={{ gridTemplateColumns: buildGrid(visibleColumns) }}
              >
                {/* Icon */}
                <div className="flex items-center justify-center py-[14px]">
                  <div className="size-[26px] rounded-[6px] bg-[#ee0000] flex items-center justify-center text-white text-[11px] font-bold font-['Red_Hat_Display',sans-serif] shrink-0">
                    {op.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Dynamic columns */}
                {ALL_COLUMNS.filter((c) => visibleColumns.includes(c.key)).map((col) => (
                  <div key={col.key} className="py-[14px] px-[10px] min-w-0">
                    {col.key === "name" && (
                      <>
                        <Link
                          to={`/ecosystem/installed-operators/${op.name}`}
                          className="font-['Red_Hat_Text',sans-serif] font-medium text-[#0066cc] dark:text-[#4dabf7] text-[13px] hover:underline no-underline block truncate"
                        >
                          {op.name}
                        </Link>
                        <p className="text-[11px] text-[#6a6e73] dark:text-[#8a8d90] font-['Red_Hat_Text',sans-serif] truncate mt-[1px]">{op.description}</p>
                      </>
                    )}
                    {col.key === "namespace" && (
                      <span className="text-[12px] text-[#0066cc] dark:text-[#4dabf7] font-['Red_Hat_Text',sans-serif] truncate block">{op.namespace}</span>
                    )}
                    {col.key === "managedNamespaces" && (
                      <span className="text-[12px] text-[#0066cc] dark:text-[#4dabf7] font-['Red_Hat_Text',sans-serif] truncate block">{op.managedNamespaces}</span>
                    )}
                    {col.key === "status" && (
                      op.status === "Succeeded" ? (
                        <span className="inline-flex items-center gap-[4px] text-[12px] text-[#3d7317]">
                          <CheckCircle className="size-[12px]" /> Succeeded
                        </span>
                      ) : op.status === "Degraded" ? (
                        <span className="inline-flex items-center gap-[4px] text-[12px] text-[#b1380b]">
                          <AlertCircle className="size-[12px]" /> Degraded
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-[4px] text-[12px] text-[#dca614]">
                          <Clock className="size-[12px]" /> Pending
                        </span>
                      )
                    )}
                    {col.key === "lastUpdated" && (
                      <span className="text-[12px] text-[#151515] dark:text-[#d2d2d2] font-['Red_Hat_Text',sans-serif]">{op.lastUpdated}</span>
                    )}
                    {col.key === "providedAPIs" && (
                      <div className="flex flex-wrap gap-[3px]">
                        {op.providedAPIs.slice(0, 2).map((api) => (
                          <span key={api} className="text-[11px] text-[#0066cc] dark:text-[#4dabf7] font-['Red_Hat_Text',sans-serif] hover:underline cursor-pointer">{api}</span>
                        ))}
                        {op.providedAPIs.length > 2 && (
                          <span className="text-[11px] text-[#6a6e73]">+{op.providedAPIs.length - 2}</span>
                        )}
                      </div>
                    )}
                    {col.key === "clusterCompat" && (
                      <CompatTooltip status={op.clusterCompat} detail={op.compatDetail}>
                        {op.clusterCompat === "compatible" ? (
                          <span className="inline-flex items-center gap-[3px] text-[12px] text-[#3d7317] cursor-default">
                            <CheckCircle className="size-[12px]" /> Compatible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-[3px] text-[12px] text-[#b1380b] cursor-default">
                            <AlertCircle className="size-[12px]" /> Incompatible
                          </span>
                        )}
                      </CompatTooltip>
                    )}
                    {col.key === "support" && (
                      <SupportTooltip endDate={op.supportEnd} status={op.supportStatus}>
                        {op.supportStatus === "supported" ? (
                          <span className="inline-flex items-center px-[8px] py-[2px] text-[11px] font-medium text-[#3d7317] border border-[#3d7317] rounded-[999px] cursor-default whitespace-nowrap">
                            {op.supportRemaining}
                          </span>
                        ) : op.supportStatus === "ending-soon" ? (
                          <span className="inline-flex items-center px-[8px] py-[2px] text-[11px] font-medium text-[#c58c00] border border-[#c58c00] rounded-[999px] cursor-default whitespace-nowrap">
                            {op.supportRemaining}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-[8px] py-[2px] text-[11px] font-medium text-[#c9190b] border border-[#c9190b] rounded-[999px] cursor-default whitespace-nowrap">
                            End of life
                          </span>
                        )}
                      </SupportTooltip>
                    )}
                  </div>
                ))}

                {/* Kebab */}
                <div className="py-[14px] px-[4px] relative">
                  <button
                    className="p-[4px] hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.08)] rounded-[4px] transition-colors bg-transparent border-0 cursor-pointer"
                    onClick={() => setOpenKebabIndex(openKebabIndex === idx ? null : idx)}
                  >
                    <MoreVertical className="size-[16px] text-[#6a6e73]" />
                  </button>
                  {openKebabIndex === idx && (
                    <>
                      <div className="fixed inset-0 z-[9998]" onClick={() => setOpenKebabIndex(null)} />
                      <div className="absolute right-[4px] top-[36px] w-[180px] bg-white/95 dark:bg-[#1f1f1f]/95 backdrop-blur-xl border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[12px] shadow-lg z-[9999] py-[4px]">
                        <button onClick={() => { navigate(`/ecosystem/installed-operators/${op.name}`); setOpenKebabIndex(null); }} className="w-full text-left px-[12px] py-[8px] text-[13px] text-[#151515] dark:text-white hover:bg-[rgba(0,0,0,0.04)] transition-colors bg-transparent border-0 cursor-pointer font-['Red_Hat_Text',sans-serif]">View details</button>
                        <button onClick={() => setOpenKebabIndex(null)} className="w-full text-left px-[12px] py-[8px] text-[13px] text-[#151515] dark:text-white hover:bg-[rgba(0,0,0,0.04)] transition-colors bg-transparent border-0 cursor-pointer font-['Red_Hat_Text',sans-serif]">Edit subscription</button>
                        <button onClick={() => setOpenKebabIndex(null)} className="w-full text-left px-[12px] py-[8px] text-[13px] text-[#151515] dark:text-white hover:bg-[rgba(0,0,0,0.04)] transition-colors bg-transparent border-0 cursor-pointer font-['Red_Hat_Text',sans-serif]">View YAML</button>
                        <div className="my-[4px] h-[1px] bg-[rgba(0,0,0,0.06)] dark:bg-[rgba(255,255,255,0.06)]" />
                        <button onClick={() => setOpenKebabIndex(null)} className="w-full text-left px-[12px] py-[8px] text-[13px] text-[#c9190b] hover:bg-[rgba(201,25,11,0.04)] transition-colors bg-transparent border-0 cursor-pointer font-['Red_Hat_Text',sans-serif]">Uninstall</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
