import { useState, useEffect, useCallback, useMemo } from "react";
import {
  CheckCircle,
  Info,
  AlertCircle,
  ExternalLink,
  Layers,
  AlertTriangle,
  Clock,
  Columns2,
} from "@/lib/pfIcons";
import { usePatternFlyGlassActive } from "@/lib/usePatternFlyGlassActive";
import { Link, useNavigate } from "react-router";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Content,
  Dropdown,
  DropdownGroup,
  DropdownItem,
  Flex,
  Icon,
  Label,
  MenuToggle,
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from "@patternfly/react-core";
import EllipsisVIcon from "@patternfly/react-icons/dist/esm/icons/ellipsis-v-icon";
import { InnerScrollContainer, Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
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
  const navigate = useNavigate();
  const { setCurrentPage } = useChat();
  const isGlass = usePatternFlyGlassActive();

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

          <Toolbar
            id="installed-operators-toolbar"
            ouiaId="installed-operators-toolbar"
            style={{ marginBottom: "var(--pf-t--global--spacer--lg)" }}
          >
            <ToolbarContent>
              <ToolbarItem>
                <SearchInput
                  aria-label="Find by name or namespace"
                  placeholder="Find by name or namespace"
                  value={searchTerm}
                  onChange={(_event, value) => setSearchTerm(value)}
                  onClear={(e) => {
                    e.stopPropagation();
                    setSearchTerm("");
                  }}
                  style={{ width: "min(100%, 280px)" }}
                />
              </ToolbarItem>
              <ToolbarGroup align={{ default: "alignEnd" }} gap={{ default: "gapMd" }}>
                <ToolbarItem>
                  <Button
                    variant="primary"
                    onClick={() => setIsBulkUpdateModalOpen(true)}
                    isDisabled={selectedOperators.length < 2}
                    title={
                      selectedOperators.length < 2
                        ? "Select at least two operators to run a bulk approval"
                        : "Review and approve updates for the selected operators"
                    }
                  >
                    Approve update
                  </Button>
                </ToolbarItem>
                <ToolbarItem>
                  <Button
                    variant="link"
                    component={Link}
                    to="/ecosystem/software-catalog"
                    icon={<ExternalLink />}
                    iconPosition="right"
                  >
                    Browse Software Catalog
                  </Button>
                </ToolbarItem>
                <ToolbarItem>
                  <Dropdown
                    isOpen={columnMenuOpen}
                    onOpenChange={setColumnMenuOpen}
                    toggle={(toggleRef) => (
                      <MenuToggle
                        ref={toggleRef}
                        variant="secondary"
                        aria-label="Table column visibility"
                        onClick={() => setColumnMenuOpen((o) => !o)}
                        isExpanded={columnMenuOpen}
                        icon={<Columns2 aria-hidden />}
                      >
                        Manage columns
                      </MenuToggle>
                    )}
                    onSelect={() => {}}
                    shouldFocusToggleOnSelect={false}
                  >
                    <DropdownGroup label="Visible columns">
                      {TABLE_COLUMN_OPTIONS.map(({ key, label }) => (
                        <DropdownItem
                          key={key}
                          itemId={key}
                          hasCheckbox
                          isSelected={visibleColumns[key]}
                          onClick={() =>
                            setVisibleColumns((v) => ({ ...v, [key]: !v[key] }))
                          }
                        >
                          {label}
                        </DropdownItem>
                      ))}
                    </DropdownGroup>
                  </Dropdown>
                </ToolbarItem>
              </ToolbarGroup>
            </ToolbarContent>
          </Toolbar>

          <Card isGlass={isGlass}>
            <CardHeader>
              <Flex
                alignItems={{ default: "alignItemsCenter" }}
                gap={{ default: "gapSm" }}
                flexWrap={{ default: "flexWrapWrap" }}
              >
                <Icon>
                  <Layers />
                </Icon>
                <Content component="small">
                  = <strong>Cluster extension</strong> (OLM v1 managed)
                </Content>
              </Flex>
            </CardHeader>
            <CardBody>
              <InnerScrollContainer>
                <Table aria-label="Installed operators" borders>
                  <Thead>
                    <Tr>
                      <Th modifier="fitContent" aria-label="Select all operators in view">
                        <input
                          type="checkbox"
                          checked={
                            filteredOperators.length > 0 &&
                            selectedOperators.length === filteredOperators.length
                          }
                          onChange={handleSelectAll}
                          title="Select all in view"
                        />
                      </Th>
                      <Th dataLabel="Operator">Operator</Th>
                      {visibleColumns.version && <Th dataLabel="Version">Version</Th>}
                      {visibleColumns.clusterCompatibility && (
                        <Th dataLabel="Cluster compatibility">Cluster compatibility</Th>
                      )}
                      {visibleColumns.updatePlan && <Th dataLabel="Update plan">Update plan</Th>}
                      {visibleColumns.support && <Th dataLabel="Support">Support</Th>}
                      {visibleColumns.status && <Th dataLabel="Status">Status</Th>}
                      {visibleColumns.lastUpdated && <Th dataLabel="Last updated">Last updated</Th>}
                      {visibleColumns.managedNamespaces && (
                        <Th dataLabel="Managed namespaces">Managed namespaces</Th>
                      )}
                      <Th modifier="fitContent" dataLabel="Actions">
                        Actions
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredOperators.length === 0 ? (
                      <Tr>
                        <Td colSpan={tableColSpan} dataLabel="Empty state">
                          No operators match your search.
                        </Td>
                      </Tr>
                    ) : (
                      filteredOperators.map((op, i) => (
                        <Tr key={op.name} isRowSelected={selectedOperators.includes(op.name)}>
                          <Td modifier="fitContent" dataLabel="Select row">
                            <input
                              type="checkbox"
                              checked={selectedOperators.includes(op.name)}
                              onChange={() => handleSelectOperator(op.name)}
                              aria-label={`Select ${op.name}`}
                            />
                          </Td>
                          <Td dataLabel="Operator">
                            <Flex direction={{ default: "column" }} gap={{ default: "gapXs" }}>
                              <Flex
                                flexWrap={{ default: "flexWrapWrap" }}
                                gap={{ default: "gapSm" }}
                                alignItems={{ default: "alignItemsCenter" }}
                              >
                                <Button
                                  variant="link"
                                  isInline
                                  component={Link}
                                  to={`/ecosystem/installed-operators/${encodeURIComponent(op.name)}`}
                                >
                                  {op.name}
                                </Button>
                                {op.requiredBeforeClusterUpdate ? (
                                  <Label color="orange" isCompact>
                                    Required
                                  </Label>
                                ) : null}
                              </Flex>
                              <Content component="small">
                                <code>{op.namespace}</code>
                              </Content>
                            </Flex>
                          </Td>
                          {visibleColumns.version && (
                            <Td dataLabel="Version">
                              <Flex direction={{ default: "column" }} gap={{ default: "gapXs" }}>
                                <Content component="small">
                                  <code>{op.version}</code>
                                </Content>
                                {op.updateAvailable ? (
                                  <Content component="small">
                                    <Button
                                      variant="link"
                                      isInline
                                      component={Link}
                                      to={`/ecosystem/installed-operators/${encodeURIComponent(op.name)}/update`}
                                      state={{
                                        returnTo: "/ecosystem/installed-operators",
                                        operatorName: op.name,
                                        operatorData: op,
                                      }}
                                    >
                                      Update available: {op.updateAvailable}
                                    </Button>
                                  </Content>
                                ) : null}
                              </Flex>
                            </Td>
                          )}
                          {visibleColumns.clusterCompatibility && (
                            <Td dataLabel="Cluster compatibility">
                              {op.clusterCompatibility === "Compatible" ? (
                                <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
                                  <Icon status="success">
                                    <CheckCircle />
                                  </Icon>
                                  Compatible
                                </Flex>
                              ) : op.clusterCompatibility === "Incompatible" ? (
                                <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
                                  <Icon status="danger">
                                    <AlertCircle />
                                  </Icon>
                                  Incompatible
                                </Flex>
                              ) : (
                                <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
                                  <Icon status="warning">
                                    <AlertTriangle />
                                  </Icon>
                                  Unknown
                                </Flex>
                              )}
                            </Td>
                          )}
                          {visibleColumns.updatePlan && (
                            <Td dataLabel="Update plan">{op.autoUpdate ? "Automatic" : "Manual"}</Td>
                          )}
                          {visibleColumns.support && (
                            <Td dataLabel="Support">
                              <Flex direction={{ default: "column" }} gap={{ default: "gapXs" }}>
                                <Content>{op.supportEndDate || "—"}</Content>
                                {op.supportBadge ? (
                                  <Label
                                    isCompact
                                    variant="outline"
                                    status={
                                      op.supportBadgeType === "danger"
                                        ? "danger"
                                        : op.supportBadgeType === "warning"
                                          ? "warning"
                                          : "success"
                                    }
                                  >
                                    {op.supportBadge}
                                  </Label>
                                ) : null}
                              </Flex>
                            </Td>
                          )}
                          {visibleColumns.status && (
                            <Td dataLabel="Status">
                              {op.status === "Running" ? (
                                <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
                                  <Icon status="success">
                                    <CheckCircle />
                                  </Icon>
                                  Running
                                </Flex>
                              ) : op.status === "Degraded" ? (
                                <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
                                  <Icon status="danger">
                                    <AlertCircle />
                                  </Icon>
                                  Degraded
                                </Flex>
                              ) : (
                                <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
                                  <Icon status="warning">
                                    <Clock />
                                  </Icon>
                                  Pending
                                </Flex>
                              )}
                            </Td>
                          )}
                          {visibleColumns.lastUpdated && (
                            <Td dataLabel="Last updated" modifier="nowrap">
                              {op.lastUpdated || "—"}
                            </Td>
                          )}
                          {visibleColumns.managedNamespaces && (
                            <Td dataLabel="Managed namespaces">
                              <Flex gap={{ default: "gapXs" }} flexWrap={{ default: "flexWrapWrap" }}>
                                {(op.managedNamespaces || []).map((ns, idx) => (
                                  <Label key={idx} isCompact variant="outline" color="grey">
                                    {ns}
                                  </Label>
                                ))}
                              </Flex>
                            </Td>
                          )}
                          <Td dataLabel="Actions" isActionCell hasAction>
                            <Dropdown
                              isOpen={openKebabIndex === i}
                              onOpenChange={(open) => setOpenKebabIndex(open ? i : null)}
                              popperProps={{ position: "right-end" }}
                              toggle={(toggleRef) => (
                                <MenuToggle
                                  ref={toggleRef}
                                  variant="plain"
                                  aria-label={`Actions for ${op.name}`}
                                  icon={<EllipsisVIcon />}
                                  onClick={() =>
                                    setOpenKebabIndex(openKebabIndex === i ? null : i)
                                  }
                                  isExpanded={openKebabIndex === i}
                                />
                              )}
                              onSelect={() => setOpenKebabIndex(null)}
                            >
                              <DropdownItem
                                itemId="view"
                                onClick={() =>
                                  navigate(
                                    `/ecosystem/installed-operators/${encodeURIComponent(op.name)}`
                                  )
                                }
                              >
                                View details
                              </DropdownItem>
                              {typeof op.updateAvailable === "string" && op.updateAvailable.length > 0 ? (
                                <DropdownItem itemId="update" onClick={() => navigateToUpdate(op)}>
                                  Update
                                </DropdownItem>
                              ) : null}
                              <DropdownItem
                                itemId="subscription"
                                onClick={() =>
                                  navigate(
                                    `/ecosystem/installed-operators/${encodeURIComponent(op.name)}/subscription`
                                  )
                                }
                              >
                                Edit subscription
                              </DropdownItem>
                            </Dropdown>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </InnerScrollContainer>
            </CardBody>
          </Card>
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
