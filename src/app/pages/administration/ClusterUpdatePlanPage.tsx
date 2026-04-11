import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate, Link, useLocation } from "react-router";
import { ChevronDown, ChevronRight, ExternalLink, Sparkles, ArrowRight, CheckCircle, AlertTriangle, AlertCircle, HelpCircle, Info, X, Loader2, Shield, Bot, Settings, RotateCcw, Play, Pause, Calendar, Bell, Clock, FileText, User, Zap, Eye, RefreshCw, MoreVertical, Check } from "@/lib/pfIcons";
import Breadcrumbs from "../../components/Breadcrumbs";
import { AiAssessmentSection } from "../../components/AiAssessmentSection";
import { OlsChatbot } from "../../components/OlsChatbot";
import { useClusterUpdateDemoVariant } from "../../contexts/ClusterUpdateDemoContext";

type TabKey = "update-plan" | "active-update-plans" | "update-history";

export type RiskResolution = {
  type: "update-operator" | "wait-for-fix" | "update-z-stream" | "accept-only";
  description: string;
  actionAvailable?: boolean;
};

export type RiskSource = "cincinnati" | "preflight" | "cluster";

export type OperatorIssue = {
  name: string;
  message: string;
  slug: string;
  severity: "critical" | "warning";
  url?: string;
  resolution?: RiskResolution;
  source?: RiskSource;
};

export type VersionEntry = {
  version: string;
  recommended: boolean;
  risk: string;
  riskColor: string;
  features: number;
  bugFixes: number;
  date: string;
  operatorIssues?: OperatorIssue[];
};

export type VersionGroup = {
  label: string;
  versions: VersionEntry[];
};


/* ─── Collapsible Section Wrapper ─── */
function CollapsibleSection({ title, children, defaultExpanded = true }: { title: string; children: React.ReactNode; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <div className="rounded-[16px] border border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] p-[24px] mb-[16px]">
      <button onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-[8px] bg-transparent border-0 cursor-pointer p-0 hover:opacity-80 transition-opacity w-full text-left">
        {expanded ? <ChevronDown className="size-[16px] text-[#151515] dark:text-white" /> : <ChevronRight className="size-[16px] text-[#151515] dark:text-white" />}
        <h2 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[18px]">{title}</h2>
      </button>
      {expanded && <div className="mt-[16px]">{children}</div>}
    </div>
  );
}

