import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import Breadcrumbs from "../../components/Breadcrumbs";
import FavoriteButton from "../../components/FavoriteButton";
import {
  AiAssessmentSection,
  AvailableUpdatesSection,
  PreflightFromTargetSection,
  OlsChatbot,
  channelVersions,
} from "./ClusterUpdatePlanPage";

export default function ClusterSettingsPage() {
  const navigate = useNavigate();

  const [selectedChannel, setSelectedChannel] = useState("fast-5.1");
  const [showZStreamOnly, setShowZStreamOnly] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string>("5.1.10");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ "5.1": true });

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

  const handleChatAction = useCallback((_actionId: string) => {}, []);

  return (
    <div className="flex h-full relative min-w-0">
      <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-[24px] pb-[48px]">
        <Breadcrumbs
          items={[
            { label: "Home", path: "/" },
            { label: "Cluster Settings" },
          ]}
        />

        <div className="mb-[24px]">
          <div className="flex items-center justify-between mb-[16px]">
            <h1 className="font-['Red_Hat_Display_VF:Medium',sans-serif] font-medium leading-[36.4px] text-[#151515] dark:text-white text-[28px]">
              Cluster Settings
            </h1>
            <FavoriteButton name="Cluster Settings" path="/administration/cluster-settings" />
          </div>
          <div className="flex gap-[24px] text-[14px] border-b border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)]">
            <button className="pb-[12px] border-b-2 border-[#0066cc] dark:border-[#4dabf7] font-semibold text-[#151515] dark:text-white -mb-[1px]">
              Details
            </button>
            <button className="pb-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] hover:text-[#151515] dark:hover:text-white">
              ClusterOperators
            </button>
            <button className="pb-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] hover:text-[#151515] dark:hover:text-white">
              Configuration
            </button>
          </div>
        </div>

        {/* AI Assessment */}
        <AiAssessmentSection openChatbot={openChatbot} selectedVersion={selectedVersion} />

        {/* Preflight Checks from Target Release */}
        <PreflightFromTargetSection selectedVersion={selectedVersion} openChatbot={openChatbot} />

        {/* Available Updates */}
        <AvailableUpdatesSection
          channelData={channelData}
          showZStreamOnly={showZStreamOnly}
          setShowZStreamOnly={setShowZStreamOnly}
          expandedGroups={expandedGroups}
          setExpandedGroups={setExpandedGroups}
          selectedVersion={selectedVersion}
          setSelectedVersion={setSelectedVersion}
          navigate={navigate}
          setActiveTab={() => {}}
          openChatbot={openChatbot}
          selectedChannel={selectedChannel}
          handleChannelChange={handleChannelChange}
        />

        {/* Cluster Details */}
        <div className="bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(255,255,255,0.05)] rounded-[16px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.06)] p-[24px] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] mb-[24px]">
          <div className="space-y-[20px]">
            <div>
              <h3 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[16px] mb-[8px]">
                Subscription
              </h3>
              <a href="https://console.redhat.com/openshift" target="_blank" rel="noopener noreferrer" className="text-[14px] text-[#0066cc] dark:text-[#4dabf7] hover:underline">
                OpenShift Cluster Manager
              </a>
            </div>

            <div>
              <h3 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[16px] mb-[8px]">
                Service Level Agreement (SLA)
              </h3>
              <p className="text-[14px] text-[#4d4d4d] dark:text-[#b0b0b0]">Self-support, 60 day trial</p>
              <p className="text-[14px] text-[#4d4d4d] dark:text-[#b0b0b0]">59 days remaining</p>
              <a href="https://console.redhat.com/openshift/subscriptions" target="_blank" rel="noopener noreferrer" className="text-[14px] text-[#0066cc] dark:text-[#4dabf7] hover:underline">
                Manage subscription settings
              </a>
            </div>

            <div>
              <h3 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[16px] mb-[8px]">
                Cluster ID
              </h3>
              <p className="text-[14px] text-[#4d4d4d] dark:text-[#b0b0b0] font-mono">
                b86faa3-b06c-4a82-8fa7-54b80a92d4b2
              </p>
            </div>

            <div>
              <h3 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[16px] mb-[8px]">
                Desired release image
              </h3>
              <p className="text-[14px] text-[#4d4d4d] dark:text-[#b0b0b0] font-mono break-all">
                registry.ci.openshift.org/ocp/release@sha256:6dbbd6b0fa89c1c0223ae79b32fb3ff1a4fc2f3a96b352bf7fd487cd2023cd0c3ae499bfdd6b6c74297bf93f9bc2ea6b8c5b6dfda8e74297bf93
              </p>
            </div>

            <div>
              <h3 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[16px] mb-[8px]">
                Upstream configuration
              </h3>
              <a href="https://docs.openshift.com/container-platform/latest/updating/understanding_updates/understanding-update-channels-releases.html" target="_blank" rel="noopener noreferrer" className="text-[14px] text-[#0066cc] dark:text-[#4dabf7] hover:underline">
                https://apenshift-release.apps.ci.ci24.p1.openshiftapps.com/graph
              </a>
            </div>

            <div>
              <h3 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[16px] mb-[8px]">
                Cluster autoscaler
              </h3>
              <a href="https://docs.openshift.com/container-platform/latest/machine_management/applying-autoscaling.html" target="_blank" rel="noopener noreferrer" className="text-[14px] text-[#0066cc] dark:text-[#4dabf7] hover:underline">
                Create autoscaler
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* OLS Chatbot Panel */}
      {chatbotOpen && (
        <OlsChatbot
          context={chatbotContext}
          selectedVersion={selectedVersion}
          selectedChannel={selectedChannel}
          onClose={() => setChatbotOpen(false)}
          onAction={handleChatAction}
        />
      )}
    </div>
  );
}
