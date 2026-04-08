import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle,
  Info,
  AlertCircle,
  MoreVertical,
  ExternalLink,
  Layers,
  AlertTriangle,
  Clock,
  Columns2,
} from "@/lib/pfIcons";
import { Link, useNavigate } from "react-router";
import Breadcrumbs from "../../components/Breadcrumbs";
import FavoriteButton from "../../components/FavoriteButton";
import { useChat } from "../../contexts/ChatContext";
import { BulkUpdateModal } from "../../components/OperatorUpdateModals";
import { AiAssessmentSection } from "../../components/AiAssessmentSection";
import { OlsChatbot } from "../../components/OlsChatbot";

const CLUSTER_TARGET_VERSION = "5.1.10";
const CLUSTER_CHANNEL = "fast-5.1";

/** Data columns that can be hidden (Operator, selection, and Actions stay visible). */
type TableColumnKey =
  | "version"
  | "clusterCompatibility"
  | "updatePlan"
  | "support"
  | "status"
  | "lastUpdated"
  | "managedNamespaces";

const TABLE_COLUMN_OPTIONS: { key: TableColumnKey; label: string }[] = [
  { key: "version", label: "Version" },
  { key: "clusterCompatibility", label: "Cluster compatibility" },
  { key: "updatePlan", label: "Update plan" },
  { key: "support", label: "Support" },
  { key: "status", label: "Status" },
  { key: "lastUpdated", label: "Last updated" },
  { key: "managedNamespaces", label: "Managed namespaces" },
];

type InstalledOperator = {
  name: string;
  namespace: string;
  version: string;
  channel: string;
  source: string;
  status: "Running" | "Degraded" | "Pending";
  autoUpdate: boolean;
  clusterCompatibility: "Compatible" | "Incompatible" | "Unknown";
  compatibilityMessage?: string;
  support: "Full" | "Limited" | "Community" | "Self-support";
  supportEndDate?: string;
  supportBadge?: string;
  supportBadgeType?: "success" | "danger" | "warning";
  updateAvailable?: string;
  maxOcpVersion?: string;
  lastUpdated?: string;
  managedNamespaces?: string[];
};

type CatalogOperator = InstalledOperator & {
  requiredBeforeClusterUpdate?: boolean;
  isOlmV1Extension?: boolean;
};

function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function getOperatorCompatibilityPage(
  op: InstalledOperator,
  targetVersion: string
): { compatibility: "Compatible" | "Incompatible" | "Unknown"; message?: string } {
  if (op.status === "Pending") {
    return { compatibility: "Unknown", message: op.compatibilityMessage || "Operator is pending." };
  }
  if (op.status === "Degraded") {
    return {
      compatibility: "Unknown",
      message:
        op.compatibilityMessage ||
        "Operator is degraded. Compatibility cannot be determined until the operator is healthy.",
    };
  }
  if (!op.maxOcpVersion) return { compatibility: "Compatible" };
  const targetMajorMinor = targetVersion.split(".").slice(0, 2).join(".");
  if (compareVersions(op.maxOcpVersion, targetMajorMinor) < 0) {
    return {
      compatibility: "Incompatible",
      message: `Max supported OCP version is ${op.maxOcpVersion}. ${
        op.updateAvailable
          ? `Update to v${op.updateAvailable}+ before upgrading cluster.`
          : "Update operator before upgrading cluster."
      }`,
    };
  }
  return { compatibility: "Compatible" };
}

