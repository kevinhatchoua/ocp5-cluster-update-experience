import { Link } from "react-router";
import svgPaths from "../../imports/svg-929lpcd05l";
import { imgGroup } from "../../imports/svg-0mrfg";

function Frame1() {
  return (
    <div className="content-stretch flex items-center justify-center p-[16px] relative rounded-[16px] shrink-0 size-[48px]">
      <div aria-hidden="true" className="absolute bg-[#f2f2f2] inset-0 mix-blend-luminosity pointer-events-none rounded-[16px]" />
      <div aria-hidden="true" className="absolute border-2 border-[#f56e6e] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name="rh-ui-icon-dark-mode">
        <div className="absolute inset-[11.37%_11.38%_9.37%_9.38%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.02 19.0201">
            <path d={svgPaths.p116ee100} fill="var(--fill-0, #1F1F1F)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Greeting() {
  return (
    <div className="flex gap-[16px] items-center">
      <Frame1 />
      <p className="font-['Red_Hat_Display_VF:Medium',sans-serif] font-medium leading-[36.4px] relative shrink-0 text-[#151515] dark:text-white text-[28px] whitespace-nowrap">Good evening</p>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute inset-[0.6%_0.55%]" data-name="Group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 46.4853 27.6615">
        <g id="Group">
          <path d={svgPaths.p4696980} fill="var(--fill-0, black)" id="Vector" />
          <g id="Group_2">
            <path clipRule="evenodd" d={svgPaths.p2fbaf00} fill="var(--fill-0, #FF9900)" fillRule="evenodd" id="Vector_2" />
            <path clipRule="evenodd" d={svgPaths.p23244380} fill="var(--fill-0, #FF9900)" fillRule="evenodd" id="Vector_3" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function DetailsCard() {
  return (
    <div className="bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(255,255,255,0.05)] relative rounded-[24px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.06)] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[24px] items-start p-[24px] relative w-full">
        <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
          <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
            <div className="overflow-clip relative shrink-0 size-[20px]">
              <div className="absolute inset-[3.13%]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.75 18.75">
                  <path d={svgPaths.p258dd700} fill="var(--fill-0, #1F1F1F)" className="dark:fill-white" id="Vector" />
                </svg>
              </div>
            </div>
            <p className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#151515] dark:text-white text-[16px] whitespace-nowrap">Details</p>
          </div>
          <Link to="/settings" className="no-underline">
            <div className="bg-[rgba(255,255,255,0)] content-stretch flex gap-[4px] items-center p-[4px] relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity">
              <p className="font-['Red_Hat_Text_VF:Regular',sans-serif] font-normal leading-[21px] relative shrink-0 text-[#06c] dark:text-[#4dabf7] text-[14px] whitespace-nowrap">View settings</p>
            </div>
          </Link>
        </div>

        <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
          <div className="content-stretch flex flex-col gap-[4px] items-start leading-[normal] relative shrink-0 w-full">
            <p className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#151515] dark:text-white text-[14px] w-full">Cluster API address</p>
            <p className="font-['Red_Hat_Mono:Regular',sans-serif] font-normal overflow-hidden relative shrink-0 text-[#4d4d4d] dark:text-[#b0b0b0] text-[12px] text-ellipsis w-full whitespace-nowrap">
              https://api.rhamilto.devcluster.openshift.com:6443
            </p>
          </div>

          <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full">
            <p className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold leading-[normal] min-w-full relative shrink-0 text-[#151515] dark:text-white text-[14px] w-[min-content]">Cluster ID</p>
            <p className="font-['Red_Hat_Mono:Regular',sans-serif] font-normal leading-[normal] min-w-full relative shrink-0 text-[#4d4d4d] dark:text-[#b0b0b0] text-[12px] w-[min-content]">
              03242ee9-8986-4f0f-acc0-65aad26ba6a5
            </p>
            <div className="content-stretch flex items-center relative shrink-0">
              <a href="https://console.redhat.com/openshift" target="_blank" rel="noopener noreferrer" className="[text-decoration-skip-ink:none] decoration-solid font-['Red_Hat_Text_VF:Regular',sans-serif] font-normal leading-[21px] relative shrink-0 text-[#06c] dark:text-[#4dabf7] text-[14px] underline whitespace-nowrap hover:opacity-70 transition-opacity">
                OpenShift Cluster Manager
              </a>
            </div>
          </div>

          <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
            <p className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold leading-[normal] min-w-full relative shrink-0 text-[#151515] dark:text-white text-[14px] w-[min-content]">Infrastructure provider</p>
            <div className="h-[28px] overflow-clip relative shrink-0 w-[47px]">
              <Group1 />
            </div>
          </div>

          <div className="content-stretch flex flex-col gap-[4px] items-start leading-[normal] relative shrink-0 w-full">
            <p className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#151515] dark:text-white text-[14px] w-full">OpenShift version</p>
            <div className="flex items-center gap-[8px] w-full">
              <p className="font-['Red_Hat_Mono:Regular',sans-serif] font-normal relative shrink-0 text-[#4d4d4d] dark:text-[#b0b0b0] text-[12px]">4.21.0</p>
              <Link to="/administration/cluster-update" className="font-['Red_Hat_Text_VF:Regular',sans-serif] text-[11px] text-[#0066cc] dark:text-[#4dabf7] no-underline hover:underline px-[6px] py-[1px] bg-[#e7f1fa] dark:bg-[rgba(43,154,243,0.1)] rounded-[4px]">
                Update available
              </Link>
            </div>
          </div>

          <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full">
            <p className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold leading-[normal] min-w-full relative shrink-0 text-[#151515] dark:text-white text-[14px] w-[min-content]">
              Service Level Agreement (SLA)
            </p>
            <div className="font-['Red_Hat_Text:Regular',sans-serif] font-normal leading-[normal] min-w-full relative shrink-0 text-[#4d4d4d] dark:text-[#b0b0b0] text-[14px] w-[min-content]">
              <p className="mb-0">Self-support, 60 day trial</p>
              <p>Warning alert:59 days remaining</p>
            </div>
            <div className="content-stretch flex items-center relative shrink-0">
              <a href="https://console.redhat.com/openshift/subscriptions" target="_blank" rel="noopener noreferrer" className="[text-decoration-skip-ink:none] decoration-solid font-['Red_Hat_Text_VF:Regular',sans-serif] font-normal leading-[21px] relative shrink-0 text-[#06c] dark:text-[#4dabf7] text-[14px] underline whitespace-nowrap hover:opacity-70 transition-opacity">
                Manage subscription settings
              </a>
            </div>
          </div>

          <div className="content-stretch flex flex-col gap-[4px] items-start leading-[normal] relative shrink-0 w-full">
            <p className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#151515] dark:text-white text-[14px] w-full">Update channel</p>
            <p className="font-['Red_Hat_Mono:Regular',sans-serif] font-normal relative shrink-0 text-[#4d4d4d] dark:text-[#b0b0b0] text-[12px] w-full">candidate-4.22</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClusterInventoryCard() {
  const items = [
    { label: "Nodes", badge: "N", color: "#8476d1", count: 6 },
    { label: "Pods", badge: "P", color: "#009596", count: 273 },
    { label: "StorageClasses", badge: "SC", color: "#2b9af3", count: 2 },
    { label: "PersistentVolumeClaims", badge: "PVC", color: "#2b9af3", count: 0 },
  ];

  return (
    <div className="bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(255,255,255,0.05)] relative rounded-[24px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.06)] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[24px] items-start p-[24px] relative w-full">
        <Link to="/inventory" className="no-underline mb-[4px]">
          <div className="content-stretch flex gap-[16px] items-center relative shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="overflow-clip relative shrink-0 size-[20px]">
              <div className="absolute inset-[3.13%_6.25%]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.5 18.75">
                  <path d={svgPaths.p1ef87c00} fill="var(--fill-0, #1F1F1F)" className="dark:fill-white" id="Vector" />
                </svg>
              </div>
            </div>
            <p className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#151515] dark:text-white text-[16px] whitespace-nowrap">Cluster inventory</p>
          </div>
        </Link>

        <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
          {items.map((item, index) => (
            <div key={index}>
              <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
                <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
                  <div className="content-stretch flex items-center relative shrink-0 w-[45px]">
                    <div
                      className="content-stretch flex flex-col items-center justify-center px-[8px] relative rounded-[999px] shrink-0"
                      style={{ backgroundColor: item.color, minWidth: "26px" }}
                    >
                      <p className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[14px] text-white w-full">{item.badge}</p>
                    </div>
                  </div>
                  <p className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#151515] dark:text-white text-[14px] whitespace-nowrap">{item.label}</p>
                </div>
                <div className="bg-[#e0e0e0] dark:bg-[rgba(255,255,255,0.1)] content-stretch flex items-center justify-center min-w-[32px] px-[8px] relative rounded-[999px] shrink-0">
                  <p className="flex-[1_0_0] font-['Red_Hat_Text_VF:Medium',sans-serif] font-medium leading-[18px] min-h-px min-w-px relative text-[#151515] dark:text-white text-[12px] text-center">
                    {item.count}
                  </p>
                </div>
              </div>
              {index < items.length - 1 && (
                <div className="content-stretch flex h-px items-start opacity-25 relative shrink-0 w-full mt-[12px]">
                  <div className="bg-[#c7c7c7] dark:bg-[rgba(255,255,255,0.2)] flex-[1_0_0] h-px min-h-px min-w-px" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActivityCard() {
  const recentEvents = [
    { time: "12:52 PM", text: 'Pulling image "nginx"', badge: "P", color: "#009596", id: 1 },
    { time: "12:40 PM", text: "Back-off restarting failed container task-pv-container in pod task-pv-pod_robb(295e1f3c-bea0-42b7-b557-ce829dc542b6)", badge: "P", color: "#009596", id: 2 },
    { time: "12:14 PM", text: "Job completed", badge: "J", color: "#004080", id: 3 },
    { time: "11:53 PM", text: "Saw completed job: image-pruner-29543040, condition: Complete", badge: "CJ", color: "#2b9af3", id: 4 },
    { time: "11:38 PM", text: "Created container: image-pruner", badge: "P", color: "#009596", id: 5 },
  ];

  return (
    <div className="bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(255,255,255,0.05)] relative rounded-[24px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.06)] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[24px] items-start p-[24px] relative w-full">
        <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
          <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
            <div className="overflow-clip relative shrink-0 size-[20px]">
              <div className="absolute inset-[3.13%_3.13%_3.12%_3.13%]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.75 18.7501">
                  <path d={svgPaths.p1af00480} fill="var(--fill-0, #1F1F1F)" className="dark:fill-white" id="Vector" />
                </svg>
              </div>
            </div>
            <p className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#151515] dark:text-white text-[16px] whitespace-nowrap">Activity</p>
          </div>
          <Link to="/activity/all" className="no-underline">
            <div className="bg-[rgba(255,255,255,0)] content-stretch flex gap-[4px] items-center p-[4px] relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity">
              <p className="font-['Red_Hat_Text_VF:Regular',sans-serif] font-normal leading-[21px] relative shrink-0 text-[#06c] dark:text-[#4dabf7] text-[14px] whitespace-nowrap">View all events</p>
            </div>
          </Link>
        </div>

        <div className="content-stretch flex flex-col gap-[8px] items-start leading-[normal] relative shrink-0 text-[14px] w-full">
          <p className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#151515] dark:text-white w-full">Ongoing</p>
          <p className="font-['Red_Hat_Text:Regular',sans-serif] font-normal relative shrink-0 text-[#4d4d4d] dark:text-[#b0b0b0] w-full">There are no ongoing activities.</p>
        </div>

        <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
          <p className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#151515] dark:text-white text-[14px] whitespace-nowrap">Recent events</p>
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex gap-[4px] items-center p-[4px] relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity">
            <p className="font-['Red_Hat_Text_VF:Regular',sans-serif] font-normal leading-[21px] relative shrink-0 text-[#06c] dark:text-[#4dabf7] text-[14px] whitespace-nowrap">Pause</p>
          </div>
        </div>

        <div className="content-stretch flex flex-col gap-[15px] items-start relative shrink-0 w-full">
          {recentEvents.map((event) => (
            <Link key={event.id} to={`/activity/${event.id}`} className="no-underline w-full">
              <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full cursor-pointer hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.05)] rounded-lg p-2 -m-2 transition-colors">
                <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center min-h-px min-w-px relative">
                  <p className="font-['Red_Hat_Mono:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#4d4d4d] dark:text-[#b0b0b0] text-[12px] text-right w-[58px]">{event.time}</p>
                  <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center min-h-px min-w-px relative">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[35px]">
                      <div className="content-stretch flex flex-col items-center justify-center px-[8px] relative rounded-[999px] shrink-0 w-[26px]" style={{ backgroundColor: event.color }}>
                        <p className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[14px] text-white w-full">{event.badge}</p>
                      </div>
                    </div>
                    <p className="flex-[1_0_0] font-['Red_Hat_Text:Regular',sans-serif] font-normal leading-[normal] min-h-px min-w-px overflow-hidden relative text-[#151515] dark:text-white text-[14px] text-ellipsis whitespace-nowrap">
                      {event.text}
                    </p>
                  </div>
                </div>
                <div className="overflow-clip relative shrink-0 size-[12px]">
                  <div className="absolute bottom-[5%] left-1/4 right-[26.04%] top-[5%]">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.87538 10.8001">
                      <path d={svgPaths.p10416800} fill="var(--fill-0, #707070)" className="dark:fill-[#b0b0b0]" id="Vector" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusCard() {
  return (
    <div className="bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(255,255,255,0.05)] relative rounded-[24px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.06)] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[24px] items-start p-[24px] relative w-full">
        <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
          <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
            <div className="overflow-clip relative shrink-0 size-[20px]">
              <div className="absolute inset-[6.25%]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.5 17.5">
                  <path d={svgPaths.p288d9200} fill="var(--fill-0, #1F1F1F)" className="dark:fill-white" id="Vector" />
                </svg>
              </div>
            </div>
            <p className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#151515] dark:text-white text-[16px] whitespace-nowrap">Status</p>
          </div>
          <Link to="/alerts" className="no-underline">
            <div className="bg-[rgba(255,255,255,0)] content-stretch flex gap-[4px] items-center p-[4px] relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity">
              <p className="font-['Red_Hat_Text_VF:Regular',sans-serif] font-normal leading-[21px] relative shrink-0 text-[#06c] dark:text-[#4dabf7] text-[14px] whitespace-nowrap">View alerts</p>
            </div>
          </Link>
        </div>

        <div className="content-stretch flex gap-[24px] items-center relative shrink-0 w-full flex-wrap">
          {[
            { label: "Cluster", color: "#3e8635", path: "/administration/cluster-update" },
            { label: "Control Plane", color: "#3e8635", path: null },
            { label: "Operators", color: "#2b9af3", path: "/ecosystem/installed-operators" },
            { label: "Dynamic Plugins", color: "#3e8635", path: "/administration/dynamic-plugins" },
            { label: "Insights", color: "#3e8635", path: null },
          ].map((status, index) => (
            <div key={index} className="content-stretch flex gap-[8px] items-center relative shrink-0">
              <div className="content-stretch flex items-center justify-center relative rounded-[999px] shrink-0 size-[10px]" style={{ backgroundColor: status.color }} />
              {status.path ? (
                <Link to={status.path} className="font-['Red_Hat_Text_VF:Regular',sans-serif] font-normal leading-[21px] relative shrink-0 text-[#151515] dark:text-white text-[14px] whitespace-nowrap no-underline hover:underline">
                  {status.label}
                </Link>
              ) : (
                <p className="font-['Red_Hat_Text_VF:Regular',sans-serif] font-normal leading-[21px] relative shrink-0 text-[#151515] dark:text-white text-[14px] whitespace-nowrap">{status.label}</p>
              )}
            </div>
          ))}
        </div>

        {/* Update awareness */}
        <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full bg-[#e7f1fa] dark:bg-[rgba(43,154,243,0.1)] rounded-[8px] px-[16px] py-[10px]">
          <div className="size-[8px] rounded-full bg-[#0066cc] dark:bg-[#4dabf7] shrink-0" />
          <p className="font-['Red_Hat_Text_VF:Regular',sans-serif] font-normal text-[13px] text-[#151515] dark:text-white flex-1">
            Cluster update available: 4.21.0 → 4.22.0
          </p>
          <div className="flex gap-[12px]">
            <Link to="/administration/cluster-update" className="font-['Red_Hat_Text_VF:Regular',sans-serif] text-[13px] text-[#0066cc] dark:text-[#4dabf7] no-underline hover:underline whitespace-nowrap">
              Update plan
            </Link>
            <Link to="/ecosystem/installed-operators" className="font-['Red_Hat_Text_VF:Regular',sans-serif] text-[13px] text-[#0066cc] dark:text-[#4dabf7] no-underline hover:underline whitespace-nowrap">
              Installed Software
            </Link>
          </div>
        </div>

        <div className="content-stretch flex h-px items-start opacity-25 relative shrink-0 w-full">
          <div className="bg-[#c7c7c7] dark:bg-[rgba(255,255,255,0.2)] flex-[1_0_0] h-px min-h-px min-w-px" />
        </div>

        <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
          <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full">
            <div className="overflow-clip relative shrink-0 size-[16px]">
              <div className="absolute inset-[3.13%_-0.07%_6.25%_0]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.0113 14.5">
                  <path d={svgPaths.p212c7270} fill="var(--fill-0, #FFCC17)" id="Vector" />
                </svg>
              </div>
            </div>
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-h-px min-w-px relative">
              <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full">
                <p className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#151515] dark:text-white text-[14px] whitespace-nowrap">
                  CannotRetrieveUpdates
                </p>
                <p className="font-['Red_Hat_Display:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#4d4d4d] dark:text-[#b0b0b0] text-[12px] w-full">Mar 3, 2026, 10:37 AM</p>
              </div>
              <p className="font-['Red_Hat_Display:Regular',sans-serif] font-normal leading-[1.5] overflow-hidden relative shrink-0 text-[#4d4d4d] dark:text-[#b0b0b0] text-[14px] text-ellipsis w-full">
                Failure to retrieve updates means that cluster administrators will need to monitor for available updates on their own or risk falling behind on security or other bugfixes.
              </p>
            </div>
          </div>

          <div className="content-stretch flex h-px items-start opacity-25 relative shrink-0 w-full">
            <div className="bg-[#c7c7c7] dark:bg-[rgba(255,255,255,0.2)] flex-[1_0_0] h-px min-h-px min-w-px" />
          </div>

          <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full">
            <div className="overflow-clip relative shrink-0 size-[16px]">
              <div className="absolute inset-[3.13%_-0.07%_6.25%_0]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.0113 14.5">
                  <path d={svgPaths.p212c7270} fill="var(--fill-0, #FFCC17)" id="Vector" />
                </svg>
              </div>
            </div>
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-h-px min-w-px relative">
              <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full">
                <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
                  <p className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#151515] dark:text-white text-[14px] whitespace-nowrap">
                    AlertmanagerReceiversNotConfigured
                  </p>
                  <div className="content-stretch flex items-center relative shrink-0">
                    <a href="https://docs.openshift.com/container-platform/latest/monitoring/configuring-the-monitoring-stack.html" target="_blank" rel="noopener noreferrer" className="[text-decoration-skip-ink:none] decoration-solid font-['Red_Hat_Text_VF:Regular',sans-serif] font-normal leading-[21px] relative shrink-0 text-[#06c] dark:text-[#4dabf7] text-[14px] underline whitespace-nowrap hover:opacity-70 transition-opacity">
                      Configure
                    </a>
                  </div>
                </div>
                <p className="font-['Red_Hat_Display:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#4d4d4d] dark:text-[#b0b0b0] text-[12px] w-full">Mar 3, 2026, 10:36 AM</p>
              </div>
              <p className="font-['Red_Hat_Display:Regular',sans-serif] font-normal leading-[1.5] overflow-hidden relative shrink-0 text-[#4d4d4d] dark:text-[#b0b0b0] text-[14px] text-ellipsis w-full">
                Alerts are not configured to be sent to a notification system, meaning that you may not be notified in a timely fashion when important failures occur.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClusterUtilizationCard() {
  return (
    <div className="bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(255,255,255,0.05)] relative rounded-[24px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.06)] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[24px] items-start p-[24px] relative w-full">
        <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
          <div className="content-stretch flex gap-[16px] h-[21px] items-center relative shrink-0">
            <div className="overflow-clip relative shrink-0 size-[20px]">
              <div className="absolute inset-[3.13%]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.75 18.75">
                  <path d={svgPaths.p9139970} fill="var(--fill-0, #1F1F1F)" className="dark:fill-white" id="Vector" />
                </svg>
              </div>
            </div>
            <p className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#151515] dark:text-white text-[16px] whitespace-nowrap">Cluster utilization</p>
          </div>
          <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
            <div className="content-stretch flex gap-[8px] h-[37px] items-center px-[16px] py-[8px] relative rounded-[6px] shrink-0 cursor-pointer hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors">
              <p className="font-['Red_Hat_Text_VF:Regular',sans-serif] font-normal leading-[21px] relative shrink-0 text-[#151515] dark:text-white text-[14px] whitespace-nowrap">Filter by Node type</p>
              <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0">
                <div className="relative shrink-0 size-[21px]">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%+0.5px)] size-[14px] top-[calc(50%+0.5px)]">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.16619 4.66654">
                      <path d={svgPaths.p1436a2c0} fill="var(--fill-0, #1F1F1F)" className="dark:fill-white" id="Icon" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="content-stretch flex gap-[8px] h-[37px] items-center px-[16px] py-[8px] relative rounded-[6px] shrink-0 cursor-pointer hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors">
              <p className="font-['Red_Hat_Text_VF:Regular',sans-serif] font-normal leading-[21px] relative shrink-0 text-[#151515] dark:text-white text-[14px] whitespace-nowrap">1 hour</p>
              <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0">
                <div className="relative shrink-0 size-[21px]">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%+0.5px)] size-[14px] top-[calc(50%+0.5px)]">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.16619 4.66654">
                      <path d={svgPaths.p1436a2c0} fill="var(--fill-0, #1F1F1F)" className="dark:fill-white" id="Icon" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
          <div className="content-stretch flex font-normal gap-[24px] items-center leading-[normal] relative shrink-0 w-full">
            <p className="flex-[1_0_0] font-['Red_Hat_Display:Regular',sans-serif] min-h-px min-w-px relative text-[#151515] dark:text-white text-[14px]">Resource</p>
            <p className="font-['Red_Hat_Display:Regular',sans-serif] relative shrink-0 text-[#151515] dark:text-white text-[14px] whitespace-nowrap">Usage</p>
            <div className="content-stretch flex font-['Red_Hat_Mono:Regular',sans-serif] gap-[62px] items-center justify-end relative shrink-0 text-[#4d4d4d] dark:text-[#b0b0b0] text-[12px] flex-1 min-w-0 whitespace-nowrap">
              <p className="relative shrink-0">7:45 PM</p>
              <p className="relative shrink-0">8:00 PM</p>
              <p className="relative shrink-0">8:15 PM</p>
            </div>
          </div>

          <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
            {["CPU", "Memory", "Filesystem", "Network transfer"].map((resource, index) => (
              <div key={index}>
                <div className="content-stretch flex gap-[24px] items-center relative shrink-0 w-full">
                  <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[normal] min-h-px min-w-px relative">
                    <p className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#151515] dark:text-white text-[14px] w-full">{resource}</p>
                    <p className="font-['Red_Hat_Mono:Regular',sans-serif] font-normal relative shrink-0 text-[#4d4d4d] dark:text-[#b0b0b0] text-[12px] w-full">
                      {index === 0 && "21.76 cores / 24 cores"}
                      {index === 1 && "29.79 GiB / 32.12 GiB"}
                      {index === 2 && "186.6 GiB / 718.7 GiB"}
                      {index === 3 && "5.10 MBps in / 5.16 MBps out"}
                    </p>
                  </div>
                  <div className="h-[60px] relative flex-1 min-w-0">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 342 60">
                      <path d="M0 30 L100 25 L200 35 L342 30" stroke="#0066CC" strokeWidth="2" fill="none" />
                      <path d="M0 30 L100 25 L200 35 L342 30 L342 60 L0 60 Z" fill="#0066CC" fillOpacity="0.15" />
                    </svg>
                  </div>
                </div>
                {index < 3 && (
                  <div className="content-stretch flex h-px items-start opacity-25 relative shrink-0 w-full mt-[16px]">
                    <div className="bg-[#c7c7c7] dark:bg-[rgba(255,255,255,0.2)] flex-[1_0_0] h-px min-h-px min-w-px" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="relative p-[24px] pb-[48px]">
      <Greeting />
      <div className="mt-[80px] grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] gap-[24px]">
        <div className="flex flex-col gap-[24px]">
          <DetailsCard />
          <ClusterInventoryCard />
        </div>
        <div className="flex flex-col gap-[24px]">
          <StatusCard />
          <ClusterUtilizationCard />
        </div>
        <div className="flex flex-col gap-[24px]">
          <ActivityCard />
        </div>
      </div>
    </div>
  );
}