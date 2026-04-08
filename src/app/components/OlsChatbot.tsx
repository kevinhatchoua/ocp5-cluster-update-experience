import { useState, useEffect, useRef } from "react";
import { X, Send, ThumbsUp, ThumbsDown, Copy, Bookmark, Volume2, Paperclip, Sparkles } from "@/lib/pfIcons";

type ChatAction = {
  label: string;
  variant: "primary" | "secondary" | "link";
  actionId: string;
};

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
  actions?: ChatAction[];
};

export function OlsChatbot({
  context,
  selectedVersion,
  selectedChannel,
  onClose,
  onAction,
}: {
  context: string;
  selectedVersion: string;
  selectedChannel: string;
  onClose: () => void;
  onAction: (actionId: string) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const initial: ChatMessage[] = [
      {
        role: "assistant",
        text: `Hello! I'm OpenShift Lightspeed, your AI assistant for cluster operations.\n\nI can see your cluster is currently on version **5.0.0** using the **${selectedChannel}** channel, and you're considering an update to **${selectedVersion}**.\n\nPre-checks and status updates cover **platform operators** and **Software Catalog (OLM) operators** together—one holistic view as those experiences converge on the dashboard.`,
      },
    ];
    if (context === "installed-operators-precheck") {
      initial[0] = {
        role: "assistant",
        text: `Hello! I'm OpenShift Lightspeed. You're on **Installed Operators** — I'm focused on **catalog operators** (OLM Subscriptions and cluster extensions) on this cluster, using **${selectedVersion}** on **${selectedChannel}** as the compatibility target.`,
      };
      initial.push({
        role: "assistant",
        text: `**Pre-check: Installed Operators**\n\n**Cluster target:** ${selectedVersion} · **Channel:** ${selectedChannel}\n\n**OLM v0 (Subscriptions)**\n• **Update available** — Abot Operator-v3.0.0, Airflow Helm Operator, Ansible Automation Platform, Bare Metal Event Relay\n• **Required before some cluster updates** — Abot Operator-v3.0.0, Airflow Helm Operator\n• **Up to date** — Camel K Operator\n\n**OLM v1 (cluster extensions)**\n• **Healthy** — OpenShift GitOps (cluster extension)\n• **Conditions pending** — Sample observability bundle (discovery still settling)\n\n**Checks performed**\n• Subscription / extension status vs. target version\n• Support and end-of-life signals (as shown in the table)\n• Alignment with **Cluster Update** readiness for the same target\n\n**Next steps**\n1. Approve updates for operators that block your cluster plan (use row actions or select **two or more** operators and **Approve update** for bulk approval)\n2. Resolve **Unknown** compatibility before go-live\n3. Open **Cluster Update** when catalog and platform both look clear\n\nAsk about upgrade order, risk, or a specific operator in the list.`,
      });
    } else if (context === "recommendations") {
      initial.push({ role: "assistant", text: `Based on your cluster's workload profile and update history, here are my recommendations:\n\n• **Recommended version**: ${selectedVersion} — Low risk with strong community adoption\n• **Best update window**: Weekdays 2:00-4:00 AM UTC based on your traffic patterns\n• **Pre-update actions**: Update cluster-logging operator to v6.5+ before proceeding\n• **Estimated downtime**: ~2 minutes for API server restart` });
    } else if (context === "agent-config") {
      initial.push({ role: "assistant", text: "I can help you configure the agent-based update strategy. The agent will:\n\n• **Analyze workload patterns** to find optimal update windows\n• **Assess readiness** automatically before each update (platform + catalog operators)\n• **Coordinate operator updates** in the correct dependency order across cluster and OLM\n• **Monitor rollout health** and trigger automatic rollback if issues are detected\n\nWould you like to configure the update schedule, set rollback thresholds, or review the current agent policy?" });
    } else if (context === "agent-monitor") {
      initial.push({ role: "assistant", text: "The update agent is currently monitoring your cluster. Here's what I can help with:\n\n• View the current agent status and decision log\n• Explain why the agent chose a specific update window\n• Review rollback criteria and thresholds\n• Adjust agent behavior for upcoming maintenance windows\n\nWhat would you like to know?" });
    } else if (context === "agent-precheck" || context === "ai-precheck") {
      initial.push({ role: "assistant", text: `Running AI-powered pre-check for update to **${selectedVersion}**...\n\n**Holistic scope (consolidated AI)**\nPre-checks and status updates now cover **OpenShift platform operators** and **Software Catalog (OLM / Installed Software) operators** together—one assessment aligned with the converged dashboard experience.\n\n**Pre-checks from Target Release Payload (${selectedVersion})**\nThese checks are shipped with the target release payload and validate cluster readiness against version-specific requirements.\n\n✅ **ClusterVersionUpgradeable** — ClusterVersion conditions permit upgrade\n✅ **ClusterOperatorDegraded** — No cluster operators are degraded\n✅ **ClusterOperatorAvailable** — All cluster operators are available\n✅ **MachineConfigPoolDraining** — MachineConfigPools can drain nodes safely\n⚠️ **PodDisruptionBudgetAtLimit** — 1 PDB at maxUnavailable=0, pod eviction may stall\n❌ **DeprecatedAPIInUse** — 3 resources using rbac.authorization.k8s.io/v1beta1, migrate to v1\n\n**Cluster Health Pre-checks**\n✅ **Node Status** — 6/6 nodes Ready\n✅ **Storage Health** — 85% available, all PVs bound\n✅ **Network Health** — OVN verified, no packet loss\n✅ **Certificates** — Valid for >90 days\n✅ **etcd** — Quorum established\n\n⚠️ **Operator compatibility (platform + catalog)** — Issues span both layers:\n• **Catalog:** cluster-logging v6.4.3 (max OCP 5.0) → Update to v6.5.1+\n• **Catalog:** elasticsearch-operator v5.7.2 (max OCP 5.0) → Update to v5.8.0+\n\n**Recommended next steps:**\n1. Migrate deprecated rbac.authorization.k8s.io/v1beta1 resources to v1\n2. Review PodDisruptionBudget settings to avoid eviction stalls during rolling update\n3. Update the incompatible catalog operators from **Installed Software**\n4. Re-run the pre-check to confirm platform and catalog are clear\n5. Approve the update plan to proceed` });
    } else if (context === "compatibility-analysis") {
      initial.push({ role: "assistant", text: `I've analyzed the compatibility profile for updating to **${selectedVersion}** on the **${selectedChannel}** channel. Here's what I found:\n\n**Operator Issues:**\n• **Cluster Logging v6.4.3** — max supported OCP is 5.0. You need v6.5.1+ before upgrading.\n• **Elasticsearch Operator v5.7.2** — max supported OCP is 5.0. Upgrade to v5.8.0+.\n• **OLM v4.21.0** — recommended to update to v4.22.0 for full 5.1 support.\n\n**API Deprecations:**\n• \`flowcontrol.apiserver.k8s.io/v1beta2\` — migrate to \`v1\` before 5.2.\n\n**Recommendation:** Update the 2 incompatible operators first, then approve the update plan. I can generate a step-by-step remediation runbook if needed.` });
    } else if (context === "agent-start") {
      initial.push({ role: "assistant", text: `Starting AI-managed update to **${selectedVersion}**...\n\n**Agent Status:** Active\n**Current Phase:** Generating update plan\n\n📋 **Actions completed:**\n1. ✅ Cluster health verified — all components healthy\n2. ✅ Pre-checks passed (6/6)\n3. ✅ Compatibility analysis complete — 2 issues found\n4. ⏳ Awaiting plan approval\n\n**Next step:** Review the proposed update plan below and approve to proceed. The agent will execute the update during the optimal window.\n\nI'll keep you updated on progress. You can pause or cancel the agent at any time from the status bar above.` });
    } else if (context === "agent-paused") {
      initial.push({ role: "assistant", text: `⏸️ **Agent paused** at ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}\n\n**Status:** The update agent has been paused. No further actions will be taken until you resume.\n\n**State preserved:**\n• Update plan: Pending approval\n• Target version: ${selectedVersion}\n• Scheduled window: Wed Apr 2, 02:00–05:00 UTC\n\n**Actions available:**\n• **Resume** — Continue from where the agent left off\n• **Cancel** — Discard the plan and stop the agent\n\nThe scheduled execution window will be skipped while paused.` });
    } else if (context === "agent-resumed") {
      initial.push({ role: "assistant", text: `▶️ **Agent resumed** at ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}\n\n**Status:** The update agent is active again and will continue processing.\n\n**Current state:**\n• Update plan: Pending approval\n• Target: 5.0.0 → ${selectedVersion}\n• Next scheduled window: Wed Apr 2, 02:00–05:00 UTC\n\nThe agent will proceed with the update plan once approved. I'll notify you of any status changes.` });
    } else if (context === "agent-cancelled") {
      initial.push({ role: "assistant", text: `🛑 **Update cancelled** at ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}\n\n**Status:** The update agent has been stopped and the update plan has been discarded.\n\n**What was cleared:**\n• Proposed update plan\n• Accepted risks\n• Scheduled execution window\n\n**To start a new update:**\n1. Click "Start update with AI" to begin a fresh update session\n2. Or use "Update pre-check with AI" to run checks first\n\nYour cluster remains on version **5.0.0**. No changes were made.` });
    } else if (context === "update-executing") {
      initial.push({ role: "assistant", text: `🚀 **Update started** at ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}\n\n**Target:** 5.0.0 → ${selectedVersion}\n**Strategy:** Rolling update with automatic rollback\n\n**Current progress:**\n1. ✅ Pre-checks passed\n2. ✅ Operator updates initiated\n3. ⏳ Control plane nodes updating...\n4. ⏳ Worker nodes pending\n\n**Live monitoring active.** I'll alert you if any health check degrades.\n\n• API Server: Healthy\n• etcd: Healthy\n• Ingress: Healthy\n\nEstimated completion: ~1h 45m. The cluster remains operational during the rolling update.` });
    } else if (context === "update-completed") {
      initial.push({ role: "assistant", text: `✅ **Update complete!** at ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}\n\n**Cluster version:** ${selectedVersion}\n**Duration:** 1h 38m\n\n**Post-update verification:**\n✅ API server responding\n✅ All 6 nodes Ready\n✅ All cluster operators available\n✅ No degraded operators\n✅ Ingress healthy\n✅ Workloads stable\n\n**Operators updated:**\n• Cluster Logging: 6.4.3 → 6.5.1\n• Elasticsearch Operator: 5.7.2 → 5.8.0\n• OLM: 4.21.0 → 4.22.0\n\nYour cluster is now running **${selectedVersion}**. All health checks passed. You can view the full update log in the Update History tab.` });
    } else if (context === "update-failed") {
      initial.push({ role: "assistant", text: `❌ **Update failed** at ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}\n\n**Error:** Node master-2 failed to drain\n**Root cause:** Pod prometheus-k8s-0 has local storage and exceeded the 300s eviction timeout.\n\n**Cluster state:**\n• 2/3 control plane nodes updated\n• 0/3 worker nodes updated\n• Cluster is in a **partially updated** state\n\n**Recommended actions:**\n1. **Retry** — I can attempt to force-drain master-2 (will delete the local storage pod)\n2. **Rollback** — Revert all nodes to 5.0.0 (~30 min)\n3. **Manual fix** — Delete the blocking pod manually, then retry\n\nWould you like me to diagnose the blocking pod and suggest a fix?` });
    } else if (context === "update-rollback") {
      initial.push({ role: "assistant", text: `⏪ **Rollback initiated** at ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}\n\n**Reverting:** ${selectedVersion} → 5.0.0\n\n**Rollback plan:**\n1. ⏳ Reverting control plane nodes (3 nodes)\n2. ⏳ Restoring operator versions\n3. ⏳ Verifying cluster health\n\n**Estimated time:** ~30 minutes\n\nThe cluster will remain operational during rollback. I'll verify all health checks pass after completion.` });
    } else if (context === "rollback-complete") {
      initial.push({ role: "assistant", text: `✅ **Rollback complete** at ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}\n\n**Cluster version:** 5.0.0 (restored)\n\n**Verification:**\n✅ All 6 nodes on version 5.0.0\n✅ Operator versions restored\n✅ Cluster health verified\n✅ No degraded components\n\nYour cluster has been safely reverted. To attempt the update again:\n1. Resolve the drain issue on master-2\n2. Click "Start update with AI" when ready\n\nWould you like help troubleshooting the original failure?` });
    } else if (context === "update-retry") {
      initial.push({ role: "assistant", text: `🔄 **Retrying update** at ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}\n\n**Target:** 5.0.0 → ${selectedVersion}\n\n**Changes from previous attempt:**\n• Increased drain timeout to 600s\n• Added force-drain for pods with local storage\n• Skipping already-updated nodes where safe\n\n**Progress:**\n1. ✅ master-0 — already on ${selectedVersion}\n2. ✅ master-1 — already on ${selectedVersion}\n3. ⏳ master-2 — retrying drain...\n4. ⏳ Workers pending\n\nMonitoring closely. I'll alert you immediately if the same issue recurs.` });
    }
    const lastMsg = initial[initial.length - 1];
    if (lastMsg && lastMsg.role === "assistant") {
      const contextActions: Record<string, ChatAction[]> = {
        "agent-precheck": [],
        "ai-precheck": [],
        "installed-operators-precheck": [
          { label: "Open Cluster Update", variant: "primary", actionId: "view-plan" },
        ],
        "agent-start": [
          { label: "Review update plan", variant: "primary", actionId: "view-plan" },
        ],
        "compatibility-analysis": [
          { label: "Generate remediation plan", variant: "secondary", actionId: "remediation" },
        ],
        "agent-config": [
          { label: "Review configuration", variant: "secondary", actionId: "view-plan" },
        ],
        "agent-monitor": [
          { label: "View update plan", variant: "primary", actionId: "view-plan" },
        ],
        "update-completed": [
          { label: "View update history", variant: "primary", actionId: "view-history" },
        ],
        "update-failed": [
          { label: "View troubleshooting", variant: "link", actionId: "view-plan" },
        ],
        "agent-paused": [
          { label: "View update plan", variant: "secondary", actionId: "view-plan" },
        ],
        "agent-cancelled": [
          { label: "View update plan", variant: "primary", actionId: "view-plan" },
        ],
        "recommendations": [
          { label: "View update plan", variant: "secondary", actionId: "view-plan" },
        ],
      };
      if (contextActions[context]) {
        lastMsg.actions = contextActions[context];
      }
    }
    return initial;
  });
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    const lowerMsg = userMsg.toLowerCase();
    setTimeout(() => {
      let response: ChatMessage;
      if (lowerMsg.includes("operator") || lowerMsg.includes("compatibility") || lowerMsg.includes("blocked")) {
        response = { role: "assistant", text: "Based on my analysis, you have **2 operators** that need updating before proceeding:\n\n• **Cluster Logging v6.4.3** → Update to v6.5.1+\n• **Elasticsearch Operator v5.7.2** → Update to v5.8.0+\n\nI recommend updating these operators before approving the update plan. You can accept the known risks from the alert banner in the Available Updates section.", actions: [{ label: "Review update plan", variant: "primary", actionId: "view-plan" }] };
      } else if (lowerMsg.includes("approve") || lowerMsg.includes("plan")) {
        response = { role: "assistant", text: "The update plan is pending your approval. Here's a summary:\n\n• **Target:** 5.0.0 → 5.1.10\n• **Pre-check:** 6/6 passed\n• **Compatibility:** 2 blocking issues\n• **Schedule:** Wed Apr 2, 02:00–05:00 UTC\n\nYou can approve the plan from the decision bar below the update plan, or accept the known risks to proceed despite the incompatibilities.", actions: [{ label: "Review update plan", variant: "primary", actionId: "view-plan" }] };
      } else if (lowerMsg.includes("schedule") || lowerMsg.includes("window") || lowerMsg.includes("when")) {
        response = { role: "assistant", text: "Based on your cluster's workload patterns, I recommend:\n\n• **Optimal window:** Wed Apr 2, 02:00–05:00 UTC\n• **Estimated duration:** 1h 45m\n• **Risk level:** Low\n\nThis window was selected because your cluster shows the lowest traffic during this period. You can adjust preferences in Agent Configuration → Scheduling." };
      } else if (lowerMsg.includes("rollback") || lowerMsg.includes("revert")) {
        response = { role: "assistant", text: "Automatic rollback is currently **enabled**. If health checks fail within 30 minutes of update completion, the agent will automatically revert to version 5.0.0.\n\n**Rollback details:**\n• Estimated time: ~30 minutes\n• All nodes will be reverted\n• Operator versions will be restored\n\nYou can configure this in Agent Configuration → Automatic Actions." };
      } else if (lowerMsg.includes("history") || lowerMsg.includes("previous") || lowerMsg.includes("past")) {
        response = { role: "assistant", text: "Your cluster has 6 previous updates on record:\n\n• **5.0.0** — Completed (Agent, 1h 48m)\n• **4.18.6** — Completed (Agent, auto-approved)\n• **4.18.4** — Completed (Manual, 1h 15m)\n• **4.17.9** — Failed (Agent, auto-rollback)\n• **4.17.8** — Rejected (pre-check failures)\n\nWould you like details on any specific update?", actions: [{ label: "View full history", variant: "primary", actionId: "view-history" }] };
      } else if (lowerMsg.includes("risk") || lowerMsg.includes("safe")) {
        response = { role: "assistant", text: "**Risk assessment for 5.0.0 → 5.1.10:**\n\n• **Overall risk:** Low (based on community adoption and test coverage)\n• **Blocking issues:** 2 incompatible operators\n• **API deprecations:** 1 warning (non-blocking)\n• **Custom resources:** No incompatibilities found\n\nThe 2 blocking operators can be updated beforehand, or you can accept the risks and proceed. The agent will attempt automatic mitigation during the update if enabled." };
      } else {
        response = { role: "assistant", text: "I can help you with your cluster update. Here's what I can assist with:\n\n• **Operator compatibility** — Check which operators need updating (platform + catalog)\n• **Update plan** — Review the proposed update path\n• **Scheduling** — Optimal update window analysis\n• **Risk assessment** — Evaluate update risks\n• **History** — Review past updates\n\nWhat would you like to know more about?", actions: [{ label: "View update plan", variant: "primary", actionId: "view-plan" }, { label: "View history", variant: "secondary", actionId: "view-history" }] };
      }
      setMessages((prev) => [...prev, response]);
    }, 1200);
  };

  return (
    <div className="w-[400px] shrink-0 flex flex-col bg-white border-l border-[#e0e0e0] rounded-l-[16px] shadow-[-4px_0_16px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-[#e0e0e0]">
        <div className="flex items-center gap-[10px]">
          <div className="size-[36px] rounded-full bg-[#f5f5f5] flex items-center justify-center shrink-0">
            <Sparkles className="size-[18px] text-[#ee0000]" />
          </div>
          <span className="text-[15px] font-semibold text-[#151515] font-['Red_Hat_Display:SemiBold',sans-serif]">OpenShift LightSpeed</span>
        </div>
        <button onClick={onClose} className="p-[6px] hover:bg-[#f0f0f0] rounded-[6px] bg-transparent border-0 cursor-pointer transition-colors">
          <X className="size-[18px] text-[#6a6e73]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-[20px] py-[16px]" role="log" aria-live="polite">
        {messages.map((msg, i) => (
          <div key={i} className="mb-[20px]">
            {msg.role === "user" ? (
              <div>
                <div className="flex items-center gap-[8px] mb-[6px]">
                  <div className="size-[28px] rounded-full bg-[#e0e0e0] flex items-center justify-center shrink-0">
                    <span className="text-[12px] text-[#6a6e73] font-semibold">K</span>
                  </div>
                  <span className="text-[13px] text-[#151515] font-['Red_Hat_Text:Regular',sans-serif] font-medium">User</span>
                  <span className="text-[13px] text-[#8a8d90] font-['Red_Hat_Text:Regular',sans-serif]">{new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
                </div>
                <div className="ml-[36px]">
                  <div className="inline-block bg-[#0066cc] text-white rounded-[20px] px-[16px] py-[10px] max-w-[90%]">
                    <p className="text-[14px] leading-[20px] font-['Red_Hat_Text:Regular',sans-serif]">{msg.text}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-[6px] mb-[6px]">
                  <span className="text-[13px] text-[#151515] font-['Red_Hat_Text:Regular',sans-serif] font-medium">OpenShift LightSpeed</span>
                  <span className="text-[11px] font-semibold text-[#6a6e73] bg-[#f0f0f0] rounded-[4px] px-[6px] py-[1px] uppercase tracking-wider font-['Red_Hat_Text:Regular',sans-serif]">AI</span>
                  <span className="text-[13px] text-[#8a8d90] font-['Red_Hat_Text:Regular',sans-serif]">{new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
                </div>
                <div className="text-[14px] text-[#333] leading-[22px] font-['Red_Hat_Text:Regular',sans-serif] whitespace-pre-wrap">
                  {msg.text.split("**").map((part, j) => (j % 2 === 1 ? <strong key={j} className="font-semibold text-[#151515]">{part}</strong> : part))}
                </div>
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap gap-[8px] mt-[12px]">
                    {msg.actions.map((action, k) => (
                      <button
                        key={k}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction(action.actionId);
                        }}
                        className={`text-[13px] px-[16px] py-[8px] rounded-[20px] cursor-pointer transition-colors font-['Red_Hat_Text:Regular',sans-serif] font-medium ${
                          action.variant === "primary"
                            ? "bg-[#0066cc] hover:bg-[#004d99] text-white border-0"
                            : action.variant === "secondary"
                              ? "bg-white text-[#0066cc] border border-[#0066cc] hover:bg-[#e7f1fa]"
                              : "bg-transparent text-[#0066cc] hover:underline border-0 px-0"
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-[4px] mt-[12px]">
                  <button className="p-[6px] hover:bg-[#f0f0f0] rounded-[6px] bg-transparent border-0 cursor-pointer transition-colors">
                    <ThumbsUp className="size-[16px] text-[#b0b0b0]" />
                  </button>
                  <button className="p-[6px] hover:bg-[#f0f0f0] rounded-[6px] bg-transparent border-0 cursor-pointer transition-colors">
                    <ThumbsDown className="size-[16px] text-[#b0b0b0]" />
                  </button>
                  <button className="p-[6px] hover:bg-[#f0f0f0] rounded-[6px] bg-transparent border-0 cursor-pointer transition-colors">
                    <Copy className="size-[16px] text-[#b0b0b0]" />
                  </button>
                  <button className="p-[6px] hover:bg-[#f0f0f0] rounded-[6px] bg-transparent border-0 cursor-pointer transition-colors">
                    <Bookmark className="size-[16px] text-[#b0b0b0]" />
                  </button>
                  <button className="p-[6px] hover:bg-[#f0f0f0] rounded-[6px] bg-transparent border-0 cursor-pointer transition-colors">
                    <Volume2 className="size-[16px] text-[#b0b0b0]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-[#e0e0e0] bg-white px-[16px] py-[12px]">
        <div className="flex items-center gap-[8px]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Send a message..."
            className="flex-1 bg-transparent border-0 outline-none text-[14px] text-[#151515] font-['Red_Hat_Text:Regular',sans-serif] placeholder:text-[#b0b0b0] py-[4px]"
          />
          <button className="p-[6px] hover:bg-[#f0f0f0] rounded-[6px] bg-transparent border-0 cursor-pointer transition-colors" title="Attach file">
            <Paperclip className="size-[18px] text-[#6a6e73]" />
          </button>
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="p-[6px] bg-transparent border-0 cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Send"
          >
            <Send className="size-[18px] text-[#0066cc]" />
          </button>
        </div>
      </div>
    </div>
  );
}