const INITIAL_CATALOG_OPERATORS: CatalogOperator[] = [
  {
    name: "Cluster Logging",
    namespace: "openshift-logging",
    version: "6.4.3",
    channel: "stable-6.4",
    source: "redhat-operators",
    status: "Running",
    autoUpdate: false,
    clusterCompatibility: "Incompatible",
    compatibilityMessage:
      "Max supported OCP version is 5.0. Update to v6.5+ before upgrading cluster.",
    support: "Full",
    supportEndDate: "Nov 13, 2025",
    supportBadge: "End of life",
    supportBadgeType: "danger",
    updateAvailable: "6.5.1",
    maxOcpVersion: "5.0",
    lastUpdated: "Jan 8, 2026, 3:12 PM",
    managedNamespaces: ["openshift-logging"],
    requiredBeforeClusterUpdate: true,
  },
  {
    name: "Elasticsearch Operator",
    namespace: "openshift-operators-redhat",
    version: "5.7.2",
    channel: "stable-5.7",
    source: "redhat-operators",
    status: "Running",
    autoUpdate: false,
    clusterCompatibility: "Compatible",
    support: "Full",
    supportEndDate: "May 10, 2028",
    supportBadge: "2 years, 1 month",
    supportBadgeType: "success",
    maxOcpVersion: "5.1",
    lastUpdated: "Feb 12, 2026, 4:32 AM",
    managedNamespaces: ["openshift-operators-redhat", "openshift-logging"],
    requiredBeforeClusterUpdate: true,
  },
  {
    name: "Cloud Credential Operator",
    namespace: "openshift-cloud-credential-operator",
    version: "5.0.0",
    channel: "stable",
    source: "Built-in",
    status: "Running",
    autoUpdate: true,
    clusterCompatibility: "Compatible",
    compatibilityMessage: "IAM configuration may need updating before cluster upgrade.",
    support: "Full",
    supportEndDate: "Jun 15, 2028",
    supportBadge: "2 years, 2 months",
    supportBadgeType: "success",
    maxOcpVersion: "5.2",
    lastUpdated: "Mar 1, 2026, 3:48 AM",
    managedNamespaces: ["openshift-cloud-credential-operator"],
  },
  {
    name: "Operator Lifecycle Manager",
    namespace: "openshift-operator-lifecycle-manager",
    version: "4.21.0",
    channel: "stable",
    source: "Built-in",
    status: "Running",
    autoUpdate: false,
    clusterCompatibility: "Incompatible",
    compatibilityMessage: "Incompatible with OCP 5.1. Update to 4.22.0 or higher.",
    support: "Full",
    supportEndDate: "Mar 20, 2027",
    supportBadge: "11 months",
    supportBadgeType: "warning",
    updateAvailable: "4.22.0",
    maxOcpVersion: "5.0",
    lastUpdated: "Mar 1, 2026, 3:48 AM",
    managedNamespaces: ["openshift-operator-lifecycle-manager", "openshift-marketplace"],
  },
  {
    name: "Cert Manager",
    namespace: "cert-manager-operator",
    version: "1.14.0",
    channel: "stable-v1",
    source: "redhat-operators",
    status: "Running",
    autoUpdate: true,
    clusterCompatibility: "Compatible",
    support: "Full",
    supportEndDate: "Sep 1, 2027",
    supportBadge: "1 year, 5 months",
    supportBadgeType: "success",
    maxOcpVersion: "5.2",
    lastUpdated: "Mar 18, 2026, 2:05 AM",
    managedNamespaces: ["cert-manager", "cert-manager-operator"],
  },
  {
    name: "OpenShift DNS",
    namespace: "openshift-dns-operator",
    version: "5.0.0",
    channel: "stable",
    source: "Built-in",
    status: "Running",
    autoUpdate: true,
    clusterCompatibility: "Compatible",
    support: "Full",
    supportEndDate: "Jun 15, 2028",
    supportBadge: "2 years, 2 months",
    supportBadgeType: "success",
    maxOcpVersion: "5.2",
    lastUpdated: "Mar 1, 2026, 3:48 AM",
    managedNamespaces: ["openshift-dns", "openshift-dns-operator"],
  },
  {
    name: "Ingress Operator",
    namespace: "openshift-ingress-operator",
    version: "5.0.0",
    channel: "stable",
    source: "Built-in",
    status: "Running",
    autoUpdate: true,
    clusterCompatibility: "Compatible",
    support: "Full",
    supportEndDate: "Jun 15, 2028",
    supportBadge: "2 years, 2 months",
    supportBadgeType: "success",
    maxOcpVersion: "5.2",
    lastUpdated: "Mar 1, 2026, 3:48 AM",
    managedNamespaces: ["openshift-ingress", "openshift-ingress-operator"],
  },
  {
    name: "Machine Config Operator",
    namespace: "openshift-machine-config-operator",
    version: "5.0.0",
    channel: "stable",
    source: "Built-in",
    status: "Running",
    autoUpdate: true,
    clusterCompatibility: "Compatible",
    support: "Full",
    supportEndDate: "Jun 15, 2028",
    supportBadge: "2 years, 2 months",
    supportBadgeType: "success",
    maxOcpVersion: "5.2",
    lastUpdated: "Mar 1, 2026, 3:48 AM",
    managedNamespaces: ["openshift-machine-config-operator"],
  },
  {
    name: "Monitoring Stack",
    namespace: "openshift-monitoring",
    version: "5.0.0",
    channel: "stable",
    source: "Built-in",
    status: "Running",
    autoUpdate: true,
    clusterCompatibility: "Compatible",
    support: "Full",
    supportEndDate: "Jun 15, 2028",
    supportBadge: "2 years, 2 months",
    supportBadgeType: "success",
    maxOcpVersion: "5.2",
    lastUpdated: "Mar 1, 2026, 3:48 AM",
    managedNamespaces: ["openshift-monitoring", "openshift-user-workload-monitoring"],
  },
  {
    name: "Service Mesh",
    namespace: "openshift-operators",
    version: "2.5.1",
    channel: "stable",
    source: "redhat-operators",
    status: "Degraded",
    autoUpdate: false,
    clusterCompatibility: "Unknown",
    compatibilityMessage:
      "Operator is degraded. Compatibility cannot be determined until the operator is healthy.",
    support: "Limited",
    supportEndDate: "Dec 1, 2026",
    supportBadge: "8 months",
    supportBadgeType: "warning",
    updateAvailable: "2.6.0",
    lastUpdated: "Nov 5, 2025, 10:22 AM",
    managedNamespaces: ["istio-system", "openshift-operators"],
  },
  {
    name: "Web Terminal",
    namespace: "openshift-operators",
    version: "1.9.0",
    channel: "fast",
    source: "redhat-operators",
    status: "Running",
    autoUpdate: true,
    clusterCompatibility: "Compatible",
    support: "Community",
    supportEndDate: "Apr 30, 2028",
    supportBadge: "2 years",
    supportBadgeType: "success",
    maxOcpVersion: "5.2",
    lastUpdated: "Mar 22, 2026, 6:00 AM",
    managedNamespaces: ["openshift-terminal"],
  },
  {
    name: "Kiali Operator",
    namespace: "openshift-operators",
    version: "1.73.0",
    channel: "stable",
    source: "redhat-operators",
    status: "Running",
    autoUpdate: false,
    clusterCompatibility: "Compatible",
    support: "Full",
    supportEndDate: "Jan 15, 2028",
    supportBadge: "1 year, 9 months",
    supportBadgeType: "success",
    updateAvailable: "1.76.0",
    maxOcpVersion: "5.1",
    lastUpdated: "Dec 20, 2025, 9:15 AM",
    managedNamespaces: ["kiali-operator", "istio-system"],
  },
  {
    name: "OpenShift GitOps (cluster extension)",
    namespace: "openshift-gitops-operator",
    version: "1.12.0",
    channel: "gitops-1.12",
    source: "redhat-operators",
    status: "Running",
    autoUpdate: true,
    clusterCompatibility: "Compatible",
    support: "Full",
    supportEndDate: "May 10, 2028",
    supportBadge: "Full support",
    supportBadgeType: "success",
    maxOcpVersion: "5.2",
    lastUpdated: "Jun 12, 2025, 4:02 PM",
    managedNamespaces: ["openshift-gitops"],
    isOlmV1Extension: true,
  },
  {
    name: "Sample observability bundle",
    namespace: "observability-bundles",
    version: "0.4.1",
    channel: "stable",
    source: "community-operators",
    status: "Pending",
    autoUpdate: true,
    clusterCompatibility: "Unknown",
    compatibilityMessage: "V1 discovery in progress — update availability TBD",
    support: "Community",
    supportEndDate: "—",
    supportBadge: "Self-support",
    supportBadgeType: "danger",
    lastUpdated: "Jun 11, 2025, 9:15 AM",
    managedNamespaces: ["observability-sample"],
    isOlmV1Extension: true,
  },
];