/* ─── Channel-specific version data ─── */
export const channelVersions: Record<string, { groups: VersionGroup[]; banner?: { title: string; description: string; link: string } }> = {
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
              { name: "ClusterLoggingMaxVersion", slug: "ClusterLoggingMaxVersion", severity: "critical", message: "openshift-logging/cluster-logging v6.4.3 maximum supported OCP version is 5.0. Update to v6.5+ before upgrading.", url: "https://docs.openshift.com/container-platform/latest/logging/cluster-logging-upgrading.html", resolution: { type: "update-operator", description: "Update cluster-logging operator from v6.4.3 to v6.5.1+.", actionAvailable: true } },
              { name: "CloudCredentialIAMUpdate", slug: "CloudCredentialIAMUpdate", severity: "warning", message: "cloudcredential.operator.openshift.io/cluster object needs updating before upgrade. The IAM configuration created for 5.0 is missing permissions required by 5.1. See Manually Creating IAM.", url: "https://docs.openshift.com/container-platform/latest/authentication/managing_cloud_provider_credentials/about-cloud-credential-operator.html", resolution: { type: "accept-only", description: "No automated fix. Manually update IAM configuration per the linked documentation, then accept this risk." } },
            ],
          },
          { version: "5.1.9", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 2, bugFixes: 8, date: "Mar 16, 2026",
            operatorIssues: [
              { name: "ClusterLoggingMaxVersion", slug: "ClusterLoggingMaxVersion", severity: "critical", message: "openshift-logging/cluster-logging v6.4.3 maximum supported OCP version is 5.0. Update to v6.5+ before upgrading.", url: "https://docs.openshift.com/container-platform/latest/logging/cluster-logging-upgrading.html", resolution: { type: "update-operator", description: "Update cluster-logging operator from v6.4.3 to v6.5.1+.", actionAvailable: true } },
            ],
          },
          { version: "5.1.8", recommended: false, risk: "Medium Risk", riskColor: "#c58c00", features: 3, bugFixes: 15, date: "Mar 8, 2026",
            operatorIssues: [
              { name: "ClusterLoggingMaxVersion", slug: "ClusterLoggingMaxVersion", severity: "critical", message: "openshift-logging/cluster-logging v6.4.3 maximum supported OCP version is 5.0. Update to v6.5+ before upgrading.", url: "https://docs.openshift.com/container-platform/latest/logging/cluster-logging-upgrading.html", resolution: { type: "update-operator", description: "Update cluster-logging operator from v6.4.3 to v6.5.1+.", actionAvailable: true } },
              { name: "OLMIncompatible", slug: "OLMIncompatible", severity: "critical", message: "Incompatible operator-lifecycle-manager version detected. OLM 4.21.0 does not support 5.1 workload APIs. Update to 4.22.0 or higher.", url: "https://docs.openshift.com/container-platform/latest/operators/admin/olm-upgrading-operators.html", resolution: { type: "update-operator", description: "Update OLM from v4.21.0 to v4.22.0+.", actionAvailable: true } },
              { name: "CloudCredentialIAMUpdate", slug: "CloudCredentialIAMUpdate", severity: "warning", message: "cloudcredential.operator.openshift.io/cluster object needs updating before upgrade. See Manually Creating IAM.", resolution: { type: "accept-only", description: "No automated fix. Manually update IAM configuration per documentation, then accept this risk." } },
            ],
          },
          { version: "5.1.7", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 1, bugFixes: 6, date: "Feb 28, 2026",
            operatorIssues: [
              { name: "ClusterLoggingMaxVersion", slug: "ClusterLoggingMaxVersion", severity: "critical", message: "openshift-logging/cluster-logging v6.4.3 maximum supported OCP version is 5.0. Update to v6.5+ before upgrading.", url: "https://docs.openshift.com/container-platform/latest/logging/cluster-logging-upgrading.html", resolution: { type: "update-operator", description: "Update cluster-logging operator from v6.4.3 to v6.5.1+.", actionAvailable: true } },
            ],
          },
          { version: "5.1.6", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 2, bugFixes: 9, date: "Feb 18, 2026",
            operatorIssues: [
              { name: "ClusterLoggingMaxVersion", slug: "ClusterLoggingMaxVersion", severity: "critical", message: "openshift-logging/cluster-logging v6.4.3 maximum supported OCP version is 5.0. Update to v6.5+ before upgrading.", url: "https://docs.openshift.com/container-platform/latest/logging/cluster-logging-upgrading.html", resolution: { type: "update-operator", description: "Update cluster-logging operator from v6.4.3 to v6.5.1+.", actionAvailable: true } },
            ],
          },
          { version: "5.1.5", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 1, bugFixes: 4, date: "Feb 8, 2026",
            operatorIssues: [
              { name: "ClusterLoggingMaxVersion", slug: "ClusterLoggingMaxVersion", severity: "critical", message: "openshift-logging/cluster-logging v6.4.3 maximum supported OCP version is 5.0. Update to v6.5+ before upgrading.", url: "https://docs.openshift.com/container-platform/latest/logging/cluster-logging-upgrading.html", resolution: { type: "update-operator", description: "Update cluster-logging operator from v6.4.3 to v6.5.1+.", actionAvailable: true } },
            ],
          },
          { version: "5.1.4", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 0, bugFixes: 5, date: "Jan 28, 2026",
            operatorIssues: [
              { name: "ClusterLoggingMaxVersion", slug: "ClusterLoggingMaxVersion", severity: "critical", message: "openshift-logging/cluster-logging v6.4.3 maximum supported OCP version is 5.0. Update to v6.5+ before upgrading.", url: "https://docs.openshift.com/container-platform/latest/logging/cluster-logging-upgrading.html", resolution: { type: "update-operator", description: "Update cluster-logging operator from v6.4.3 to v6.5.1+.", actionAvailable: true } },
            ],
          },
          { version: "5.1.3", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 0, bugFixes: 3, date: "Jan 18, 2026",
            operatorIssues: [
              { name: "ClusterLoggingMaxVersion", slug: "ClusterLoggingMaxVersion", severity: "critical", message: "openshift-logging/cluster-logging v6.4.3 maximum supported OCP version is 5.0. Update to v6.5+ before upgrading.", url: "https://docs.openshift.com/container-platform/latest/logging/cluster-logging-upgrading.html", resolution: { type: "update-operator", description: "Update cluster-logging operator from v6.4.3 to v6.5.1+.", actionAvailable: true } },
            ],
          },
        ],
      },
      {
        label: "5.0",
        versions: [
          { version: "5.0.8", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 0, bugFixes: 6, date: "Mar 18, 2026" },
          { version: "5.0.7", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 0, bugFixes: 4, date: "Mar 10, 2026" },
          { version: "5.0.5", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 0, bugFixes: 5, date: "Feb 14, 2026" },
          { version: "5.0.4", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 0, bugFixes: 3, date: "Jan 28, 2026" },
          { version: "5.0.3", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 0, bugFixes: 7, date: "Jan 14, 2026" },
          { version: "5.0.2", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 0, bugFixes: 2, date: "Dec 20, 2025" },
          { version: "5.0.1", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 0, bugFixes: 4, date: "Dec 5, 2025" },
        ],
      },
      {
        label: "4.18",
        versions: [
          { version: "4.18.12", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 0, bugFixes: 3, date: "Nov 20, 2025" },
          { version: "4.18.10", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 0, bugFixes: 5, date: "Nov 5, 2025" },
          { version: "4.18.8", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 0, bugFixes: 4, date: "Oct 22, 2025" },
          { version: "4.18.6", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 0, bugFixes: 6, date: "Oct 8, 2025" },
        ],
      },
    ],
  },
  "stable-5.1": {
    banner: { title: "OpenShift 5.1 is available!", description: "Stable channel releases are production-ready and fully tested.", link: "See what's new in 5.1" },
    groups: [
      { label: "5.1", versions: [
          { version: "5.1.9", recommended: true, risk: "Low Risk", riskColor: "#3e8635", features: 2, bugFixes: 8, date: "Mar 16, 2026", operatorIssues: [{ name: "cluster-logging", slug: "cluster-logging-6.4.3-max-ocp-5.0", severity: "critical" as const, message: "openshift-logging/cluster-logging v6.4.3 maximum supported OCP version is 5.0. Update to v6.5+ before upgrading.", url: "https://docs.openshift.com/container-platform/latest/logging/cluster-logging-upgrading.html" }] },
          { version: "5.1.7", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 1, bugFixes: 10, date: "Feb 28, 2026", operatorIssues: [{ name: "cluster-logging", slug: "cluster-logging-6.4.3-max-ocp-5.0", severity: "critical" as const, message: "openshift-logging/cluster-logging v6.4.3 maximum supported OCP version is 5.0. Update to v6.5+ before upgrading.", url: "https://docs.openshift.com/container-platform/latest/logging/cluster-logging-upgrading.html" }] },
        ] },
      { label: "5.0", versions: [
          { version: "5.0.8", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 0, bugFixes: 6, date: "Mar 18, 2026" },
          { version: "5.0.6", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 0, bugFixes: 3, date: "Feb 20, 2026" },
          { version: "5.0.4", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 0, bugFixes: 3, date: "Jan 28, 2026" },
          { version: "5.0.2", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 0, bugFixes: 2, date: "Dec 20, 2025" },
        ] },
      { label: "4.18", versions: [
          { version: "4.18.12", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 0, bugFixes: 3, date: "Nov 20, 2025" },
          { version: "4.18.10", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 0, bugFixes: 5, date: "Nov 5, 2025" },
          { version: "4.18.8", recommended: false, risk: "Low Risk", riskColor: "#3e8635", features: 0, bugFixes: 4, date: "Oct 22, 2025" },
        ] },
    ],
  },
  "candidate-5.1": {
    groups: [{ label: "5.1", versions: [
          { version: "5.1.11-rc.2", recommended: false, risk: "High Risk", riskColor: "#c9190b", features: 6, bugFixes: 3, date: "Mar 28, 2026", operatorIssues: [{ name: "cluster-logging", slug: "cluster-logging-6.4.3-max-ocp-5.0", severity: "critical" as const, message: "openshift-logging/cluster-logging v6.4.3 maximum supported OCP version is 5.0. Update to v6.5+ before upgrading.", url: "https://docs.openshift.com/container-platform/latest/logging/cluster-logging-upgrading.html" }, { name: "operator-lifecycle-manager", slug: "olm-candidate-compat", severity: "warning" as const, message: "Candidate channel versions may have incompatible operator dependencies. Review release notes carefully.", url: "https://docs.openshift.com/container-platform/latest/updating/understanding_updates/understanding-update-channels-releases.html" }] },
          { version: "5.1.11-rc.1", recommended: false, risk: "High Risk", riskColor: "#c9190b", features: 5, bugFixes: 2, date: "Mar 25, 2026", operatorIssues: [{ name: "cluster-logging", slug: "cluster-logging-6.4.3-max-ocp-5.0", severity: "critical" as const, message: "openshift-logging/cluster-logging v6.4.3 maximum supported OCP version is 5.0. Update to v6.5+ before upgrading.", url: "https://docs.openshift.com/container-platform/latest/logging/cluster-logging-upgrading.html" }] },
          { version: "5.1.10", recommended: true, risk: "Low Risk", riskColor: "#3e8635", features: 4, bugFixes: 12, date: "Mar 22, 2026", operatorIssues: [{ name: "cluster-logging", slug: "cluster-logging-6.4.3-max-ocp-5.0", severity: "critical" as const, message: "openshift-logging/cluster-logging v6.4.3 maximum supported OCP version is 5.0. Update to v6.5+ before upgrading.", url: "https://docs.openshift.com/container-platform/latest/logging/cluster-logging-upgrading.html" }] },
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
  /** OLM v1 extension required before cluster update (matches Installed Operators catalog). */
  requiredBeforeClusterUpdate?: boolean;
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

function getOperatorCompatibility(op: InstalledOperator, targetVersion: string): { compatibility: "Compatible" | "Incompatible" | "Unknown"; message?: string } {
  if (op.status === "Degraded") return { compatibility: "Unknown", message: op.compatibilityMessage || "Operator is degraded. Compatibility cannot be determined until the operator is healthy." };
  if (!op.maxOcpVersion) return { compatibility: "Compatible" };
  const targetMajorMinor = targetVersion.split(".").slice(0, 2).join(".");
  if (compareVersions(op.maxOcpVersion, targetMajorMinor) < 0) {
    return { compatibility: "Incompatible", message: `Max supported OCP version is ${op.maxOcpVersion}. ${op.updateAvailable ? `Update to v${op.updateAvailable}+ before upgrading cluster.` : "Update operator before upgrading cluster."}` };
  }
  return { compatibility: "Compatible" };
}

const installedOperators: InstalledOperator[] = [
  { name: "Cluster Logging", namespace: "openshift-logging", version: "6.4.3", channel: "stable-6.4", source: "redhat-operators", status: "Running", autoUpdate: false, clusterCompatibility: "Incompatible", compatibilityMessage: "Max supported OCP version is 5.0. Update to v6.5+ before upgrading cluster.", support: "Full", supportEndDate: "Nov 13, 2025", supportBadge: "End of life", supportBadgeType: "danger", updateAvailable: "6.5.1", maxOcpVersion: "5.0", lastUpdated: "Jan 8, 2026, 3:12 PM", managedNamespaces: ["openshift-logging"], requiredBeforeClusterUpdate: true },
  { name: "Elasticsearch Operator", namespace: "openshift-operators-redhat", version: "5.7.2", channel: "stable-5.7", source: "redhat-operators", status: "Running", autoUpdate: false, clusterCompatibility: "Compatible", support: "Full", supportEndDate: "May 10, 2028", supportBadge: "2 years, 1 month", supportBadgeType: "success", maxOcpVersion: "5.1", lastUpdated: "Feb 12, 2026, 4:32 AM", managedNamespaces: ["openshift-operators-redhat", "openshift-logging"], requiredBeforeClusterUpdate: true },
  { name: "Cloud Credential Operator", namespace: "openshift-cloud-credential-operator", version: "5.0.0", channel: "stable", source: "Built-in", status: "Running", autoUpdate: true, clusterCompatibility: "Compatible", compatibilityMessage: "IAM configuration may need updating before cluster upgrade.", support: "Full", supportEndDate: "Jun 15, 2028", supportBadge: "2 years, 2 months", supportBadgeType: "success", maxOcpVersion: "5.2", lastUpdated: "Mar 1, 2026, 3:48 AM", managedNamespaces: ["openshift-cloud-credential-operator"] },
  { name: "Operator Lifecycle Manager", namespace: "openshift-operator-lifecycle-manager", version: "4.21.0", channel: "stable", source: "Built-in", status: "Running", autoUpdate: false, clusterCompatibility: "Incompatible", compatibilityMessage: "Incompatible with OCP 5.1. Update to 4.22.0 or higher.", support: "Full", supportEndDate: "Mar 20, 2027", supportBadge: "11 months", supportBadgeType: "warning", updateAvailable: "4.22.0", maxOcpVersion: "5.0", lastUpdated: "Mar 1, 2026, 3:48 AM", managedNamespaces: ["openshift-operator-lifecycle-manager", "openshift-marketplace"] },
  { name: "Cert Manager", namespace: "cert-manager-operator", version: "1.14.0", channel: "stable-v1", source: "redhat-operators", status: "Running", autoUpdate: true, clusterCompatibility: "Compatible", support: "Full", supportEndDate: "Sep 1, 2027", supportBadge: "1 year, 5 months", supportBadgeType: "success", maxOcpVersion: "5.2", lastUpdated: "Mar 18, 2026, 2:05 AM", managedNamespaces: ["cert-manager", "cert-manager-operator"] },
  { name: "OpenShift DNS", namespace: "openshift-dns-operator", version: "5.0.0", channel: "stable", source: "Built-in", status: "Running", autoUpdate: true, clusterCompatibility: "Compatible", support: "Full", supportEndDate: "Jun 15, 2028", supportBadge: "2 years, 2 months", supportBadgeType: "success", maxOcpVersion: "5.2", lastUpdated: "Mar 1, 2026, 3:48 AM", managedNamespaces: ["openshift-dns", "openshift-dns-operator"] },
  { name: "Ingress Operator", namespace: "openshift-ingress-operator", version: "5.0.0", channel: "stable", source: "Built-in", status: "Running", autoUpdate: true, clusterCompatibility: "Compatible", support: "Full", supportEndDate: "Jun 15, 2028", supportBadge: "2 years, 2 months", supportBadgeType: "success", maxOcpVersion: "5.2", lastUpdated: "Mar 1, 2026, 3:48 AM", managedNamespaces: ["openshift-ingress", "openshift-ingress-operator"] },
  { name: "Machine Config Operator", namespace: "openshift-machine-config-operator", version: "5.0.0", channel: "stable", source: "Built-in", status: "Running", autoUpdate: true, clusterCompatibility: "Compatible", support: "Full", supportEndDate: "Jun 15, 2028", supportBadge: "2 years, 2 months", supportBadgeType: "success", maxOcpVersion: "5.2", lastUpdated: "Mar 1, 2026, 3:48 AM", managedNamespaces: ["openshift-machine-config-operator"] },
  { name: "Monitoring Stack", namespace: "openshift-monitoring", version: "5.0.0", channel: "stable", source: "Built-in", status: "Running", autoUpdate: true, clusterCompatibility: "Compatible", support: "Full", supportEndDate: "Jun 15, 2028", supportBadge: "2 years, 2 months", supportBadgeType: "success", maxOcpVersion: "5.2", lastUpdated: "Mar 1, 2026, 3:48 AM", managedNamespaces: ["openshift-monitoring", "openshift-user-workload-monitoring"] },
  { name: "Service Mesh", namespace: "openshift-operators", version: "2.5.1", channel: "stable", source: "redhat-operators", status: "Degraded", autoUpdate: false, clusterCompatibility: "Unknown", compatibilityMessage: "Operator is degraded. Compatibility cannot be determined until the operator is healthy.", support: "Limited", supportEndDate: "Dec 1, 2026", supportBadge: "8 months", supportBadgeType: "warning", updateAvailable: "2.6.0", lastUpdated: "Nov 5, 2025, 10:22 AM", managedNamespaces: ["istio-system", "openshift-operators"] },
  { name: "Web Terminal", namespace: "openshift-operators", version: "1.9.0", channel: "fast", source: "redhat-operators", status: "Running", autoUpdate: true, clusterCompatibility: "Compatible", support: "Community", supportEndDate: "Apr 30, 2028", supportBadge: "2 years", supportBadgeType: "success", maxOcpVersion: "5.2", lastUpdated: "Mar 22, 2026, 6:00 AM", managedNamespaces: ["openshift-terminal"] },
  { name: "Kiali Operator", namespace: "openshift-operators", version: "1.73.0", channel: "stable", source: "redhat-operators", status: "Running", autoUpdate: false, clusterCompatibility: "Compatible", support: "Full", supportEndDate: "Jan 15, 2028", supportBadge: "1 year, 9 months", supportBadgeType: "success", updateAvailable: "1.76.0", maxOcpVersion: "5.1", lastUpdated: "Dec 20, 2025, 9:15 AM", managedNamespaces: ["kiali-operator", "istio-system"] },
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
  preCheck: { passed: number; failed: number; total: number };
  compatSummary?: string;
};

const updateHistory: UpdateHistoryEntry[] = [
  { version: "5.0.0", status: "Completed", method: "Agent", decision: "Approved", initiatedBy: "admin@example.com", startedAt: "Mar 1, 2026 02:00 UTC", completedAt: "Mar 1, 2026 03:48 UTC", duration: "1h 48m", preCheck: { passed: 6, failed: 0, total: 6 }, compatSummary: "All operators compatible. No API deprecations detected." },
  { version: "4.18.6", status: "Completed", method: "Agent", decision: "Auto-approved", initiatedBy: "cluster-update-agent", startedAt: "Feb 12, 2026 03:00 UTC", completedAt: "Feb 12, 2026 04:32 UTC", duration: "1h 32m", preCheck: { passed: 6, failed: 0, total: 6 }, compatSummary: "Z-stream update — all checks passed automatically." },
  { version: "4.18.4", status: "Completed", method: "Manual", decision: "N/A", initiatedBy: "admin@example.com", startedAt: "Jan 22, 2026 02:00 UTC", completedAt: "Jan 22, 2026 03:15 UTC", duration: "1h 15m", preCheck: { passed: 5, failed: 1, total: 6 }, compatSummary: "cluster-logging operator warning (non-blocking)." },
  { version: "4.18.2", status: "Completed", method: "Manual", decision: "N/A", initiatedBy: "devops-team@example.com", startedAt: "Dec 15, 2025 03:00 UTC", completedAt: "Dec 15, 2025 04:22 UTC", duration: "1h 22m", preCheck: { passed: 6, failed: 0, total: 6 } },
  { version: "4.17.9", status: "Failed", method: "Agent", decision: "Auto-approved", initiatedBy: "cluster-update-agent", startedAt: "Nov 28, 2025 02:00 UTC", completedAt: "Nov 28, 2025 02:45 UTC", duration: "45m", preCheck: { passed: 4, failed: 2, total: 6 }, compatSummary: "Operator compatibility check failed. Automatic rollback triggered." },
  { version: "4.17.8", status: "Rejected", method: "Agent", decision: "Rejected", initiatedBy: "admin@example.com", startedAt: "Nov 20, 2025 02:00 UTC", completedAt: "Nov 20, 2025 02:02 UTC", duration: "2m", preCheck: { passed: 3, failed: 3, total: 6 }, compatSummary: "Multiple operator incompatibilities. 2 deprecated APIs in use. Admin rejected update plan." },
];


export default function ClusterUpdatePlanPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem("clusterUpdateInProgress");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        navigate("/administration/cluster-update/in-progress", { state: { version: data.version }, replace: true });
      } catch { /* ignore */ }
    }
  }, [navigate]);

  const [selectedChannel, setSelectedChannel] = useState("fast-5.1");
  const [activeTab, setActiveTab] = useState<TabKey>("update-plan");
  const [selectedVersion, setSelectedVersion] = useState<string>("5.1.10");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ "5.1": true });
  
  const { demoVariant } = useClusterUpdateDemoVariant();
  const [updateMode, setUpdateMode] = useState<"manual" | "agent">(
    () => (demoVariant === "agent-only" ? "agent" : "manual")
  );
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatbotContext, setChatbotContext] = useState("");

  const [operators, setOperators] = useState<InstalledOperator[]>(() => [...installedOperators]);

  useEffect(() => {
    if (location.state?.updatedOperator) {
      const { updatedOperator, newVersion } = location.state as { updatedOperator: string; newVersion: string };
      setOperators(prev => prev.map(op => {
        if (op.name === updatedOperator && op.updateAvailable) {
          const oldMajorMinor = op.version.split(".").slice(0, 2).join(".");
          const newMajorMinor = (newVersion || op.updateAvailable).split(".").slice(0, 2).join(".");
          const updatedChannel = op.channel.includes(oldMajorMinor)
            ? op.channel.replace(oldMajorMinor, newMajorMinor)
            : op.channel;
          return {
            ...op,
            version: newVersion || op.updateAvailable,
            channel: updatedChannel,
            updateAvailable: undefined,
            maxOcpVersion: "5.2",
          };
        }
        return op;
      }));
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const tab = (location.state as { tab?: TabKey } | null)?.tab;
    if (tab === "update-plan" || tab === "update-history" || tab === "active-update-plans") {
      setActiveTab(tab);
    }
  }, [location.state]);

  const channelData = channelVersions[selectedChannel] ?? channelVersions["fast-5.1"];

  const handleChannelChange = (channel: string) => {
    setSelectedChannel(channel);
    const data = channelVersions[channel];
    if (data) {
      const firstGroup = data.groups[0];
      const newExpanded: Record<string, boolean> = {};
      for (const g of data.groups) {
        newExpanded[g.label] = !!firstGroup && g.label === firstGroup.label;
      }
      if (firstGroup) {
        const rec = firstGroup.versions.find((v) => v.recommended);
        setSelectedVersion(rec ? rec.version : firstGroup.versions[0]?.version ?? "");
      }
      setExpandedGroups(newExpanded);
    }
  };

  useEffect(() => {
    setUpdateMode(demoVariant === "agent-only" ? "agent" : "manual");
  }, [demoVariant]);

  const openChatbot = useCallback((context: string) => {
    setChatbotContext(context);
    setChatbotOpen(true);
  }, []);


  const handleChatAction = useCallback((actionId: string) => {
    switch (actionId) {
      case "view-history":
        setActiveTab("update-history");
        break;
      case "view-plan":
        setActiveTab("update-plan");
        break;
      default:
        break;
    }
  }, []);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "update-plan", label: "Update plan" },
    { key: "active-update-plans", label: "Active update plans" },
    { key: "update-history", label: "Update history" },
  ];

  return (
    <div className="flex h-full relative min-w-0">
      <OlsChatbot
        isOpen={chatbotOpen}
        context={chatbotContext}
        selectedVersion={selectedVersion}
        selectedChannel={selectedChannel}
        onClose={() => setChatbotOpen(false)}
        onAction={handleChatAction}
      >
      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden p-[24px] pb-[48px]">
      <Breadcrumbs items={[
        { label: "Administration", path: "/administration/cluster-update" },
        { label: "Cluster Update" },
      ]} />

      <h1 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[28px] mb-[12px]">
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
          <AiAssessmentSection
            openChatbot={openChatbot}
            selectedVersion={selectedVersion}
            clusterUpdateDemoVariant={demoVariant}
          />

          {/* Update Method — hidden in agent-only demo variant */}
          {demoVariant === "manual-and-agent" && (
            <CollapsibleSection title="Update Method" defaultExpanded>
              <p className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[16px]">
                Choose how cluster updates are managed.
              </p>
              <div className="grid grid-cols-2 gap-[12px]">
                <button
                  type="button"
                  onClick={() => setUpdateMode("manual")}
                  className={`flex items-start gap-[12px] p-[16px] rounded-[12px] border-2 text-left cursor-pointer transition-all bg-transparent ${
                    updateMode === "manual"
                      ? "border-[#0066cc] dark:border-[#4dabf7] bg-[rgba(0,102,204,0.03)] dark:bg-[rgba(77,171,247,0.05)]"
                      : "border-[#d2d2d2] dark:border-[rgba(255,255,255,0.15)] hover:border-[#8a8d90]"
                  }`}
                >
                  <div
                    className={`mt-[2px] size-[36px] rounded-[8px] flex items-center justify-center shrink-0 ${
                      updateMode === "manual" ? "bg-[#0066cc] text-white" : "bg-[#f0f0f0] dark:bg-[rgba(255,255,255,0.08)] text-[#6a6e73]"
                    }`}
                  >
                    <Settings className="size-[18px]" />
                  </div>
                  <div>
                    <p
                      className={`text-[14px] font-semibold font-['Red_Hat_Text:Regular',sans-serif] mb-[4px] ${updateMode === "manual" ? "text-[#0066cc] dark:text-[#4dabf7]" : "text-[#151515] dark:text-white"}`}
                    >
                      Manual
                    </p>
                    <p className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">
                      Review available updates, assess risks, and initiate updates yourself. Full control over timing and version selection.
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setUpdateMode("agent")}
                  className={`flex items-start gap-[12px] p-[16px] rounded-[12px] border-2 text-left cursor-pointer transition-all bg-transparent ${
                    updateMode === "agent"
                      ? "border-[#6753ac] dark:border-[#b2a3e0] bg-[rgba(103,83,172,0.03)] dark:bg-[rgba(178,163,224,0.05)]"
                      : "border-[#d2d2d2] dark:border-[rgba(255,255,255,0.15)] hover:border-[#8a8d90]"
                  }`}
                >
                  <div
                    className={`mt-[2px] size-[36px] rounded-[8px] flex items-center justify-center shrink-0 ${
                      updateMode === "agent" ? "bg-[#6753ac] text-white" : "bg-[#f0f0f0] dark:bg-[rgba(255,255,255,0.08)] text-[#6a6e73]"
                    }`}
                  >
                    <Bot className="size-[18px]" />
                  </div>
                  <div>
                    <p
                      className={`text-[14px] font-semibold font-['Red_Hat_Text:Regular',sans-serif] mb-[4px] ${updateMode === "agent" ? "text-[#6753ac] dark:text-[#b2a3e0]" : "text-[#151515] dark:text-white"}`}
                    >
                      Agent-based
                    </p>
                    <p className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">
                      An AI agent handles pre-flight checks, scheduling, coordinated platform and catalog operator updates, and rollback
                      automatically. Pre-checks and status span both layers holistically. You approve plans before execution.
                    </p>
                  </div>
                </button>
              </div>
            </CollapsibleSection>
          )}

          {demoVariant === "manual-and-agent" && updateMode === "manual" ? (
            <>
              <AvailableUpdatesSection
                channelData={channelData}
                expandedGroups={expandedGroups}
                setExpandedGroups={setExpandedGroups}
                selectedVersion={selectedVersion}
                setSelectedVersion={setSelectedVersion}
                navigate={navigate}
                setActiveTab={setActiveTab}
                openChatbot={openChatbot}
                selectedChannel={selectedChannel}
                handleChannelChange={handleChannelChange}
              />

              <InstalledOperatorsSection selectedVersion={selectedVersion} operators={operators} navigate={navigate} />

              <WorkerNodesSection />
            </>
          ) : (
            <UpdateAgentTab
              openChatbot={openChatbot}
              selectedVersion={selectedVersion}
              onSelectedVersionChange={setSelectedVersion}
              selectedChannel={selectedChannel}
              channelGroups={channelData.groups}
            />
          )}
        </>
      )}

      {activeTab === "active-update-plans" && <ActiveUpdatePlansTab />}

      {activeTab === "update-history" && <UpdateHistoryTab />}

      </div>
      </OlsChatbot>

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
  const [agentStatus, setAgentStatus] = useState<"idle" | "active" | "paused" | "updating" | "completed" | "failed" | "rolling-back">("idle");
  const [configTab, setConfigTab] = useState<"actions" | "compliance" | "scheduling" | "notifications">("actions");

  const [autoPreCheck, setAutoPreCheck] = useState(true);
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
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [showRollbackModal, setShowRollbackModal] = useState(false);

  const updateNodes = [
    { name: "master-0", role: "control-plane", status: "done" as const },
    { name: "master-1", role: "control-plane", status: "done" as const },
    { name: "master-2", role: "control-plane", status: "in-progress" as const },
    { name: "worker-0", role: "worker", status: "pending" as const },
    { name: "worker-1", role: "worker", status: "pending" as const },
    { name: "worker-2", role: "worker", status: "pending" as const },
  ];

  const updateOperators = [
    { name: "Cluster Logging", from: "6.4.3", to: "6.5.1", status: "done" as const },
    { name: "Elasticsearch Operator", from: "5.7.2", to: "5.8.0", status: "in-progress" as const },
    { name: "Operator Lifecycle Manager", from: "4.21.0", to: "4.22.0", status: "pending" as const },
  ];

  const postUpdateChecks = [
    { label: "API server responding", status: "pass" as const },
    { label: "All nodes Ready", status: "pass" as const },
    { label: "Cluster operators available", status: "pass" as const },
    { label: "No degraded operators", status: "pass" as const },
    { label: "Ingress healthy", status: "pass" as const },
    { label: "Workloads stable", status: "pass" as const },
  ];

  useEffect(() => {
    if (agentStatus === "updating" || agentStatus === "rolling-back") {
      const timer = setInterval(() => {
        setUpdateProgress((prev) => {
          if (prev >= 100) { clearInterval(timer); return 100; }
          return prev + 1;
        });
      }, 300);
      return () => clearInterval(timer);
    }
  }, [agentStatus]);

  const startUpdate = () => {
    localStorage.setItem("clusterUpdateInProgress", JSON.stringify({ version: "5.1.10", startedAt: Date.now() }));
    navigate("/administration/cluster-update/in-progress", { state: { version: "5.1.10" } });
  };

  const simulateComplete = () => {
    setAgentStatus("completed");
    openChatbot("update-completed");
  };

  const simulateFailure = () => {
    setAgentStatus("failed");
    openChatbot("update-failed");
  };

  const startRollback = () => {
    setShowRollbackModal(false);
    setAgentStatus("rolling-back");
    setUpdateProgress(0);
    openChatbot("update-rollback");
  };

  const agentPreChecks = [
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
            <div className={`size-[10px] rounded-full ${
              agentStatus === "active" || agentStatus === "updating" ? "bg-[#3e8635] animate-pulse" :
              agentStatus === "paused" ? "bg-[#c58c00]" :
              agentStatus === "completed" ? "bg-[#3e8635]" :
              agentStatus === "failed" ? "bg-[#c9190b]" :
              agentStatus === "rolling-back" ? "bg-[#c58c00] animate-pulse" :
              "bg-[#8a8d90]"
            }`} />
            <Bot className="size-[20px] text-[#6753ac]" />
            <span className="text-[15px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white">
              {agentStatus === "active" ? "Update Agent Active" :
               agentStatus === "paused" ? "Update Agent Paused" :
               agentStatus === "updating" ? "Updating Cluster" :
               agentStatus === "completed" ? "Update Complete" :
               agentStatus === "failed" ? "Update Failed" :
               agentStatus === "rolling-back" ? "Rolling Back" :
               "Update Agent Ready"}
            </span>
            {(agentStatus === "active" || agentStatus === "updating") && (
              <span className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">
                Target: <span className="font-['Red_Hat_Mono:Regular',sans-serif] text-[#151515] dark:text-white">5.1.10</span>
                {agentStatus === "updating" && <> &middot; <span className="font-['Red_Hat_Mono:Regular',sans-serif] text-[#151515] dark:text-white">{updateProgress}%</span></>}
              </span>
            )}
          </div>
          <div className="flex items-center gap-[8px]">
            {agentStatus === "idle" && (
              <>
                <button onClick={() => openChatbot("agent-precheck")}
                  className="flex items-center gap-[6px] bg-transparent text-[#0066cc] dark:text-[#4dabf7] text-[13px] px-[12px] py-[6px] rounded-[999px] border border-[#0066cc] dark:border-[#4dabf7] cursor-pointer hover:bg-[#0066cc]/5 transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
                  Update pre-check with AI <Sparkles className="size-[13px]" />
                </button>
                <button onClick={() => { setAgentStatus("active"); openChatbot("agent-start"); }} className="flex items-center gap-[6px] bg-[#0066cc] hover:bg-[#004080] text-white text-[13px] px-[14px] py-[6px] rounded-[999px] border-0 cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
                  Start update with AI <Sparkles className="size-[13px]" />
                </button>
              </>
            )}
            {agentStatus === "active" && (
              <>
                <button onClick={() => setShowPauseModal(true)} className="flex items-center gap-[6px] bg-transparent text-[#151515] dark:text-white text-[13px] px-[14px] py-[6px] rounded-[999px] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] cursor-pointer hover:bg-[rgba(0,0,0,0.03)] transition-colors font-['Red_Hat_Text:Regular',sans-serif]">
                  <Pause className="size-[13px]" /> Pause agent
                </button>
                <button onClick={() => setShowCancelModal(true)} className="flex items-center gap-[6px] bg-transparent text-[#151515] dark:text-white text-[13px] px-[14px] py-[6px] rounded-[999px] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] cursor-pointer hover:bg-[rgba(0,0,0,0.03)] transition-colors font-['Red_Hat_Text:Regular',sans-serif]">
                  Cancel update
                </button>
              </>
            )}
            {agentStatus === "paused" && (
              <>
                <button onClick={() => { setAgentStatus("active"); openChatbot("agent-resumed"); }} className="flex items-center gap-[6px] bg-[#0066cc] hover:bg-[#004080] text-white text-[13px] px-[14px] py-[6px] rounded-[999px] border-0 cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
                  <Play className="size-[13px]" /> Resume agent
                </button>
                <button onClick={() => setShowCancelModal(true)} className="flex items-center gap-[6px] bg-transparent text-[#151515] dark:text-white text-[13px] px-[14px] py-[6px] rounded-[999px] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] cursor-pointer hover:bg-[rgba(0,0,0,0.03)] transition-colors font-['Red_Hat_Text:Regular',sans-serif]">
                  Cancel update
                </button>
              </>
            )}
            {agentStatus === "updating" && (
              <span className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] flex items-center gap-[6px]">
                <Loader2 className="size-[14px] animate-spin text-[#0066cc]" /> Update in progress&hellip;
              </span>
            )}
            {agentStatus === "completed" && (
              <button onClick={() => { setAgentStatus("idle"); setPlanDecision("pending"); }} className="flex items-center gap-[6px] bg-[#0066cc] hover:bg-[#004080] text-white text-[13px] px-[14px] py-[6px] rounded-[999px] border-0 cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
                Done
              </button>
            )}
            {agentStatus === "failed" && (
              <>
                <button onClick={() => setShowRollbackModal(true)} className="flex items-center gap-[6px] bg-transparent text-[#151515] dark:text-white text-[13px] px-[14px] py-[6px] rounded-[999px] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] cursor-pointer hover:bg-[rgba(0,0,0,0.03)] transition-colors font-['Red_Hat_Text:Regular',sans-serif]">
                  <RotateCcw className="size-[13px]" /> Rollback
                </button>
                <button onClick={() => { setAgentStatus("updating"); setUpdateProgress(0); openChatbot("update-retry"); }} className="flex items-center gap-[6px] bg-[#0066cc] hover:bg-[#004080] text-white text-[13px] px-[14px] py-[6px] rounded-[999px] border-0 cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
                  <RefreshCw className="size-[13px]" /> Retry update
                </button>
              </>
            )}
            {agentStatus === "rolling-back" && (
              <span className="text-[12px] text-[#c58c00] font-['Red_Hat_Text:Regular',sans-serif] flex items-center gap-[6px]">
                <Loader2 className="size-[14px] animate-spin" /> Rolling back to 5.0.0&hellip;
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Agent Configuration — Tabbed */}
      <div className="rounded-[16px] border border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] p-[24px] mb-[16px]">
        <div className="flex items-center justify-between mb-[4px]">
          <h2 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[18px]">Agent Configuration</h2>
          <button onClick={() => openChatbot("agent-config")}
            className="flex items-center gap-[6px] bg-transparent text-[#0066cc] dark:text-[#4dabf7] text-[12px] px-[10px] py-[5px] rounded-[999px] border border-[#0066cc] dark:border-[#4dabf7] cursor-pointer hover:bg-[#0066cc]/5 transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
            AI setup assistant <Sparkles className="size-[12px]" />
          </button>
        </div>

        <div className="flex border-b border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] mb-[16px]">
          {configTabs.map((t) => (
            <button key={t.key} onClick={() => setConfigTab(t.key)}
              className={`flex items-center gap-[6px] px-[16px] py-[10px] text-[13px] font-['Red_Hat_Text:Regular',sans-serif] border-0 bg-transparent cursor-pointer transition-colors relative ${configTab === t.key ? "text-[#151515] dark:text-white font-medium" : "text-[#4d4d4d] dark:text-[#b0b0b0] hover:text-[#151515] dark:hover:text-white"}`}>
              <t.icon className="size-[14px]" />
              {t.label}
              {configTab === t.key && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0066cc] dark:bg-[#4dabf7]" />}
            </button>
          ))}
        </div>

        <div>
          {/* Automatic Actions */}
          {configTab === "actions" && (
            <div className="space-y-[12px]">
              <div className="flex items-center justify-between bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] rounded-[8px] px-[16px] py-[12px]">
                <div>
                  <p className="text-[14px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] font-medium">Automatic pre-checks</p>
                  <p className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">Run all health and compatibility checks before each update attempt</p>
                </div>
                <Toggle enabled={autoPreCheck} onChange={() => setAutoPreCheck(!autoPreCheck)} />
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
                    <select value={windowDay} onChange={(e) => setWindowDay(e.target.value)} className="w-full bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] rounded-[999px] px-[10px] py-[7px] text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] cursor-pointer">
                      <option value="weekdays">Weekdays</option>
                      <option value="weekends">Weekends</option>
                      <option value="any">Any day</option>
                      <option value="tue-thu">Tue–Thu</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[4px] block">Start time</label>
                    <input type="time" value={windowStart} onChange={(e) => setWindowStart(e.target.value)} className="w-full bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] rounded-[999px] px-[10px] py-[7px] text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Mono:Regular',sans-serif]" />
                  </div>
                  <div>
                    <label className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[4px] block">End time</label>
                    <input type="time" value={windowEnd} onChange={(e) => setWindowEnd(e.target.value)} className="w-full bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] rounded-[999px] px-[10px] py-[7px] text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Mono:Regular',sans-serif]" />
                  </div>
                  <div>
                    <label className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[4px] block">Timezone</label>
                    <select value={windowTz} onChange={(e) => setWindowTz(e.target.value)} className="w-full bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] rounded-[999px] px-[10px] py-[7px] text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] cursor-pointer">
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
                    <select value={minNodesUp} onChange={(e) => setMinNodesUp(e.target.value)} className="w-full bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] rounded-[999px] px-[10px] py-[6px] text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] cursor-pointer">
                      <option value="1">At least 1 node</option>
                      <option value="2">At least 2 nodes</option>
                      <option value="3">At least 3 nodes</option>
                      <option value="50%">At least 50% of nodes</option>
                    </select>
                  </div>
                  <div className="bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] rounded-[8px] px-[14px] py-[10px]">
                    <label className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[4px] block">Max unavailable nodes (percentage)</label>
                    <select value={maxUnavailablePercent} onChange={(e) => setMaxUnavailablePercent(e.target.value)} className="w-full bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] rounded-[999px] px-[10px] py-[6px] text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] cursor-pointer">
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
                    <input type="date" value={fixedDate} onChange={(e) => setFixedDate(e.target.value)} className="w-full bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] rounded-[999px] px-[10px] py-[7px] text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Mono:Regular',sans-serif]" />
                  </div>
                  <div>
                    <label className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[4px] block">Time ({windowTz})</label>
                    <input type="time" value={fixedTime} onChange={(e) => setFixedTime(e.target.value)} className="w-full bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] rounded-[999px] px-[10px] py-[7px] text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Mono:Regular',sans-serif]" />
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
        <div className="rounded-[16px] border border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] p-[24px] mb-[16px]">
          <div className="flex items-center justify-between mb-[4px]">
            <div className="flex items-center gap-[10px]">
              <h2 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[18px]">Agent&apos;s Proposed Update Plan</h2>
              {planDecision === "pending" && <span className="text-[11px] px-[8px] py-[2px] rounded-full bg-[#e7f1fa] text-[#0066cc] font-semibold font-['Red_Hat_Text:Regular',sans-serif]">Pending approval</span>}
              {planDecision === "approved" && <span className="text-[11px] px-[8px] py-[2px] rounded-full bg-[rgba(62,134,53,0.1)] text-[#3e8635] font-semibold font-['Red_Hat_Text:Regular',sans-serif]">Approved</span>}
              {planDecision === "rejected" && <span className="text-[11px] px-[8px] py-[2px] rounded-full bg-[rgba(201,25,11,0.1)] text-[#c9190b] font-semibold font-['Red_Hat_Text:Regular',sans-serif]">Rejected</span>}
            </div>
            <span className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">Generated Mar 30, 2026 02:15 UTC</span>
          </div>
          <p className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[14px] mb-[16px] font-['Red_Hat_Text:Regular',sans-serif]">AI-generated update plan for your cluster</p>

          <div className="space-y-[20px]">
            {/* Pre-Checks Module */}
            <div>
              <div className="flex items-center gap-[8px] mb-[12px]">
                <Shield className="size-[16px] text-[#3e8635]" />
                <h3 className="text-[15px] font-semibold text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">Pre-Checks</h3>
                <span className="text-[12px] text-[#3e8635] font-semibold px-[8px] py-[1px] rounded-full bg-[rgba(62,134,53,0.1)] font-['Red_Hat_Text:Regular',sans-serif]">
                  {agentPreChecks.filter(c => c.status === "pass").length}/{agentPreChecks.length} passed
                </span>
              </div>
              <div className="grid grid-cols-3 gap-[8px]">
                {agentPreChecks.map((check) => (
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
                  className="flex items-center gap-[6px] bg-transparent text-[#0066cc] dark:text-[#4dabf7] text-[12px] px-[10px] py-[5px] rounded-[999px] border border-[#0066cc] dark:border-[#4dabf7] cursor-pointer hover:bg-[#0066cc]/5 transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
                  AI compatibility check <Sparkles className="size-[12px]" />
                </button>
              </div>

              {/* Operator Compatibility — table chrome aligned with Update history tab */}
              <div className="mb-[12px]">
                <p className="text-[12px] text-[#6a6e73] dark:text-[#8a8d90] font-['Red_Hat_Text:Regular',sans-serif] mb-[8px] font-medium">Operator compatibility status</p>
                <div className="border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.1)] rounded-[8px] overflow-hidden">
                  <div className="grid grid-cols-[1fr_65px_80px_60px_80px_1fr_100px] gap-[8px] px-[16px] py-[10px] text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] border-b border-[#d2d2d2] dark:border-[rgba(255,255,255,0.1)]">
                    <span>Operator</span><span>Type</span><span>Version</span><span>Max OCP</span><span>Status</span><span>Required action</span><span>Resolution</span>
                  </div>
                  {compatAnalysis.operators.map((op) => (
                    <div key={op.name} className={`grid grid-cols-[1fr_65px_80px_60px_80px_1fr_100px] gap-[8px] items-center px-[16px] py-[12px] border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] last:border-0 transition-colors hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] ${op.status === "incompatible" ? "bg-[rgba(201,25,11,0.02)]" : ""}`}>
                      <span className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">{op.name}</span>
                      <span className={`text-[10px] px-[4px] py-[1px] rounded-[3px] font-semibold w-fit font-['Red_Hat_Text:Regular',sans-serif] ${op.category === "Platform" ? "bg-[rgba(94,64,190,0.1)] text-[#5e40be]" : "bg-[rgba(0,102,204,0.1)] text-[#0066cc]"}`}>
                        {op.category}
                      </span>
                      <span className="text-[12px] font-['Red_Hat_Mono:Regular',sans-serif] text-[#151515] dark:text-white">{op.currentVersion}</span>
                      <span className="text-[12px] font-['Red_Hat_Mono:Regular',sans-serif] text-[#4d4d4d] dark:text-[#b0b0b0]">{op.maxOCP}</span>
                      <span>
                        {op.status === "compatible" && <span className="flex items-center gap-[3px] text-[11px] text-[#3e8635] font-semibold"><CheckCircle className="size-[10px]" /> OK</span>}
                        {op.status === "incompatible" && <span className="flex items-center gap-[3px] text-[11px] text-[#c9190b] font-semibold"><AlertCircle className="size-[10px]" /> Blocked</span>}
                        {op.status === "warning" && <span className="flex items-center gap-[3px] text-[11px] text-[#c58c00] font-semibold"><AlertTriangle className="size-[10px]" /> Warn</span>}
                      </span>
                      <span className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">{op.action ?? "—"}</span>
                      <span>
                        {op.action ? (
                          <div className="flex items-center gap-[6px]">
                            {op.docUrl && (
                              <a href={op.docUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-[4px] text-[#0066cc] dark:text-[#4dabf7] text-[11px] no-underline hover:underline font-['Red_Hat_Text:Regular',sans-serif]">
                                View docs <ExternalLink className="size-[11px]" />
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

              {/* API Deprecations */}
              <div className="grid grid-cols-2 gap-[12px]">
                <div>
                  <p className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[8px] font-semibold uppercase tracking-wide">API Deprecations</p>
                  {compatAnalysis.apiDeprecations.length > 0 ? (
                    <div className="space-y-[6px]">
                      {compatAnalysis.apiDeprecations.map((dep, i) => (
                        <div key={i} className="bg-[#fdf7e7] dark:bg-[rgba(197,140,0,0.06)] rounded-[999px] px-[12px] py-[8px] border border-[#c58c00]/20">
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
                        <div key={i} className="bg-[rgba(201,25,11,0.04)] rounded-[999px] px-[12px] py-[8px] border border-[#c9190b]/20">
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

            {/* Decision Bar */}
            <div className="border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] pt-[20px]">
              {incompatibleOps.length > 0 && (
                <div className="flex items-start gap-[8px] bg-[#fdf7e7] dark:bg-[rgba(197,140,0,0.06)] rounded-[8px] px-[14px] py-[10px] mb-[14px] border border-[#c58c00]/30">
                  <AlertTriangle className="size-[14px] text-[#c58c00] shrink-0 mt-[2px]" />
                  <p className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">
                    <span className="font-semibold">{incompatibleOps.length} blocking issue{incompatibleOps.length !== 1 ? "s" : ""}</span> must be resolved before approving, or you can accept the risks and proceed.
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <p className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">
                  Target: <span className="font-['Red_Hat_Mono:Regular',sans-serif] text-[#151515] dark:text-white font-medium">5.0.0 → 5.1.10</span>
                </p>
                <div className="flex items-center gap-[10px]">
                  {incompatibleOps.length > 0 ? (
                    <>
                      <button onClick={() => setShowRiskAcceptModal(true)}
                        className="text-[14px] px-[16px] py-[8px] rounded-[999px] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] bg-transparent text-[#151515] dark:text-white cursor-pointer hover:bg-[rgba(0,0,0,0.03)] transition-colors font-['Red_Hat_Text:Regular',sans-serif]">
                        Accept risks &amp; approve
                      </button>
                      <div className="relative group">
                        <button disabled
                          className="text-[14px] px-[16px] py-[8px] rounded-[999px] border-0 transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium bg-[#d2d2d2] text-[#6a6e73] cursor-not-allowed">
                          Approve plan
                        </button>
                        <div className="absolute bottom-full right-0 mb-[6px] hidden group-hover:block z-10">
                          <div className="bg-[#151515] text-white text-[11px] px-[10px] py-[6px] rounded-[999px] shadow-lg whitespace-nowrap font-['Red_Hat_Text:Regular',sans-serif]">
                            Resolve {incompatibleOps.length} blocking issue{incompatibleOps.length !== 1 ? "s" : ""} to approve
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    planDecision === "approved" ? (
                      <button onClick={startUpdate}
                        className="text-[14px] px-[16px] py-[8px] rounded-[999px] border-0 cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium bg-[#0066cc] hover:bg-[#004080] text-white flex items-center gap-[6px]">
                        <Play className="size-[14px]" /> Start update
                      </button>
                    ) : (
                      <button onClick={() => setPlanDecision("approved")}
                        className="text-[14px] px-[16px] py-[8px] rounded-[999px] border-0 cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium bg-[#0066cc] hover:bg-[#004080] text-white">
                        Approve plan
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Progress Panel */}
      {(agentStatus === "updating" || agentStatus === "rolling-back") && (
        <div className="rounded-[16px] border border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] overflow-hidden">
          <div className="px-[24px] py-[16px] border-b border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] bg-[#fafafa] dark:bg-[rgba(255,255,255,0.02)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[10px]">
                <Loader2 className={`size-[18px] animate-spin ${agentStatus === "rolling-back" ? "text-[#c58c00]" : "text-[#0066cc]"}`} />
                <h2 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[16px]">
                  {agentStatus === "rolling-back" ? "Rolling Back to 5.0.0" : "Updating to 5.1.10"}
                </h2>
              </div>
              <div className="flex items-center gap-[12px]">
                <span className="text-[13px] font-['Red_Hat_Mono:Regular',sans-serif] text-[#151515] dark:text-white font-medium">{updateProgress}%</span>
                <span className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">
                  Est. remaining: {Math.max(0, Math.round((100 - updateProgress) * 0.6))}m
                </span>
              </div>
            </div>
            <div className="mt-[12px] h-[6px] bg-[#e0e0e0] dark:bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-300 ${agentStatus === "rolling-back" ? "bg-[#c58c00]" : "bg-[#0066cc]"}`} style={{ width: `${updateProgress}%` }} />
            </div>
          </div>

          <div className="p-[24px] space-y-[20px]">
            {/* Node Rollout */}
            <div>
              <div className="flex items-center gap-[8px] mb-[12px]">
                <Shield className="size-[16px] text-[#0066cc]" />
                <h3 className="text-[15px] font-semibold text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">
                  {agentStatus === "rolling-back" ? "Node rollback" : "Node rollout"}
                </h3>
                <span className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">
                  {updateNodes.filter(n => n.status === "done").length}/{updateNodes.length} complete
                </span>
              </div>
              <div className="grid grid-cols-3 gap-[8px]">
                {updateNodes.map((node) => (
                  <div key={node.name} className="flex items-center gap-[8px] bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] rounded-[8px] px-[12px] py-[10px]">
                    {node.status === "done" && <CheckCircle className="size-[14px] text-[#3e8635] shrink-0" />}
                    {node.status === "in-progress" && <Loader2 className="size-[14px] text-[#0066cc] animate-spin shrink-0" />}
                    {node.status === "pending" && <Clock className="size-[14px] text-[#8a8d90] shrink-0" />}
                    <div>
                      <p className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Mono:Regular',sans-serif]">{node.name}</p>
                      <p className="text-[11px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">{node.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Operator Updates */}
            {agentStatus !== "rolling-back" && (
              <div className="border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] pt-[20px]">
                <div className="flex items-center gap-[8px] mb-[12px]">
                  <Settings className="size-[16px] text-[#6753ac]" />
                  <h3 className="text-[15px] font-semibold text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">Operator updates</h3>
                  <span className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">
                    {updateOperators.filter(o => o.status === "done").length}/{updateOperators.length} complete
                  </span>
                </div>
                <div className="space-y-[6px]">
                  {updateOperators.map((op) => (
                    <div key={op.name} className="flex items-center justify-between bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] rounded-[8px] px-[14px] py-[10px]">
                      <div className="flex items-center gap-[10px]">
                        {op.status === "done" && <CheckCircle className="size-[14px] text-[#3e8635]" />}
                        {op.status === "in-progress" && <Loader2 className="size-[14px] text-[#0066cc] animate-spin" />}
                        {op.status === "pending" && <Clock className="size-[14px] text-[#8a8d90]" />}
                        <span className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] font-medium">{op.name}</span>
                      </div>
                      <span className="text-[12px] font-['Red_Hat_Mono:Regular',sans-serif] text-[#4d4d4d] dark:text-[#b0b0b0]">{op.from} → {op.to}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Health */}
            <div className="border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] pt-[20px]">
              <div className="flex items-center gap-[8px] mb-[12px]">
                <Eye className="size-[16px] text-[#3e8635]" />
                <h3 className="text-[15px] font-semibold text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">Live health monitoring</h3>
              </div>
              <div className="grid grid-cols-4 gap-[8px]">
                {[
                  { label: "API Server", value: "Healthy", ok: true },
                  { label: "etcd", value: "Healthy", ok: true },
                  { label: "Ingress", value: "Healthy", ok: true },
                  { label: "Node Pressure", value: "None", ok: true },
                ].map((h) => (
                  <div key={h.label} className="bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] rounded-[8px] px-[12px] py-[8px]">
                    <p className="text-[11px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[2px]">{h.label}</p>
                    <p className={`text-[12px] font-semibold font-['Red_Hat_Text:Regular',sans-serif] flex items-center gap-[4px] ${h.ok ? "text-[#3e8635]" : "text-[#c9190b]"}`}>
                      {h.ok ? <CheckCircle className="size-[10px]" /> : <AlertCircle className="size-[10px]" />} {h.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulate actions for demo */}
            <div className="border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] pt-[16px] flex items-center gap-[10px]">
              <span className="text-[11px] text-[#8a8d90] font-['Red_Hat_Text:Regular',sans-serif] italic">Demo:</span>
              {agentStatus === "updating" && (
                <>
                  <button onClick={simulateComplete} className="text-[11px] px-[10px] py-[4px] rounded-[4px] border border-[#3e8635] text-[#3e8635] bg-transparent cursor-pointer hover:bg-[rgba(62,134,53,0.05)] font-['Red_Hat_Text:Regular',sans-serif]">Simulate success</button>
                  <button onClick={simulateFailure} className="text-[11px] px-[10px] py-[4px] rounded-[4px] border border-[#c9190b] text-[#c9190b] bg-transparent cursor-pointer hover:bg-[rgba(201,25,11,0.05)] font-['Red_Hat_Text:Regular',sans-serif]">Simulate failure</button>
                </>
              )}
              {agentStatus === "rolling-back" && (
                <button onClick={() => { setAgentStatus("idle"); setPlanDecision("pending"); openChatbot("rollback-complete"); }} className="text-[11px] px-[10px] py-[4px] rounded-[4px] border border-[#3e8635] text-[#3e8635] bg-transparent cursor-pointer hover:bg-[rgba(62,134,53,0.05)] font-['Red_Hat_Text:Regular',sans-serif]">Simulate rollback complete</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Update Complete Panel */}
      {agentStatus === "completed" && (
        <div className="rounded-[16px] border-2 border-[#3e8635] overflow-hidden">
          <div className="px-[24px] py-[20px] bg-[rgba(62,134,53,0.06)]">
            <div className="flex items-center gap-[12px] mb-[16px]">
              <div className="size-[40px] rounded-full bg-[#3e8635] flex items-center justify-center">
                <CheckCircle className="size-[22px] text-white" />
              </div>
              <div>
                <h2 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[18px]">Cluster updated to 5.1.10</h2>
                <p className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">Completed at {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} &middot; Duration: 1h 38m</p>
              </div>
            </div>

            {/* Post-update verification */}
            <div className="mb-[16px]">
              <div className="flex items-center gap-[8px] mb-[10px]">
                <Shield className="size-[14px] text-[#3e8635]" />
                <p className="text-[14px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] font-semibold">Post-update health verification</p>
                <span className="text-[12px] text-[#3e8635] font-semibold px-[8px] py-[1px] rounded-full bg-[rgba(62,134,53,0.1)] font-['Red_Hat_Text:Regular',sans-serif]">
                  {postUpdateChecks.length}/{postUpdateChecks.length} passed
                </span>
              </div>
              <div className="grid grid-cols-3 gap-[6px]">
                {postUpdateChecks.map((c) => (
                  <div key={c.label} className="flex items-center gap-[6px] bg-white dark:bg-[rgba(255,255,255,0.03)] rounded-[999px] px-[10px] py-[6px] border border-[rgba(62,134,53,0.2)]">
                    <CheckCircle className="size-[12px] text-[#3e8635] shrink-0" />
                    <span className="text-[12px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-4 gap-[12px]">
              <div className="bg-white dark:bg-[rgba(255,255,255,0.03)] rounded-[8px] px-[14px] py-[10px] border border-[rgba(0,0,0,0.06)]">
                <p className="text-[11px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[2px]">Previous version</p>
                <p className="text-[14px] text-[#151515] dark:text-white font-['Red_Hat_Mono:Regular',sans-serif]">5.0.0</p>
              </div>
              <div className="bg-white dark:bg-[rgba(255,255,255,0.03)] rounded-[8px] px-[14px] py-[10px] border border-[rgba(0,0,0,0.06)]">
                <p className="text-[11px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[2px]">Current version</p>
                <p className="text-[14px] text-[#3e8635] font-['Red_Hat_Mono:Regular',sans-serif] font-semibold">5.1.10</p>
              </div>
              <div className="bg-white dark:bg-[rgba(255,255,255,0.03)] rounded-[8px] px-[14px] py-[10px] border border-[rgba(0,0,0,0.06)]">
                <p className="text-[11px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[2px]">Nodes updated</p>
                <p className="text-[14px] text-[#151515] dark:text-white font-['Red_Hat_Mono:Regular',sans-serif]">6/6</p>
              </div>
              <div className="bg-white dark:bg-[rgba(255,255,255,0.03)] rounded-[8px] px-[14px] py-[10px] border border-[rgba(0,0,0,0.06)]">
                <p className="text-[11px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[2px]">Operators updated</p>
                <p className="text-[14px] text-[#151515] dark:text-white font-['Red_Hat_Mono:Regular',sans-serif]">3/3</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Failed Panel */}
      {agentStatus === "failed" && (
        <div className="rounded-[16px] border-2 border-[#c9190b] overflow-hidden">
          <div className="px-[24px] py-[20px] bg-[rgba(201,25,11,0.04)]">
            <div className="flex items-center gap-[12px] mb-[16px]">
              <div className="size-[40px] rounded-full bg-[#c9190b] flex items-center justify-center">
                <AlertCircle className="size-[22px] text-white" />
              </div>
              <div>
                <h2 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[18px]">Update to 5.1.10 failed</h2>
                <p className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">Failed at {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} &middot; Node master-2 failed to drain</p>
              </div>
            </div>

            <div className="rounded-[8px] border border-[#c9190b]/30 bg-white dark:bg-[rgba(255,255,255,0.02)] p-[14px] mb-[16px]">
              <p className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] font-semibold mb-[6px]">Error details</p>
              <div className="bg-[#151515] rounded-[999px] p-[12px] font-['Red_Hat_Mono:Regular',sans-serif] text-[12px] text-[#e0e0e0] overflow-x-auto">
                <p className="text-[#c9190b]">error: node/master-2 drain failed</p>
                <p className="text-[#8a8d90] mt-[4px]">  pods with local storage: prometheus-k8s-0</p>
                <p className="text-[#8a8d90]">  eviction timeout: 300s exceeded</p>
                <p className="text-[#c58c00] mt-[4px]">warning: cluster version is partially updated</p>
                <p className="text-[#8a8d90]">  completed: 2/3 control-plane, 0/3 worker</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-[8px] mb-[16px]">
              {updateNodes.map((node) => {
                const failed = node.name === "master-2";
                return (
                  <div key={node.name} className="flex items-center gap-[8px] bg-white dark:bg-[rgba(255,255,255,0.03)] rounded-[8px] px-[12px] py-[10px] border border-[rgba(0,0,0,0.06)]">
                    {node.status === "done" && <CheckCircle className="size-[14px] text-[#3e8635] shrink-0" />}
                    {failed && <AlertCircle className="size-[14px] text-[#c9190b] shrink-0" />}
                    {!failed && node.status !== "done" && <Clock className="size-[14px] text-[#8a8d90] shrink-0" />}
                    <div>
                      <p className={`text-[13px] font-['Red_Hat_Mono:Regular',sans-serif] ${failed ? "text-[#c9190b]" : "text-[#151515] dark:text-white"}`}>{node.name}</p>
                      <p className="text-[11px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">{failed ? "Drain failed" : node.status === "done" ? "Complete" : "Not started"}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-[10px]">
              <button onClick={() => setShowRollbackModal(true)}
                className="flex items-center gap-[6px] bg-transparent text-[#151515] dark:text-white text-[14px] px-[16px] py-[8px] rounded-[999px] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] cursor-pointer hover:bg-[rgba(0,0,0,0.03)] transition-colors font-['Red_Hat_Text:Regular',sans-serif]">
                <RotateCcw className="size-[14px]" /> Rollback to 5.0.0
              </button>
              <button onClick={() => { setAgentStatus("updating"); setUpdateProgress(0); openChatbot("update-retry"); }}
                className="flex items-center gap-[6px] bg-[#0066cc] hover:bg-[#004080] text-white text-[14px] px-[16px] py-[8px] rounded-[999px] border-0 cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
                <RefreshCw className="size-[14px]" /> Retry update
              </button>
              <button onClick={() => openChatbot("update-failed")}
                className="flex items-center gap-[6px] bg-transparent text-[#0066cc] dark:text-[#4dabf7] text-[14px] px-[16px] py-[8px] rounded-[999px] border border-[#0066cc] dark:border-[#4dabf7] cursor-pointer hover:bg-[#0066cc]/5 transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
                Get AI diagnosis <Sparkles className="size-[14px]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rollback confirmation modal */}
      {showRollbackModal && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40" onClick={() => setShowRollbackModal(false)}>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.2)] max-w-[480px] w-full mx-[16px]" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)]">
              <h3 className="text-[16px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#c9190b]">Rollback to 5.0.0?</h3>
              <button onClick={() => setShowRollbackModal(false)} className="bg-transparent border-0 cursor-pointer text-[#6a6e73] hover:text-[#151515] dark:hover:text-white p-[4px]"><X className="size-[16px]" /></button>
            </div>
            <div className="px-[24px] py-[16px]">
              <p className="text-[14px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] mb-[8px]">This will revert your cluster from the partially updated state back to version 5.0.0.</p>
              <ul className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] list-disc pl-[18px] space-y-[4px]">
                <li>All nodes will be reverted to 5.0.0</li>
                <li>Operator versions will be restored</li>
                <li>Workloads may experience brief disruption</li>
                <li>Estimated rollback time: ~30 minutes</li>
              </ul>
            </div>
            <div className="flex items-center justify-end gap-[10px] px-[24px] py-[16px] border-t border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)]">
              <button onClick={() => setShowRollbackModal(false)} className="text-[14px] px-[16px] py-[8px] rounded-[999px] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] bg-transparent text-[#151515] dark:text-white cursor-pointer hover:bg-[rgba(0,0,0,0.03)] transition-colors font-['Red_Hat_Text:Regular',sans-serif]">
                Cancel
              </button>
              <button onClick={startRollback}
                className="flex items-center gap-[6px] text-[14px] px-[16px] py-[8px] rounded-[999px] border-0 bg-[#c9190b] hover:bg-[#a2150a] text-white cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
                <RotateCcw className="size-[14px]" /> Start rollback
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Pause confirmation modal */}
      {showPauseModal && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40" onClick={() => setShowPauseModal(false)}>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.2)] max-w-[440px] w-full mx-[16px]" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)]">
              <h3 className="text-[16px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white">Pause update agent?</h3>
              <button onClick={() => setShowPauseModal(false)} className="bg-transparent border-0 cursor-pointer text-[#6a6e73] hover:text-[#151515] dark:hover:text-white p-[4px]"><X className="size-[16px]" /></button>
            </div>
            <div className="px-[24px] py-[16px]">
              <p className="text-[14px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] mb-[8px]">The update agent will stop processing and no further actions will be taken until you resume.</p>
              <ul className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] list-disc pl-[18px] space-y-[4px]">
                <li>Current update progress will be preserved</li>
                <li>Scheduled execution window will be skipped</li>
                <li>You can resume at any time</li>
              </ul>
            </div>
            <div className="flex items-center justify-end gap-[10px] px-[24px] py-[16px] border-t border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)]">
              <button onClick={() => setShowPauseModal(false)} className="text-[14px] px-[16px] py-[8px] rounded-[999px] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] bg-transparent text-[#151515] dark:text-white cursor-pointer hover:bg-[rgba(0,0,0,0.03)] transition-colors font-['Red_Hat_Text:Regular',sans-serif]">
                Keep running
              </button>
              <button onClick={() => { setAgentStatus("paused"); setShowPauseModal(false); openChatbot("agent-paused"); }}
                className="text-[14px] px-[16px] py-[8px] rounded-[999px] border-0 bg-[#0066cc] hover:bg-[#004080] text-white cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
                Pause agent
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Cancel confirmation modal */}
      {showCancelModal && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40" onClick={() => setShowCancelModal(false)}>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.2)] max-w-[440px] w-full mx-[16px]" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)]">
              <h3 className="text-[16px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#c9190b]">Cancel update?</h3>
              <button onClick={() => setShowCancelModal(false)} className="bg-transparent border-0 cursor-pointer text-[#6a6e73] hover:text-[#151515] dark:hover:text-white p-[4px]"><X className="size-[16px]" /></button>
            </div>
            <div className="px-[24px] py-[16px]">
              <p className="text-[14px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] mb-[8px]">This will stop the update agent and discard the current update plan. This action cannot be undone.</p>
              <ul className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] list-disc pl-[18px] space-y-[4px]">
                <li>The proposed update plan will be discarded</li>
                <li>Any accepted risks will be cleared</li>
                <li>You will need to start a new update session</li>
              </ul>
            </div>
            <div className="flex items-center justify-end gap-[10px] px-[24px] py-[16px] border-t border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)]">
              <button onClick={() => setShowCancelModal(false)} className="text-[14px] px-[16px] py-[8px] rounded-[999px] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] bg-transparent text-[#151515] dark:text-white cursor-pointer hover:bg-[rgba(0,0,0,0.03)] transition-colors font-['Red_Hat_Text:Regular',sans-serif]">
                Go back
              </button>
              <button onClick={() => { setAgentStatus("idle"); setPlanDecision("pending"); setAcceptedSlugs(new Set()); setShowCancelModal(false); openChatbot("agent-cancelled"); }}
                className="text-[14px] px-[16px] py-[8px] rounded-[999px] border-0 bg-[#c9190b] hover:bg-[#a2150a] text-white cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium">
                Cancel update
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Per-risk acceptance modal */}
      {showRiskAcceptModal && (() => {
        const allRisks = [
          ...incompatibleOps.map((op) => ({ slug: op.slug!, name: op.name, severity: "critical" as const, detail: `${op.name} ${op.currentVersion} (max OCP ${op.maxOCP}) — ${op.action}` })),
          ...warningOps.map((op) => ({ slug: op.slug!, name: op.name, severity: "warning" as const, detail: `${op.name} ${op.currentVersion} (max OCP ${op.maxOCP}) — ${op.action}` })),
        ];
        const selectedCount = allRisks.filter((r) => acceptedSlugs.has(r.slug)).length;
        const allSelected = selectedCount === allRisks.length;
        const toggleSlug = (slug: string) => {
          setAcceptedSlugs((prev) => { const next = new Set(prev); if (next.has(slug)) next.delete(slug); else next.add(slug); return next; });
        };
        const toggleAll = () => {
          if (allSelected) { setAcceptedSlugs(new Set()); }
          else { setAcceptedSlugs(new Set(allRisks.map((r) => r.slug))); }
        };
        return createPortal(
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40" onClick={() => setShowRiskAcceptModal(false)}>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-[16px] shadow-[0_10px_20px_rgba(41,41,41,0.15)] max-w-[560px] w-full mx-[16px] max-h-[80vh] flex flex-col" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[#d2d2d2] dark:border-[rgba(255,255,255,0.1)]">
                <h3 className="text-[18px] font-['Red_Hat_Display',sans-serif] font-semibold text-[#151515] dark:text-white">Accept known risks</h3>
                <button onClick={() => setShowRiskAcceptModal(false)} className="bg-transparent border-0 cursor-pointer text-[#6a6e73] hover:text-[#151515] dark:hover:text-white p-[4px]" aria-label="Close">
                  <X className="size-[18px]" />
                </button>
              </div>

              <div className="px-[24px] py-[16px] overflow-y-auto flex-1">
                <div className="flex items-start gap-[8px] rounded-[16px] border-l-[2px] border-l-[#dca614] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.15)] bg-white dark:bg-[#1a1a1a] px-[16px] py-[12px] mb-[16px]">
                  <AlertTriangle className="size-[14px] text-[#dca614] shrink-0 mt-[2px]" />
                  <p className="text-[14px] text-[#151515] dark:text-white font-['Red_Hat_Text',sans-serif]">
                    Acknowledging these risks will set <span className="font-['Red_Hat_Mono',sans-serif] text-[#5e40be]">desiredUpdate.acceptedRisks</span> on the ClusterVersion resource.
                    The update will proceed despite known incompatibilities. You must accept all risks to proceed.
                  </p>
                </div>

                <div className="flex items-center justify-between mb-[12px]">
                  <p className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text',sans-serif] uppercase tracking-[0.5px] font-semibold">
                    {allRisks.length} risk{allRisks.length !== 1 ? "s" : ""} identified
                  </p>
                  <label className="flex items-center gap-[6px] cursor-pointer">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll}
                      className="size-[16px] accent-[#0066cc] cursor-pointer" />
                    <span className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text',sans-serif] font-medium">Select all</span>
                  </label>
                </div>

                <div className="space-y-[10px]">
                  {allRisks.map((risk) => (
                    <label key={risk.slug} className={`flex items-start gap-[12px] rounded-[16px] p-[14px] border cursor-pointer transition-colors ${acceptedSlugs.has(risk.slug) ? "border-[#0066cc] bg-[#e7f1fa]/30 dark:bg-[rgba(43,154,243,0.06)]" : "border-[#d2d2d2] dark:border-[rgba(255,255,255,0.15)] hover:border-[#8a8d90]"}`}>
                      <input type="checkbox" checked={acceptedSlugs.has(risk.slug)} onChange={() => toggleSlug(risk.slug)}
                        className="size-[16px] mt-[2px] cursor-pointer accent-[#0066cc] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-[6px] mb-[4px]">
                          {risk.severity === "critical" ? <AlertCircle className="size-[12px] text-[#b1380b] shrink-0" /> : <AlertTriangle className="size-[12px] text-[#dca614] shrink-0" />}
                          <span className="text-[14px] text-[#151515] dark:text-white font-medium font-['Red_Hat_Text',sans-serif]">{risk.name}</span>
                          <span className={`text-[11px] px-[6px] py-[1px] rounded-[4px] font-semibold ${risk.severity === "critical" ? "bg-[rgba(177,56,11,0.1)] text-[#b1380b]" : "bg-[rgba(220,166,20,0.1)] text-[#795600]"}`}>
                            {risk.severity}
                          </span>
                        </div>
                        <p className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text',sans-serif]">{risk.detail}</p>
                        <p className="text-[11px] text-[#6a6e73] dark:text-[#8a8d90] font-['Red_Hat_Mono',sans-serif] mt-[4px]">slug: {risk.slug}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-[12px] px-[24px] py-[16px] border-t border-[#d2d2d2] dark:border-[rgba(255,255,255,0.1)]">
                <button disabled={!allSelected}
                  onClick={() => { setPlanDecision("approved"); setShowRiskAcceptModal(false); }}
                  className={`text-[14px] px-[16px] py-[8px] rounded-[999px] border-0 transition-colors font-['Red_Hat_Text',sans-serif] font-medium ${allSelected ? "bg-[#0066cc] hover:bg-[#004080] text-white cursor-pointer" : "bg-[#d2d2d2] text-[#6a6e73] cursor-not-allowed"}`}>
                  Accept all risks &amp; approve plan
                </button>
                <button disabled={selectedCount === 0}
                  onClick={() => setShowRiskAcceptModal(false)}
                  className={`text-[14px] px-[16px] py-[8px] rounded-[999px] border transition-colors font-['Red_Hat_Text',sans-serif] font-medium ${selectedCount > 0 ? "border-[#0066cc] dark:border-[#4dabf7] text-[#0066cc] dark:text-[#4dabf7] bg-transparent cursor-pointer hover:bg-[#0066cc]/5" : "border-[#d2d2d2] text-[#6a6e73] bg-transparent cursor-not-allowed"}`}>
                  Accept and save
                </button>
                <button onClick={() => setShowRiskAcceptModal(false)}
                  className="text-[14px] px-[16px] py-[8px] bg-transparent border-0 text-[#0066cc] dark:text-[#4dabf7] cursor-pointer hover:underline font-['Red_Hat_Text',sans-serif] font-medium">
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}

      {/* Sticky Approval Footer */}
      {(agentStatus === "active" || agentStatus === "paused") && planDecision === "pending" && createPortal(
        <div className="fixed bottom-0 left-0 right-0 z-[80] bg-white dark:bg-[#1a1a1a] border-t border-[#d2d2d2] dark:border-[rgba(255,255,255,0.1)] px-[24px] py-[14px] shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between max-w-full">
            <div className="flex items-center gap-[10px]">
              {incompatibleOps.length > 0 && <AlertTriangle className="size-[16px] text-[#c58c00]" />}
              <span className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">
                {incompatibleOps.length > 0 ? (
                  <><span className="font-semibold">{incompatibleOps.length} blocking issue{incompatibleOps.length !== 1 ? "s" : ""}</span> must be resolved before approving, or you can accept the risks and proceed.</>
                ) : (
                  <>Update plan ready for approval</>
                )}
                <span className="text-[#4d4d4d] dark:text-[#b0b0b0] ml-[12px]">Target: <span className="font-['Red_Hat_Mono:Regular',sans-serif] font-medium text-[#151515] dark:text-white">5.0.0 → 5.1.10</span></span>
              </span>
            </div>
            <div className="flex items-center gap-[10px]">
              {incompatibleOps.length > 0 ? (
                <>
                  <button onClick={() => setShowRiskAcceptModal(true)}
                    className="text-[13px] px-[14px] py-[7px] rounded-[999px] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] bg-transparent text-[#151515] dark:text-white cursor-pointer hover:bg-[rgba(0,0,0,0.03)] transition-colors font-['Red_Hat_Text:Regular',sans-serif]">
                    Accept risks &amp; approve
                  </button>
                  <div className="relative group">
                    <button disabled className="text-[13px] px-[14px] py-[7px] rounded-[999px] border-0 bg-[#d2d2d2] text-[#6a6e73] cursor-not-allowed font-['Red_Hat_Text:Regular',sans-serif] font-medium">
                      Approve plan
                    </button>
                    <div className="absolute bottom-full right-0 mb-[6px] hidden group-hover:block z-10">
                      <div className="bg-[#151515] text-white text-[11px] px-[10px] py-[6px] rounded-[999px] shadow-lg whitespace-nowrap font-['Red_Hat_Text:Regular',sans-serif]">
                        Resolve {incompatibleOps.length} blocking issue{incompatibleOps.length !== 1 ? "s" : ""} to approve
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <button onClick={() => setPlanDecision("approved")}
                  className="text-[13px] px-[14px] py-[7px] rounded-[999px] border-0 cursor-pointer bg-[#0066cc] hover:bg-[#004080] text-white font-['Red_Hat_Text:Regular',sans-serif] font-medium transition-colors">
                  Approve plan
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
      {(agentStatus === "active" || agentStatus === "paused") && planDecision === "approved" && createPortal(
        <div className="fixed bottom-0 left-0 right-0 z-[80] bg-white dark:bg-[#1a1a1a] border-t border-[#d2d2d2] dark:border-[rgba(255,255,255,0.1)] px-[24px] py-[14px] shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[8px]">
              <CheckCircle className="size-[16px] text-[#3e8635]" />
              <span className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">
                Plan approved &middot; Target: <span className="font-['Red_Hat_Mono:Regular',sans-serif] font-medium">5.0.0 → 5.1.10</span>
              </span>
            </div>
            <button onClick={startUpdate}
              className="text-[13px] px-[14px] py-[7px] rounded-[999px] border-0 cursor-pointer bg-[#0066cc] hover:bg-[#004080] text-white font-['Red_Hat_Text:Regular',sans-serif] font-medium transition-colors flex items-center gap-[6px]">
              <Play className="size-[13px]" /> Start update
            </button>
          </div>
        </div>,
        document.body
      )}
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

function ChannelTooltip() {
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
      <button onClick={() => setOpen(!open)} className="bg-transparent border-0 cursor-pointer p-[2px] text-[#6a6e73] dark:text-[#b0b0b0] hover:text-[#0066cc] dark:hover:text-[#4dabf7] transition-colors" aria-label="Learn more about update channels">
        <HelpCircle className="size-[16px]" />
      </button>
      {open && (
        <div className="absolute top-[28px] left-1/2 -translate-x-1/2 z-50 w-[320px] bg-white dark:bg-[#1a1a1a] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.15)] rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] p-[16px]">
          <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-[12px] h-[12px] bg-white dark:bg-[#1a1a1a] border-l border-t border-[#d2d2d2] dark:border-[rgba(255,255,255,0.15)] rotate-45" />
          <p className="text-[#151515] dark:text-white text-[13px] font-['Red_Hat_Text:Regular',sans-serif] font-medium mb-[4px]">Update channels</p>
          <p className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[13px] font-['Red_Hat_Text:Regular',sans-serif] mb-[8px]">
            Channels determine which versions are available for update. <strong>fast</strong> delivers updates as soon as they pass CI, <strong>stable</strong> waits for broader adoption, <strong>eus</strong> provides extended update support for select minor versions, and <strong>candidate</strong> includes pre-release builds for early testing.
          </p>
          <a href="https://docs.openshift.com/container-platform/latest/updating/understanding_updates/understanding-update-channels-releases.html" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-[4px] text-[#0066cc] dark:text-[#4dabf7] text-[13px] no-underline hover:underline font-['Red_Hat_Text:Regular',sans-serif]">
            Learn more about channels <ExternalLink className="size-[11px]" />
          </a>
        </div>
      )}
    </div>
  );
}

/* ─── Agent Plan Data & Components ─── */
interface AgentOperator {
  name: string;
  current: string;
  required: string | null;
  compatible: boolean;
  incompatibleAt?: string;
  action: "required" | "optional" | "up-to-date";
}

const AGENT_OPERATORS: AgentOperator[] = [
  { name: "Abot Operator", current: "3.0.0", required: "3.1.0", compatible: false, incompatibleAt: "3.0.0", action: "required" },
  { name: "Airflow Helm Operator", current: "5.7.2", required: "5.7.3", compatible: false, incompatibleAt: "5.7.2", action: "required" },
  { name: "Ansible Automation Platform", current: "1.5.0", required: "1.6.0", compatible: true, action: "optional" },
  { name: "Bare Metal Event Relay", current: "1.1.1", required: "1.2.0", compatible: true, action: "optional" },
  { name: "Camel K Operator", current: "2.1.0", required: null, compatible: true, action: "up-to-date" },
];

type PlanStepStatus = "done" | "warning" | "pending";
interface PlanStep {
  label: string;
  status: PlanStepStatus;
  badge?: string;
  badgeColor?: string;
  detail: string;
}

function StepIcon({ status }: { status: PlanStepStatus }) {
  if (status === "done") return <CheckCircle className="size-[20px] text-[#3e8635] shrink-0" />;
  if (status === "warning") return <AlertTriangle className="size-[20px] text-[#f0ab00] shrink-0" />;
  return <Clock className="size-[20px] text-[#6a6e73] shrink-0" />;
}

function BadgeLabel({ text, color }: { text: string; color: string }) {
  return (
    <span className="text-[11px] font-semibold px-[8px] py-[2px] rounded-[4px] text-white" style={{ backgroundColor: color }}>
      {text}
    </span>
  );
}

function flattenChannelVersionOptions(groups: VersionGroup[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const g of groups) {
    for (const v of g.versions) {
      if (!seen.has(v.version)) {
        seen.add(v.version);
        out.push(v.version);
      }
    }
  }
  return out;
}

/** Matches the agent-only demo storyline (cluster on 5.0.x, target chosen from channel). */
const AGENT_CLUSTER_CURRENT_VERSION = "5.0.0";

const DEFAULT_AGENT_MAINTENANCE_WINDOW = "Apr 15, 2026 · 2:00 AM EST";

function formatAgentScheduleLine(dateIso: string, timeHm: string, tzLabel: string): string {
  const [y, m, d] = dateIso.split("-").map(Number);
  if (!y || !m || !d) return DEFAULT_AGENT_MAINTENANCE_WINDOW;
  const date = new Date(y, m - 1, d);
  const datePart = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const [hh, mm] = timeHm.split(":").map(Number);
  const t = new Date(2000, 0, 1, hh || 0, mm || 0);
  const timePart = t.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${datePart} · ${timePart} · ${tzLabel}`;
}

function hashVersionKey(version: string): number {
  let h = 0;
  for (let i = 0; i < version.length; i++) h = Math.imul(31, h) + version.charCodeAt(i) | 0;
  return Math.abs(h);
}

type AgentPlanProfile = {
  defaultMaintenance: string;
  durationRange: string;
  rollingStrategy: string;
  riskBarPct: number;
  riskLabel: string;
  riskBarColor: string;
  riskDetail: string;
  tags: string[];
  compatCompatible: number;
  compatTotal: number;
  compatRequired: number;
  storageDetail: string;
};

/** Deterministic mock plan details per target version (prototype). */
function getAgentPlanProfile(version: string): AgentPlanProfile {
  const h = hashVersionKey(version);
  const windows = [
    DEFAULT_AGENT_MAINTENANCE_WINDOW,
    "Apr 18, 2026 · 3:30 AM EST",
    "Apr 22, 2026 · 1:00 AM UTC",
    "May 2, 2026 · 11:00 PM EST",
    "Apr 12, 2026 · 6:00 AM EST",
  ];
  const durations = ["38–52 minutes", "45–60 minutes", "52–70 minutes", "40–55 minutes", "48–65 minutes"];
  const rolling = [
    "Rolling (2 nodes at a time)",
    "Rolling (1 node at a time)",
    "Rolling (3 nodes at a time)",
    "Parallel control plane, rolling workers",
  ];
  const tagSets = [
    ["Security patches", "Bug fixes", "Performance"],
    ["Security patches", "Networking", "Observability"],
    ["Bug fixes", "Performance", "Operator tooling"],
    ["Security patches", "AI workload", "Storage"],
  ];
  const risks = [
    { pct: 20, label: "2 / 10 — Low", color: "#3e8635", detail: "AI risk score: 2/10 · No PDB violations or blocking conditions detected" },
    { pct: 32, label: "3 / 10 — Low", color: "#3e8635", detail: "AI risk score: 3/10 · Minor cordon delay on one node pool" },
    { pct: 45, label: "4 / 10 — Moderate", color: "#f0ab00", detail: "AI risk score: 4/10 · Review PDBs and surge settings before execution" },
    { pct: 28, label: "3 / 10 — Low", color: "#3e8635", detail: "AI risk score: 3/10 · etcd backup verified within policy" },
  ];
  const storageDetails = [
    "Sufficient capacity (68% used)",
    "Sufficient capacity (72% used)",
    "Sufficient capacity (61% used)",
  ];
  const compatVariants = [
    { c: 3, t: 5, r: 2 },
    { c: 4, t: 5, r: 1 },
    { c: 2, t: 5, r: 3 },
  ];
  const cv = compatVariants[h % compatVariants.length];
  const ri = risks[h % risks.length];
  return {
    defaultMaintenance: windows[h % windows.length],
    durationRange: durations[h % durations.length],
    rollingStrategy: rolling[h % rolling.length],
    riskBarPct: ri.pct,
    riskLabel: ri.label,
    riskBarColor: ri.color,
    riskDetail: ri.detail,
    tags: tagSets[h % tagSets.length],
    compatCompatible: cv.c,
    compatTotal: cv.t,
    compatRequired: cv.r,
    storageDetail: storageDetails[h % storageDetails.length],
  };
}

function UpdateAgentTab({
  selectedVersion,
  onSelectedVersionChange,
  selectedChannel,
  channelGroups,
}: {
  openChatbot: (ctx: string) => void;
  selectedVersion: string;
  onSelectedVersionChange: (v: string) => void;
  selectedChannel: string;
  channelGroups: VersionGroup[];
}) {
  const navigate = useNavigate();
  const [activePlanVersion, setActivePlanVersion] = useState(selectedVersion);
  const [isPlanLoading, setIsPlanLoading] = useState(false);
  const [planDecision, setPlanDecision] = useState<"pending" | "scheduled" | "rejected">("pending");
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([1, 2]));
  const [planSerial, setPlanSerial] = useState(13);
  const [planAgeLabel, setPlanAgeLabel] = useState("2 hours ago");
  const [maintenanceWindowLine, setMaintenanceWindowLine] = useState(() => getAgentPlanProfile(selectedVersion).defaultMaintenance);
  const [scheduledWindowLine, setScheduledWindowLine] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    plansCreated: 12,
    updatesExecuted: 12,
    totalDurationMin: 12 * 78,
  });

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveAcknowledged, setApproveAcknowledged] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectAcknowledged, setRejectAcknowledged] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("2026-04-15");
  const [scheduleTime, setScheduleTime] = useState("02:00");
  const [scheduleTzLabel, setScheduleTzLabel] = useState("Eastern Time (ET)");

  const planRegenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runGeneratePlan = useCallback(() => {
    if (isPlanLoading) return;
    const versionToApply = selectedVersion;
    setIsPlanLoading(true);
    if (planRegenTimerRef.current) clearTimeout(planRegenTimerRef.current);
    planRegenTimerRef.current = setTimeout(() => {
      planRegenTimerRef.current = null;
      const profile = getAgentPlanProfile(versionToApply);
      setActivePlanVersion(versionToApply);
      setPlanSerial((n) => n + 1);
      setPlanDecision("pending");
      setPlanAgeLabel("Just now");
      setMaintenanceWindowLine(profile.defaultMaintenance);
      setScheduledWindowLine(null);
      setIsPlanLoading(false);
    }, 1100);
  }, [selectedVersion, isPlanLoading]);

  useEffect(
    () => () => {
      if (planRegenTimerRef.current) {
        clearTimeout(planRegenTimerRef.current);
        planRegenTimerRef.current = null;
      }
    },
    []
  );

  const planProfile = useMemo(() => getAgentPlanProfile(activePlanVersion), [activePlanVersion]);
  const planDiffersFromSelection = selectedVersion !== activePlanVersion;
  const targetVersion = activePlanVersion;
  const versionOptions = flattenChannelVersionOptions(channelGroups);

  const toggleStep = (i: number) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const avgDurationMin = Math.max(1, Math.round(metrics.totalDurationMin / metrics.updatesExecuted));

  const stats = [
    { label: "Plans Created", value: String(metrics.plansCreated) },
    { label: "Updates Executed", value: String(metrics.updatesExecuted) },
    { label: "Avg Duration", value: `${avgDurationMin} min` },
  ];

  const recordApproval = () => {
    const simulatedRunMin = 72;
    setMetrics((m) => {
      const nextExecutions = m.updatesExecuted + 1;
      const nextTotal = m.totalDurationMin + simulatedRunMin;
      return {
        plansCreated: m.plansCreated + 1,
        updatesExecuted: nextExecutions,
        totalDurationMin: nextTotal,
      };
    });
  };

  const steps: PlanStep[] = useMemo(
    () => [
      { label: "Version Detection", status: "done", badge: "FOUND", badgeColor: "#3e8635", detail: `New version ${targetVersion} detected on ${selectedChannel} channel` },
      { label: "Pre-flight Checks Complete", status: "done", badge: "PASSED", badgeColor: "#3e8635", detail: "All cluster health checks completed successfully" },
      {
        label: "Compatibility Analysis",
        status: "warning",
        badge: "ACTION NEEDED",
        badgeColor: "#f0ab00",
        detail: `${planProfile.compatCompatible} of ${planProfile.compatTotal} operators compatible with ${targetVersion} · ${planProfile.compatRequired} operators must be updated first`,
      },
      { label: "API Deprecations", status: "done", detail: "No deprecated APIs in use" },
      { label: "Custom Resources", status: "done", detail: "All CRDs compatible with new version" },
      {
        label: "Risk Assessment",
        status: "done",
        badge: planProfile.riskLabel.includes("Moderate") ? "MEDIUM" : "LOW",
        badgeColor: planProfile.riskLabel.includes("Moderate") ? "#f0ab00" : "#3e8635",
        detail: planProfile.riskDetail,
      },
      { label: "Maintenance Window", status: "done", badge: "IDENTIFIED", badgeColor: "#3e8635", detail: `Optimal window: ${maintenanceWindowLine} (minimal cluster traffic)` },
      { label: "Awaiting Decision", status: "pending", badge: "PENDING", badgeColor: "#f0ab00", detail: "Plan ready — approve, schedule for later, or reject below" },
    ],
    [targetVersion, selectedChannel, maintenanceWindowLine, planProfile]
  );

  const healthChecks = useMemo(
    () => [
      { label: "Cluster Health", detail: "All operators available", ok: true },
      { label: "Node Status", detail: "6/6 nodes ready", ok: true },
      { label: "Storage", detail: planProfile.storageDetail, ok: true },
      { label: "Network", detail: "All pods reachable", ok: true },
    ],
    [planProfile.storageDetail]
  );

  const confirmApproveAndStart = () => {
    if (!approveAcknowledged) return;
    recordApproval();
    localStorage.setItem("clusterUpdateInProgress", JSON.stringify({ version: selectedVersion, startedAt: Date.now() }));
    setShowApproveModal(false);
    navigate("/administration/cluster-update/in-progress", { state: { version: selectedVersion } });
  };

  const confirmRejectPlan = () => {
    if (!rejectAcknowledged) return;
    setPlanDecision("rejected");
    setShowRejectModal(false);
  };

  const confirmScheduleWindow = () => {
    const line = formatAgentScheduleLine(scheduleDate, scheduleTime, scheduleTzLabel);
    setScheduledWindowLine(line);
    setMaintenanceWindowLine(line);
    setPlanDecision("scheduled");
    setShowScheduleModal(false);
  };

  const applySchedulePreset = (date: string, time: string, tz: string) => {
    setScheduleDate(date);
    setScheduleTime(time);
    setScheduleTzLabel(tz);
  };

  return (
    <>
    <div className="space-y-[24px]">
      <div className="bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(255,255,255,0.05)] rounded-[16px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.06)] p-[24px] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)]">
        <div className="mb-[20px]">
          <div className="flex items-center gap-[12px]">
            <div className="size-[40px] rounded-[10px] bg-[#f0f0f0] dark:bg-[rgba(255,255,255,0.08)] flex items-center justify-center">
              <Bot className="size-[22px] text-[#151515] dark:text-white" />
            </div>
            <div>
              <h2 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[18px]">AI Update Agent</h2>
              <p className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">
                Activity summary and the current proposed plan · {selectedChannel} channel
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-[8px] border border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] px-[14px] py-[12px] mb-[16px] flex flex-col gap-[8px] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[12px] text-[#6a6e73] dark:text-[#8a8d90] font-['Red_Hat_Text:Regular',sans-serif] mb-[4px]">Agent target version</p>
            <p className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">
              Pick a target from your channel (updates AI Assessment), then click <span className="text-[#151515] dark:text-white font-medium">Generate plan</span> to build or refresh the proposed update below.
            </p>
          </div>
          <div className="flex flex-col gap-[10px] sm:flex-row sm:items-end sm:gap-[12px] shrink-0 w-full sm:w-auto">
            <label className="flex flex-col gap-[4px] flex-1 min-w-0 sm:min-w-[200px]">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#6a6e73] dark:text-[#8a8d90] font-['Red_Hat_Text:Regular',sans-serif]">Target version</span>
              <select
                value={selectedVersion}
                disabled={isPlanLoading}
                onChange={(e) => onSelectedVersionChange(e.target.value)}
                className="w-full rounded-[6px] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] bg-white dark:bg-[#1a1a1a] text-[#151515] dark:text-white text-[14px] px-[12px] py-[8px] font-['Red_Hat_Text:Regular',sans-serif] disabled:opacity-60"
              >
                {versionOptions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              {planDiffersFromSelection && !isPlanLoading && (
                <span className="text-[11px] text-[#795600] dark:text-[#f0ab00] font-['Red_Hat_Text:Regular',sans-serif]">
                  Selection differs from the plan shown — generate to update.
                </span>
              )}
            </label>
            <button
              type="button"
              onClick={runGeneratePlan}
              disabled={isPlanLoading}
              className="flex items-center justify-center gap-[6px] shrink-0 bg-[var(--pf-color-blue-50)] hover:bg-[var(--pf-color-blue-60)] dark:bg-[var(--pf-color-blue-50)] dark:hover:bg-[var(--pf-color-blue-60)] text-white !text-white [&_svg]:text-white text-[14px] px-[20px] py-[9px] rounded-[999px] border-0 cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPlanLoading ? (
                <>
                  <Loader2 className="size-[14px] animate-spin" aria-hidden /> Generating…
                </>
              ) : (
                <>
                  <RefreshCw className="size-[14px]" aria-hidden /> Generate plan
                </>
              )}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[12px]">
          {stats.map(s => (
            <div key={s.label} className="rounded-[8px] bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] px-[16px] py-[14px]">
              <p className="text-[12px] text-[#6a6e73] dark:text-[#8a8d90] font-['Red_Hat_Text:Regular',sans-serif] mb-[4px]">{s.label}</p>
              <p className="text-[22px] font-semibold text-[#151515] dark:text-white font-['Red_Hat_Display:SemiBold',sans-serif]">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(255,255,255,0.05)] rounded-[16px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.06)] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] overflow-hidden relative">
        {isPlanLoading && (
          <div
            className="absolute inset-0 z-[20] flex flex-col items-center justify-center gap-[12px] bg-white/90 dark:bg-[#1a1a1a]/92 backdrop-blur-[2px]"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <Loader2 className="size-[32px] animate-spin text-[#0066cc] dark:text-[#4dabf7]" aria-hidden />
            <p className="text-[14px] font-medium text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif] px-[16px] text-center">
              Generating plan for <span className="font-mono font-semibold">{selectedVersion}</span>…
            </p>
            <p className="text-[12px] text-[#6a6e73] dark:text-[#8a8d90] font-['Red_Hat_Text:Regular',sans-serif]">Recomputing steps, risk, and maintenance window</p>
          </div>
        )}
        <div className="px-[24px] py-[16px] border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] flex items-center justify-between">
          <div>
            <p className="text-[12px] text-[#6a6e73] dark:text-[#8a8d90] font-['Red_Hat_Text:Regular',sans-serif] mb-[4px]">
              PLAN #{planSerial} · Generated {planAgeLabel}
            </p>
            <p className="text-[16px] font-semibold text-[#151515] dark:text-white font-['Red_Hat_Display:SemiBold',sans-serif]">
              Proposed Update: {AGENT_CLUSTER_CURRENT_VERSION} → {targetVersion}
            </p>
            <div className="flex flex-wrap gap-[6px] mt-[8px]">
              {planProfile.tags.map(tag => (
                <span key={tag} className="text-[11px] px-[8px] py-[3px] rounded-[999px] bg-[rgba(0,102,204,0.08)] text-[#0066cc] dark:bg-[rgba(77,171,247,0.12)] dark:text-[#4dabf7] font-['Red_Hat_Text:Regular',sans-serif] font-medium flex items-center gap-[4px]">
                  <Shield className="size-[10px]" /> {tag}
                </span>
              ))}
            </div>
          </div>
          {planDecision === "pending" ? (
            <div className="shrink-0 text-right sm:max-w-[220px]">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6a6e73] dark:text-[#8a8d90] font-['Red_Hat_Text:Regular',sans-serif] mb-[4px]">
                Prerequisites
              </p>
              <p className="text-[13px] text-[#151515] dark:text-white font-medium font-['Red_Hat_Text:Regular',sans-serif] leading-[18px]">
                {planProfile.compatRequired > 0 ? (
                  <>
                    {planProfile.compatRequired} operator {planProfile.compatRequired === 1 ? "update" : "updates"} required before this cluster upgrade
                  </>
                ) : (
                  <>No operator blockers — review steps below to approve or schedule</>
                )}
              </p>
            </div>
          ) : (
            <span
              className={`shrink-0 text-[12px] font-semibold px-[12px] py-[5px] rounded-[999px] border ${
                planDecision === "rejected"
                  ? "border-[#c9190b] text-[#c9190b] bg-[rgba(201,25,11,0.05)]"
                  : "border-[#0066cc] text-[#0066cc] bg-[rgba(0,102,204,0.05)]"
              }`}
            >
              {planDecision === "rejected" ? "Rejected" : "Scheduled"}
            </span>
          )}
        </div>

        <div className="px-[24px] py-[20px] space-y-[0px]">
          {steps.map((step, i) => (
            <div key={i}>
              <button
                onClick={() => toggleStep(i)}
                className="flex items-center gap-[10px] w-full text-left bg-transparent border-0 cursor-pointer py-[12px] px-0 hover:opacity-80 transition-opacity"
              >
                <StepIcon status={step.status} />
                <span className="text-[14px] font-medium text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">{step.label}</span>
                {step.badge && <BadgeLabel text={step.badge} color={step.badgeColor!} />}
                <span className="flex-1" />
                {expandedSteps.has(i)
                  ? <ChevronDown className="size-[14px] text-[#6a6e73]" />
                  : <ChevronRight className="size-[14px] text-[#6a6e73]" />}
              </button>
              <p className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] ml-[30px] -mt-[6px] mb-[8px]">{step.detail}</p>

              {expandedSteps.has(i) && i === 1 && (
                <div className="ml-[30px] mb-[12px] grid grid-cols-2 gap-[10px]">
                  {healthChecks.map(h => (
                    <div key={h.label} className="flex items-center gap-[8px] rounded-[8px] border border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] px-[14px] py-[10px]">
                      <CheckCircle className="size-[16px] text-[#3e8635] shrink-0" />
                      <div>
                        <p className="text-[13px] font-medium text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">{h.label}</p>
                        <p className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">{h.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {expandedSteps.has(i) && i === 2 && (
                <div className="ml-[30px] mb-[12px]">
                  <div className="rounded-[8px] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.1)] overflow-hidden bg-white dark:bg-transparent">
                    <div className="flex items-center justify-between px-[16px] py-[10px] bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] border-b border-[#d2d2d2] dark:border-[rgba(255,255,255,0.1)]">
                      <div className="flex items-center gap-[6px]">
                        <AlertTriangle className="size-[14px] text-[#f0ab00]" />
                        <span className="text-[13px] font-medium text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">Operator compatibility</span>
                      </div>
                      <div className="flex gap-[6px]">
                        <span className="text-[11px] px-[8px] py-[2px] rounded-[999px] bg-[rgba(62,134,53,0.1)] text-[#3e8635] font-semibold">{planProfile.compatCompatible} compatible</span>
                        <span className="text-[11px] px-[8px] py-[2px] rounded-[999px] bg-[rgba(240,171,0,0.1)] text-[#795600] font-semibold">{planProfile.compatRequired} require update</span>
                      </div>
                    </div>
                    <p className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] px-[16px] py-[10px] border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] bg-[#fafafa] dark:bg-[rgba(255,255,255,0.02)]">
                      {planProfile.compatRequired} operators must be updated before upgrading to {targetVersion}
                    </p>
                    <table className="w-full text-[13px] font-['Red_Hat_Text:Regular',sans-serif] border-collapse">
                      <thead>
                        <tr className="bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] border-b border-[#d2d2d2] dark:border-[rgba(255,255,255,0.1)] text-left">
                          <th className="pl-[16px] pr-[16px] py-[10px] text-[12px] font-medium text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">Operator</th>
                          <th className="px-[16px] py-[10px] text-[12px] font-medium text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">Current</th>
                          <th className="px-[16px] py-[10px] text-[12px] font-medium text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">Required version</th>
                          <th className="px-[16px] py-[10px] text-[12px] font-medium text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">OCP {targetVersion} compat.</th>
                          <th className="pl-[16px] pr-[16px] py-[10px] text-[12px] font-medium text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">Action needed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {AGENT_OPERATORS.map(op => (
                          <tr key={op.name} className="border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] last:border-0 hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                            <td className="pl-[16px] pr-[16px] py-[12px] align-top">
                              <span className={`font-medium ${!op.compatible ? "text-[#c9190b]" : "text-[#151515] dark:text-white"}`}>
                                {!op.compatible && <span className="mr-[4px]">●</span>}{op.name}
                              </span>
                            </td>
                            <td className="px-[16px] py-[12px] font-mono text-[#4d4d4d] dark:text-[#b0b0b0] align-top">{op.current}</td>
                            <td className="px-[16px] py-[12px] align-top">
                              {op.required ? (
                                <span className={`font-mono font-semibold ${!op.compatible ? "text-[#c9190b]" : "text-[#151515] dark:text-white"}`}>{op.required}</span>
                              ) : (
                                <span className="text-[#6a6e73]">–</span>
                              )}
                            </td>
                            <td className="px-[16px] py-[12px] align-top">
                              {op.compatible ? (
                                <span className="inline-flex items-center gap-[4px] text-[12px] text-[#3e8635]"><CheckCircle className="size-[12px]" /> Compatible</span>
                              ) : (
                                <span className="inline-flex items-center gap-[4px] text-[12px] text-[#f0ab00]"><AlertTriangle className="size-[12px]" /> Incompatible at {op.incompatibleAt}</span>
                              )}
                            </td>
                            <td className="pl-[16px] pr-[16px] py-[12px] align-top">
                              {op.action === "required" ? (
                                <span className="text-[11px] font-semibold px-[10px] py-[3px] rounded-[999px] bg-[#f0ab00] text-white">Update required before OCP upgrade</span>
                              ) : op.action === "optional" ? (
                                <span className="text-[11px] font-semibold px-[10px] py-[3px] rounded-[999px] border border-[#3e8635] text-[#3e8635]">Update available (optional)</span>
                              ) : (
                                <span className="text-[12px] text-[#6a6e73]">Up to date</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {i < steps.length - 1 && <div className="ml-[10px] w-[1px] h-[8px] bg-[#d2d2d2] dark:bg-[rgba(255,255,255,0.1)]" />}
            </div>
          ))}
        </div>

        <div className="border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] px-[24px] py-[16px]">
          <div className="grid grid-cols-3 gap-[24px] mb-[16px]">
            <div>
              <p className="text-[12px] text-[#6a6e73] dark:text-[#8a8d90] font-['Red_Hat_Text:Regular',sans-serif] mb-[2px]">Maintenance Window</p>
              <p className="text-[14px] font-medium text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">
                {planDecision === "scheduled" && scheduledWindowLine ? scheduledWindowLine : maintenanceWindowLine}
              </p>
            </div>
            <div>
              <p className="text-[12px] text-[#6a6e73] dark:text-[#8a8d90] font-['Red_Hat_Text:Regular',sans-serif] mb-[2px]">Estimated Duration</p>
              <p className="text-[14px] font-medium text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">{planProfile.durationRange}</p>
            </div>
            <div>
              <p className="text-[12px] text-[#6a6e73] dark:text-[#8a8d90] font-['Red_Hat_Text:Regular',sans-serif] mb-[2px]">Rolling Strategy</p>
              <p className="text-[14px] font-medium text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">{planProfile.rollingStrategy}</p>
            </div>
          </div>

          <div className="mb-[20px]">
            <p className="text-[12px] text-[#6a6e73] dark:text-[#8a8d90] font-['Red_Hat_Text:Regular',sans-serif] mb-[6px]">AI Risk Score</p>
            <div className="flex items-center gap-[12px]">
              <div className="flex-1 h-[8px] bg-[#e0e0e0] dark:bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${planProfile.riskBarPct}%`, backgroundColor: planProfile.riskBarColor }} />
              </div>
              <span className="text-[13px] font-medium font-['Red_Hat_Text:Regular',sans-serif] whitespace-nowrap" style={{ color: planProfile.riskBarColor }}>{planProfile.riskLabel}</span>
            </div>
          </div>

          {planDecision === "pending" && (
            <div className="flex flex-wrap items-center gap-[10px]">
              <button
                type="button"
                disabled={isPlanLoading}
                onClick={() => {
                  setApproveAcknowledged(false);
                  setShowApproveModal(true);
                }}
                className="flex items-center gap-[6px] bg-[var(--pf-color-blue-50)] hover:bg-[var(--pf-color-blue-60)] dark:bg-[var(--pf-color-blue-50)] dark:hover:bg-[var(--pf-color-blue-60)] text-white !text-white [&_svg]:text-white text-[14px] px-[20px] py-[9px] rounded-[999px] border-0 cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Check className="size-[14px]" aria-hidden /> Approve plan
              </button>
              <button
                type="button"
                disabled={isPlanLoading}
                onClick={() => {
                  setScheduleDate("2026-04-15");
                  setScheduleTime("02:00");
                  setScheduleTzLabel("Eastern Time (ET)");
                  setShowScheduleModal(true);
                }}
                className="flex items-center gap-[6px] bg-transparent hover:bg-[rgba(0,102,204,0.05)] dark:hover:bg-[rgba(0,102,204,0.12)] text-[var(--pf-color-blue-50)] text-[14px] px-[16px] py-[9px] rounded-[999px] border border-[var(--pf-color-blue-50)] cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Calendar className="size-[14px] shrink-0 text-[var(--pf-color-blue-50)]" aria-hidden /> Schedule for later
              </button>
              <button
                type="button"
                disabled={isPlanLoading}
                onClick={() => {
                  setRejectAcknowledged(false);
                  setShowRejectModal(true);
                }}
                className="flex items-center gap-[6px] bg-transparent text-[#c9190b] text-[14px] px-[20px] py-[9px] rounded-[999px] border border-[#c9190b] cursor-pointer hover:bg-[rgba(201,25,11,0.05)] transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <X className="size-[14px]" aria-hidden /> Reject plan
              </button>
            </div>
          )}
          {planDecision === "scheduled" && (
            <div className="flex items-center gap-[10px] rounded-[8px] bg-[rgba(0,102,204,0.05)] border border-[#0066cc] p-[14px]">
              <Calendar className="size-[18px] text-[#0066cc] shrink-0" />
              <div>
                <p className="text-[14px] font-medium text-[#0066cc] font-['Red_Hat_Text:Regular',sans-serif]">Scheduled for later</p>
                <p className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">
                  Update window: <span className="text-[#151515] dark:text-white font-medium">{scheduledWindowLine ?? maintenanceWindowLine}</span>.
                  The agent will re-analyze before that window and remind you to confirm execution.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPlanDecision("pending");
                  setScheduledWindowLine(null);
                  setMaintenanceWindowLine(getAgentPlanProfile(activePlanVersion).defaultMaintenance);
                }}
                className="ml-auto text-[12px] text-[#0066cc] dark:text-[#4dabf7] bg-transparent border-0 cursor-pointer hover:underline font-['Red_Hat_Text:Regular',sans-serif]"
              >
                Undo
              </button>
            </div>
          )}
          {planDecision === "rejected" && (
            <div className="flex flex-col gap-[12px] rounded-[8px] bg-[rgba(201,25,11,0.05)] border border-[#c9190b] p-[14px] sm:flex-row sm:items-center">
              <div className="flex items-start gap-[10px] flex-1 min-w-0">
                <X className="size-[18px] text-[#c9190b] shrink-0 mt-[2px]" aria-hidden />
                <div className="min-w-0">
                <p className="text-[14px] font-medium text-[#c9190b] font-['Red_Hat_Text:Regular',sans-serif]">Plan rejected</p>
                <p className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">
                  Generate a new plan for your chosen target version, or adjust the target above and run again.
                </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-[8px] shrink-0 sm:ml-auto sm:pl-[28px]">
                <button
                  type="button"
                  onClick={runGeneratePlan}
                  className="flex items-center gap-[6px] bg-[var(--pf-color-blue-50)] hover:bg-[var(--pf-color-blue-60)] dark:bg-[var(--pf-color-blue-50)] dark:hover:bg-[var(--pf-color-blue-60)] text-white !text-white [&_svg]:text-white text-[13px] px-[16px] py-[8px] rounded-[999px] border-0 cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={isPlanLoading}
                >
                  <RefreshCw className="size-[14px]" aria-hidden /> Generate new plan
                </button>
                <button
                  type="button"
                  onClick={() => setPlanDecision("pending")}
                  className="text-[12px] text-[#0066cc] dark:text-[#4dabf7] bg-transparent border-0 cursor-pointer hover:underline font-['Red_Hat_Text:Regular',sans-serif] px-[4px]"
                >
                  Undo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

      {showApproveModal && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-[16px]" onClick={() => setShowApproveModal(false)}>
          <div
            className="bg-white dark:bg-[#1a1a1a] rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.2)] max-w-[520px] w-full"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="agent-approve-title"
          >
            <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)]">
              <h3 id="agent-approve-title" className="text-[16px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white">
                Approve and start update
              </h3>
              <button type="button" onClick={() => setShowApproveModal(false)} className="bg-transparent border-0 cursor-pointer text-[#6a6e73] hover:text-[#151515] dark:hover:text-white p-[4px]" aria-label="Close">
                <X className="size-[16px]" />
              </button>
            </div>
            <div className="px-[24px] py-[16px] space-y-[12px]">
              <p className="text-[14px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">
                You are about to approve the agent plan and <span className="font-medium">start the cluster update</span> from{" "}
                <span className="font-mono font-semibold">{AGENT_CLUSTER_CURRENT_VERSION}</span> to{" "}
                <span className="font-mono font-semibold">{selectedVersion}</span> on channel <span className="font-medium">{selectedChannel}</span>.
              </p>
              <p className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">
                The console will open the in-progress update experience. Ensure maintenance is communicated and workloads are ready.
              </p>
              <label className="flex items-start gap-[10px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={approveAcknowledged}
                  onChange={(e) => setApproveAcknowledged(e.target.checked)}
                  className="mt-[3px] size-[16px] shrink-0 accent-[#0066cc]"
                />
                <span className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">
                  I have reviewed this plan and authorize the cluster update to proceed for target version {selectedVersion}.
                </span>
              </label>
            </div>
            <div className="flex items-center justify-end gap-[10px] px-[24px] py-[16px] border-t border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)]">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="text-[14px] px-[16px] py-[8px] rounded-[999px] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] bg-transparent text-[#151515] dark:text-white cursor-pointer hover:bg-[rgba(0,0,0,0.03)] transition-colors font-['Red_Hat_Text:Regular',sans-serif]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!approveAcknowledged}
                onClick={confirmApproveAndStart}
                className="flex items-center gap-[6px] text-[14px] px-[16px] py-[8px] rounded-[999px] border-0 bg-[var(--pf-color-blue-50)] hover:bg-[var(--pf-color-blue-60)] dark:bg-[var(--pf-color-blue-50)] dark:hover:bg-[var(--pf-color-blue-60)] text-white !text-white [&_svg]:text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium"
              >
                <Play className="size-[14px]" aria-hidden /> Start update
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showRejectModal && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-[16px]" onClick={() => setShowRejectModal(false)}>
          <div
            className="bg-white dark:bg-[#1a1a1a] rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.2)] max-w-[480px] w-full"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="agent-reject-title"
          >
            <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)]">
              <h3 id="agent-reject-title" className="text-[16px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#c9190b]">
                Reject this plan?
              </h3>
              <button type="button" onClick={() => setShowRejectModal(false)} className="bg-transparent border-0 cursor-pointer text-[#6a6e73] hover:text-[#151515] dark:hover:text-white p-[4px]" aria-label="Close">
                <X className="size-[16px]" />
              </button>
            </div>
            <div className="px-[24px] py-[16px] space-y-[12px]">
              <p className="text-[14px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">
                Rejecting stops this proposed update for <span className="font-mono font-semibold">{selectedVersion}</span>. No changes will be applied until you approve a new plan.
              </p>
              <label className="flex items-start gap-[10px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rejectAcknowledged}
                  onChange={(e) => setRejectAcknowledged(e.target.checked)}
                  className="mt-[3px] size-[16px] shrink-0 accent-[#0066cc]"
                />
                <span className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text:Regular',sans-serif]">
                  I understand this plan will be rejected and no update will run for this approval request.
                </span>
              </label>
            </div>
            <div className="flex items-center justify-end gap-[10px] px-[24px] py-[16px] border-t border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)]">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="text-[14px] px-[16px] py-[8px] rounded-[999px] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] bg-transparent text-[#151515] dark:text-white cursor-pointer hover:bg-[rgba(0,0,0,0.03)] transition-colors font-['Red_Hat_Text:Regular',sans-serif]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectAcknowledged}
                onClick={confirmRejectPlan}
                className="text-[14px] px-[16px] py-[8px] rounded-[999px] border border-[#c9190b] text-[#c9190b] hover:bg-[rgba(201,25,11,0.06)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium"
              >
                Reject plan
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showScheduleModal && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-[16px]" onClick={() => setShowScheduleModal(false)}>
          <div
            className="bg-white dark:bg-[#1a1a1a] rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.2)] max-w-[520px] w-full max-h-[90vh] overflow-y-auto"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="agent-schedule-title"
          >
            <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)]">
              <h3 id="agent-schedule-title" className="text-[16px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white">
                Schedule update window
              </h3>
              <button type="button" onClick={() => setShowScheduleModal(false)} className="bg-transparent border-0 cursor-pointer text-[#6a6e73] hover:text-[#151515] dark:hover:text-white p-[4px]" aria-label="Close">
                <X className="size-[16px]" />
              </button>
            </div>
            <div className="px-[24px] py-[16px] space-y-[16px]">
              <p className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">
                Choose when the agent should target execution. You can pick a preset or set a custom date and time.
              </p>
              <div className="flex flex-wrap gap-[8px]">
                <button
                  type="button"
                  onClick={() => applySchedulePreset("2026-04-15", "02:00", "Eastern Time (ET)")}
                  className="text-[12px] px-[12px] py-[6px] rounded-[999px] border border-[#0066cc] dark:border-[#4dabf7] text-[#0066cc] dark:text-[#4dabf7] bg-transparent hover:bg-[rgba(0,102,204,0.06)] font-['Red_Hat_Text:Regular',sans-serif]"
                >
                  Agent recommendation
                </button>
                <button
                  type="button"
                  onClick={() => applySchedulePreset("2026-04-12", "23:00", "Eastern Time (ET)")}
                  className="text-[12px] px-[12px] py-[6px] rounded-[999px] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] text-[#151515] dark:text-white bg-transparent hover:bg-[rgba(0,0,0,0.04)] font-['Red_Hat_Text:Regular',sans-serif]"
                >
                  This weekend · 11:00 PM
                </button>
                <button
                  type="button"
                  onClick={() => applySchedulePreset("2026-04-18", "06:00", "UTC")}
                  className="text-[12px] px-[12px] py-[6px] rounded-[999px] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] text-[#151515] dark:text-white bg-transparent hover:bg-[rgba(0,0,0,0.04)] font-['Red_Hat_Text:Regular',sans-serif]"
                >
                  Next week · 6:00 AM UTC
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
                <label className="flex flex-col gap-[4px]">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#6a6e73] dark:text-[#8a8d90] font-['Red_Hat_Text:Regular',sans-serif]">Date</span>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="rounded-[6px] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] bg-white dark:bg-[#1a1a1a] text-[#151515] dark:text-white text-[14px] px-[10px] py-[8px] font-['Red_Hat_Text:Regular',sans-serif]"
                  />
                </label>
                <label className="flex flex-col gap-[4px]">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#6a6e73] dark:text-[#8a8d90] font-['Red_Hat_Text:Regular',sans-serif]">Time</span>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="rounded-[6px] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] bg-white dark:bg-[#1a1a1a] text-[#151515] dark:text-white text-[14px] px-[10px] py-[8px] font-['Red_Hat_Text:Regular',sans-serif]"
                  />
                </label>
              </div>
              <label className="flex flex-col gap-[4px]">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[#6a6e73] dark:text-[#8a8d90] font-['Red_Hat_Text:Regular',sans-serif]">Timezone</span>
                <select
                  value={scheduleTzLabel}
                  onChange={(e) => setScheduleTzLabel(e.target.value)}
                  className="rounded-[6px] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] bg-white dark:bg-[#1a1a1a] text-[#151515] dark:text-white text-[14px] px-[10px] py-[8px] font-['Red_Hat_Text:Regular',sans-serif]"
                >
                  <option>Eastern Time (ET)</option>
                  <option>Central Time (CT)</option>
                  <option>Pacific Time (PT)</option>
                  <option>UTC</option>
                </select>
              </label>
              <p className="text-[12px] text-[#6a6e73] dark:text-[#8a8d90] font-['Red_Hat_Text:Regular',sans-serif]">
                Preview: <span className="text-[#151515] dark:text-white font-medium">{formatAgentScheduleLine(scheduleDate, scheduleTime, scheduleTzLabel)}</span>
              </p>
            </div>
            <div className="flex items-center justify-end gap-[10px] px-[24px] py-[16px] border-t border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)]">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="text-[14px] px-[16px] py-[8px] rounded-[999px] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] bg-transparent text-[#151515] dark:text-white cursor-pointer hover:bg-[rgba(0,0,0,0.03)] transition-colors font-['Red_Hat_Text:Regular',sans-serif]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmScheduleWindow}
                className="flex items-center gap-[6px] text-[14px] px-[16px] py-[8px] rounded-[999px] border-0 bg-[var(--pf-color-blue-50)] hover:bg-[var(--pf-color-blue-60)] dark:bg-[var(--pf-color-blue-50)] dark:hover:bg-[var(--pf-color-blue-60)] text-white !text-white [&_svg]:text-white cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium"
              >
                <Calendar className="size-[14px]" aria-hidden /> Save schedule
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

/* ─── Operators on this cluster ─── */
function OperatorsOnClusterSection({ selectedVersion, operators, navigate }: { selectedVersion: string; operators: InstalledOperator[]; navigate: ReturnType<typeof useNavigate> }) {
  const [updateAll, setUpdateAll] = useState(false);

  return (
    <div className="rounded-[16px] border border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] p-[24px] mb-[16px]">
      <h2 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[18px] mb-[16px]">Operators on this cluster</h2>

      <div className="rounded-[8px] border border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] overflow-hidden">
        <table className="w-full text-[13px] font-['Red_Hat_Text:Regular',sans-serif]">
          <thead>
            <tr className="border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-left text-[11px] text-[#6a6e73] dark:text-[#8a8d90] uppercase tracking-wide">
              <th className="px-[16px] py-[10px] font-medium">Name</th>
              <th className="px-[16px] py-[10px] font-medium">Status</th>
              <th className="px-[16px] py-[10px] font-medium">Version</th>
              <th className="px-[16px] py-[10px] font-medium">Cluster compatibility</th>
              <th className="px-[16px] py-[10px] font-medium">Last updated</th>
            </tr>
          </thead>
          <tbody>
            {operators.slice(0, 8).map((op) => {
              const compat = getOperatorCompatibility(op, selectedVersion);
              return (
                <tr key={op.name} className="border-b border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.05)] hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <td className="px-[16px] py-[10px]">
                    <button onClick={() => navigate(`/ecosystem/installed-operators/${encodeURIComponent(op.name)}`)} className="text-[#0066cc] dark:text-[#4dabf7] bg-transparent border-0 cursor-pointer p-0 hover:underline font-medium text-[13px] font-['Red_Hat_Text:Regular',sans-serif]">
                      {op.name}
                    </button>
                  </td>
                  <td className="px-[16px] py-[10px]">
                    <span className={`inline-flex items-center gap-[4px] text-[12px] ${op.updateAvailable ? "text-[#0066cc]" : "text-[#3e8635]"}`}>
                      {op.updateAvailable ? <><ArrowRight className="size-[12px]" /> Update available</> : <><CheckCircle className="size-[12px]" /> Up to date</>}
                    </span>
                  </td>
                  <td className="px-[16px] py-[10px] font-mono text-[#4d4d4d] dark:text-[#b0b0b0]">{op.version}</td>
                  <td className="px-[16px] py-[10px]">
                    <span className={`text-[12px] ${compat.compatibility === "Compatible" ? "text-[#3e8635]" : compat.compatibility === "Incompatible" ? "text-[#c9190b]" : "text-[#795600]"}`}>
                      {compat.compatibility}
                    </span>
                  </td>
                  <td className="px-[16px] py-[10px] text-[#4d4d4d] dark:text-[#b0b0b0]">{op.lastUpdated || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {operators.length > 8 && (
        <button onClick={() => navigate("/ecosystem/installed-operators")}
          className="mt-[12px] text-[13px] text-[#0066cc] dark:text-[#4dabf7] bg-transparent border-0 cursor-pointer hover:underline font-['Red_Hat_Text:Regular',sans-serif] font-medium">
          View all {operators.length} operators →
        </button>
      )}

      <div className="flex items-center gap-[8px] mt-[16px] pt-[16px] border-t border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)]">
        <button onClick={() => setUpdateAll(!updateAll)}
          className={`relative w-[36px] h-[20px] rounded-full border-0 cursor-pointer transition-colors ${updateAll ? "bg-[#0066cc]" : "bg-[#8a8d90]"}`}>
          <div className={`absolute top-[2px] size-[16px] rounded-full bg-white transition-transform ${updateAll ? "left-[18px]" : "left-[2px]"}`} />
        </button>
        <span className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[13px] font-['Red_Hat_Text:Regular',sans-serif]">Update all operators</span>
      </div>
    </div>
  );
}

/* ─── Worker Nodes on this cluster ─── */
const WORKER_NODE_POOLS = [
  { pool: "worker", status: "Update required", version: "5.0.0", targetVersion: "5.1.10", compatibility: "compatible" as const, nodes: 4, readyNodes: 4 },
  { pool: "infra", status: "Up to date", version: "5.0.0", targetVersion: null, compatibility: "compatible" as const, nodes: 2, readyNodes: 2 },
];

function WorkerNodesSection() {
  const [sectionExpanded, setSectionExpanded] = useState(true);
  const [updateAll, setUpdateAll] = useState(false);
  const poolsNeedingUpdate = WORKER_NODE_POOLS.filter(p => p.status === "Update required").length;

  return (
    <div className="rounded-[16px] border border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] p-[24px] mb-[16px]">
      <button onClick={() => setSectionExpanded(!sectionExpanded)}
        className="flex items-center gap-[8px] bg-transparent border-0 cursor-pointer p-0 hover:opacity-80 transition-opacity w-full text-left">
        {sectionExpanded ? <ChevronDown className="size-[16px] text-[#151515] dark:text-white" /> : <ChevronRight className="size-[16px] text-[#151515] dark:text-white" />}
        <h2 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[18px]">Worker nodes on this cluster</h2>
      </button>

      {sectionExpanded && <div className="mt-[16px]">
      {poolsNeedingUpdate > 0 && (
        <div className="flex items-center gap-[8px] bg-[#fdf7e7] dark:bg-[rgba(240,171,0,0.06)] border border-[#f0ab00] rounded-[8px] px-[14px] py-[10px] mb-[16px]">
          <AlertTriangle className="size-[16px] text-[#f0ab00] shrink-0" />
          <p className="text-[13px] text-[#795600] dark:text-[#dca614] font-['Red_Hat_Text:Regular',sans-serif]">
            {poolsNeedingUpdate} node pool{poolsNeedingUpdate !== 1 ? "s" : ""} require{poolsNeedingUpdate === 1 ? "s" : ""} an update
          </p>
        </div>
      )}

      <div className="rounded-[8px] border border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] overflow-hidden">
        <table className="w-full text-[13px] font-['Red_Hat_Text:Regular',sans-serif]">
          <thead>
            <tr className="border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-left text-[11px] text-[#6a6e73] dark:text-[#8a8d90] uppercase tracking-wide">
              <th className="px-[16px] py-[10px] font-medium">Pool</th>
              <th className="px-[16px] py-[10px] font-medium">Status</th>
              <th className="px-[16px] py-[10px] font-medium">Version</th>
              <th className="px-[16px] py-[10px] font-medium">Nodes</th>
              <th className="px-[16px] py-[10px] font-medium">Cluster compatibility</th>
            </tr>
          </thead>
          <tbody>
            {WORKER_NODE_POOLS.map((pool) => (
              <tr key={pool.pool} className="border-b border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.05)] last:border-0 hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <td className="px-[16px] py-[10px] font-medium text-[#151515] dark:text-white">{pool.pool}</td>
                <td className="px-[16px] py-[10px]">
                  <span className={`inline-flex items-center gap-[4px] text-[12px] ${pool.status === "Update required" ? "text-[#f0ab00]" : "text-[#3e8635]"}`}>
                    {pool.status === "Update required" ? <><AlertTriangle className="size-[12px]" /> {pool.status}</> : <><CheckCircle className="size-[12px]" /> {pool.status}</>}
                  </span>
                </td>
                <td className="px-[16px] py-[10px] font-mono text-[#4d4d4d] dark:text-[#b0b0b0]">{pool.version}</td>
                <td className="px-[16px] py-[10px] text-[#4d4d4d] dark:text-[#b0b0b0]">{pool.readyNodes}/{pool.nodes} ready</td>
                <td className="px-[16px] py-[10px]">
                  <span className="text-[12px] text-[#3e8635]">Compatible</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-[8px] mt-[16px] pt-[16px] border-t border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)]">
        <button onClick={() => setUpdateAll(!updateAll)}
          className={`relative w-[36px] h-[20px] rounded-full border-0 cursor-pointer transition-colors ${updateAll ? "bg-[#0066cc]" : "bg-[#8a8d90]"}`}>
          <div className={`absolute top-[2px] size-[16px] rounded-full bg-white transition-transform ${updateAll ? "left-[18px]" : "left-[2px]"}`} />
        </button>
        <span className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[13px] font-['Red_Hat_Text:Regular',sans-serif]">Update all worker nodes</span>
      </div>
      </div>}
    </div>
  );
}

/** Older minor / z-stream lines (e.g. 5.0) alongside a blocked newer minor — show bugfix-path hint. */
function shouldShowBugfixPathCallout(groups: VersionGroup[]): boolean {
  const hasOlderMinor = groups.some(
    (g) => g.label === "5.0" || g.label.startsWith("5.0 ") || /^4\.\d+/.test(g.label)
  );
  if (!hasOlderMinor) return false;
  return groups.some((g) =>
    g.versions.some((v) =>
      (v.operatorIssues ?? []).some(
        (i) =>
          i.slug === "ClusterLoggingMaxVersion" ||
          i.name === "ClusterLoggingMaxVersion" ||
          /maximum supported OCP version is 5\.0/i.test(i.message ?? "")
      )
    )
  );
}

/* ─── Available Updates Section ─── */
export function AvailableUpdatesSection({
  channelData,
  expandedGroups, setExpandedGroups,
  selectedVersion, setSelectedVersion, navigate, setActiveTab, openChatbot,
  selectedChannel, handleChannelChange,
}: any) {
  const [sectionExpanded, setSectionExpanded] = useState(true);
  const groups = channelData.groups as VersionGroup[];
  const showBugfixHint = shouldShowBugfixPathCallout(groups);

  return (
    <div className="rounded-[16px] border border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] p-[24px] mb-[16px]">
      <button onClick={() => setSectionExpanded(!sectionExpanded)}
        className="flex items-center gap-[8px] bg-transparent border-0 cursor-pointer p-0 hover:opacity-80 transition-opacity w-full text-left">
        {sectionExpanded ? <ChevronDown className="size-[16px] text-[#151515] dark:text-white" /> : <ChevronRight className="size-[16px] text-[#151515] dark:text-white" />}
        <h2 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[18px]">Available Updates</h2>
        <InfoTooltip />
      </button>

      {sectionExpanded && <div className="mt-[16px]">
      {/* Channel selector */}
      <div className="flex items-center gap-[12px] mb-[16px] pb-[16px] border-b border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)]">
        <p className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[13px] font-['Red_Hat_Text:Regular',sans-serif] font-medium">Channel</p>
        <select value={selectedChannel} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChannelChange(e.target.value)}
          className="bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.2)] rounded-[999px] px-[10px] py-[5px] text-[14px] text-[#151515] dark:text-white font-['Red_Hat_Mono:Regular',sans-serif] cursor-pointer">
          <option value="fast-5.1">fast-5.1</option>
          <option value="stable-5.1">stable-5.1</option>
          <option value="candidate-5.1">candidate-5.1</option>
          <option value="eus-5.0">eus-5.0</option>
        </select>
        <ChannelTooltip />
      </div>

      {showBugfixHint && (
        <div
          className="flex gap-[10px] items-start rounded-[8px] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.12)] bg-[#fafafa] dark:bg-[rgba(255,255,255,0.04)] px-[14px] py-[12px] mb-[16px]"
          role="note"
        >
          <Info className="size-[18px] text-[#0066cc] dark:text-[#4dabf7] shrink-0 mt-[1px]" />
          <p className="text-[13px] text-[#151515] dark:text-[#e0e0e0] font-['Red_Hat_Text:Regular',sans-serif] leading-[1.45] m-0">
            Not interested in addressing <span className="font-['Red_Hat_Mono:Regular',monospace] font-semibold text-[#151515] dark:text-white">ClusterLoggingMaxVersion</span> today?
            You still have bugfix options — use the <span className="font-medium">5.0</span> (and older) update lines below for z-stream releases without taking the minor bump.
          </p>
        </div>
      )}

      {groups.length === 0 && (
        <p className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[14px] font-['Red_Hat_Text:Regular',sans-serif] py-[20px]">No updates available for this channel.</p>
      )}

      {groups.map((group: VersionGroup) => (
        <VersionGroupComponent key={group.label} label={group.label} versions={group.versions}
          expanded={!!expandedGroups[group.label]}
          setExpanded={(val: boolean) =>
            setExpandedGroups((prev: Record<string, boolean>) => {
              if (val) {
                const next: Record<string, boolean> = {};
                for (const g of groups) {
                  next[g.label] = g.label === group.label;
                }
                return next;
              }
              return { ...prev, [group.label]: false };
            })
          }
          selectedVersion={selectedVersion} setSelectedVersion={setSelectedVersion} navigate={navigate} setActiveTab={setActiveTab} />
      ))}

      </div>}
    </div>
  );
}

/* ─── Kebab Menu (portaled to escape overflow clipping) ─── */
function KebabMenu({ isOpen, onToggle, onClose, items }: { isOpen: boolean; onToggle: () => void; onClose: () => void; items: { label: string; onClick: () => void }[] }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const menuHeight = (items.length * 36) + 8;
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
        className="p-[4px] hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.08)] rounded-[4px] transition-colors bg-transparent border-0 cursor-pointer"
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
      >
        <MoreVertical className="size-[16px] text-[#4d4d4d] dark:text-[#b0b0b0]" />
      </button>
      {isOpen && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={onClose} />
          <div ref={menuRef} className="fixed z-[9999] w-[200px] app-glass-panel app-glass-panel--radius-sm py-[4px]"
            style={{ top: pos.top, left: pos.left }}>
            {items.map((item, idx) => (
              <button key={idx} className="w-full text-left px-[16px] py-[8px] text-[14px] text-[#151515] dark:text-white hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors bg-transparent border-0 cursor-pointer"
                onClick={() => { item.onClick(); onClose(); }}>
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

/* ─── Installed Operators Section (OLM-integrated widget) ─── */
function InstalledOperatorsSection({ selectedVersion, operators, navigate }: { selectedVersion: string; operators: InstalledOperator[]; navigate: ReturnType<typeof useNavigate> }) {
  const [sectionExpanded, setSectionExpanded] = useState(true);
  const [filterCompat, setFilterCompat] = useState<"all" | "incompatible" | "update-available">("all");
  const [selectedOperators, setSelectedOperators] = useState<string[]>([]);
  const [openKebabFor, setOpenKebabFor] = useState<string | null>(null);
  const [updateAll, setUpdateAll] = useState(false);

  const operatorsWithCompat = operators.map((op) => {
    const { compatibility, message } = getOperatorCompatibility(op, selectedVersion);
    return { ...op, clusterCompatibility: compatibility, compatibilityMessage: message || op.compatibilityMessage };
  });

  const filtered = operatorsWithCompat.filter((op) => {
    if (filterCompat === "incompatible") return op.clusterCompatibility === "Incompatible";
    if (filterCompat === "update-available") return !!op.updateAvailable;
    return true;
  });
  const incompatibleCount = operatorsWithCompat.filter((op) => op.clusterCompatibility === "Incompatible").length;
  const updateAvailableCount = operatorsWithCompat.filter((op) => op.updateAvailable).length;
  const upgradeableFalse = incompatibleCount > 0;

  const navigateToUpdate = (op: typeof operatorsWithCompat[0]) => {
    navigate(`/ecosystem/installed-operators/${encodeURIComponent(op.name)}/update`, {
      state: { returnTo: '/administration/cluster-update', operatorName: op.name, operatorData: op }
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOperators(filtered.map((op) => op.name));
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
    <div className="rounded-[16px] border border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] p-[24px] mb-[16px]" id="operators-section">
      <button onClick={() => setSectionExpanded(!sectionExpanded)}
        className="flex items-center gap-[8px] bg-transparent border-0 cursor-pointer p-0 hover:opacity-80 transition-opacity w-full text-left">
        {sectionExpanded ? <ChevronDown className="size-[16px] text-[#151515] dark:text-white" /> : <ChevronRight className="size-[16px] text-[#151515] dark:text-white" />}
        <h2 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[18px]">Operators on this cluster</h2>
        <InfoTooltip />
      </button>

      {sectionExpanded && <div className="mt-[16px]">
      <div className="flex items-center gap-[8px] mb-[12px] flex-wrap">
        <p className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[13px] font-['Red_Hat_Text:Regular',sans-serif]">
          {operators.length} catalog operators installed · Compatibility for <span className="font-medium text-[#151515] dark:text-white">{selectedVersion}</span>
          {" "}
          <span className="text-[#6a6e73] dark:text-[#8a8d90]">— assessed with platform operators in unified AI pre-checks.</span>
        </p>
        <span className="text-[#d2d2d2] dark:text-[rgba(255,255,255,0.15)]">|</span>
        <div className="flex items-center gap-[6px]">
          {(["all", "incompatible", "update-available"] as const).map((f) => (
            <button key={f} onClick={() => setFilterCompat(f)}
              className={`text-[12px] px-[10px] py-[4px] rounded-[999px] border cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] ${filterCompat === f ? "bg-[#0066cc] text-white border-[#0066cc]" : "bg-transparent text-[#4d4d4d] dark:text-[#b0b0b0] border-[#d2d2d2] dark:border-[rgba(255,255,255,0.15)] hover:border-[#8a8d90]"}`}>
              {f === "all" ? "All" : f === "incompatible" ? `Incompatible (${incompatibleCount})` : `Updates available (${updateAvailableCount})`}
            </button>
          ))}
        </div>
      </div>

      {upgradeableFalse && filterCompat !== "update-available" && (
        <div className="mb-[12px] rounded-[16px] border-l-[2px] border-l-[#b1380b] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.15)] bg-white dark:bg-[#1a1a1a] p-[16px]">
          <div className="flex items-start gap-[8px]">
            <AlertCircle className="size-[14px] text-[#b1380b] shrink-0 mt-[2px]" />
            <div className="flex-1">
              <p className="font-['Red_Hat_Text',sans-serif] font-medium text-[#151515] dark:text-white text-[14px] mb-[4px] flex items-center gap-[6px]">
                Cluster upgrade blocked
                <span className="text-[10px] px-[6px] py-[1px] rounded-[3px] font-semibold bg-[rgba(177,56,11,0.1)] text-[#b1380b] font-['Red_Hat_Mono',sans-serif]">upgradeable=False</span>
              </p>
              <p className="text-[14px] font-['Red_Hat_Text',sans-serif] text-[#4d4d4d] dark:text-[#b0b0b0] mb-[8px]">
                {incompatibleCount} operator{incompatibleCount !== 1 ? "s are" : " is"} incompatible with the target cluster version. Update these operators or accept the associated risks before proceeding with the cluster upgrade.
              </p>
              <ul className="list-disc pl-[18px] space-y-[3px] text-[14px] font-['Red_Hat_Text',sans-serif] text-[#4d4d4d] dark:text-[#b0b0b0]">
                {operatorsWithCompat.filter(op => op.clusterCompatibility === "Incompatible").map((op, i) => (
                  <li key={i}><span className="text-[#151515] dark:text-white font-medium">{op.name} ({op.version})</span>: {op.compatibilityMessage} {op.updateAvailable && <button onClick={() => navigateToUpdate(op)} className="inline-flex items-center gap-[2px] text-[#0066cc] dark:text-[#4dabf7] bg-transparent border-0 cursor-pointer p-0 text-[14px] font-['Red_Hat_Text',sans-serif] font-medium hover:underline">→ Update to {op.updateAvailable}</button>}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(255,255,255,0.05)] rounded-[16px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)] overflow-hidden border border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)]">
                <th className="text-left py-[12px] pl-[16px] pr-[8px] w-[48px]">
                  <input
                    type="checkbox"
                    checked={
                      filtered.length > 0 && selectedOperators.length === filtered.length
                    }
                    onChange={handleSelectAll}
                    className="size-[16px] cursor-pointer"
                    title="Select all in view"
                    aria-label="Select all in view"
                  />
                </th>
                <th className="text-left py-[12px] px-[16px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px]">Operator</th>
                <th className="text-left py-[12px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px]">Version</th>
                <th className="text-left py-[12px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px]">Cluster compatibility</th>
                <th className="text-left py-[12px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px]">Update plan</th>
                <th className="text-left py-[12px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px]">Support</th>
                <th className="text-left py-[12px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px]">Status</th>
                <th className="text-left py-[12px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px]">Last updated</th>
                <th className="text-left py-[12px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px]">Managed namespaces</th>
                <th className="text-left py-[12px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px] w-[60px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-[16px] py-[24px] text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">
                    No operators match your filter.
                  </td>
                </tr>
              ) : (
                filtered.map((op, i) => (
                  <tr key={op.name} className={`border-b border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.05)] hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] transition-colors ${i === filtered.length - 1 ? "border-b-0" : ""}`}>
                    <td className="py-[14px] pl-[16px] pr-[8px] align-top">
                      <input
                        type="checkbox"
                        checked={selectedOperators.includes(op.name)}
                        onChange={() => handleSelectOperator(op.name)}
                        className="size-[16px] cursor-pointer mt-[2px]"
                        aria-label={`Select ${op.name}`}
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
                          {op.requiredBeforeClusterUpdate ? (
                            <span className="px-[6px] py-[1px] bg-[#f0ab00] text-white rounded-[4px] text-[10px] font-semibold shrink-0">
                              Required
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[11px] text-[#6a6e73] dark:text-[#8a8d90] font-['Red_Hat_Mono:Regular',sans-serif] truncate mt-[1px]">{op.namespace}</p>
                      </div>
                    </td>
                    <td className="py-[14px] px-[12px]">
                      <span className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Mono:Regular',sans-serif]">{op.version}</span>
                    </td>
                    <td className="py-[14px] px-[12px]">
                      {op.clusterCompatibility === "Compatible" ? (
                        <span className="flex items-center gap-[4px] text-[13px] text-[#151515] dark:text-[#e0e0e0]"><CheckCircle className="size-[14px] text-[#3d7317]" /> Compatible</span>
                      ) : op.clusterCompatibility === "Incompatible" ? (
                        <span className="flex items-center gap-[4px] text-[13px] text-[#151515] dark:text-[#e0e0e0]"><AlertCircle className="size-[14px] text-[#b1380b]" /> Incompatible</span>
                      ) : (
                        <span className="flex items-center gap-[4px] text-[13px] text-[#151515] dark:text-[#e0e0e0]"><AlertTriangle className="size-[14px] text-[#dca614]" /> Unknown</span>
                      )}
                    </td>
                    <td className="py-[14px] px-[12px] text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0]">{op.autoUpdate ? "Automatic" : "Manual"}</td>
                    <td className="py-[14px] px-[12px]">
                      <div>
                        <p className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0]">{op.supportEndDate || "—"}</p>
                        {op.supportBadge && (
                          <span className={`text-[12px] ${
                            op.supportBadgeType === "danger" ? "text-[#f0ab00] dark:text-[#f4c145]"
                            : op.supportBadgeType === "warning" ? "text-[#f0ab00] dark:text-[#f4c145]"
                            : "text-[#3e8635] dark:text-[#5ba352]"
                          }`}>
                            {op.supportBadge}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-[14px] px-[12px]">
                      {op.status === "Running" ? (
                        <span className="flex items-center gap-[4px] text-[13px] text-[#151515] dark:text-[#e0e0e0]"><CheckCircle className="size-[14px] text-[#3d7317]" /> Running</span>
                      ) : op.status === "Degraded" ? (
                        <span className="flex items-center gap-[4px] text-[13px] text-[#151515] dark:text-[#e0e0e0]"><AlertCircle className="size-[14px] text-[#b1380b]" /> Degraded</span>
                      ) : (
                        <span className="flex items-center gap-[4px] text-[13px] text-[#151515] dark:text-[#e0e0e0]"><Clock className="size-[14px] text-[#dca614]" /> Pending</span>
                      )}
                    </td>
                    <td className="py-[14px] px-[12px] text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] whitespace-nowrap">{op.lastUpdated || "—"}</td>
                    <td className="py-[14px] px-[12px]">
                      <div className="flex flex-wrap gap-[4px]">
                        {(op.managedNamespaces || []).map((ns, idx) => (
                          <span key={idx} className="text-[11px] px-[6px] py-[1px] rounded-[4px] bg-[rgba(0,0,0,0.04)] dark:bg-[rgba(255,255,255,0.06)] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Mono:Regular',sans-serif]">{ns}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-[14px] px-[12px]">
                      <KebabMenu
                        isOpen={openKebabFor === op.name}
                        onToggle={() => setOpenKebabFor(openKebabFor === op.name ? null : op.name)}
                        onClose={() => setOpenKebabFor(null)}
                        items={[
                          { label: "View details", onClick: () => navigate(`/ecosystem/installed-operators/${encodeURIComponent(op.name)}`) },
                          ...(op.updateAvailable ? [{ label: `Update to ${op.updateAvailable}`, onClick: () => navigateToUpdate(op) }] : []),
                          { label: "Edit subscription", onClick: () => navigate(`/ecosystem/installed-operators/${encodeURIComponent(op.name)}/subscription`) },
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

      <div className="flex items-center gap-[8px] mt-[16px] pt-[16px] border-t border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)]">
        <button onClick={() => setUpdateAll(!updateAll)}
          className={`relative w-[36px] h-[20px] rounded-full border-0 cursor-pointer transition-colors ${updateAll ? "bg-[#0066cc]" : "bg-[#8a8d90]"}`}>
          <div className={`absolute top-[2px] size-[16px] rounded-full bg-white transition-transform ${updateAll ? "left-[18px]" : "left-[2px]"}`} />
        </button>
        <span className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[13px] font-['Red_Hat_Text:Regular',sans-serif]">Update all operators</span>
      </div>
      </div>}
    </div>
  );
}

/* ─── Version Group ─── */

const PREFLIGHT_RISKS: Record<string, OperatorIssue[]> = {
  "5.1.10": [
    { name: "PodDisruptionBudgetAtLimit", slug: "PodDisruptionBudgetAtLimit", severity: "warning", message: "PDB \"zookeeper-pdb\" in namespace data-services is at maxUnavailable=0. Pod eviction during node drain may stall the update.", url: "https://docs.openshift.com/container-platform/latest/nodes/pods/nodes-pods-configuring.html#nodes-pods-configuring-pod-distruption-about_nodes-pods-configuring", source: "preflight", resolution: { type: "accept-only", description: "Adjust the PDB maxUnavailable to at least 1, or accept that node drains may take longer." } },
    { name: "DeprecatedAPIInUse", slug: "DeprecatedAPIInUse", severity: "critical", message: "3 resources still using rbac.authorization.k8s.io/v1beta1 — migrate to v1 before updating. Affected: ClusterRoleBinding/legacy-admin, RoleBinding/app-reader, RoleBinding/ci-deployer.", url: "https://docs.openshift.com/container-platform/latest/updating/preparing_for_updates/updating-cluster-prepare.html#update-preparing-migrate_updating-cluster-prepare", source: "preflight", resolution: { type: "update-z-stream", description: "Migrate deprecated API resources to v1 before proceeding. Run `oc get apirequestcounts` to identify all affected resources." } },
  ],
  "5.1.9": [
    { name: "PodDisruptionBudgetAtLimit", slug: "PodDisruptionBudgetAtLimit", severity: "warning", message: "PDB \"zookeeper-pdb\" in namespace data-services is at maxUnavailable=0. Pod eviction during node drain may stall the update.", source: "preflight", resolution: { type: "accept-only", description: "Adjust the PDB maxUnavailable to at least 1, or accept that node drains may take longer." } },
  ],
};

function VersionGroupComponent({ label, versions, expanded, setExpanded, selectedVersion, setSelectedVersion, navigate }: any) {
  const [acceptedSlugs, setAcceptedSlugs] = useState<Set<string>>(new Set());
  const [expandedRiskSlug, setExpandedRiskSlug] = useState<string | null>(null);
  const [expandedRiskDetail, setExpandedRiskDetail] = useState<string | null>(null);
  type PreflightStatus = "idle" | "checking-health" | "checking-operators" | "checking-apis" | "checking-nodes" | "complete";
  const [preflightStatus, setPreflightStatus] = useState<PreflightStatus>("idle");
  const riskReviewRef = useRef<HTMLDivElement>(null);

  const isPreflightRunning = preflightStatus !== "idle" && preflightStatus !== "complete";

  const preflightStepLabel: Record<PreflightStatus, string> = {
    "idle": "",
    "checking-health": "Checking cluster health…",
    "checking-operators": "Checking operator compatibility…",
    "checking-apis": "Checking API deprecations…",
    "checking-nodes": "Checking worker nodes…",
    "complete": "",
  };

  const toggleAccept = (slug: string) => {
    setAcceptedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const runPreflight = useCallback(() => {
    if (isPreflightRunning) return;
    const steps: PreflightStatus[] = ["checking-health", "checking-operators", "checking-apis", "checking-nodes", "complete"];
    let i = 0;
    const advance = () => {
      setPreflightStatus(steps[i]);
      i++;
      if (i < steps.length) setTimeout(advance, 1000);
    };
    advance();
  }, [isPreflightRunning]);

  useEffect(() => {
    setPreflightStatus("idle" as PreflightStatus);
  }, [selectedVersion]);

  const selectedVer = versions.find((v: VersionEntry) => v.version === selectedVersion);

  const preflightRisks: OperatorIssue[] = preflightStatus === "complete" && selectedVersion
    ? (PREFLIGHT_RISKS[selectedVersion] || [])
    : [];

  const allRisks: (OperatorIssue & { resolved?: boolean })[] = [];
  if (selectedVer?.operatorIssues) {
    for (const issue of selectedVer.operatorIssues) {
      allRisks.push({ ...issue, source: issue.source || "cincinnati", resolved: false });
    }
  }
  for (const pr of preflightRisks) {
    if (!allRisks.some(r => r.slug === pr.slug)) {
      allRisks.push({ ...pr, resolved: false });
    }
  }
  const addressedCount = allRisks.filter(r => acceptedSlugs.has(r.slug) || r.resolved).length;
  const allAddressed = allRisks.length > 0 && addressedCount === allRisks.length;
  const hasNoRisks = allRisks.length === 0;
  const canUpdate = hasNoRisks || allAddressed;

  // Compute shared risks (present on ALL versions in the group)
  const allGroupSlugs = versions.map((v: VersionEntry) => new Set((v.operatorIssues || []).map((i: OperatorIssue) => i.slug)));
  const sharedSlugs: string[] = [];
  if (allGroupSlugs.length > 0) {
    for (const slug of allGroupSlugs[0]) {
      if (allGroupSlugs.every((s: Set<string>) => s.has(slug))) sharedSlugs.push(slug);
    }
  }

  // Per-version unique risks (not in shared set)
  const getUniqueRisks = (v: VersionEntry) => (v.operatorIssues || []).filter((i: OperatorIssue) => !sharedSlugs.includes(i.slug));

  const severityColor = (sev: string) => sev === "critical" ? "bg-[rgba(177,56,11,0.08)] text-[#b1380b] border-[rgba(177,56,11,0.2)]" : "bg-[rgba(220,166,20,0.08)] text-[#795600] border-[rgba(220,166,20,0.25)]";

  return (
    <div className="mb-[8px]">
      <button onClick={() => setExpanded(!expanded)}
        className="flex items-center flex-wrap gap-[8px] bg-transparent border-0 cursor-pointer p-[8px] -ml-[8px] hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.03)] rounded-[12px] transition-colors w-full text-left">
        {expanded ? <ChevronDown className="size-[16px] text-[#4d4d4d] dark:text-[#b0b0b0]" /> : <ChevronRight className="size-[16px] text-[#4d4d4d] dark:text-[#b0b0b0]" />}
        <span className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[15px]">{label}</span>
        <span className="text-[11px] px-[8px] py-[2px] rounded-full bg-[#e7f1fa] dark:bg-[rgba(43,154,243,0.12)] text-[#0066cc] dark:text-[#4dabf7] font-semibold font-['Red_Hat_Text:Regular',sans-serif]">{versions.length} update{versions.length !== 1 ? "s" : ""}</span>
        {sharedSlugs.length > 0 && (
          <span className="text-[11px] text-[#795600] dark:text-[#dca614] font-['Red_Hat_Text:Regular',sans-serif]">
            all exposed to <span className="font-['Red_Hat_Mono:Regular',sans-serif] font-semibold">{sharedSlugs.join(", ")}</span>
          </span>
        )}
      </button>

      {expanded && (
        <div className="mt-[4px] ml-[24px]">
          {versions.map((v: VersionEntry) => {
            const isSelected = selectedVersion === v.version;
            const uniqueRisks = getUniqueRisks(v);
            return (
              <div key={v.version}>
                <div onClick={() => { setSelectedVersion(v.version); setAcceptedSlugs(new Set()); setExpandedRiskSlug(null); }}
                  className={`flex items-start gap-[10px] px-[12px] py-[10px] cursor-pointer transition-colors border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] ${isSelected ? "bg-[#e7f1fa] dark:bg-[rgba(43,154,243,0.08)] rounded-t-[8px]" : "hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)]"}`}>
                  <div className="flex items-center justify-center mt-[3px]">
                    <div className={`size-[18px] rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-[#0066cc] dark:border-[#4dabf7]" : "border-[#8a8d90]"}`}>
                      {isSelected && <div className="size-[10px] rounded-full bg-[#0066cc] dark:bg-[#4dabf7]" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-[8px] mb-[2px]">
                      <Link to={`/administration/cluster-update/version/${v.version}`} onClick={(e) => e.stopPropagation()}
                        className="text-[#0066cc] dark:text-[#4dabf7] text-[14px] no-underline hover:underline font-['Red_Hat_Mono:Regular',sans-serif]">{v.version}</Link>
                      {v.recommended && <span className="bg-[#e7f1fa] dark:bg-[rgba(43,154,243,0.15)] text-[#0066cc] dark:text-[#4dabf7] text-[11px] px-[8px] py-[2px] rounded-full font-semibold">Recommended</span>}
                      <span className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">{v.date}</span>
                    </div>
                    <div className="flex items-center gap-[6px]">
                      <span className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">{v.features} features · {v.bugFixes} bug fixes</span>
                      <a href="https://docs.openshift.com/container-platform/latest/release_notes/ocp-4-18-release-notes.html" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-[3px] text-[#0066cc] dark:text-[#4dabf7] text-[11px] no-underline hover:underline font-['Red_Hat_Text:Regular',sans-serif]">
                        Release notes <ExternalLink className="size-[10px]" />
                      </a>
                    </div>
                    {uniqueRisks.length > 0 && (
                      <div className="flex flex-wrap gap-[4px] mt-[4px]">
                        {uniqueRisks.map((risk: OperatorIssue) => (
                          <button key={risk.slug} onClick={(e) => { e.stopPropagation(); setExpandedRiskSlug(expandedRiskSlug === `${v.version}:${risk.slug}` ? null : `${v.version}:${risk.slug}`); setSelectedVersion(v.version); }}
                            className={`text-[11px] px-[6px] py-[2px] rounded-[4px] font-['Red_Hat_Mono:Regular',sans-serif] font-semibold border cursor-pointer transition-colors ${severityColor(risk.severity)} hover:opacity-80`}>
                            {risk.slug}
                          </button>
                        ))}
                      </div>
                    )}
                    {uniqueRisks.map((risk: OperatorIssue) => (
                      expandedRiskSlug === `${v.version}:${risk.slug}` && (
                        <div key={`detail-${risk.slug}`} className="mt-[8px] rounded-[8px] bg-[#fafafa] dark:bg-[rgba(255,255,255,0.03)] border border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] p-[12px]" onClick={(e) => e.stopPropagation()}>
                          <p className="text-[13px] text-[#151515] dark:text-white font-['Red_Hat_Text',sans-serif] mb-[6px]">{risk.message}</p>
                          {risk.url && (
                            <a href={risk.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-[4px] text-[#0066cc] dark:text-[#4dabf7] text-[12px] no-underline hover:underline font-['Red_Hat_Text',sans-serif]">
                              View impact statement <ExternalLink className="size-[11px]" />
                            </a>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Inline Risk Review Panel */}
          {selectedVersion && selectedVer && (
            <div ref={riskReviewRef}>
              {hasNoRisks ? (
                <div className="rounded-[16px] border-l-[3px] border-l-[#3d7317] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.15)] bg-white dark:bg-[#1a1a1a] p-[20px]">
                  <div className="flex items-center gap-[10px] mb-[16px]">
                    <CheckCircle className="size-[18px] text-[#3d7317]" />
                    <div>
                      <p className="font-['Red_Hat_Text',sans-serif] font-medium text-[#151515] dark:text-white text-[14px]">
                        No known risks for {selectedVersion}
                      </p>
                      <p className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text',sans-serif]">Ready to update.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-[10px]">
                    <button
                      disabled={isPreflightRunning}
                      onClick={() => { if (isPreflightRunning) return; localStorage.setItem("clusterUpdateInProgress", JSON.stringify({ version: selectedVersion, startedAt: Date.now() })); navigate("/administration/cluster-update/in-progress", { state: { version: selectedVersion } }); }}
                      className={`text-[14px] px-[20px] py-[9px] rounded-[999px] border-0 transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium ${isPreflightRunning ? "bg-[#d2d2d2] text-[#6a6e73] cursor-not-allowed" : "bg-[#0066cc] hover:bg-[#004080] text-white cursor-pointer"}`}>
                      {isPreflightRunning ? "Update requested" : `Update to ${selectedVersion}`}
                    </button>
                    <button
                      onClick={runPreflight}
                      disabled={isPreflightRunning}
                      className={`text-[14px] px-[20px] py-[9px] rounded-[999px] border cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium flex items-center gap-[6px] ${isPreflightRunning ? "border-[#d2d2d2] bg-transparent text-[#6a6e73] cursor-wait" : preflightStatus === "complete" && preflightRisks.length === 0 ? "border-[#3d7317] bg-[rgba(61,115,23,0.04)] text-[#3d7317]" : preflightStatus === "complete" && preflightRisks.length > 0 ? "border-[#dca614] bg-[rgba(220,166,20,0.04)] text-[#795600]" : "border-[#0066cc] dark:border-[#4dabf7] bg-transparent text-[#0066cc] dark:text-[#4dabf7] hover:bg-[#0066cc]/5"}`}>
                      {isPreflightRunning ? (
                        <><Loader2 className="size-[14px] animate-spin" /> {preflightStepLabel[preflightStatus]}</>
                      ) : preflightStatus === "complete" && preflightRisks.length === 0 ? (
                        <><CheckCircle className="size-[14px]" /> Pre-flight passed for {selectedVersion}</>
                      ) : preflightStatus === "complete" && preflightRisks.length > 0 ? (
                        <><Shield className="size-[14px]" /> {preflightRisks.length} concern{preflightRisks.length !== 1 ? "s" : ""} found for {selectedVersion}</>
                      ) : (
                        <><Shield className="size-[14px]" /> Run pre-flight for {selectedVersion} release</>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-[16px] border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.15)] bg-white dark:bg-[#1a1a1a] p-[20px]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-['Red_Hat_Display',sans-serif] font-semibold text-[#151515] dark:text-white text-[16px] m-0">
                      Review risks for {selectedVersion}
                    </h3>
                    <span className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text',sans-serif]">
                      {addressedCount} of {allRisks.length} risk{allRisks.length !== 1 ? "s" : ""} addressed
                    </span>
                  </div>

                  <div className="h-[4px] bg-[#e0e0e0] dark:bg-[rgba(255,255,255,0.1)] rounded-full mt-[16px] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${allRisks.length > 0 ? (addressedCount / allRisks.length) * 100 : 0}%`,
                        backgroundColor: allAddressed ? "#3d7317" : "#0066cc",
                      }}
                    />
                  </div>

                  <div className="space-y-[6px] mt-[16px] mb-[16px]">
                    {allRisks.map((risk) => {
                      const isAccepted = acceptedSlugs.has(risk.slug);
                      const isResolved = !!risk.resolved;
                      const statusLabel = isResolved ? "resolved" : isAccepted ? "accepted" : risk.severity;
                      const statusColor = isResolved
                        ? "bg-[rgba(61,115,23,0.1)] text-[#3d7317]"
                        : isAccepted ? "bg-[rgba(61,115,23,0.1)] text-[#3d7317]"
                        : risk.severity === "critical" ? "bg-[rgba(177,56,11,0.1)] text-[#b1380b]"
                        : "bg-[rgba(220,166,20,0.1)] text-[#795600]";
                      const borderColor = isResolved || isAccepted
                        ? "border-[#3d7317] bg-[rgba(61,115,23,0.03)]"
                        : "border-[#d2d2d2] dark:border-[rgba(255,255,255,0.15)]";
                      const resolution = risk.resolution;
                      const isDetailOpen = expandedRiskDetail === risk.slug;
                      return (
                        <div key={risk.slug}
                          className={`rounded-[10px] border transition-colors ${borderColor}`}>
                          {/* Compact header row — always visible */}
                          <button
                            onClick={() => setExpandedRiskDetail(isDetailOpen ? null : risk.slug)}
                            className="flex items-center gap-[8px] w-full bg-transparent border-0 cursor-pointer px-[14px] py-[10px] text-left"
                          >
                            {isDetailOpen ? <ChevronDown className="size-[12px] text-[#4d4d4d] shrink-0" /> : <ChevronRight className="size-[12px] text-[#4d4d4d] shrink-0" />}
                            <span className="text-[13px] text-[#151515] dark:text-white font-semibold font-['Red_Hat_Mono:Regular',sans-serif]">{risk.slug}</span>
                            <span className={`text-[11px] px-[6px] py-[1px] rounded-[4px] font-semibold ${statusColor}`}>
                              {statusLabel}
                            </span>
                            <span className="flex-1" />
                            {(isResolved || isAccepted) && <CheckCircle className="size-[14px] text-[#3d7317] shrink-0" />}
                          </button>

                          {/* Expanded detail — message, resolution, actions */}
                          {isDetailOpen && (
                            <div className="px-[14px] pb-[14px] pt-0 ml-[20px]">
                              <p className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text',sans-serif] mb-[8px]">{risk.message}</p>
                              {risk.url && (
                                <a href={risk.url} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-[4px] text-[#0066cc] dark:text-[#4dabf7] text-[12px] no-underline hover:underline font-['Red_Hat_Text',sans-serif] mb-[10px]">
                                  View impact statement <ExternalLink className="size-[11px]" />
                                </a>
                              )}

                              {!isResolved && !isAccepted && resolution && (
                                <div className="rounded-[8px] bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] px-[12px] py-[8px] mb-[10px]">
                                  <div className="flex items-start gap-[6px]">
                                    {(resolution.type === "update-operator" && resolution.actionAvailable) && <ArrowRight className="size-[12px] text-[#0066cc] mt-[2px] shrink-0" />}
                                    {(resolution.type === "update-operator" && !resolution.actionAvailable) && <Clock className="size-[12px] text-[#795600] mt-[2px] shrink-0" />}
                                    {resolution.type === "wait-for-fix" && <Clock className="size-[12px] text-[#795600] mt-[2px] shrink-0" />}
                                    {resolution.type === "update-z-stream" && <Info className="size-[12px] text-[#0066cc] mt-[2px] shrink-0" />}
                                    {resolution.type === "accept-only" && <Info className="size-[12px] text-[#4d4d4d] mt-[2px] shrink-0" />}
                                    <p className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text',sans-serif]">{resolution.description}</p>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center gap-[8px]">
                                {isResolved ? (
                                  <span className="text-[13px] text-[#3d7317] font-['Red_Hat_Text',sans-serif] font-medium flex items-center gap-[4px]">
                                    <CheckCircle className="size-[12px]" /> Risk resolved
                                  </span>
                                ) : (
                                  <>
                                    {resolution?.type === "update-operator" && resolution.actionAvailable && !isAccepted && (
                                      <button onClick={() => navigate('/administration/installed-operators')}
                                        className="text-[13px] px-[12px] py-[5px] rounded-[999px] bg-[#0066cc] hover:bg-[#004080] text-white border-0 cursor-pointer transition-colors font-['Red_Hat_Text',sans-serif] font-medium flex items-center gap-[4px]">
                                        Update operator <ArrowRight className="size-[12px]" />
                                      </button>
                                    )}
                                    <button onClick={() => toggleAccept(risk.slug)}
                                      className={`text-[13px] px-[12px] py-[5px] rounded-[999px] cursor-pointer transition-colors font-['Red_Hat_Text',sans-serif] font-medium ${
                                        isAccepted
                                          ? "bg-[rgba(61,115,23,0.08)] text-[#3d7317] border border-[#3d7317] hover:bg-[rgba(61,115,23,0.15)]"
                                          : "bg-transparent text-[#0066cc] dark:text-[#4dabf7] border border-[#0066cc] dark:border-[#4dabf7] hover:bg-[#0066cc]/5"
                                      }`}>
                                      {isAccepted ? "Accepted" : "Accept risk"}
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-[10px] pt-[16px] border-t border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)]">
                    <button
                      disabled={!canUpdate || isPreflightRunning}
                      onClick={() => { if (isPreflightRunning || !canUpdate) return; localStorage.setItem("clusterUpdateInProgress", JSON.stringify({ version: selectedVersion, startedAt: Date.now() })); navigate("/administration/cluster-update/in-progress", { state: { version: selectedVersion } }); }}
                      className={`text-[14px] px-[20px] py-[9px] rounded-[999px] border-0 transition-colors font-['Red_Hat_Text',sans-serif] font-medium ${
                        isPreflightRunning
                          ? "bg-[#d2d2d2] text-[#6a6e73] cursor-not-allowed"
                          : canUpdate
                            ? "bg-[#0066cc] hover:bg-[#004080] text-white cursor-pointer"
                            : "bg-[#d2d2d2] text-[#6a6e73] cursor-not-allowed"
                      }`}>
                      {isPreflightRunning ? "Update requested" : `Update to ${selectedVersion}`}
                    </button>
                    <button
                      onClick={runPreflight}
                      disabled={isPreflightRunning}
                      className={`text-[14px] px-[20px] py-[9px] rounded-[999px] border cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium flex items-center gap-[6px] ${isPreflightRunning ? "border-[#d2d2d2] bg-transparent text-[#6a6e73] cursor-wait" : preflightStatus === "complete" && preflightRisks.length === 0 ? "border-[#3d7317] bg-[rgba(61,115,23,0.04)] text-[#3d7317]" : preflightStatus === "complete" && preflightRisks.length > 0 ? "border-[#dca614] bg-[rgba(220,166,20,0.04)] text-[#795600]" : "border-[#0066cc] dark:border-[#4dabf7] bg-transparent text-[#0066cc] dark:text-[#4dabf7] hover:bg-[#0066cc]/5"}`}>
                      {isPreflightRunning ? (
                        <><Loader2 className="size-[14px] animate-spin" /> {preflightStepLabel[preflightStatus]}</>
                      ) : preflightStatus === "complete" && preflightRisks.length === 0 ? (
                        <><CheckCircle className="size-[14px]" /> Pre-flight passed for {selectedVersion}</>
                      ) : preflightStatus === "complete" && preflightRisks.length > 0 ? (
                        <><Shield className="size-[14px]" /> {preflightRisks.length} concern{preflightRisks.length !== 1 ? "s" : ""} found for {selectedVersion}</>
                      ) : (
                        <><Shield className="size-[14px]" /> Run pre-flight for {selectedVersion} release</>
                      )}
                    </button>
                    {!canUpdate && !isPreflightRunning && (
                      <span className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text',sans-serif]">
                        Address all risks to proceed
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Active agent update plans (scheduled / in progress) ─── */
type ActiveAgentPlanRow = {
  id: string;
  status: "scheduled" | "in_progress";
  targetVersion: string;
  summary: string;
  windowLabel: string;
  phase?: string;
  details: string[];
};

const MOCK_ACTIVE_AGENT_PLANS: ActiveAgentPlanRow[] = [
  {
    id: "plan-sched-1",
    status: "scheduled",
    targetVersion: "5.1.10",
    summary: "Approved — waiting for maintenance window",
    windowLabel: "Apr 15, 2026 · 2:00 AM EST",
    details: [
      "Agent: cluster-update-agent",
      "Pre-checks will run again 24 hours before the window.",
      "Rollback snapshot: taken Apr 7, 2026",
    ],
  },
  {
    id: "plan-run-1",
    status: "in_progress",
    targetVersion: "5.1.9",
    summary: "Executing coordinated platform + catalog updates",
    windowLabel: "Started Apr 8, 2026 · 1:12 AM EST",
    phase: "Operator coordination — step 4 of 8",
    details: [
      "Control plane: complete",
      "Catalog operators: in progress (12 of 28)",
      "Estimated remaining: ~28 minutes",
    ],
  },
];

function ActiveUpdatePlansTab() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = MOCK_ACTIVE_AGENT_PLANS.find((p) => p.id === selectedId);

  return (
    <div className="max-w-[960px]">
      <p className="text-[14px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[16px]">
        Scheduled or ongoing agent-based update plans. Select a row to view details.
      </p>
      <div className="border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.1)] rounded-[8px] overflow-hidden">
        <div className="grid grid-cols-[minmax(110px,120px)_minmax(72px,90px)_1fr_minmax(140px,1fr)] gap-[8px] px-[16px] py-[10px] text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] border-b border-[#d2d2d2] dark:border-[rgba(255,255,255,0.1)]">
          <span>Status</span>
          <span>Target</span>
          <span>Summary</span>
          <span>Window / started</span>
        </div>
        {MOCK_ACTIVE_AGENT_PLANS.map((p) => {
          const isSelected = selectedId === p.id;
          return (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedId(p.id === selectedId ? null : p.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedId(p.id === selectedId ? null : p.id);
                }
              }}
              className={`grid grid-cols-[minmax(110px,120px)_minmax(72px,90px)_1fr_minmax(140px,1fr)] gap-[8px] items-center px-[16px] py-[12px] border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] last:border-0 cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] ${
                isSelected
                  ? "bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)]"
                  : "hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)]"
              }`}
            >
              <span>
                <span
                  className={`inline-flex text-[12px] font-semibold px-[8px] py-[2px] rounded-[999px] ${
                    p.status === "scheduled"
                      ? "bg-[rgba(0,102,204,0.12)] text-[#0066cc] dark:text-[#4dabf7]"
                      : "bg-[rgba(103,83,172,0.12)] text-[#6753ac] dark:text-[#b2a3e0]"
                  }`}
                >
                  {p.status === "scheduled" ? "Scheduled" : "In progress"}
                </span>
              </span>
              <span className="text-[14px] text-[#151515] dark:text-white font-['Red_Hat_Mono:Regular',sans-serif]">{p.targetVersion}</span>
              <span className="text-[14px] text-[#151515] dark:text-white min-w-0">{p.summary}</span>
              <span className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] whitespace-nowrap">{p.windowLabel}</span>
            </div>
          );
        })}
      </div>

      {selected && (
        <div
          className="mt-[16px] rounded-[12px] border border-[#0066cc]/35 dark:border-[#4dabf7]/35 bg-[#e7f1fa] dark:bg-[rgba(0,102,204,0.1)] p-[16px]"
          role="region"
          aria-label="Plan details"
        >
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[#6a6e73] dark:text-[#8a8d90] mb-[6px]">Plan details</p>
          <p className="text-[16px] font-medium text-[#151515] dark:text-white font-['Red_Hat_Display:SemiBold',sans-serif] mb-[4px]">
            OpenShift {selected.targetVersion}
          </p>
          {selected.phase && (
            <p className="text-[13px] text-[#0066cc] dark:text-[#4dabf7] font-medium mb-[8px]">{selected.phase}</p>
          )}
          <ul className="list-disc pl-[18px] space-y-[4px] text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif]">
            {selected.details.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ─── Cluster Operators Tab ─── */
/* ─── Update History Tab ─── */
function UpdateHistoryTab() {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [filterMethod, setFilterMethod] = useState<"all" | "Manual" | "Agent">("all");

  const filtered = filterMethod === "all" ? updateHistory : updateHistory.filter((e) => e.method === filterMethod);

  return (
    <div>
      <div className="flex items-center justify-between mb-[16px]">
        <h2 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[18px]">Update history</h2>
        <div className="flex items-center gap-[8px]">
          {(["all", "Manual", "Agent"] as const).map((f) => (
            <button key={f} onClick={() => setFilterMethod(f)}
              className={`text-[13px] px-[12px] py-[5px] rounded-[999px] border cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] ${filterMethod === f ? "bg-[#0066cc] text-white border-[#0066cc]" : "bg-transparent text-[#4d4d4d] dark:text-[#b0b0b0] border-[#d2d2d2] dark:border-[rgba(255,255,255,0.15)] hover:border-[#8a8d90]"}`}>
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>
      </div>
      <div className="border border-[#d2d2d2] dark:border-[rgba(255,255,255,0.1)] rounded-[8px] overflow-hidden">
        <div className="grid grid-cols-[90px_100px_72px_100px_1fr_140px_72px] gap-[8px] px-[16px] py-[10px] text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.03)] border-b border-[#d2d2d2] dark:border-[rgba(255,255,255,0.1)]">
          <span>Version</span><span>Status</span><span>Method</span><span>Decision</span><span>Initiated by</span><span>Date</span><span>Pre-check</span>
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
                  {entry.status === "Failed" && <span className="flex items-center gap-[3px] text-[11px] px-[6px] py-[2px] rounded-[4px] font-semibold bg-[rgba(201,25,11,0.1)] text-[#c9190b] w-fit"><AlertCircle className="size-[10px]" /> Failed</span>}
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
                  <span className={`text-[11px] px-[6px] py-[2px] rounded-[4px] font-semibold ${entry.preCheck.failed === 0 ? "bg-[rgba(62,134,53,0.1)] text-[#3e8635]" : "bg-[rgba(201,25,11,0.1)] text-[#c9190b]"}`}>
                    {entry.preCheck.passed}/{entry.preCheck.total}
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
                      <p className="text-[11px] text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text:Regular',sans-serif] mb-[2px]">Pre-check Summary</p>
                      <div className="flex items-center gap-[8px]">
                        <span className="text-[13px] font-['Red_Hat_Text:Regular',sans-serif]">
                          <span className="text-[#3e8635] font-semibold">{entry.preCheck.passed} passed</span>
                          {entry.preCheck.failed > 0 && <span className="text-[#c9190b] font-semibold"> · {entry.preCheck.failed} failed</span>}
                          <span className="text-[#4d4d4d] dark:text-[#b0b0b0]"> of {entry.preCheck.total} checks</span>
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
