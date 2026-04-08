import { useState } from "react";
import { Search, X } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

interface ImpersonateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImpersonate: (user: User) => void;
}

export default function ImpersonateUserModal({ isOpen, onClose, onImpersonate }: ImpersonateUserModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const users: User[] = [
    { id: "1", name: "Sarah Chen", email: "sarah.chen@redhat.com", role: "Developer", department: "Engineering" },
    { id: "2", name: "Michael Rodriguez", email: "michael.rodriguez@redhat.com", role: "DevOps Engineer", department: "Operations" },
    { id: "3", name: "Emily Watson", email: "emily.watson@redhat.com", role: "Product Manager", department: "Product" },
    { id: "4", name: "David Kim", email: "david.kim@redhat.com", role: "Security Analyst", department: "Security" },
    { id: "5", name: "Lisa Anderson", email: "lisa.anderson@redhat.com", role: "QA Engineer", department: "Quality Assurance" },
    { id: "6", name: "James Wilson", email: "james.wilson@redhat.com", role: "Site Reliability Engineer", department: "Operations" },
    { id: "7", name: "Maria Garcia", email: "maria.garcia@redhat.com", role: "Frontend Developer", department: "Engineering" },
    { id: "8", name: "Robert Taylor", email: "robert.taylor@redhat.com", role: "Backend Developer", department: "Engineering" },
  ];

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImpersonate = (user: User) => {
    onImpersonate(user);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[640px]">
        <div className="app-glass-panel overflow-hidden">
          {/* Header */}
          <div className="px-[24px] py-[20px] border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] flex items-center justify-between">
            <div>
              <h2 className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[20px] text-[#151515] dark:text-white">
                Impersonate User
              </h2>
              <p className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] mt-[4px]">
                Select a user to view the console from their perspective
              </p>
            </div>
            <button
              onClick={onClose}
              className="size-[32px] rounded-full hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.08)] flex items-center justify-center transition-colors"
            >
              <X className="size-[16px] text-[#4d4d4d] dark:text-[#b0b0b0]" />
            </button>
          </div>

          {/* Search */}
          <div className="px-[24px] py-[16px] border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)]">
            <div className="relative">
              <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 size-[16px] text-[#4d4d4d] dark:text-[#b0b0b0]" />
              <input
                type="text"
                placeholder="Search by name, email, role, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-[40px] pr-[12px] py-[10px] bg-[#f8f8f8] dark:bg-[rgba(255,255,255,0.05)] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] rounded-[8px] text-[14px] text-[#151515] dark:text-white placeholder:text-[#4d4d4d] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-[#0066cc] dark:focus:ring-[#4dabf7]"
              />
            </div>
          </div>

          {/* User List */}
          <div className="max-h-[400px] overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="px-[24px] py-[40px] text-center">
                <p className="text-[14px] text-[#4d4d4d] dark:text-[#b0b0b0]">
                  No users found matching "{searchQuery}"
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[rgba(0,0,0,0.08)] dark:divide-[rgba(255,255,255,0.08)]">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleImpersonate(user)}
                    className="w-full px-[24px] py-[16px] hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors text-left"
                  >
                    <div className="flex items-center gap-[12px]">
                      {/* Avatar */}
                      <div className="size-[40px] rounded-full bg-[#e0e0e0] dark:bg-[#2a2a2a] flex items-center justify-center shrink-0">
                        <span className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[14px] text-[#151515] dark:text-white">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      
                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[14px] text-[#151515] dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] truncate">
                          {user.email}
                        </p>
                      </div>
                      
                      {/* Role & Department */}
                      <div className="text-right shrink-0">
                        <p className="text-[12px] text-[#151515] dark:text-white font-semibold">
                          {user.role}
                        </p>
                        <p className="text-[11px] text-[#4d4d4d] dark:text-[#b0b0b0]">
                          {user.department}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-[24px] py-[16px] border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#f8f8f8] dark:bg-[rgba(255,255,255,0.02)]">
            <div className="flex items-start gap-[8px]">
              <svg className="size-[14px] text-[#0066cc] dark:text-[#4dabf7] shrink-0 mt-[2px]" fill="none" viewBox="0 0 16 16">
                <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM8 5a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3A.5.5 0 0 1 8 5zm0 5.5a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5z" fill="currentColor" />
              </svg>
              <p className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0]">
                You will see the console from the selected user's perspective. All actions will be logged under your admin account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