function KebabMenu({
  isOpen,
  onToggle,
  onClose,
  items,
}: {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  items: { label: string; onClick: () => void }[];
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const menuHeight = items.length * 36 + 8;
      const spaceBelow = window.innerHeight - rect.bottom;
      const opensUp = spaceBelow < menuHeight + 8;
      setPos({
        top: opensUp ? rect.top - menuHeight - 4 : rect.bottom + 4,
        left: rect.right - 200,
      });
    }
  }, [isOpen, items.length]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="p-[4px] hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.08)] rounded-[4px] transition-colors bg-transparent border-0 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        <MoreVertical className="size-[16px] text-[#4d4d4d] dark:text-[#b0b0b0]" />
      </button>
      {isOpen &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[9998]" onClick={onClose} />
            <div
              ref={menuRef}
              className="fixed z-[9999] w-[200px] app-glass-panel app-glass-panel--radius-sm py-[4px]"
              style={{ top: pos.top, left: pos.left }}
            >
              {items.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="w-full text-left px-[16px] py-[8px] text-[14px] text-[#151515] dark:text-white hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors bg-transparent border-0 cursor-pointer"
                  onClick={() => {
                    item.onClick();
                    onClose();
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </>,
          document.body
        )}
    </>
  );
}

export default function InstalledOperatorsPage() {
  const [operators, setOperators] = useState<CatalogOperator[]>(() => [...INITIAL_CATALOG_OPERATORS]);
  const [selectedOperators, setSelectedOperators] = useState<string[]>([]);
  const [openKebabIndex, setOpenKebabIndex] = useState<number | null>(null);
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatbotContext, setChatbotContext] = useState("");
  const [olsMountKey, setOlsMountKey] = useState(0);
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<TableColumnKey, boolean>>({
    version: true,
    clusterCompatibility: true,
    updatePlan: true,
    support: true,
    status: true,
    lastUpdated: true,
    managedNamespaces: true,
  });
  const columnMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { setCurrentPage } = useChat();

  const openChatbot = useCallback((context: string) => {
    setChatbotContext(context);
    setOlsMountKey((k) => k + 1);
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

  useEffect(() => {
    setCurrentPage("/ecosystem/installed-operators");
  }, [setCurrentPage]);

  useEffect(() => {
    if (!columnMenuOpen) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (columnMenuRef.current && !columnMenuRef.current.contains(e.target as Node)) {
        setColumnMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [columnMenuOpen]);

  const visibleDataColumnCount = useMemo(
    () => TABLE_COLUMN_OPTIONS.filter(({ key }) => visibleColumns[key]).length,
    [visibleColumns]
  );

  const tableColSpan = 3 + visibleDataColumnCount;

  const operatorsWithCompat = useMemo(() => {
    return operators.map((op) => {
      const { compatibility, message } = getOperatorCompatibilityPage(op, CLUSTER_TARGET_VERSION);
      return {
        ...op,
        clusterCompatibility: compatibility,
        compatibilityMessage: message || op.compatibilityMessage,
      };
    });
  }, [operators]);

  const filteredOperators = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return operatorsWithCompat.filter((op) => {
      if (!q) return true;
      return op.name.toLowerCase().includes(q) || op.namespace.toLowerCase().includes(q);
    });
  }, [operatorsWithCompat, searchTerm]);

  const v1Count = operators.filter((o) => o.isOlmV1Extension).length;

  const operatorsForBulkModal = useMemo(
    () =>
      operatorsWithCompat.map((op) => ({
        name: op.name,
        version: op.version,
        newVersion: op.updateAvailable ?? null,
        status: op.status,
        statusType: op.status === "Running" ? "success" : op.status === "Degraded" ? "warning" : "neutral",
        updatePlan: op.autoUpdate ? "Automatic" : "Manual",
        clusterCompatibility: op.clusterCompatibility,
        support: op.supportEndDate ?? "—",
        supportBadge: op.supportBadge ?? "",
        supportType:
          op.supportBadgeType === "danger"
            ? "danger"
            : op.supportBadgeType === "warning"
              ? "warning"
              : "success",
        lastUpdated: op.lastUpdated ?? "—",
        required: op.requiredBeforeClusterUpdate,
      })),
    [operatorsWithCompat]
  );

  const installedAiSummary = useMemo(
    () => ({
      totalOperators: operators.length,
      updatesAvailable: operators.filter((o) => o.updateAvailable).length,
      clusterTargetVersion: CLUSTER_TARGET_VERSION,
      channelLabel: CLUSTER_CHANNEL,
    }),
    [operators]
  );

  const applyBulkUpdates = useCallback((updatedNames: string[]) => {
    const now = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
    setOperators((prev) =>
      prev.map((op) => {
        if (!updatedNames.includes(op.name) || !op.updateAvailable) return op;
        const nv = op.updateAvailable;
        return {
          ...op,
          version: nv,
          updateAvailable: undefined,
          maxOcpVersion: "5.2",
          clusterCompatibility: "Compatible" as const,
          compatibilityMessage: undefined,
          status: op.status === "Pending" ? ("Running" as const) : op.status,
          lastUpdated: now,
        };
      })
    );
    setSelectedOperators([]);
  }, []);

  const navigateToUpdate = (op: (typeof filteredOperators)[0]) => {
    navigate(`/ecosystem/installed-operators/${encodeURIComponent(op.name)}/update`, {
      state: { returnTo: "/ecosystem/installed-operators", operatorName: op.name, operatorData: op },
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOperators(filteredOperators.map((op) => op.name));
    } else {
      setSelectedOperators([]);
    }
  };

  const handleSelectOperator = (name: string) => {
    if (selectedOperators.includes(name)) {
      setSelectedOperators(selectedOperators.filter((n) => n !== name));
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
              Manage catalog operators installed on this cluster. The table matches{" "}
              <span className="text-[#151515] dark:text-white font-medium">Cluster Update</span> for column
              names and layout. Select{" "}
              <span className="text-[#151515] dark:text-white font-medium">two or more</span> operators with
              catalog updates to run a bulk approval from{" "}
              <span className="text-[#151515] dark:text-white font-medium">Approve update</span>.
            </p>
          </div>

          <AiAssessmentSection
            variant="installed-operators"
            installedSummary={installedAiSummary}
            openChatbot={openChatbot}
            selectedVersion={CLUSTER_TARGET_VERSION}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-[16px] mb-[24px]">
            <div className="bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(255,255,255,0.05)] rounded-[16px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.06)] p-[20px] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)]">
              <div className="flex items-center gap-[12px] mb-[8px]">
                <CheckCircle className="size-[24px] text-[#3e8635] dark:text-[#5ba352]" />
                <p className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[13px]">Total installed</p>
              </div>
              <p className="font-['Red_Hat_Display:Bold',sans-serif] font-bold text-[#151515] dark:text-white text-[32px]">
                {operators.length}
              </p>
            </div>
            <div className="bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(255,255,255,0.05)] rounded-[16px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.06)] p-[20px] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)]">
              <div className="flex items-center gap-[12px] mb-[8px]">
                <Info className="size-[24px] text-[#2b9af3] dark:text-[#73bcf7]" />
                <p className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[13px]">Available Updates</p>
              </div>
              <p className="font-['Red_Hat_Display:Bold',sans-serif] font-bold text-[#2b9af3] dark:text-[#73bcf7] text-[32px]">
                {operators.filter((o) => o.updateAvailable).length}
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
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-[12px] mb-[20px]">
            <input
              type="text"
              placeholder="Find by name or namespace"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[280px] px-[12px] py-[10px] bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[rgba(0,0,0,0.2)] dark:border-[rgba(255,255,255,0.2)] rounded-[8px] text-[13px] text-[#151515] dark:text-white placeholder:text-[#4d4d4d] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-[#0066cc] dark:focus:ring-[#4dabf7]"
            />
            <button
              type="button"
              onClick={() => setIsBulkUpdateModalOpen(true)}
              disabled={selectedOperators.length < 2}
              title={
                selectedOperators.length < 2
                  ? "Select at least two operators to run a bulk approval"
                  : "Review and approve updates for the selected operators"
              }
              className={`px-[16px] py-[10px] rounded-[8px] font-semibold text-[14px] transition-all ${
                selectedOperators.length < 2
                  ? "bg-[#d2d2d2] dark:bg-[#4d4d4d] text-[#8a8d90] dark:text-[#8a8d90] cursor-not-allowed"
                  : "bg-[#0066cc] hover:bg-[#004080] dark:bg-[#4dabf7] dark:hover:bg-[#339af0] text-white cursor-pointer"
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
            <div className="relative" ref={columnMenuRef}>
              <button
                type="button"
                onClick={() => setColumnMenuOpen((o) => !o)}
                aria-expanded={columnMenuOpen}
                aria-haspopup="true"
                className="inline-flex items-center gap-[6px] px-[12px] py-[8px] rounded-[8px] border border-[#0066cc] dark:border-[#4dabf7] text-[#0066cc] dark:text-[#4dabf7] text-[13px] font-semibold font-['Red_Hat_Text:Regular',sans-serif] hover:bg-[rgba(0,102,204,0.06)] dark:hover:bg-[rgba(77,171,247,0.1)] transition-colors bg-white dark:bg-[rgba(255,255,255,0.05)]"
              >
                <Columns2 className="size-[16px] shrink-0" aria-hidden />
                Manage columns
              </button>
              {columnMenuOpen && (
                <div
                  className="absolute left-0 mt-[6px] z-[100] w-[min(100vw-32px,280px)] app-glass-panel app-glass-panel--radius-sm py-[8px]"
                  role="menu"
                  aria-label="Table column visibility"
                >
                  <p className="px-[14px] pb-[6px] text-[11px] font-semibold uppercase tracking-wide text-[#6a6e73] dark:text-[#8a8d90] font-['Red_Hat_Text:Regular',sans-serif]">
                    Visible columns
                  </p>
                  {TABLE_COLUMN_OPTIONS.map(({ key, label }) => (
                    <label
                      key={key}
                      className="flex items-center gap-[10px] px-[14px] py-[8px] cursor-pointer hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.06)] mx-[4px] rounded-[4px]"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns[key]}
                        onChange={() => setVisibleColumns((v) => ({ ...v, [key]: !v[key] }))}
                        className="size-[14px] rounded border-[#8a8d90] cursor-pointer accent-[#0066cc]"
                      />
                      <span className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(255,255,255,0.05)] rounded-[16px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)] overflow-hidden border border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)]">
            <div className="px-[20px] py-[12px] border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.03)]">
              <p className="text-[12px] text-[#6a6e73] dark:text-[#8a8d90] font-['Red_Hat_Text:Regular',sans-serif] flex flex-wrap items-center gap-[6px]">
                <Layers className="size-[14px] text-[#6753ac] dark:text-[#b2a3e0] shrink-0" aria-hidden />
                <span>
                  = <span className="font-medium text-[#151515] dark:text-white">Cluster extension</span>{" "}
                  <span className="text-[#6a6e73] dark:text-[#8a8d90]">(OLM v1 managed)</span>
                </span>
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)]">
                    <th className="text-left py-[12px] pl-[16px] pr-[8px] w-[48px]">
                      <input
                        type="checkbox"
                        checked={
                          filteredOperators.length > 0 &&
                          selectedOperators.length === filteredOperators.length
                        }
                        onChange={handleSelectAll}
                        className="size-[16px] cursor-pointer"
                        title="Select all in view"
                      />
                    </th>
                    <th className="text-left py-[12px] px-[16px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px]">
                      Operator
                    </th>
                    {visibleColumns.version && (
                      <th className="text-left py-[12px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px]">
                        Version
                      </th>
                    )}
                    {visibleColumns.clusterCompatibility && (
                      <th className="text-left py-[12px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px]">
                        Cluster compatibility
                      </th>
                    )}
                    {visibleColumns.updatePlan && (
                      <th className="text-left py-[12px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px]">
                        Update plan
                      </th>
                    )}
                    {visibleColumns.support && (
                      <th className="text-left py-[12px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px]">
                        Support
                      </th>
                    )}
                    {visibleColumns.status && (
                      <th className="text-left py-[12px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px]">
                        Status
                      </th>
                    )}
                    {visibleColumns.lastUpdated && (
                      <th className="text-left py-[12px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px]">
                        Last updated
                      </th>
                    )}
                    {visibleColumns.managedNamespaces && (
                      <th className="text-left py-[12px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px]">
                        Managed namespaces
                      </th>
                    )}
                    <th className="text-left py-[12px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px] w-[60px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOperators.length === 0 ? (
                    <tr>
                      <td
                        colSpan={tableColSpan}
                        className="px-[16px] py-[24px] text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]"
                      >
                        No operators match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredOperators.map((op, i) => (
                      <tr
                        key={op.name}
                        className={`border-b border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.05)] hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] transition-colors ${
                          i === filteredOperators.length - 1 ? "border-b-0" : ""
                        }`}
                      >
                        <td className="py-[14px] pl-[16px] pr-[8px] align-top">
                          <input
                            type="checkbox"
                            checked={selectedOperators.includes(op.name)}
                            onChange={() => handleSelectOperator(op.name)}
                            className="size-[16px] cursor-pointer mt-[2px]"
                          />
                        </td>
                        <td className="py-[14px] px-[16px]">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-[8px] gap-y-[2px]">
                              <Link
                                to={`/ecosystem/installed-operators/${encodeURIComponent(op.name)}`}
                                className="text-[#0066cc] dark:text-[#4dabf7] text-[13px] font-['Red_Hat_Text:Medium',sans-serif] font-medium hover:underline no-underline"
                              >
                                {op.name}
                              </Link>
                              {op.requiredBeforeClusterUpdate && (
                                <span className="px-[6px] py-[1px] bg-[#f0ab00] text-white rounded-[4px] text-[10px] font-semibold shrink-0">
                                  Required
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#6a6e73] dark:text-[#8a8d90] font-['Red_Hat_Mono:Regular',sans-serif] truncate mt-[1px]">
                              {op.namespace}
                            </p>
                          </div>
                        </td>
                        {visibleColumns.version && (
                          <td className="py-[14px] px-[12px]">
                            <span className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Mono:Regular',sans-serif]">
                              {op.version}
                            </span>
                            {op.updateAvailable ? (
                              <span className="block text-[11px] text-[#0066cc] dark:text-[#4dabf7] mt-[4px] font-['Red_Hat_Text:Regular',sans-serif]">
                                Update available: {op.updateAvailable}
                              </span>
                            ) : null}
                          </td>
                        )}
                        {visibleColumns.clusterCompatibility && (
                          <td className="py-[14px] px-[12px]">
                            {op.clusterCompatibility === "Compatible" ? (
                              <span className="flex items-center gap-[4px] text-[13px] text-[#151515] dark:text-[#e0e0e0]">
                                <CheckCircle className="size-[14px] text-[#3d7317]" /> Compatible
                              </span>
                            ) : op.clusterCompatibility === "Incompatible" ? (
                              <span className="flex items-center gap-[4px] text-[13px] text-[#151515] dark:text-[#e0e0e0]">
                                <AlertCircle className="size-[14px] text-[#b1380b]" /> Incompatible
                              </span>
                            ) : (
                              <span className="flex items-center gap-[4px] text-[13px] text-[#151515] dark:text-[#e0e0e0]">
                                <AlertTriangle className="size-[14px] text-[#dca614]" /> Unknown
                              </span>
                            )}
                          </td>
                        )}
                        {visibleColumns.updatePlan && (
                          <td className="py-[14px] px-[12px] text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0]">
                            {op.autoUpdate ? "Automatic" : "Manual"}
                          </td>
                        )}
                        {visibleColumns.support && (
                          <td className="py-[14px] px-[12px]">
                            <div>
                              <p className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0]">
                                {op.supportEndDate || "—"}
                              </p>
                              {op.supportBadge && (
                                <span
                                  className={`text-[12px] ${
                                    op.supportBadgeType === "danger"
                                      ? "text-[#f0ab00] dark:text-[#f4c145]"
                                      : op.supportBadgeType === "warning"
                                        ? "text-[#f0ab00] dark:text-[#f4c145]"
                                        : "text-[#3e8635] dark:text-[#5ba352]"
                                  }`}
                                >
                                  {op.supportBadge}
                                </span>
                              )}
                            </div>
                          </td>
                        )}
                        {visibleColumns.status && (
                          <td className="py-[14px] px-[12px]">
                            {op.status === "Running" ? (
                              <span className="flex items-center gap-[4px] text-[13px] text-[#151515] dark:text-[#e0e0e0]">
                                <CheckCircle className="size-[14px] text-[#3d7317]" /> Running
                              </span>
                            ) : op.status === "Degraded" ? (
                              <span className="flex items-center gap-[4px] text-[13px] text-[#151515] dark:text-[#e0e0e0]">
                                <AlertCircle className="size-[14px] text-[#b1380b]" /> Degraded
                              </span>
                            ) : (
                              <span className="flex items-center gap-[4px] text-[13px] text-[#151515] dark:text-[#e0e0e0]">
                                <Clock className="size-[14px] text-[#dca614]" /> Pending
                              </span>
                            )}
                          </td>
                        )}
                        {visibleColumns.lastUpdated && (
                          <td className="py-[14px] px-[12px] text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] whitespace-nowrap">
                            {op.lastUpdated || "—"}
                          </td>
                        )}
                        {visibleColumns.managedNamespaces && (
                          <td className="py-[14px] px-[12px]">
                            <div className="flex flex-wrap gap-[4px]">
                              {(op.managedNamespaces || []).map((ns, idx) => (
                                <span
                                  key={idx}
                                  className="text-[11px] px-[6px] py-[1px] rounded-[4px] bg-[rgba(0,0,0,0.04)] dark:bg-[rgba(255,255,255,0.06)] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Mono:Regular',sans-serif]"
                                >
                                  {ns}
                                </span>
                              ))}
                            </div>
                          </td>
                        )}
                        <td className="py-[14px] px-[12px]">
                          <KebabMenu
                            isOpen={openKebabIndex === i}
                            onToggle={() => setOpenKebabIndex(openKebabIndex === i ? null : i)}
                            onClose={() => setOpenKebabIndex(null)}
                            items={[
                              {
                                label: "View details",
                                onClick: () =>
                                  navigate(`/ecosystem/installed-operators/${encodeURIComponent(op.name)}`),
                              },
                              ...(typeof op.updateAvailable === "string" && op.updateAvailable.length > 0
                                ? [
                                    {
                                      label: "Update",
                                      onClick: () => navigateToUpdate(op),
                                    },
                                  ]
                                : []),
                              {
                                label: "Edit subscription",
                                onClick: () =>
                                  navigate(
                                    `/ecosystem/installed-operators/${encodeURIComponent(op.name)}/subscription`
                                  ),
                              },
                            ]}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {chatbotOpen && (
        <OlsChatbot
          key={olsMountKey}
          context={chatbotContext}
          selectedVersion={CLUSTER_TARGET_VERSION}
          selectedChannel={CLUSTER_CHANNEL}
          onClose={() => setChatbotOpen(false)}
          onAction={handleChatAction}
        />
      )}

      <BulkUpdateModal
        isOpen={isBulkUpdateModalOpen}
        onClose={() => setIsBulkUpdateModalOpen(false)}
        selectedOperators={selectedOperators}
        operators={operatorsForBulkModal}
        onBulkComplete={applyBulkUpdates}
      />
    </div>
  );
}
