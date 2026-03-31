import { useState, useEffect } from "react";
import { CheckCircle, Info, AlertCircle, MoreVertical, AlertTriangle, X, ExternalLink, Loader2, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router";
import Breadcrumbs from "../../components/Breadcrumbs";
import FavoriteButton from "../../components/FavoriteButton";
import { useChat } from "../../contexts/ChatContext";
import { RequiredUpdateModal, BulkUpdateModal } from "../../components/OperatorUpdateModals";

export default function InstalledOperatorsPage() {
  const [selectedOperators, setSelectedOperators] = useState<string[]>([]);
  const [openKebabIndex, setOpenKebabIndex] = useState<number | null>(null);
  const [dismissedBanner, setDismissedBanner] = useState(false);
  const [isRequiredUpdateModalOpen, setIsRequiredUpdateModalOpen] = useState(false);
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);
  const [updateInProgress, setUpdateInProgress] = useState(false);
  const [updateStage, setUpdateStage] = useState<'confirmation' | 'ai-analysis' | 'updating' | 'complete'>('confirmation');
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { setIsOpen: setIsAIOpen, addMessage, setCurrentPage } = useChat();

  // Set current page context for AI
  useEffect(() => {
    setCurrentPage('/ecosystem/installed-operators');
  }, [setCurrentPage]);

  const operators = [
    {
      name: "Abot Operator-v3.0.0",
      status: "Update available",
      statusType: "warning",
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
      status: "Update available",
      statusType: "warning",
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
      status: "Update available",
      statusType: "warning",
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
      status: "Update available",
      statusType: "warning",
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
      status: "Up to date",
      statusType: "success",
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
  ];

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOperators(operators.map(op => op.name));
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
    <div className="h-full overflow-y-auto">
      <div className="p-[24px]">
        <Breadcrumbs
          items={[
            { label: "Home", path: "/" },
            { label: "Ecosystem", path: "/ecosystem" },
            { label: "Installed Software" },
          ]}
        />

        <div className="mb-[24px]">
          <div className="flex items-center justify-between mb-[8px]">
            <h1 className="font-['Red_Hat_Display_VF:Medium',sans-serif] font-medium leading-[36.4px] text-[#151515] dark:text-white text-[28px]">
              Installed Software
            </h1>
            <FavoriteButton name="Installed Software" path="/ecosystem/installed" />
          </div>
          <p className="text-[14px] text-[#4d4d4d] dark:text-[#b0b0b0]">
            Monitor, manage and schedule updates for installed operators.
          </p>
        </div>

        {/* Cluster Update Banner */}
        {!dismissedBanner && (
          <div className="mb-[16px] bg-white dark:bg-[rgba(240,171,0,0.1)] border-l-2 border-[#f0ab00] rounded-[16px] p-[16px] relative">
            <div aria-hidden="true" className="absolute border-2 border-[#f0ab00] border-solid inset-0 pointer-events-none rounded-[16px]" />
            <button
              onClick={() => setDismissedBanner(true)}
              className="absolute top-[16px] right-[16px] p-[4px] hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.08)] rounded-[4px] transition-colors z-10"
              aria-label="Dismiss alert"
            >
              <X className="size-[16px] text-[#4d4d4d] dark:text-[#b0b0b0]" />
            </button>
            <div className="flex items-start gap-[12px] pr-[32px]">
              <AlertTriangle className="size-[20px] text-[#f0ab00] dark:text-[#f4c145] shrink-0 mt-[2px]" />
              <div className="flex-1">
                <p className="text-[14px] text-[#151515] dark:text-white font-medium mb-[4px]">
                  Cluster update requires operator updates
                </p>
                <p className="text-[14px] text-[#151515] dark:text-[#b0b0b0] mb-[8px]">
                  The following operators must be updated before you can update to OpenShift 4.22.0:
                </p>
                <ul className="list-disc list-inside mb-[12px] text-[14px] text-[#151515] dark:text-[#b0b0b0]">
                  <li>Abot Operator-v3.0.0</li>
                  <li>Airflow Helm Operator</li>
                </ul>
                <div className="flex gap-[12px]">
                  <button
                    onClick={() => setIsRequiredUpdateModalOpen(true)}
                    className="text-[14px] text-[#06c] dark:text-[#4dabf7] hover:underline no-underline cursor-pointer bg-transparent border-0"
                  >
                    Update operators now
                  </button>
                  <Link
                    to="/administration/cluster-update"
                    className="text-[14px] text-[#06c] dark:text-[#4dabf7] hover:underline no-underline"
                  >
                    View cluster update plan
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-[16px] mb-[24px]">
          <div className="bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(255,255,255,0.05)] rounded-[16px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.06)] p-[20px] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-[12px] mb-[8px]">
              <CheckCircle className="size-[24px] text-[#3e8635] dark:text-[#5ba352]" />
              <p className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[13px]">Installed Software</p>
            </div>
            <p className="font-['Red_Hat_Display:Bold',sans-serif] font-bold text-[#151515] dark:text-white text-[32px]">
              5
            </p>
          </div>
          <div className="bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(255,255,255,0.05)] rounded-[16px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.06)] p-[20px] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-[12px] mb-[8px]">
              <Info className="size-[24px] text-[#2b9af3] dark:text-[#73bcf7]" />
              <p className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[13px]">Available Updates</p>
            </div>
            <p className="font-['Red_Hat_Display:Bold',sans-serif] font-bold text-[#2b9af3] dark:text-[#73bcf7] text-[32px]">
              4
            </p>
          </div>
          <div className="bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(255,255,255,0.05)] rounded-[16px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.06)] p-[20px] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-[12px] mb-[8px]">
              <AlertCircle className="size-[24px] text-[#f0ab00] dark:text-[#f4c145]" />
              <p className="text-[#4d4d4d] dark:text-[#b0b0b0] text-[13px]">End of Life Support</p>
            </div>
            <p className="font-['Red_Hat_Display:Bold',sans-serif] font-bold text-[#f0ab00] dark:text-[#f4c145] text-[32px]">
              2
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between mb-[24px]">
          <div className="flex gap-[24px] text-[14px] border-b border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)]">
            <button className="pb-[12px] border-b-2 border-[#0066cc] dark:border-[#4dabf7] font-semibold text-[#151515] dark:text-white -mb-[1px]">
              Operators (OLM v0)
            </button>
            <button className="pb-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] hover:text-[#151515] dark:hover:text-white flex items-center gap-[8px]">
              Cluster extensions (OLMv1)
              <span className="px-[8px] py-[2px] bg-[#2b9af3] text-white rounded-[12px] text-[11px] font-semibold">
                Tech preview
              </span>
            </button>
          </div>
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

        {/* Table */}
        <div className="bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(255,255,255,0.05)] rounded-[24px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)]">
                  <th className="text-left py-[16px] px-[20px] w-[50px]">
                    <input 
                      type="checkbox"
                      checked={selectedOperators.length === operators.length}
                      onChange={handleSelectAll}
                      className="size-[16px] cursor-pointer"
                    />
                  </th>
                  <th className="text-left py-[16px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px]">
                    Name ↕
                  </th>
                  <th className="text-left py-[16px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px]">
                    Status ↕
                  </th>
                  <th className="text-left py-[16px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px]">
                    Version ↕
                  </th>
                  <th className="text-left py-[16px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px]">
                    Update plan ↕
                  </th>
                  <th className="text-left py-[16px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px]">
                    Cluster compatibility ↕
                  </th>
                  <th className="text-left py-[16px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px]">
                    Support ↕
                  </th>
                  <th className="text-left py-[16px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px]">
                    Last updated ↕
                  </th>
                  <th className="text-left py-[16px] px-[12px] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[13px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {operators.map((op, index) => (
                  <tr
                    key={op.name}
                    className={`border-b border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.05)] hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] transition-colors ${
                      index === operators.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="py-[16px] px-[20px]">
                      <input 
                        type="checkbox"
                        checked={selectedOperators.includes(op.name)}
                        onChange={() => handleSelectOperator(op.name)}
                        className="size-[16px] cursor-pointer"
                      />
                    </td>
                    <td className="py-[16px] px-[12px]">
                      <div className="flex items-center gap-[8px]">
                        <Link 
                          to={`/ecosystem/installed-operators/${op.name}`}
                          className="font-['Red_Hat_Text:Medium',sans-serif] font-medium text-[#0066cc] dark:text-[#4dabf7] text-[14px] hover:underline no-underline"
                        >
                          {op.name}
                        </Link>
                        {op.required && (
                          <span className="px-[8px] py-[2px] bg-[#f0ab00] text-white rounded-[4px] text-[11px] font-semibold">
                            Required
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-[16px] px-[12px]">
                      <span className={`px-[10px] py-[4px] rounded-[999px] text-[12px] font-semibold inline-flex items-center gap-[6px] ${
                        op.statusType === "warning" 
                          ? "bg-[#e7f6fd] dark:bg-[rgba(43,154,243,0.15)] text-[#2b9af3] dark:text-[#73bcf7]"
                          : "bg-[#f3faf2] dark:bg-[rgba(62,134,53,0.15)] text-[#3e8635] dark:text-[#5ba352]"
                      }`}>
                        <span className="size-[6px] rounded-full bg-current"></span>
                        {op.status}
                      </span>
                    </td>
                    <td className="py-[16px] px-[12px] text-[14px] text-[#4d4d4d] dark:text-[#b0b0b0]">
                      {op.version}
                    </td>
                    <td className="py-[16px] px-[12px] text-[14px] text-[#4d4d4d] dark:text-[#b0b0b0]">
                      {op.updatePlan}
                    </td>
                    <td className="py-[16px] px-[12px] text-[14px] text-[#4d4d4d] dark:text-[#b0b0b0]">
                      {op.clusterCompatibility}
                    </td>
                    <td className="py-[16px] px-[12px]">
                      <div>
                        <p className="text-[14px] text-[#4d4d4d] dark:text-[#b0b0b0]">{op.support}</p>
                        <span className={`text-[12px] ${
                          op.supportBadge === "End of life" 
                            ? "text-[#f0ab00] dark:text-[#f4c145]"
                            : "text-[#3e8635] dark:text-[#5ba352]"
                        }`}>
                          {op.supportBadge}
                        </span>
                      </div>
                    </td>
                    <td className="py-[16px] px-[12px] text-[14px] text-[#4d4d4d] dark:text-[#b0b0b0]">
                      {op.lastUpdated}
                    </td>
                    <td className="py-[16px] px-[12px]">
                      <div className="relative">
                        <button
                          className="p-[4px] hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.08)] rounded-[4px] transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenKebabIndex(openKebabIndex === index ? null : index);
                          }}
                        >
                          <MoreVertical className="size-[16px] text-[#4d4d4d] dark:text-[#b0b0b0]" />
                        </button>
                        
                        {openKebabIndex === index && (
                          <>
                            <div 
                              className="fixed inset-0 z-[9998]" 
                              onClick={() => setOpenKebabIndex(null)}
                            />
                            <div className="absolute right-0 mt-[4px] w-[220px] bg-white dark:bg-[#1f1f1f] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] rounded-[8px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.12)] z-[9999] py-[4px]">
                              <button
                                className="w-full text-left px-[16px] py-[8px] text-[14px] text-[#151515] dark:text-white hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                                onClick={() => {
                                  navigate(`/ecosystem/installed-operators/${op.name}`);
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
                                  navigate(`/ecosystem/installed-operators/${op.name}/subscription`);
                                  setOpenKebabIndex(null);
                                }}
                              >
                                Edit subscription
                              </button>
                              <button
                                className="w-full text-left px-[16px] py-[8px] text-[14px] text-[#151515] dark:text-white hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                                onClick={() => {
                                  navigate(`/ecosystem/installed-operators/${op.name}/yaml`);
                                  setOpenKebabIndex(null);
                                }}
                              >
                                View YAML
                              </button>
                              <button
                                className="w-full text-left px-[16px] py-[8px] text-[14px] text-[#151515] dark:text-white hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                                onClick={() => {
                                  navigate(`/ecosystem/installed-operators/${op.name}/logs`);
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
                                  navigate(`/ecosystem/installed-operators/${op.name}/events`);
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
                              </button>\n                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RequiredUpdateModal
        isOpen={isRequiredUpdateModalOpen}
        onClose={() => setIsRequiredUpdateModalOpen(false)}
        operators={operators}
      />

      <BulkUpdateModal
        isOpen={isBulkUpdateModalOpen}
        onClose={() => setIsBulkUpdateModalOpen(false)}
        selectedOperators={selectedOperators}
        operators={operators}
      />
    </div>
  );
}