import { X } from "lucide-react";

interface UpdateLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpdateLogsModal({ isOpen, onClose }: UpdateLogsModalProps) {
  if (!isOpen) return null;

  const logs = [
    { timestamp: "2026-03-17 14:32:15", level: "INFO", message: "Starting cluster update process" },
    { timestamp: "2026-03-17 14:32:18", level: "INFO", message: "Validating update prerequisites" },
    { timestamp: "2026-03-17 14:32:25", level: "INFO", message: "Downloading update images" },
    { timestamp: "2026-03-17 14:33:42", level: "INFO", message: "Updating operator Abot Operator-v3.0.0" },
    { timestamp: "2026-03-17 14:34:15", level: "INFO", message: "Operator Abot Operator-v3.0.0 updated successfully" },
    { timestamp: "2026-03-17 14:34:18", level: "INFO", message: "Updating operator Airflow Helm Operator" },
    { timestamp: "2026-03-17 14:35:02", level: "INFO", message: "Operator Airflow Helm Operator updated successfully" },
    { timestamp: "2026-03-17 14:35:05", level: "INFO", message: "Updating operator Ansible Automation Platform" },
    { timestamp: "2026-03-17 14:36:21", level: "INFO", message: "Operator Ansible Automation Platform updated successfully" },
    { timestamp: "2026-03-17 14:36:24", level: "INFO", message: "Starting control plane update" },
    { timestamp: "2026-03-17 14:37:45", level: "INFO", message: "Control plane master-0 updated successfully" },
    { timestamp: "2026-03-17 14:39:12", level: "INFO", message: "Control plane master-1 updated successfully" },
    { timestamp: "2026-03-17 14:40:38", level: "INFO", message: "Control plane master-2 updated successfully" },
    { timestamp: "2026-03-17 14:40:42", level: "INFO", message: "Starting worker nodes update" },
    { timestamp: "2026-03-17 14:41:15", level: "INFO", message: "Worker node worker-east-01 draining..." },
    { timestamp: "2026-03-17 14:42:30", level: "INFO", message: "Worker node worker-east-01 drained" },
    { timestamp: "2026-03-17 14:42:35", level: "INFO", message: "Updating worker node worker-east-01..." },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-[24px] bg-[rgba(0,0,0,0.5)] backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1f1f1f] rounded-[16px] shadow-[0px_8px_32px_0px_rgba(0,0,0,0.2)] max-w-[900px] w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-[24px] border-b border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)]">
          <h2 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[20px] text-[#151515] dark:text-white">
            Cluster Update Logs
          </h2>
          <button
            onClick={onClose}
            className="p-[8px] rounded-[999px] hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.1)] transition-colors"
          >
            <X className="size-[20px] text-[#4d4d4d] dark:text-[#b0b0b0]" />
          </button>
        </div>

        {/* Logs Content */}
        <div className="flex-1 overflow-y-auto p-[24px] bg-[#1e1e1e] dark:bg-[#0d1117] font-mono text-[13px]">
          <div className="space-y-[4px]">
            {logs.map((log, index) => (
              <div key={index} className="flex gap-[12px] text-[#d4d4d4]">
                <span className="text-[#858585] shrink-0">{log.timestamp}</span>
                <span className={`shrink-0 font-semibold ${
                  log.level === "INFO" ? "text-[#4dabf7]" : 
                  log.level === "WARN" ? "text-[#ffb300]" : 
                  "text-[#ee0000]"
                }`}>
                  [{log.level}]
                </span>
                <span>{log.message}</span>
              </div>
            ))}
            {/* Live cursor */}
            <div className="flex gap-[12px] text-[#d4d4d4] animate-pulse">
              <span className="text-[#858585]">2026-03-17 14:43:15</span>
              <span className="text-[#4dabf7] font-semibold">[INFO]</span>
              <span>Updating...</span>
              <span className="inline-block w-[8px] h-[14px] bg-[#4dabf7] animate-blink" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-[12px] p-[24px] border-t border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)]">
          <button
            onClick={onClose}
            className="px-[20px] py-[10px] rounded-[8px] font-semibold text-[14px] bg-[#0066cc] hover:bg-[#004080] dark:bg-[#4dabf7] dark:hover:bg-[#339af0] text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
