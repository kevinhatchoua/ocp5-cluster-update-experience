import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Alert,
  AlertActionCloseButton,
  AlertActionLink,
  AlertGroup,
  Content,
} from "@patternfly/react-core";
import { Search, ChevronDown, ChevronRight, AlertTriangle, CheckCircle, X } from "@/lib/pfIcons";
import Breadcrumbs from "../../components/Breadcrumbs";

interface Operator {
  id: string;
  name: string;
  provider: string;
  providerType: "Red Hat" | "Community" | "Certified";
  description: string;
  icon: string;
  installed: boolean;
  hasUpdate?: boolean;
  newVersion?: string;
  currentVersion?: string;
  categories: string[];
  olmVersion?: "v0" | "v1";
}

export default function SoftwareCatalogPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [showLegacyCatalog, setShowLegacyCatalog] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["Type", "Capabilities", "Source", "Provider"]);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [showAllTypes, setShowAllTypes] = useState(false);
  const [showAllProviders, setShowAllProviders] = useState(false);

  const [filters, setFilters] = useState({
    source: [] as string[],
    provider: [] as string[],
  });

  const operators: Operator[] = [
    // OLMv0 Operators (default set - large catalog)
    {
      id: "abot-operator",
      name: "Abot Operator",
      provider: "Refactz Technologies",
      providerType: "Certified",
      description: "The Abot Test Bench is a test automation tool for 4G, 5G and ORAN Telecom networks",
      icon: "🔷",
      installed: true,
      hasUpdate: true,
      newVersion: "3.1.0",
      currentVersion: "3.0.0",
      categories: ["Operators", "Certified"],
      olmVersion: "v0"
    },
    {
      id: "airflow-helm",
      name: "Airflow Helm Operator",
      provider: "Apache",
      providerType: "Community",
      description: "An experimental operator that installs Apache Airflow for workflow orchestration",
      icon: "🔷",
      installed: true,
      hasUpdate: true,
      newVersion: "5.7.3",
      currentVersion: "5.7.2",
      categories: ["Operators", "Community"],
      olmVersion: "v0"
    },
    {
      id: "ansible-automation",
      name: "Ansible Automation Platform",
      provider: "Red Hat",
      providerType: "Red Hat",
      description: "The Ansible Automation Platform Resource Operator manages everything Automation",
      icon: "🔷",
      installed: true,
      hasUpdate: true,
      newVersion: "1.6.0",
      currentVersion: "1.5.0",
      categories: ["Operators", "Red Hat"],
      olmVersion: "v0"
    },
    {
      id: "bare-metal-event",
      name: "Bare Metal Event Relay",
      provider: "Red Hat",
      providerType: "Red Hat",
      description: "This software manages the lifecycle of the bare-event-proxy container",
      icon: "🔷",
      installed: true,
      hasUpdate: true,
      newVersion: "1.2.0",
      currentVersion: "1.1.1",
      categories: ["Operators", "Red Hat"],
      olmVersion: "v0"
    },
    {
      id: "camel-k",
      name: "Camel K Operator",
      provider: "Apache",
      providerType: "Community",
      description: "Apache Camel K is a lightweight integration platform, born on Kubernetes, with serverless superpowers",
      icon: "🔷",
      installed: true,
      categories: ["Operators", "Community"],
      olmVersion: "v0"
    },
    {
      id: "business-automation",
      name: "Business Automation",
      provider: "Red Hat",
      providerType: "Red Hat",
      description: "Deploys and manages Red Hat Process Automation Manager and Red Hat Decision Manager environments",
      icon: "🔷",
      installed: false,
      categories: ["Operators", "Red Hat"],
      olmVersion: "v0"
    },
    {
      id: "postgresql",
      name: "PostgreSQL Operator",
      provider: "CrunchyData",
      providerType: "Certified",
      description: "Production PostgreSQL made easy, with high availability, backups and disaster recovery",
      icon: "🔷",
      installed: false,
      categories: ["Database", "Certified"],
      olmVersion: "v0"
    },
    {
      id: "mongodb",
      name: "MongoDB Enterprise",
      provider: "MongoDB",
      providerType: "Certified",
      description: "MongoDB Enterprise Kubernetes Operator - production-grade MongoDB deployment and management",
      icon: "🔷",
      installed: false,
      categories: ["Database", "Certified"],
      olmVersion: "v0"
    },
    {
      id: "mysql",
      name: "MySQL Operator",
      provider: "Oracle",
      providerType: "Community",
      description: "Create, operate and scale self-healing MySQL clusters in Kubernetes",
      icon: "🔷",
      installed: false,
      categories: ["Database", "Community"],
      olmVersion: "v0"
    },
    {
      id: "redis",
      name: "Redis Operator",
      provider: "Spotahome",
      providerType: "Community",
      description: "Redis Operator creates/configures/manages Redis clusters atop Kubernetes",
      icon: "🔷",
      installed: false,
      categories: ["Database", "Community"],
      olmVersion: "v0"
    },
    {
      id: "kafka-strimzi",
      name: "Strimzi Apache Kafka",
      provider: "Strimzi",
      providerType: "Community",
      description: "Strimzi provides a way to run an Apache Kafka cluster on Kubernetes in various deployment configurations",
      icon: "🔷",
      installed: false,
      categories: ["Streaming", "Community"],
      olmVersion: "v0"
    },
    {
      id: "couchbase",
      name: "Couchbase Operator",
      provider: "Couchbase",
      providerType: "Certified",
      description: "The Couchbase Autonomous Operator provides a native integration of Couchbase Server with Kubernetes",
      icon: "🔷",
      installed: false,
      categories: ["Database", "Certified"],
      olmVersion: "v0"
    },
    {
      id: "jenkins",
      name: "Jenkins Operator",
      provider: "Jenkins",
      providerType: "Community",
      description: "Kubernetes native operator which fully manages Jenkins on Kubernetes",
      icon: "🔷",
      installed: false,
      categories: ["CI/CD", "Community"],
      olmVersion: "v0"
    },
    {
      id: "tekton",
      name: "OpenShift Pipelines",
      provider: "Red Hat",
      providerType: "Red Hat",
      description: "Red Hat OpenShift Pipelines is a cloud-native, continuous integration and delivery solution based on Kubernetes resources",
      icon: "🔷",
      installed: false,
      categories: ["CI/CD", "Red Hat"],
      olmVersion: "v0"
    },
    {
      id: "jaeger",
      name: "Jaeger Operator",
      provider: "Red Hat",
      providerType: "Red Hat",
      description: "Jaeger Operator for Kubernetes simplifies deploying and running Jaeger on Kubernetes",
      icon: "🔷",
      installed: false,
      categories: ["Observability", "Red Hat"],
      olmVersion: "v0"
    },
    {
      id: "kiali",
      name: "Kiali Operator",
      provider: "Red Hat",
      providerType: "Red Hat",
      description: "Kiali is a management console for Istio-based service mesh",
      icon: "🔷",
      installed: false,
      categories: ["Observability", "Red Hat"],
      olmVersion: "v0"
    },
    {
      id: "elasticsearch",
      name: "Elasticsearch Operator",
      provider: "Elastic",
      providerType: "Certified",
      description: "Automates the deployment, provisioning, management, and orchestration of Elasticsearch",
      icon: "🔷",
      installed: false,
      categories: ["Logging", "Certified"],
      olmVersion: "v0"
    },
    {
      id: "fluentd",
      name: "Fluentd Operator",
      provider: "Fluent",
      providerType: "Community",
      description: "Fluentd is an open source data collector for unified logging layer",
      icon: "🔷",
      installed: false,
      categories: ["Logging", "Community"],
      olmVersion: "v0"
    },
    {
      id: "minio",
      name: "MinIO Operator",
      provider: "MinIO",
      providerType: "Community",
      description: "MinIO is a high performance distributed object storage server, designed for large-scale private cloud infrastructure",
      icon: "🔷",
      installed: false,
      categories: ["Storage", "Community"],
      olmVersion: "v0"
    },
    {
      id: "rook-ceph",
      name: "Rook Ceph",
      provider: "Rook",
      providerType: "Community",
      description: "Rook turns distributed storage systems into self-managing, self-scaling, self-healing storage services",
      icon: "🔷",
      installed: false,
      categories: ["Storage", "Community"],
      olmVersion: "v0"
    },
    {
      id: "metallb",
      name: "MetalLB Operator",
      provider: "MetalLB",
      providerType: "Community",
      description: "MetalLB is a load-balancer implementation for bare metal Kubernetes clusters",
      icon: "🔷",
      installed: false,
      categories: ["Networking", "Community"],
      olmVersion: "v0"
    },
    {
      id: "nginx-ingress",
      name: "NGINX Ingress Operator",
      provider: "NGINX",
      providerType: "Certified",
      description: "NGINX Ingress Operator provides ingress controller for Kubernetes deployments",
      icon: "🔷",
      installed: false,
      categories: ["Networking", "Certified"],
      olmVersion: "v0"
    },
    {
      id: "istio",
      name: "Istio Service Mesh",
      provider: "Red Hat",
      providerType: "Red Hat",
      description: "Red Hat OpenShift Service Mesh provides a uniform way to connect, manage and observe microservices based applications",
      icon: "🔷",
      installed: false,
      categories: ["Networking", "Red Hat"],
      olmVersion: "v0"
    },
    {
      id: "kong",
      name: "Kong Gateway Operator",
      provider: "Kong",
      providerType: "Certified",
      description: "Kong for Kubernetes is an ingress controller and API gateway",
      icon: "🔷",
      installed: false,
      categories: ["Networking", "Certified"],
      olmVersion: "v0"
    },
    {
      id: "datadog",
      name: "Datadog Operator",
      provider: "Datadog",
      providerType: "Certified",
      description: "The Datadog Operator provides a Kubernetes-native way to deploy the Datadog Agent",
      icon: "🔷",
      installed: false,
      categories: ["Monitoring", "Certified"],
      olmVersion: "v0"
    },
    {
      id: "dynatrace",
      name: "Dynatrace Operator",
      provider: "Dynatrace",
      providerType: "Certified",
      description: "Dynatrace is an all-in-one, zero-configuration monitoring platform designed for modern cloud and hybrid environments",
      icon: "🔷",
      installed: false,
      categories: ["Monitoring", "Certified"],
      olmVersion: "v0"
    },
    {
      id: "newrelic",
      name: "New Relic Operator",
      provider: "New Relic",
      providerType: "Certified",
      description: "Observability platform built to help engineers create more perfect software",
      icon: "🔷",
      installed: false,
      categories: ["Monitoring", "Certified"],
      olmVersion: "v0"
    },
    {
      id: "splunk",
      name: "Splunk Operator",
      provider: "Splunk",
      providerType: "Certified",
      description: "Splunk Enterprise Operator for Kubernetes provides a cloud-native way to deploy and manage Splunk Enterprise",
      icon: "🔷",
      installed: false,
      categories: ["Logging", "Certified"],
      olmVersion: "v0"
    },
    {
      id: "vault-secrets",
      name: "Vault Secrets Operator",
      provider: "HashiCorp",
      providerType: "Certified",
      description: "The Vault Secrets Operator allows Pods to consume Vault secrets natively from Kubernetes Secrets",
      icon: "🔷",
      installed: false,
      categories: ["Security", "Certified"],
      olmVersion: "v0"
    },
    {
      id: "cert-manager",
      name: "cert-manager",
      provider: "Jetstack",
      providerType: "Community",
      description: "Automates the management and issuance of TLS certificates from various sources",
      icon: "🔷",
      installed: false,
      categories: ["Security", "Community"],
      olmVersion: "v0"
    },
    {
      id: "keycloak",
      name: "Keycloak Operator",
      provider: "Red Hat",
      providerType: "Red Hat",
      description: "Keycloak is an Open Source Identity and Access Management solution for modern Applications and Services",
      icon: "🔷",
      installed: false,
      categories: ["Security", "Red Hat"],
      olmVersion: "v0"
    },
    {
      id: "gpu-operator",
      name: "NVIDIA GPU Operator",
      provider: "NVIDIA",
      providerType: "Certified",
      description: "Automates the management of all NVIDIA software components needed to run GPU accelerated workloads",
      icon: "🔷",
      installed: false,
      categories: ["AI/ML", "Certified"],
      olmVersion: "v0"
    },
    {
      id: "knative-serving",
      name: "Knative Serving",
      provider: "Red Hat",
      providerType: "Red Hat",
      description: "Knative Serving builds on Kubernetes to support deploying and serving of serverless applications",
      icon: "🔷",
      installed: false,
      categories: ["Serverless", "Red Hat"],
      olmVersion: "v0"
    },
    {
      id: "openfaas",
      name: "OpenFaaS",
      provider: "OpenFaaS",
      providerType: "Community",
      description: "Serverless Functions Made Simple for Kubernetes",
      icon: "🔷",
      installed: false,
      categories: ["Serverless", "Community"],
      olmVersion: "v0"
    },
    {
      id: "kubevirt",
      name: "KubeVirt",
      provider: "Red Hat",
      providerType: "Red Hat",
      description: "KubeVirt is a virtual machine management add-on for Kubernetes",
      icon: "🔷",
      installed: false,
      categories: ["Virtualization", "Red Hat"],
      olmVersion: "v0"
    },
    {
      id: "crossplane",
      name: "Crossplane",
      provider: "Upbound",
      providerType: "Community",
      description: "Crossplane is an open source Kubernetes add-on that enables platform teams to assemble infrastructure from multiple vendors",
      icon: "🔷",
      installed: false,
      categories: ["Infrastructure", "Community"],
      olmVersion: "v0"
    },
    {
      id: "argocd",
      name: "Argo CD",
      provider: "Argo Project",
      providerType: "Community",
      description: "Declarative continuous delivery with a fully-loaded UI",
      icon: "🔷",
      installed: false,
      categories: ["CI/CD", "Community"],
      olmVersion: "v0"
    },
    {
      id: "gitops",
      name: "Red Hat OpenShift GitOps",
      provider: "Red Hat",
      providerType: "Red Hat",
      description: "Enables teams to implement GitOps principles with a declarative approach to configuration management",
      icon: "🔷",
      installed: false,
      categories: ["CI/CD", "Red Hat"],
      olmVersion: "v0"
    },
    {
      id: "nexus",
      name: "Nexus Operator",
      provider: "Sonatype",
      providerType: "Community",
      description: "Nexus Repository Manager helps developers and organizations to proxy, collect and manage dependencies",
      icon: "🔷",
      installed: false,
      categories: ["Development Tools", "Community"],
      olmVersion: "v0"
    },
    {
      id: "harbor",
      name: "Harbor Operator",
      provider: "VMware",
      providerType: "Community",
      description: "Harbor is an open source trusted cloud native registry project that stores, signs, and scans content",
      icon: "🔷",
      installed: false,
      categories: ["Development Tools", "Community"],
      olmVersion: "v0"
    },
    {
      id: "portworx",
      name: "Portworx Enterprise",
      provider: "Portworx",
      providerType: "Certified",
      description: "Cloud-Native storage and data management platform for Kubernetes",
      icon: "🔷",
      installed: false,
      categories: ["Storage", "Certified"],
      olmVersion: "v0"
    },

    // OLMv1 Operators (new simplified API - smaller set)
    {
      id: "argocd-operator-v1",
      name: "Argo CD",
      provider: "Argo Project",
      providerType: "Community",
      description: "Declarative GitOps continuous delivery for Kubernetes - built with OLMv1 for simpler management",
      icon: "🚀",
      installed: false,
      categories: ["Operators", "Community"],
      olmVersion: "v1"
    },
    {
      id: "prometheus-v1",
      name: "Prometheus Operator",
      provider: "Prometheus Community",
      providerType: "Community",
      description: "Provides Kubernetes native deployment and management of Prometheus and related monitoring components using OLMv1",
      icon: "📊",
      installed: true,
      categories: ["Operators", "Community"],
      olmVersion: "v1"
    },
    {
      id: "cert-manager-v1",
      name: "cert-manager",
      provider: "Jetstack",
      providerType: "Community",
      description: "Automates the management and issuance of TLS certificates with OLMv1 simplified update control",
      icon: "🔐",
      installed: false,
      categories: ["Operators", "Community"],
      olmVersion: "v1"
    },
    {
      id: "elastic-v1",
      name: "Elastic Cloud on Kubernetes",
      provider: "Elastic",
      providerType: "Certified",
      description: "Orchestrate Elasticsearch, Kibana, APM Server, Enterprise Search, and Beats on Kubernetes with OLMv1",
      icon: "🔍",
      installed: false,
      hasUpdate: false,
      categories: ["Operators", "Certified"],
      olmVersion: "v1"
    },
    {
      id: "vault-v1",
      name: "Vault Operator",
      provider: "HashiCorp",
      providerType: "Certified",
      description: "Manage HashiCorp Vault in Kubernetes with OLMv1 direct control over upgrade rollouts",
      icon: "🔒",
      installed: true,
      hasUpdate: true,
      newVersion: "1.15.0",
      currentVersion: "1.14.2",
      categories: ["Operators", "Certified"],
      olmVersion: "v1"
    },
    {
      id: "grafana-v1",
      name: "Grafana Operator",
      provider: "Grafana Labs",
      providerType: "Community",
      description: "Kubernetes Operator for Grafana with OLMv1 streamlined API",
      icon: "📈",
      installed: false,
      categories: ["Operators", "Community"],
      olmVersion: "v1"
    },
  ];

  const availableUpdates = operators.filter(op => op.hasUpdate).length;

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleFilter = (filterType: "source" | "provider", value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(v => v !== value)
        : [...prev[filterType], value],
    }));
  };

  const filteredOperators = operators.filter(op => {
    // Filter by search query
    if (searchQuery && !op.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by OLM version
    if (showLegacyCatalog) {
      if (op.olmVersion !== "v0") return false;
    } else {
      if (op.olmVersion !== "v1") return false;
    }

    // Filter by source
    if (filters.source.length > 0) {
      if (!filters.source.includes(op.providerType)) {
        return false;
      }
    }

    // Filter by provider
    if (filters.provider.length > 0) {
      if (!filters.provider.includes(op.provider)) {
        return false;
      }
    }

    return true;
  });

  const handleOperatorClick = (operator: Operator) => {
    setSelectedOperator(operator);
    setShowSidePanel(true);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-[24px]">
        <Breadcrumbs
          items={[
            { label: "Ecosystem", path: "/ecosystem" },
            { label: "Software Catalog" },
          ]}
        >

        <Content className="mb-6">
          <h1 id="main-title">Software Catalog</h1>
          <p>
            Add shared applications, services, event sources, or source-to-image builders to your Project from the
            software catalog. Cluster administrators can customize the content made available in the catalog.
          </p>
        </Content>

        {((availableUpdates > 0 && !dismissedAlerts.includes("updates")) || !dismissedAlerts.includes("olmv1")) && (
          <AlertGroup className="mb-4">
            {availableUpdates > 0 && !dismissedAlerts.includes("updates") && (
              <Alert
                variant="info"
                isInline
                title={`${availableUpdates} Software versions available`}
                actionClose={
                  <AlertActionCloseButton onClose={() => setDismissedAlerts((prev) => [...prev, "updates"])} />
                }
                actionLinks={
                  <AlertActionLink component={Link} to="/ecosystem/installed-operators">
                    Manage updates
                  </AlertActionLink>
                }
              >
                Review and approve pending software updates to keep your cluster secure and up-to-date.
              </Alert>
            )}
            {!dismissedAlerts.includes("olmv1") && (
              <Alert
                variant="info"
                isInline
                title="Operator Lifecycle Management version 1"
                actionClose={
                  <AlertActionCloseButton onClose={() => setDismissedAlerts((prev) => [...prev, "olmv1"])} />
                }
              >
                {`With OLMv1, you'll get a much simpler API that's easier to work with and understand. Plus, you have more direct control over upgrade. You can define update ranges, and decide exactly how updates are rolled out. `}
                <a
                  href="https://docs.openshift.com/container-platform/latest/operators/understanding/olm-understanding-operatorhub.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more
                </a>
                {` about OLMv1.`}
              </Alert>
            )}
          </AlertGroup>
        )}

        <div className="flex gap-[24px]">
          {/* Left Sidebar - Filters */}
          <div className="w-[280px] shrink-0">
            {/* Type Filter */}
            <div className="mb-[16px]">
              <button
                onClick={() => toggleCategory("Type")}
                className="w-full flex items-center justify-between mb-[8px] text-[14px] font-semibold text-[#151515] dark:text-white"
              >
                <div className="flex items-center gap-[4px]">
                  <span>Type</span>
                  <span className="text-[#4d4d4d] dark:text-[#b0b0b0]">ⓘ</span>
                </div>
                {expandedCategories.includes("Type") ? (
                  <ChevronDown className="size-[14px]" />
                ) : (
                  <ChevronRight className="size-[14px]" />
                )}
              </button>
              {expandedCategories.includes("Type") && (
                <div className="space-y-[8px] pl-[4px]">
                  <label className="flex items-center gap-[8px] cursor-pointer text-[14px] text-[#151515] dark:text-white">
                    <input type="checkbox" className="size-[14px]" />
                    <span>Builder Images (12)</span>
                  </label>
                  <label className="flex items-center gap-[8px] cursor-pointer text-[14px] text-[#151515] dark:text-white">
                    <input type="checkbox" className="size-[14px]" />
                    <span>Devfiles (5)</span>
                  </label>
                  <label className="flex items-center gap-[8px] cursor-pointer text-[14px] text-[#151515] dark:text-white">
                    <input type="checkbox" className="size-[14px]" />
                    <span>Helm Charts (117)</span>
                  </label>
                  <label className="flex items-center gap-[8px] cursor-pointer text-[14px] text-[#151515] dark:text-white">
                    <input type="checkbox" className="size-[14px]" defaultChecked />
                    <span>Operators (488)</span>
                  </label>
                  <label className="flex items-center gap-[8px] cursor-pointer text-[14px] text-[#151515] dark:text-white">
                    <input type="checkbox" className="size-[14px]" />
                    <span>Templates (41)</span>
                  </label>
                  <button
                    className="text-[#0066cc] dark:text-[#4dabf7] hover:underline text-[13px]"
                    onClick={() => setShowAllTypes(!showAllTypes)}
                  >
                    {showAllTypes ? "Hide" : "Show all"}
                  </button>
                </div>
              )}
            </div>

            {/* Capabilities Filter */}
            <div className="mb-[16px]">
              <button 
                onClick={() => toggleCategory("Capabilities")}
                className="w-full flex items-center justify-between mb-[8px] text-[14px] font-semibold text-[#151515] dark:text-white"
              >
                <span>Capabilities</span>
                {expandedCategories.includes("Capabilities") ? (
                  <ChevronDown className="size-[14px]" />
                ) : (
                  <ChevronRight className="size-[14px]" />
                )}
              </button>
            </div>

            {/* Source Filter */}
            <div className="mb-[16px]">
              <button
                onClick={() => toggleCategory("Source")}
                className="w-full flex items-center justify-between mb-[8px] text-[14px] font-semibold text-[#151515] dark:text-white"
              >
                <span>Source</span>
                {expandedCategories.includes("Source") ? (
                  <ChevronDown className="size-[14px]" />
                ) : (
                  <ChevronRight className="size-[14px]" />
                )}
              </button>
              {expandedCategories.includes("Source") && (
                <div className="space-y-[8px] pl-[4px]">
                  <label className="flex items-center gap-[8px] cursor-pointer text-[14px] text-[#151515] dark:text-white">
                    <input 
                      type="checkbox" 
                      className="size-[14px]" 
                      checked={filters.source.includes("Certified")}
                      onChange={() => toggleFilter("source", "Certified")}
                    />
                    <span>Certified</span>
                  </label>
                  <label className="flex items-center gap-[8px] cursor-pointer text-[14px] text-[#151515] dark:text-white">
                    <input 
                      type="checkbox" 
                      className="size-[14px]" 
                      checked={filters.source.includes("Community")}
                      onChange={() => toggleFilter("source", "Community")}
                    />
                    <span>Community</span>
                  </label>
                  <label className="flex items-center gap-[8px] cursor-pointer text-[14px] text-[#151515] dark:text-white">
                    <input 
                      type="checkbox" 
                      className="size-[14px]" 
                      checked={filters.source.includes("Red Hat")}
                      onChange={() => toggleFilter("source", "Red Hat")}
                    />
                    <span>Red Hat</span>
                  </label>
                </div>
              )}
            </div>

            {/* Provider Filter */}
            <div className="mb-[16px]">
              <button
                onClick={() => toggleCategory("Provider")}
                className="w-full flex items-center justify-between mb-[8px] text-[14px] font-semibold text-[#151515] dark:text-white"
              >
                <span>Provider</span>
                {expandedCategories.includes("Provider") ? (
                  <ChevronDown className="size-[14px]" />
                ) : (
                  <ChevronRight className="size-[14px]" />
                )}
              </button>
              {expandedCategories.includes("Provider") && (
                <div className="space-y-[8px] pl-[4px]">
                  <label className="flex items-center gap-[8px] cursor-pointer text-[14px] text-[#151515] dark:text-white">
                    <input 
                      type="checkbox" 
                      className="size-[14px]" 
                      checked={filters.provider.includes("Couchbase")}
                      onChange={() => toggleFilter("provider", "Couchbase")}
                    />
                    <span>Couchbase</span>
                  </label>
                  <label className="flex items-center gap-[8px] cursor-pointer text-[14px] text-[#151515] dark:text-white">
                    <input 
                      type="checkbox" 
                      className="size-[14px]" 
                      checked={filters.provider.includes("CrunchyData")}
                      onChange={() => toggleFilter("provider", "CrunchyData")}
                    />
                    <span>CrunchyData</span>
                  </label>
                  <label className="flex items-center gap-[8px] cursor-pointer text-[14px] text-[#151515] dark:text-white">
                    <input 
                      type="checkbox" 
                      className="size-[14px]" 
                      checked={filters.provider.includes("Dynatrace")}
                      onChange={() => toggleFilter("provider", "Dynatrace")}
                    />
                    <span>Dynatrace</span>
                  </label>
                  <label className="flex items-center gap-[8px] cursor-pointer text-[14px] text-[#151515] dark:text-white">
                    <input 
                      type="checkbox" 
                      className="size-[14px]" 
                      checked={filters.provider.includes("Red Hat")}
                      onChange={() => toggleFilter("provider", "Red Hat")}
                    />
                    <span>Red Hat</span>
                  </label>
                  <button
                    className="text-[#0066cc] dark:text-[#4dabf7] hover:underline text-[13px]"
                    onClick={() => setShowAllProviders(!showAllProviders)}
                  >
                    {showAllProviders ? "Hide" : "Show 7 more"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Operator Grid */}
          <div className="flex-1">
            {/* Search and Toggle Controls */}
            <div className="mb-[24px]">
              <div className="flex items-center gap-[16px]">
                <div className="relative w-[280px]">
                  <Search className="absolute left-[12px] top-[10px] size-[16px] text-[#4d4d4d] dark:text-[#b0b0b0]" />
                  <input
                    type="text"
                    placeholder="Find by name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-[36px] pr-[12px] py-[8px] bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[#c7c7c7] dark:border-[rgba(255,255,255,0.2)] rounded-[999px] text-[14px] text-[#151515] dark:text-white placeholder:text-[#4d4d4d] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-[#0066cc] dark:focus:ring-[#4dabf7]"
                  />
                </div>
                
                <label className="flex items-center gap-[8px] cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={showLegacyCatalog}
                      onChange={(e) => setShowLegacyCatalog(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className={`w-[40px] h-[20px] rounded-full transition-all ${showLegacyCatalog ? 'bg-[#0066cc] dark:bg-[#4dabf7]' : 'bg-[#d1d1d1] dark:bg-[#4d4d4d]'}`}>
                      <div className={`absolute top-[2px] w-[16px] h-[16px] bg-white rounded-full transition-all ${showLegacyCatalog ? 'left-[22px]' : 'left-[2px]'}`}></div>
                    </div>
                  </div>
                  <span className="text-[14px] text-[#151515] dark:text-white">Legacy catalog</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[16px]">
              {filteredOperators.map((operator) => (
                <button
                  key={operator.id}
                  onClick={() => handleOperatorClick(operator)}
                  className="bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(255,255,255,0.05)] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] rounded-[16px] p-[20px] text-left hover:shadow-[0px_4px_16px_0px_rgba(0,0,0,0.12)] transition-all"
                >
                  <div className="flex items-start gap-[12px] mb-[12px]">
                    <div className="size-[48px] bg-[#0066cc] dark:bg-[#4dabf7] rounded-[8px] flex items-center justify-center text-[24px] shrink-0">
                      {operator.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-[8px] mb-[4px]">
                        <h3 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[16px] text-[#151515] dark:text-white">
                          {operator.name}
                        </h3>
                        <span className={`px-[8px] py-[2px] rounded-[4px] text-[11px] font-semibold shrink-0 ${
                          operator.providerType === "Red Hat"
                            ? "bg-[#c9190b] text-white"
                            : operator.providerType === "Community"
                            ? "bg-[#8a8d90] text-white"
                            : "bg-[#0066cc] text-white"
                        }`}>
                          {operator.providerType}
                        </span>
                      </div>
                      <p className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] mb-[8px]">
                        Provided by {operator.provider}
                      </p>
                    </div>
                  </div>
                  <p className="text-[14px] text-[#4d4d4d] dark:text-[#b0b0b0] mb-[12px] line-clamp-2">
                    {operator.description}
                  </p>
                  <div className="flex items-center justify-between">
                    {operator.hasUpdate ? (
                      <a
                        href="https://docs.openshift.com/container-platform/latest/operators/admin/olm-upgrading-operators.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/ecosystem/software-catalog/${operator.id}/update`);
                        }}
                        className="text-[13px] text-[#0066cc] dark:text-[#4dabf7] hover:underline flex items-center gap-[4px]"
                      >
                        <AlertTriangle className="size-[14px]" />
                        New version available
                      </a>
                    ) : operator.installed ? (
                      <span className="text-[13px] text-[#3e8635] dark:text-[#5ba352] flex items-center gap-[4px]">
                        <CheckCircle className="size-[14px]" />
                        Installed
                      </span>
                    ) : (
                      <span className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0]">
                        Not installed
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        </Breadcrumbs>
      </div>

      {/* Side Panel */}
      {showSidePanel && selectedOperator && (
        <div className="fixed inset-0 z-[10000]">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowSidePanel(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[480px] app-glass-panel app-glass-panel--edge-right overflow-y-auto">
            <div className="p-[24px]">
              <div className="flex items-start justify-between mb-[24px]">
                <h2 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[20px] text-[#151515] dark:text-white">
                  {selectedOperator.name}
                </h2>
                <button
                  onClick={() => setShowSidePanel(false)}
                  className="p-[4px] hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.08)] rounded-[4px] transition-colors"
                >
                  <X className="size-[16px]" />
                </button>
              </div>

              <p className="text-[14px] text-[#4d4d4d] dark:text-[#b0b0b0] mb-[24px]">
                {selectedOperator.currentVersion} provided by {selectedOperator.provider}
              </p>

              {selectedOperator.hasUpdate && (
                <div className="bg-[#fef6e6] dark:bg-[rgba(240,171,0,0.15)] border-l-4 border-[#f0ab00] dark:border-[#f4c145] rounded-[8px] p-[16px] mb-[24px]">
                  <div className="flex items-start gap-[12px]">
                    <AlertTriangle className="size-[20px] text-[#f0ab00] dark:text-[#f4c145] shrink-0 mt-[2px]" />
                    <div>
                      <p className="text-[14px] text-[#151515] dark:text-white font-semibold mb-[8px]">
                        New version {selectedOperator.newVersion} available!
                      </p>
                      <div className="flex gap-[8px]">
                        <button
                          onClick={() => {
                            navigate(`/ecosystem/software-catalog/${selectedOperator.id}/update`);
                            setShowSidePanel(false);
                          }}
                          className="px-[16px] py-[8px] bg-[#0066cc] hover:bg-[#004080] dark:bg-[#4dabf7] dark:hover:bg-[#339af0] text-white rounded-[8px] font-semibold text-[14px] transition-colors"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => {
                            navigate(`/ecosystem/software-catalog/${selectedOperator.id}`);
                            setShowSidePanel(false);
                          }}
                          className="px-[16px] py-[8px] bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[rgba(0,0,0,0.2)] dark:border-[rgba(255,255,255,0.2)] text-[#151515] dark:text-white rounded-[8px] font-semibold text-[14px] hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.08)] transition-colors"
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-[24px]">
                <h3 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[16px] text-[#151515] dark:text-white mb-[12px]">
                  Description
                </h3>
                <p className="text-[14px] text-[#4d4d4d] dark:text-[#b0b0b0]">
                  {selectedOperator.description}
                </p>
              </div>

              <div className="mb-[24px]">
                <h3 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[16px] text-[#151515] dark:text-white mb-[12px]">
                  Provider Information
                </h3>
                <div className="space-y-[8px]">
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#4d4d4d] dark:text-[#b0b0b0]">Provider</span>
                    <span className="text-[#151515] dark:text-white">{selectedOperator.provider}</span>
                  </div>
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#4d4d4d] dark:text-[#b0b0b0]">Source</span>
                    <span className="text-[#151515] dark:text-white">{selectedOperator.providerType}</span>
                  </div>
                  {selectedOperator.currentVersion && (
                    <div className="flex justify-between text-[14px]">
                      <span className="text-[#4d4d4d] dark:text-[#b0b0b0]">Version</span>
                      <span className="text-[#151515] dark:text-white">{selectedOperator.currentVersion}</span>
                    </div>
                  )}
                </div>
              </div>

              {!selectedOperator.installed && (
                <button
                  onClick={() => {
                    navigate(`/ecosystem/software-catalog/${selectedOperator.id}/install`);
                    setShowSidePanel(false);
                  }}
                  className="w-full px-[16px] py-[10px] bg-[#0066cc] hover:bg-[#004080] dark:bg-[#4dabf7] dark:hover:bg-[#339af0] text-white rounded-[8px] font-semibold text-[14px] transition-colors"
                >
                  Install
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}