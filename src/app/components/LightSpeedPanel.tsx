import { useState, useEffect, useRef } from "react";
import { X, Sparkles, Send, ThumbsUp, ThumbsDown, Copy, MoreVertical } from "lucide-react";
import { useChat } from "../contexts/ChatContext";
import { useNavigate, useLocation } from "react-router";
import { getAIResponse } from "./LightSpeedPanelResponses";

interface Message {
  id: string;
  type?: 'user' | 'assistant' | 'ai';
  sender?: 'user' | 'ai';  // Support both formats
  content?: string;
  text?: string;  // Support both formats
  timestamp: Date;
  suggestions?: string[];
  loading?: boolean;
  action?: {
    label: string;
    type: 'pre-check' | 'update' | 'cancel';
    callback: () => void;
  };
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
}

interface LightSpeedPanelProps {
  isOpen: boolean;
  onClose: () => void;
  context?: string;
  onLaunchPreCheck?: () => void;
  onStartUpdate?: () => void;
  preloadedMessages?: Message[];
  autoScroll?: boolean;
  externalMessages?: Message[]; // New prop for real-time updates
}

export default function LightSpeedPanel({ 
  isOpen, 
  onClose, 
  context, 
  onLaunchPreCheck, 
  onStartUpdate, 
  preloadedMessages, 
  autoScroll = false,
  externalMessages 
}: LightSpeedPanelProps) {
  // Use global chat context
  const { messages: globalMessages, addMessage, replaceMessage, context: globalContext, setContext } = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastContextPath, setLastContextPath] = useState('');
  const [hasInitialGreeting, setHasInitialGreeting] = useState(false);
  
  // Calculate natural typing delay based on response length
  const getTypingDelay = (content: string): number => {
    const length = content.length;
    if (length < 200) return 600 + Math.random() * 300;
    if (length < 500) return 1000 + Math.random() * 400;
    if (length < 1000) return 1500 + Math.random() * 500;
    if (length < 2000) return 2200 + Math.random() * 600;
    return 2800 + Math.random() * 700;
  };
  
  // Use global messages from context
  const messages = globalMessages;

  // Auto-scroll to bottom when messages change or typing state changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Reset state when panel closes
  useEffect(() => {
    if (!isOpen) {
      setLastContextPath('');
      setHasInitialGreeting(false);
    }
  }, [isOpen]);

  // Add initial context-aware greeting when panel FIRST opens
  useEffect(() => {
    if (isOpen && !hasInitialGreeting && context) {
      setContext(context);
      
      // Add contextual message based on current page
      let contextMessage = '';
      let suggestions: string[] = [];
      
      if (location.pathname === '/' || location.pathname === '') {
        contextMessage = "👋 Hi Kevin! I can see you're on the **Dashboard**. Your cluster looks healthy overall!\n\n**Quick Overview:**\n• **2 alerts** need attention (1 warning about retrieval updates, 1 info about service level)\n• Cluster utilization is normal across CPU, Memory, and Filesystem\n• **Control Plane** and **Operators** are running smoothly\n\n**What would you like me to help with?**";
        suggestions = [
          'Explain the retrieval updates alert',
          'Show cluster health status',
          'Check for cluster updates',
          'Which operators need updates?',
        ];
      } else if (location.pathname.includes('/preflight-results')) {
        contextMessage = "✅ **Great news!** All pre-checks passed successfully.\n\n**What I found:**\n• All 8 checks completed without critical issues\n• Cluster health is optimal for update\n• All operators are compatible with OpenShift 4.22.0\n• Estimated update time: 2 hours 12 minutes\n\n**Recommended Next Steps:**\n1. **Start the cluster update** - Your cluster is ready to proceed\n2. **Review operator updates** - 1 operator (Ansible Automation Platform) has an update available\n3. **Check API migrations** - 1 API requires permission verification";
        suggestions = [
          "Start the cluster update",
          "How do I update the Ansible Automation Platform operator?",
          "What API changes should I be aware of?",
          "What happens during the update process?",
          "How can I minimize downtime?"
        ];
      } else if (location.pathname.includes('/preflight-failed')) {
        contextMessage = "⚠️ **Pre-checks found issues that need attention.**\n\nI've analyzed the failures and can guide you through fixing each one.";
        suggestions = [
          "Show me step-by-step remediation",
          "Help me fix the storage issue",
          "What's causing the failures?",
          "Can I proceed despite the warnings?"
        ];
      } else if (location.pathname.includes('/ecosystem/installed-operators') || location.pathname.includes('/administration/installed-operators')) {
        contextMessage = "I can see you're managing your **Installed Software**. You have several operators installed with a few updates available!\n\n**Current Status:**\n• **5 operators** installed and healthy\n• **4 updates** available\n• **2 operators** require updates before cluster update\n• Cluster update compatibility: Ready after operator updates\n\n**What would you like to know?**";
        suggestions = [
          "Show operator compatibility status",
          "Which operators need updates?",
          "How do I update all operators?",
          "Update operators now"
        ];
      } else if (location.pathname.includes('/cluster-update/in-progress')) {
        contextMessage = "🔄 **Cluster update in progress!**\n\nYour cluster is currently updating to OpenShift 4.22.0. I'm monitoring the progress and can provide insights.\n\n**Current Status:**\n• Control plane nodes: Updating (1 of 3 complete)\n• Worker nodes: Waiting\n• Estimated time remaining: ~1 hour 45 minutes\n\nI'll let you know if anything needs your attention! 👀";
        suggestions = [
          "What's happening right now?",
          "How long will this take?",
          "What if something goes wrong?",
        ];
      } else if (location.pathname.includes('/cluster-update/complete')) {
        contextMessage = "🎉 **Congratulations!** Your cluster update to OpenShift 4.22.0 completed successfully!\n\n**Update Summary:**\n✅ All nodes updated without issues\n✅ Control plane is healthy\n✅ All workloads are running\n✅ No operator conflicts detected\n\n**Recommended Next Steps:**\n1. Review updated operators\n2. Check application compatibility\n3. Update any remaining operators";
        suggestions = [
          "Show me what changed",
          "Which operators still need updates?",
          "How do I verify everything works?",
        ];
      } else if (location.pathname.includes('/cluster-update')) {
        contextMessage = "I can see you're planning a **cluster update**. I'll help you every step of the way!\n\n**I can help with:**\n• Running pre-checks\n• Explaining risks and compatibility\n• Guiding through the update process\n• Troubleshooting any issues\n\nWhat would you like to know?";
        suggestions = [
          'Assess readiness with Lightspeed',
          'What are the risks?',
          'How long will it take?',
          'Start the update',
        ];
      } else if (location.pathname.includes('/administration')) {
        contextMessage = "I can help with **cluster administration** tasks like namespaces, resources, settings, and more. What do you need help with?";
        suggestions = [
          'Show cluster settings',
          'Check for updates',
          'Manage operators',
        ];
      } else if (location.pathname.includes('/software-catalog')) {
        contextMessage = "Browsing the **Software Catalog**? I can help you find operators, explain what they do, and guide you through installation!";
        suggestions = [
          'Recommend operators for monitoring',
          'How do I install an operator?',
          'What operators are most popular?',
        ];
      } else if (location.pathname.includes('/workloads')) {
        contextMessage = "I can see you're managing **Workloads**. You have a healthy mix of Pods, Deployments, and StatefulSets running!\n\n**Quick Stats:**\n• Most workloads are running smoothly\n• A few restarts detected (normal for long-running pods)\n• 1 pod in pending state\n\n**Need help with something specific?**";
        suggestions = [
          'Why is a pod pending?',
          'Explain pod restarts',
          'How do I scale a deployment?',
          'Troubleshoot failed workloads',
        ];
      } else if (location.pathname.includes('/networking')) {
        contextMessage = "I can help with **Networking** configuration! I can explain services, routes, ingresses, and network policies.\n\n**Your Network:**\n• Multiple services exposed\n• Routes configured for external access\n• Network policies enforcing security\n\n**What would you like to know?**";
        suggestions = [
          'Explain the difference between Service and Route',
          'How do I expose a service externally?',
          'What are Network Policies?',
          'Troubleshoot network connectivity',
        ];
      } else if (location.pathname.includes('/storage')) {
        contextMessage = "Managing **Storage**? I can help you understand PersistentVolumes, Claims, and StorageClasses.\n\n**Storage Overview:**\n• ~2.5Ti total capacity provisioned\n• Multiple storage classes available (encrypted, standard, high-performance)\n• Most volumes are bound and healthy\n\n**Need assistance?**";
        suggestions = [
          'Explain storage classes',
          'How do I expand a volume?',
          'What does Bound status mean?',
          'Create a new PVC',
        ];
      } else if (location.pathname.includes('/builds')) {
        contextMessage = "I can help with **Builds and CI/CD**! I can explain BuildConfigs, image streams, and deployment pipelines.\n\n**Build Status:**\n• Build pipelines are active\n• Image streams tracking multiple tags\n• Some builds recently completed\n\n**What do you need help with?**";
        suggestions = [
          'How do I trigger a new build?',
          'Explain build strategies',
          'Troubleshoot failed builds',
          'What are image streams?',
        ];
      } else if (location.pathname.includes('/observe')) {
        contextMessage = "I'm here to help you **monitor and observe** your cluster! I can analyze metrics, explain alerts, and suggest optimizations.\n\n**Current Observations:**\n• CPU usage trending upward\n• Some critical alerts need attention\n• Overall cluster health is good\n\n**What would you like to explore?**";
        suggestions = [
          'Explain the critical alerts',
          'Why is CPU usage high?',
          'Optimize resource usage',
          'Set up custom alerts',
        ];
      } else if (location.pathname.includes('/compute')) {
        contextMessage = "Managing **Compute resources**! I can help with nodes, machine sets, and cluster capacity.\n\n**Compute Overview:**\n• Control plane and worker nodes healthy\n• Resource utilization within limits\n• Auto-scaling configured\n\n**How can I assist?**";
        suggestions = [
          'Show node details',
          'How do I add more nodes?',
          'Explain node health',
          'Check resource availability',
        ];
      }
      
      if (contextMessage) {
        const lastMessage = messages[messages.length - 1];
        const isDefaultGreeting = lastMessage?.content?.includes("I'm OpenShift LightSpeed");
        
        if (isDefaultGreeting) {
          // Replace the generic greeting with the contextual one
          replaceMessage('1', {
            type: 'ai',
            content: contextMessage,
            suggestions: suggestions.length > 0 ? suggestions : undefined,
          });
        }
      }
      
      setLastContextPath(location.pathname);
      setHasInitialGreeting(true);
    }
  }, [isOpen, context, location.pathname]);

  // Detect navigation while panel is OPEN and append context change message
  useEffect(() => {
    // Only react if panel is open, we have an initial greeting, and path actually changed
    if (isOpen && hasInitialGreeting && lastContextPath && location.pathname !== lastContextPath) {
      // Add a brief acknowledgment of the page change
      let pageContext = '';
      let suggestions: string[] = [];
      
      if (location.pathname === '/' || location.pathname === '') {
        pageContext = "📍 I see you're back on the **Dashboard**. Let me know if you need help with anything here!";
        suggestions = ['Show cluster health status', 'Check for cluster updates'];
      } else if (location.pathname.includes('/cluster-update/in-progress')) {
        pageContext = "📍 You're now viewing the **cluster update progress**. I'm monitoring it closely!";
        suggestions = ["What's happening right now?", "How long will this take?"];
      } else if (location.pathname.includes('/cluster-update/complete')) {
        pageContext = "📍 I see the **update completed**! 🎉 Great job!";
        suggestions = ["Show me what changed", "Which operators still need updates?"];
      } else if (location.pathname.includes('/cluster-update')) {
        pageContext = "📍 You're now on the **Cluster Update** page. Ready to help!";
        suggestions = ['Assess readiness', 'What are the risks?'];
      } else if (location.pathname.includes('/workloads')) {
        pageContext = "📍 Now viewing **Workloads**. I can help you manage your pods, deployments, and more!";
        suggestions = ['Why is a pod pending?', 'How do I scale a deployment?'];
      } else if (location.pathname.includes('/storage')) {
        pageContext = "📍 You're on the **Storage** page. I can help with PersistentVolumes, Claims, and StorageClasses!";
        suggestions = ['Explain storage classes', 'How do I expand a volume?'];
      } else if (location.pathname.includes('/networking')) {
        pageContext = "📍 Now on **Networking**. Let me know if you need help with services, routes, or network policies!";
        suggestions = ['Explain the difference between Service and Route', 'Troubleshoot network connectivity'];
      } else if (location.pathname.includes('/observe')) {
        pageContext = "📍 You're viewing **Observe**. I can help analyze metrics and explain alerts!";
        suggestions = ['Explain the critical alerts', 'Why is CPU usage high?'];
      } else if (location.pathname.includes('/builds')) {
        pageContext = "📍 Now on **Builds**. I can help with BuildConfigs and CI/CD pipelines!";
        suggestions = ['How do I trigger a new build?', 'Troubleshoot failed builds'];
      } else if (location.pathname.includes('/compute')) {
        pageContext = "📍 You're on the **Compute** page. I can help with nodes and machine sets!";
        suggestions = ['Show node details', 'How do I add more nodes?'];
      } else if (location.pathname.includes('/ecosystem/installed-operators') || location.pathname.includes('/administration/installed-operators')) {
        pageContext = "📍 Now viewing **Installed Software**. I can help you manage operator updates!";
        suggestions = ['Which operators need updates?', 'Update operators now'];
      } else if (location.pathname.includes('/administration')) {
        pageContext = "📍 You're in **Administration**. How can I help with cluster management?";
        suggestions = ['Show cluster settings', 'Check for updates'];
      }
      
      if (pageContext) {
        // Append the page change acknowledgment to the conversation
        setTimeout(() => {
          addMessage({
            type: 'ai',
            content: pageContext,
            suggestions: suggestions.length > 0 ? suggestions : undefined,
          });
        }, 300);
      }
      
      setLastContextPath(location.pathname);
    }
  }, [location.pathname, isOpen, hasInitialGreeting, lastContextPath]);

  // Format text with markdown-like syntax
  const formatText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      } else if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code 
            key={index} 
            className="bg-[rgba(0,0,0,0.08)] dark:bg-[rgba(255,255,255,0.15)] px-[6px] py-[2px] rounded-[4px] text-[13px] font-mono"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    addMessage({
      type: 'user',
      content: input,
    });
    
    const userQuery = input;
    setInput('');
    setIsTyping(true);

    // Pre-compute response to determine natural delay
    const response = getAIResponse(userQuery, location.pathname);
    const delay = getTypingDelay(response.content);

    setTimeout(() => {
      addMessage({
        type: 'ai',
        content: response.content,
        actions: response.actions,
        suggestions: response.suggestions
      });
      setIsTyping(false);
    }, delay);
  };

  const handleSuggestionClick = (suggestion: string) => {
    const lowerSuggestion = suggestion.toLowerCase();
    
    addMessage({
      type: 'user',
      content: suggestion,
    });
    
    if (lowerSuggestion.includes('run pre-check') || lowerSuggestion.includes('launch pre-check') || lowerSuggestion.includes('run preflight') || lowerSuggestion.includes('launch preflight') || lowerSuggestion.includes('assess readiness')) {
      navigate('/administration/cluster-update/in-progress', { state: { aiMode: true } });
      return;
    }
    
    // Start cluster update
    if (lowerSuggestion.includes('start') && lowerSuggestion.includes('cluster') && lowerSuggestion.includes('update')) {
      if (location.pathname.includes('/preflight-results')) {
        navigate('/administration/cluster-update/in-progress');
      } else {
        const msg = "🚀 Great! Let's get your cluster updated to 4.22.0.\n\nFirst, let me run the pre-checks to make sure everything's ready. Think of it as a pre-check inspection before takeoff! ✈️";
        setIsTyping(true);
        setTimeout(() => {
          addMessage({
            type: 'ai',
            content: msg,
            suggestions: ["Assess readiness now"]
          });
          setIsTyping(false);
        }, getTypingDelay(msg));
      }
      return;
    }
    
    // Navigate to operators
    if (lowerSuggestion.includes('operator') && lowerSuggestion.includes('update')) {
      navigate('/administration/installed-operators');
      const msg = "📦 Taking you to the Installed Operators page where you can manage updates!\n\nLook for operators with the ⚠️ icon—those have updates available.";
      setIsTyping(true);
      setTimeout(() => {
        addMessage({
          type: 'ai',
          content: msg,
        });
        setIsTyping(false);
      }, getTypingDelay(msg));
      return;
    }
    
    // Approve Ansible update
    if (lowerSuggestion.includes('ansible') && lowerSuggestion.includes('approve')) {
      const msg = "✅ Awesome! I'm approving the Ansible Automation Platform update to v3.2.0...\n\n⏳ This should take about 5-10 minutes. You can monitor the progress on the Installed Operators page.\n\n**Fun fact:** Did you know that operator updates use a \"rolling update\" strategy? It's like changing tires on a moving car—no downtime! 🏎️";
      setIsTyping(true);
      setTimeout(() => {
        addMessage({
          type: 'ai',
          content: msg,
        });
        setIsTyping(false);
      }, getTypingDelay(msg));
      return;
    }
    
    // Export report
    if (lowerSuggestion.includes('export') || lowerSuggestion.includes('report')) {
      const msg = "📄 Generating pre-check report...\n\n✓ Report exported as `pre-check-report-2026-03-17.txt`\n\nThis report includes all check results, cluster health data, and recommended actions. Perfect for sharing with your team or keeping for compliance! 📋";
      setIsTyping(true);
      setTimeout(() => {
        addMessage({
          type: 'ai',
          content: msg,
        });
        setIsTyping(false);
      }, getTypingDelay(msg));
      return;
    }
    
    // Show cluster health
    if (lowerSuggestion.includes('show') && lowerSuggestion.includes('cluster') && lowerSuggestion.includes('health')) {
      const msg = "🏥 **Cluster Health Check Complete!**\n\n**Overall Status:** Healthy 💚\n\n**Node Health:**\n✅ 3 control plane nodes - All healthy\n✅ 5 worker nodes - All healthy\n\n**Resource Utilization:**\n• CPU: 45% average (plenty of headroom! 💪)\n• Memory: 62% average\n• Storage: 78% used (watch this one 👀)\n\n**Critical Services:**\n✅ API Server: Responding\n✅ etcd: Healthy & performant\n✅ DNS: Operational\n✅ Networking: All pods communicating\n\nYour cluster is looking good! 🎉";
      setIsTyping(true);
      setTimeout(() => {
        addMessage({
          type: 'ai',
          content: msg,
          suggestions: [
            "Show me storage breakdown",
            "Check operator health",
            "Assess readiness"
          ]
        });
        setIsTyping(false);
      }, getTypingDelay(msg));
      return;
    }
    
    // What's new in 4.22.0
    if (lowerSuggestion.includes('what') && lowerSuggestion.includes('new') && lowerSuggestion.includes('4.22')) {
      const msg = "🎉 **OpenShift 4.22.0 - What's New!**\n\nLet me give you the highlights (the exciting stuff! 😄):\n\n**🤖 AI/ML Enhancements:**\n• GPU operator improvements for AI workloads\n• Better support for LLM inference\n\n**⚡ Performance:**\n• 30% faster pod startup times (your deployments will thank you!)\n• Improved etcd performance\n\n**🔒 Security:**\n• Enhanced RBAC policies\n• New security scanning integrations\n• FIPS 140-2 compliance updates\n\n**🛠️ Developer Experience:**\n• Updated GitOps integrations\n• Improved observability with better metrics\n• Enhanced CLI tools\n\n**☁️ Multi-Cloud:**\n• Better AWS EKS integration\n• Azure Arc improvements\n• GCP Anthos compatibility\n\nOh, and they fixed like 200 bugs. Not that anyone's counting... 😅";
      setIsTyping(true);
      setTimeout(() => {
        addMessage({
          type: 'ai',
          content: msg,
          suggestions: [
            "Tell me more about GPU support",
            "What are the security improvements?",
            "Start the cluster update"
          ]
        });
        setIsTyping(false);
      }, getTypingDelay(msg));
      return;
    }
    
    // Jokes
    if (lowerSuggestion.includes('joke') || lowerSuggestion.includes('funny')) {
      const jokes = [
        "Why do Kubernetes pods make bad comedians? Because they keep getting restarted before they can finish their jokes! 🤣\n\nBut seriously, that's actually a feature, not a bug. Self-healing FTW!",
        "Why did the container go to therapy? It had too many layers! 🧅\n\nOkay, that was cheesy. But you asked! 😄",
        "What's a cluster operator's favorite dance? The Rolling Update! 💃\n\nI'll see myself out...",
        "Why don't etcd nodes ever get lost? Because they always come to a consensus on where they are! 🗺️\n\nYeah, I know, I should stick to cluster management... 😅"
      ];
      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
      setIsTyping(true);
      setTimeout(() => {
        addMessage({
          type: 'ai',
          content: randomJoke,
        });
        setIsTyping(false);
      }, getTypingDelay(randomJoke));
      return;
    }
    
    // Default: use getAIResponse with dynamic delay
    setIsTyping(true);
    const response = getAIResponse(suggestion, location.pathname);
    const delay = getTypingDelay(response.content);
    setTimeout(() => {
      addMessage({
        type: 'ai',
        content: response.content,
        actions: response.actions,
        suggestions: response.suggestions
      });
      setIsTyping(false);
    }, delay);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed top-0 right-0 h-full w-[400px] bg-white/90 dark:bg-[#1a1a1a]/90 no-glass:bg-white no-glass:dark:bg-[#1a1a1a] backdrop-blur-xl no-glass:backdrop-blur-none shadow-[-4px_0_24px_0_rgba(0,0,0,0.12)] dark:shadow-[-4px_0_32px_0_rgba(0,0,0,0.5)] z-50 flex flex-col border-l border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-[16px] border-b border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)]">
        <div className="flex items-center gap-[8px]">
          <div className="relative">
            <Sparkles className="size-[20px] text-[#0066cc] dark:text-[#4dabf7]" />
            <div className="absolute -top-1 -right-1 size-[8px] bg-[#0066cc] dark:bg-[#4dabf7] rounded-full animate-pulse"></div>
          </div>
          <div>
            <h2 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[#151515] dark:text-white text-[16px]">
              OpenShift LightSpeed
            </h2>
            <p className="text-[11px] text-[#4d4d4d] dark:text-[#b0b0b0]">AI · 1:30 PM</p>
          </div>
        </div>
        <div className="flex items-center gap-[8px]">
          <button className="p-[4px] hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.05)] rounded-[4px]">
            <MoreVertical className="size-[16px] text-[#4d4d4d] dark:text-[#b0b0b0]" />
          </button>
          <button 
            onClick={onClose}
            className="p-[4px] hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.05)] rounded-[4px]"
          >
            <X className="size-[16px] text-[#4d4d4d] dark:text-[#b0b0b0]" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-[16px] space-y-[16px]">
        {messages.map((message) => (
          <div key={message.id} className="space-y-[8px]">
            {message.type === 'user' ? (
              <div className="flex justify-end">
                <div className="bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.08)] text-[#151515] dark:text-white rounded-[12px] rounded-tr-[4px] px-[16px] py-[10px] max-w-[85%]">
                  <p className="text-[14px] whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-[12px]">
                <div className="bg-[rgba(0,0,0,0.03)] dark:bg-[rgba(255,255,255,0.05)] rounded-[12px] rounded-tl-[4px] px-[16px] py-[12px]">
                  <p className="text-[14px] text-[#151515] dark:text-white whitespace-pre-wrap leading-[20px]">
                    {formatText(message.content || '')}
                  </p>
                </div>
                
                {/* Suggestion chips */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-[8px]">
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={`${message.id}-suggestion-${idx}`}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-[16px] py-[8px] bg-[#0066cc] hover:bg-[#004080] dark:bg-[#4dabf7] dark:hover:bg-[#339af0] text-white rounded-[8px] text-[13px] font-medium transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-[8px]">
                  <button className="p-[6px] hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.05)] rounded-[999px] transition-colors">
                    <ThumbsUp className="size-[14px] text-[#4d4d4d] dark:text-[#b0b0b0]" />
                  </button>
                  <button className="p-[6px] hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.05)] rounded-[999px] transition-colors">
                    <ThumbsDown className="size-[14px] text-[#4d4d4d] dark:text-[#b0b0b0]" />
                  </button>
                  <button className="p-[6px] hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.05)] rounded-[999px] transition-colors">
                    <Copy className="size-[14px] text-[#4d4d4d] dark:text-[#b0b0b0]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="space-y-[12px]">
            <div className="bg-[rgba(0,0,0,0.03)] dark:bg-[rgba(255,255,255,0.05)] rounded-[12px] rounded-tl-[4px] px-[16px] py-[12px]">
              <div className="flex gap-[4px]">
                <div className="size-[8px] bg-[#4d4d4d] dark:bg-[#b0b0b0] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="size-[8px] bg-[#4d4d4d] dark:bg-[#b0b0b0] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="size-[8px] bg-[#4d4d4d] dark:bg-[#b0b0b0] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-[16px] border-t border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)]">
        <div className="flex gap-[8px]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask about cluster updates, operators..."
            className="flex-1 px-[12px] py-[10px] rounded-[8px] bg-[rgba(0,0,0,0.04)] dark:bg-[rgba(255,255,255,0.06)] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] text-[#151515] dark:text-white text-[14px] focus:outline-none focus:border-[#0066cc] dark:focus:border-[#4dabf7] transition-colors placeholder:text-[#999]"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim()}
            className="px-[16px] py-[10px] bg-[#0066cc] hover:bg-[#004080] dark:bg-[#4dabf7] dark:hover:bg-[#339af0] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-[8px] transition-colors flex items-center gap-[6px]"
          >
            <Send className="size-[16px]" />
          </button>
        </div>
      </div>
    </div>
  );
}