import { useState } from "react";
import { useNavigate } from "react-router";
import { AlertTriangle } from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs";
import FavoriteButton from "../../components/FavoriteButton";

export default function ClusterSettingsPage() {
  const navigate = useNavigate();
  // Simulate checking if update is in progress
  const [isUpdateInProgress] = useState(true); // In real app, this would come from global state/context

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-[24px]">
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
              Configuration
            </button>
          </div>
        </div>

        {/* Update in Progress Warning */}
        {isUpdateInProgress && (
          <div className="bg-[#fdf7e7] dark:bg-[rgba(240,171,0,0.1)] border-2 border-[#f0ab00] dark:border-[#f4c145] rounded-[16px] p-[20px] mb-[24px]">
            <div className="flex items-start gap-[16px] mb-[16px]">
              <AlertTriangle className="size-[24px] text-[#f0ab00] dark:text-[#f4c145] flex-shrink-0 mt-[2px]" />
              <div className="flex-1">
                <h3 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[16px] mb-[8px]">
                  This cluster should not be updated to a minor version.
                </h3>
                <p className="text-[14px] text-[#151515] dark:text-white mb-[12px]">
                  An update is already in progress and details are in the Progressing condition.
                </p>
                <div className="flex gap-[12px]">
                  <button
                    onClick={() => navigate('/administration/cluster-update/in-progress')}
                    className="bg-white dark:bg-[rgba(255,255,255,0.05)] border-2 border-[#f0ab00] dark:border-[#f4c145] text-[#151515] dark:text-white px-[16px] py-[8px] rounded-[8px] font-semibold text-[14px] hover:bg-[rgba(240,171,0,0.05)] dark:hover:bg-[rgba(240,171,0,0.1)] transition-colors"
                  >
                    Review update progress
                  </button>
                  <button className="text-[#0066cc] dark:text-[#4dabf7] hover:underline font-semibold text-[14px] px-[12px]">
                    View Release Notes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
    </div>
  );
}