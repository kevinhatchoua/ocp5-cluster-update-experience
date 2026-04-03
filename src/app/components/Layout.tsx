import { Link, Outlet, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Menu } from "lucide-react";
import svgPaths from "../../imports/svg-929lpcd05l";
import LightSpeedPanel from "./LightSpeedPanel";
import ImpersonateUserModal from "./ImpersonateUserModal";
import { usePermissions } from "../contexts/PermissionsContext";
import { useChat } from "../contexts/ChatContext";
import { useFavorites } from "../contexts/FavoritesContext";

interface ImpersonatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

function MainNavToggle({ onClick, isCollapsed }: { onClick: () => void; isCollapsed: boolean }) {
  return (
    <div 
      onClick={onClick}
      className="content-stretch flex h-[40px] items-center justify-center relative shrink-0 w-[48px] cursor-pointer hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.08)] rounded-[8px] transition-colors" 
      data-name="Main Nav Toggle"
    >
      <Menu className="size-[18px] text-[#1F1F1F] dark:text-white" />
    </div>
  );
}

function UiIcon() {
  return (
    <div className="absolute contents inset-[3.91%]" data-name="UI icon">
      <div className="absolute inset-[3.91%]" data-name="Group">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.75 14.75">
          <g id="Group">
            <path d={svgPaths.p1388cf00} fill="var(--fill-0, #1F1F1F)" className="dark:fill-white" id="Vector" />
            <path d={svgPaths.p33d09900} fill="var(--fill-0, #1F1F1F)" className="dark:fill-white" id="Vector_2" />
            <path d={svgPaths.p2e5b1680} fill="var(--fill-0, #1F1F1F)" className="dark:fill-white" id="Vector_3" />
            <path d={svgPaths.p38df6f80} fill="var(--fill-0, #1F1F1F)" className="dark:fill-white" id="Vector_4" />
            <path d={svgPaths.p2e0e5700} fill="var(--fill-0, #1F1F1F)" className="dark:fill-white" id="Vector_5" />
            <path d={svgPaths.p385e8600} fill="var(--fill-0, #1F1F1F)" className="dark:fill-white" id="Vector_6" />
            <path d={svgPaths.p9155f00} fill="var(--fill-0, #1F1F1F)" className="dark:fill-white" id="Vector_7" />
            <path d={svgPaths.p36882e80} fill="var(--fill-0, #1F1F1F)" className="dark:fill-white" id="Vector_8" />
            <path d={svgPaths.p14445380} fill="var(--fill-0, #1F1F1F)" className="dark:fill-white" id="Vector_9" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Apps() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative shrink-0 size-[40px] cursor-pointer hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.08)] rounded-[999px] transition-colors" data-name="Apps">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="rh-ui-icon-switcher-menu">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <g id="Bounding box">
            <g id="Vector" />
          </g>
        </svg>
        <UiIcon />
      </div>
    </div>
  );
}

function UiIcon1() {
  return (
    <div className="absolute inset-[0_6.25%_-0.03%_6.25%]" data-name="UI icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 16.005">
        <g id="UI icon">
          <path d={svgPaths.p31ff3ea0} fill="var(--fill-0, #1F1F1F)" className="dark:fill-white" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Notifications() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative shrink-0 size-[40px] cursor-pointer hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.08)] rounded-[999px] transition-colors" data-name="Notifications">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="rh-ui-icon-notification">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <g id="Bounding box">
            <g id="Vector" />
          </g>
        </svg>
        <UiIcon1 />
      </div>
    </div>
  );
}

function UiIcon2() {
  return (
    <div className="absolute contents inset-0" data-name="UI icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Group">
          <path d={svgPaths.p2238de70} fill="var(--fill-0, #1F1F1F)" className="dark:fill-white" id="Vector" />
          <path d={svgPaths.p228cba80} fill="var(--fill-0, #1F1F1F)" className="dark:fill-white" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Add() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative shrink-0 size-[40px] cursor-pointer hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.08)] rounded-[999px] transition-colors" data-name="Add">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="rh-ui-icon-add-circle">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <g id="Bounding box">
            <g id="Vector" />
          </g>
        </svg>
        <UiIcon2 />
      </div>
    </div>
  );
}

function UiIcon3() {
  return (
    <div className="absolute contents inset-0" data-name="UI icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Group">
          <path d={svgPaths.p14c76000} fill="var(--fill-0, #1F1F1F)" className="dark:fill-white" id="Vector" />
          <path d={svgPaths.p228cba80} fill="var(--fill-0, #1F1F1F)" className="dark:fill-white" id="Vector_2" />
          <path d={svgPaths.pfe94800} fill="var(--fill-0, #1F1F1F)" className="dark:fill-white" id="Vector_3" />
        </g>
      </svg>
    </div>
  );
}

function Help() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative shrink-0 size-[40px] cursor-pointer hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.08)] rounded-[999px] transition-colors" data-name="Help">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="rh-ui-icon-question-mark-circle">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <g id="Bounding box">
            <g id="Vector" />
          </g>
        </svg>
        <UiIcon3 />
      </div>
    </div>
  );
}

function AvatarMd({ impersonatedUser, onImpersonate, onStopImpersonation }: { 
  impersonatedUser: ImpersonatedUser | null;
  onImpersonate: () => void;
  onStopImpersonation: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const displayName = impersonatedUser ? impersonatedUser.name : "John Smith";
  const displayEmail = impersonatedUser ? impersonatedUser.email : "john.smith@redhat.com";
  const displayInitials = impersonatedUser 
    ? impersonatedUser.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : "JS";

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`${impersonatedUser ? 'bg-[#e0e0e0] dark:bg-[#2a2a2a]' : 'bg-[#b9e5e5]'} content-stretch flex items-center justify-center p-[4px] relative rounded-[999px] shrink-0 size-[36px] cursor-pointer hover:opacity-80 transition-opacity border border-[#9ad8d8]`}
        data-name="avatar-MD"
      >
        <p className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#151515] text-[14px] text-center whitespace-nowrap">{displayInitials}</p>
      </div>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-30" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-[48px] z-40 w-[280px] bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-xl rounded-[12px] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-lg overflow-hidden">
            {/* User Info Section */}
            <div className="px-[16px] py-[12px] border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)]">
              <p className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[14px] text-[#151515] dark:text-white">
                {displayName}
              </p>
              <p className="text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0] mt-[2px]">
                {displayEmail}
              </p>
              {impersonatedUser && (
                <p className="text-[11px] text-[#0066cc] dark:text-[#4dabf7] mt-[4px] font-semibold">
                  {impersonatedUser.role} • {impersonatedUser.department}
                </p>
              )}
            </div>

            {/* Menu Items */}
            <div className="py-[8px]">
              <button className="w-full px-[16px] py-[10px] text-left hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center gap-[12px]">
                <svg className="size-[16px] text-[#4d4d4d] dark:text-[#b0b0b0]" fill="none" viewBox="0 0 16 16">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 1c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4z" fill="currentColor"/>
                </svg>
                <span className="text-[14px] text-[#151515] dark:text-white">My Account</span>
              </button>

              <button className="w-full px-[16px] py-[10px] text-left hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center gap-[12px]">
                <svg className="size-[16px] text-[#4d4d4d] dark:text-[#b0b0b0]" fill="none" viewBox="0 0 16 16">
                  <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM4.5 8a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm0 6a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5z" fill="currentColor"/>
                </svg>
                <span className="text-[14px] text-[#151515] dark:text-white">User Preferences</span>
              </button>

              <button className="w-full px-[16px] py-[10px] text-left hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center gap-[12px]">
                <svg className="size-[16px] text-[#4d4d4d] dark:text-[#b0b0b0]" fill="none" viewBox="0 0 16 16">
                  <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z" fill="currentColor"/>
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" fill="none"/>
                </svg>
                <span className="text-[14px] text-[#151515] dark:text-white">Role Management</span>
              </button>
            </div>

            {/* Impersonation Section */}
            <div className="border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] py-[8px]">
              {impersonatedUser ? (
                <button 
                  onClick={() => {
                    onStopImpersonation();
                    setIsOpen(false);
                  }}
                  className="w-full px-[16px] py-[10px] text-left hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center gap-[12px]"
                >
                  <svg className="size-[16px] text-[#d4183d]" fill="none" viewBox="0 0 16 16">
                    <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM10.5 8a.5.5 0 0 1-.5.5H6a.5.5 0 0 1 0-1h4a.5.5 0 0 1 .5.5z" fill="currentColor"/>
                  </svg>
                  <span className="text-[14px] text-[#d4183d] font-semibold">Stop Impersonation</span>
                </button>
              ) : (
                <button 
                  onClick={() => {
                    onImpersonate();
                    setIsOpen(false);
                  }}
                  className="w-full px-[16px] py-[10px] text-left hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center gap-[12px]"
                >
                  <svg className="size-[16px] text-[#0066cc] dark:text-[#4dabf7]" fill="none" viewBox="0 0 16 16">
                    <path d="M8 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM4 10.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5v.5H4v-.5zM2 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm12 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM1 10.5C1 9.67 1.67 9 2.5 9H4v2H1v-.5zm11 0v.5h3v-.5c0-.83-.67-1.5-1.5-1.5H12v2z" fill="currentColor"/>
                  </svg>
                  <span className="text-[14px] text-[#0066cc] dark:text-[#4dabf7] font-semibold">Impersonate User</span>
                </button>
              )}
            </div>

            {/* Logout Section */}
            <div className="border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] py-[8px]">
              <button className="w-full px-[16px] py-[10px] text-left hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center gap-[12px]">
                <svg className="size-[16px] text-[#d4183d]" fill="none" viewBox="0 0 16 16">
                  <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3m5 8l3-3m0 0l-3-3m3 3H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-[14px] text-[#d4183d]">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [isGlass, setIsGlass] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
    
    const hasGlass = !document.documentElement.classList.contains('no-glass');
    setIsGlass(hasGlass);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleGlass = () => {
    const newIsGlass = !isGlass;
    setIsGlass(newIsGlass);
    
    if (newIsGlass) {
      document.documentElement.classList.remove('no-glass');
    } else {
      document.documentElement.classList.add('no-glass');
    }
  };

  return (
    <div className="relative">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="content-stretch flex items-center justify-center p-[8px] relative shrink-0 size-[40px] cursor-pointer hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.08)] rounded-[999px] transition-colors"
        data-name="ThemeToggle"
      >
        {isDark ? (
          <svg className="size-[16px] text-[#1F1F1F] dark:text-white" fill="none" viewBox="0 0 16 16">
            <path d="M8 11.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7zm0-1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm0-9a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5zm0 11a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5zm5.5-4.5a.5.5 0 0 1 .5.5.5.5 0 0 1-.5.5h-1a.5.5 0 0 1 0-1h1zm-11 0a.5.5 0 0 1 .5.5.5.5 0 0 1-.5.5h-1a.5.5 0 0 1 0-1h1zm9.192-4.692a.5.5 0 0 1 0 .707l-.707.707a.5.5 0 0 1-.707-.707l.707-.707a.5.5 0 0 1 .707 0zm-7.778 7.778a.5.5 0 0 1 0 .707l-.707.707a.5.5 0 0 1-.707-.707l.707-.707a.5.5 0 0 1 .707 0zm7.778 0a.5.5 0 0 1-.707 0l-.707-.707a.5.5 0 0 1 .707-.707l.707.707a.5.5 0 0 1 0 .707zM3.914 3.914a.5.5 0 0 1-.707 0l-.707-.707a.5.5 0 0 1 .707-.707l.707.707a.5.5 0 0 1 0 .707z" fill="currentColor" />
          </svg>
        ) : (
          <svg className="size-[16px] text-[#1F1F1F]" fill="none" viewBox="0 0 16 16">
            <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z" fill="currentColor" />
          </svg>
        )}
      </div>

      {/* Theme Options Menu */}
      {isExpanded && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-30" 
            onClick={() => setIsExpanded(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-[48px] z-40 w-[220px] bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-xl rounded-[12px] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-lg overflow-hidden">
            {/* Theme Mode */}
            <div className="px-[16px] py-[12px] border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)]">
              <p className="text-[11px] text-[#4d4d4d] dark:text-[#b0b0b0] uppercase font-semibold mb-[8px]">Theme Mode</p>
              <button 
                onClick={toggleTheme}
                className="w-full px-[12px] py-[8px] text-left hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center justify-between rounded-[999px]"
              >
                <span className="text-[13px] text-[#151515] dark:text-white">{isDark ? 'Dark' : 'Light'}</span>
                <div className={`size-[16px] rounded-full ${isDark ? 'bg-[#4dabf7]' : 'bg-[#f59f00]'} flex items-center justify-center`}>
                  {isDark ? (
                    <svg className="size-[10px] text-white" fill="none" viewBox="0 0 10 10">
                      <path d="M5 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z" fill="currentColor" transform="scale(0.6)" />
                    </svg>
                  ) : (
                    <svg className="size-[10px] text-white" fill="none" viewBox="0 0 10 10">
                      <circle cx="5" cy="5" r="2.5" fill="currentColor" />
                    </svg>
                  )}
                </div>
              </button>
            </div>

            {/* Glass Effect */}
            <div className="px-[16px] py-[12px]">
              <p className="text-[11px] text-[#4d4d4d] dark:text-[#b0b0b0] uppercase font-semibold mb-[8px]">Glass Effect</p>
              <button 
                onClick={toggleGlass}
                className="w-full px-[12px] py-[8px] text-left hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center justify-between rounded-[999px]"
              >
                <span className="text-[13px] text-[#151515] dark:text-white">{isGlass ? 'Enabled' : 'Disabled'}</span>
                <div className={`w-[32px] h-[18px] rounded-full transition-colors ${isGlass ? 'bg-[#0066cc] dark:bg-[#4dabf7]' : 'bg-[#d2d2d2] dark:bg-[#4d4d4d]'} relative`}>
                  <div className={`absolute top-[2px] size-[14px] rounded-full bg-white transition-all ${isGlass ? 'left-[16px]' : 'left-[2px]'}`} />
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface MenuItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  subItems?: { path: string; label: string }[];
  isCollapsed: boolean;
}

function MenuItem({ to, icon, label, isActive, subItems, isCollapsed }: MenuItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (subItems) {
      const hasActiveSubItem = subItems.some(item => 
        location.pathname === item.path || location.pathname.startsWith(item.path + '/')
      );
      if (hasActiveSubItem && !isExpanded) {
        setIsExpanded(true);
      }
    }
  }, [location.pathname]); // Removed subItems from dependencies to prevent infinite loop

  const handleClick = (e: React.MouseEvent) => {
    if (subItems && subItems.length > 0) {
      e.preventDefault();
      if (!isCollapsed) {
        setIsExpanded(!isExpanded);
      }
    }
  };

  const shouldHighlight = isActive || (subItems && subItems.some(item => 
    location.pathname === item.path || location.pathname.startsWith(item.path + '/')
  ));

  if (isCollapsed) {
    if (subItems && subItems.length > 0) {
      return (
        <div className="block no-underline" title={label}>
          <div
            className={`flex h-[40px] items-center justify-center rounded-[8px] w-full cursor-pointer transition-all ${
              shouldHighlight 
                ? "bg-[rgba(0,0,0,0.06)] dark:bg-[rgba(255,255,255,0.1)]" 
                : "hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.06)]"
            }`}
          >
            {icon}
          </div>
        </div>
      );
    }
    
    return (
      <Link to={to} className="block no-underline" title={label}>
        <div
          className={`flex h-[40px] items-center justify-center rounded-[8px] w-full cursor-pointer transition-all ${
            shouldHighlight 
              ? "bg-[rgba(0,0,0,0.06)] dark:bg-[rgba(255,255,255,0.1)]" 
              : "hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.06)]"
          }`}
        >
          {icon}
        </div>
      </Link>
    );
  }

  return (
    <div>
      {subItems && subItems.length > 0 ? (
        <div className="block no-underline" onClick={handleClick}>
          <div
            className={`content-stretch flex h-[40px] items-center justify-between px-[16px] rounded-[8px] w-full cursor-pointer transition-all relative ${
              shouldHighlight 
                ? "bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.08)]" 
                : "hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.04)]"
            }`}
            data-name="Menu Item"
          >
            {shouldHighlight && (
              <div className="absolute left-0 top-[8px] bottom-[8px] w-[3px] bg-[#0066cc] dark:bg-[#4dabf7] rounded-full" />
            )}
            <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
              {icon}
              <p
                className={`font-['Red_Hat_Text:Regular',sans-serif] leading-[normal] relative shrink-0 text-[14px] whitespace-nowrap ${
                  shouldHighlight ? "text-[#151515] dark:text-white font-medium" : "text-[#151515] dark:text-[#e0e0e0]"
                }`}
              >
                {label}
              </p>
            </div>
            <div 
              className={`overflow-clip relative shrink-0 size-[14px] transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
            >
              <svg className="block size-full" fill="none" viewBox="0 0 6 10">
                <path d="M1 1l4 4-4 4" stroke={shouldHighlight ? "#151515" : "#707070"} className="dark:stroke-[#b0b0b0]" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
          </div>
        </div>
      ) : (
        <Link to={to} className="block no-underline" onClick={handleClick}>
          <div
            className={`content-stretch flex h-[40px] items-center justify-between px-[16px] rounded-[8px] w-full cursor-pointer transition-all ${
              shouldHighlight 
                ? "bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.08)]" 
                : "hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.04)]"
            }`}
            data-name="Menu Item"
          >
            <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
              {icon}
              <p
                className={`font-['Red_Hat_Text:Regular',sans-serif] leading-[normal] relative shrink-0 text-[14px] whitespace-nowrap ${
                  shouldHighlight ? "text-[#151515] dark:text-white font-medium" : "text-[#151515] dark:text-[#e0e0e0]"
                }`}
              >
                {label}
              </p>
            </div>
            {/* Chevron for non-expandable items with sub-navigation potential */}
            <svg className="size-[14px]" fill="none" viewBox="0 0 6 10">
              <path d="M1 1l4 4-4 4" stroke="#707070" className="dark:stroke-[#b0b0b0]" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
        </Link>
      )}
      
      {subItems && isExpanded && !isCollapsed && (
        <div className="ml-[28px] mt-[2px] flex flex-col gap-[1px] border-l-0 pl-[12px]">
          {subItems.map((subItem) => {
            const isSubActive = location.pathname === subItem.path || location.pathname.startsWith(subItem.path + '/');
            return (
              <Link key={subItem.path} to={subItem.path} className="block no-underline">
                <div
                  className={`px-[12px] py-[8px] rounded-[8px] cursor-pointer transition-all ${
                    isSubActive 
                      ? "bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.08)]" 
                      : "hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.04)]"
                  }`}
                >
                  <p className={`font-['Red_Hat_Text:Regular',sans-serif] text-[14px] ${
                    isSubActive 
                      ? "text-[#151515] dark:text-white" 
                      : "text-[#4d4d4d] dark:text-[#b0b0b0]"
                  }`}>
                    {subItem.label}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [isImpersonateModalOpen, setIsImpersonateModalOpen] = useState(false);
  const [isFavoritesExpanded, setIsFavoritesExpanded] = useState(false);
  const location = useLocation();
  
  // Use the permissions context
  const { impersonatedUser, setImpersonatedUser } = usePermissions();
  
  // Use the chat context for AI panel state
  const { isOpen: isAIOpen, setIsOpen: setIsAIOpen } = useChat();

  // Use favorites context
  const { favorites } = useFavorites();

  const handleImpersonate = (user: { id: string; name: string; email: string; role: string; department: string }) => {
    setImpersonatedUser(user);
  };

  const handleStopImpersonation = () => {
    setImpersonatedUser(null);
  };

  // Check if current user has admin permissions
  const hasAdminPermissions = !impersonatedUser || impersonatedUser.role === 'Cluster Admin';

  const menuItems = [
    {
      path: "/",
      label: "Home",
      icon: (
        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="rh-ui-icon-home">
          <div className="absolute inset-[4.22%_3.13%_3.12%_3.13%]" data-name="Vector">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 14.8251">
              <path d={svgPaths.p2884b900} fill="var(--fill-0, #707070)" className={`${location.pathname === '/' ? 'dark:fill-white fill-[#151515]' : ''}`} id="Vector" />
            </svg>
          </div>
        </div>
      ),
    },
    {
      path: "/favorites",
      label: "Favorites",
      icon: (
        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="rh-ui-icon-star">
          <div className="absolute inset-[6.25%_2.52%]" data-name="Vector">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.1948 14">
              <path d={svgPaths.p2f016100} fill="var(--fill-0, #707070)" id="Vector" />
            </svg>
          </div>
        </div>
      ),
    },
    {
      path: "/ecosystem",
      label: "Ecosystem",
      icon: (
        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="rh-ui-icon-topology">
          <div className="absolute inset-[3.13%]" data-name="Vector">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
              <path d={svgPaths.p864ee00} fill="var(--fill-0, #707070)" id="Vector" />
            </svg>
          </div>
        </div>
      ),
      subItems: [
        { path: "/ecosystem/software-catalog", label: "Software Catalog" },
        { path: "/ecosystem/installed-operators", label: "Installed Software" },
        { path: "/ecosystem/helm", label: "Helm" },
      ],
    },
    {
      path: "/workloads",
      label: "Workloads",
      icon: (
        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="rh-ui-icon-package">
          <div className="absolute inset-[3.13%_3.13%_4.29%_3.13%]" data-name="Vector">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 14.8141">
              <path d={svgPaths.p34d28180} fill="var(--fill-0, #707070)" id="Vector" />
            </svg>
          </div>
        </div>
      ),
      subItems: [
        { path: "/workloads/topology", label: "Topology" },
        { path: "/workloads/pods", label: "Pods" },
        { path: "/workloads/deployments", label: "Deployments" },
        { path: "/workloads/statefulsets", label: "StatefulSets" },
        { path: "/workloads/daemonsets", label: "DaemonSets" },
        { path: "/workloads/jobs", label: "Jobs" },
        { path: "/workloads/cronjobs", label: "CronJobs" },
      ],
    },
    {
      path: "/networking",
      label: "Networking",
      icon: (
        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="rh-ui-icon-network">
          <div className="absolute inset-[6.25%]" data-name="Vector">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
              <path d={svgPaths.p1b70bd80} fill="var(--fill-0, #707070)" id="Vector" />
            </svg>
          </div>
        </div>
      ),
    },
    {
      path: "/storage",
      label: "Storage",
      icon: (
        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="rh-ui-icon-storage">
          <div className="absolute inset-[3.13%_6.25%]" data-name="Vector">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 15">
              <path d={svgPaths.p2d096000} fill="var(--fill-0, #707070)" id="Vector" />
            </svg>
          </div>
        </div>
      ),
    },
    {
      path: "/builds",
      label: "Builds",
      icon: (
        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="rh-ui-icon-build">
          <div className="absolute inset-[3.13%]" data-name="Vector">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.9994 14.9995">
              <path d={svgPaths.p5608080} fill="var(--fill-0, #707070)" id="Vector" />
            </svg>
          </div>
        </div>
      ),
    },
    {
      path: "/observe",
      label: "Observe",
      icon: (
        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="rh-ui-icon-monitoring">
          <div className="absolute inset-[9.38%_3.13%]" data-name="Vector">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 13">
              <path d={svgPaths.p126bcb00} fill="var(--fill-0, #707070)" id="Vector" />
            </svg>
          </div>
        </div>
      ),
    },
    {
      path: "/compute",
      label: "Compute",
      icon: (
        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="rh-ui-icon-server">
          <div className="absolute inset-[28.13%_3.13%]" data-name="Vector">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 7">
              <path d={svgPaths.p2845b00} fill="var(--fill-0, #707070)" id="Vector" />
            </svg>
          </div>
        </div>
      ),
    },
    {
      path: "/user-management",
      label: "User Management",
      icon: (
        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="rh-ui-icon-users">
          <div className="absolute inset-[6.25%_3.13%]" data-name="Vector">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 14">
              <path d={svgPaths.pe92d880} fill="var(--fill-0, #707070)" id="Vector" />
            </svg>
          </div>
        </div>
      ),
    },
    {
      path: "/administration",
      label: "Administration",
      icon: (
        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="rh-ui-icon-settings">
          <div className="absolute inset-[3.13%_3.12%_3.13%_3.13%]" data-name="Vector">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.9999 14.999">
              <path d={svgPaths.p17dcc480} fill="var(--fill-0, #707070)" id="Vector" />
            </svg>
          </div>
        </div>
      ),
      subItems: [
        { path: "/administration/cluster-settings", label: "Cluster Settings" },
        { path: "/administration/namespaces", label: "Namespaces" },
        { path: "/administration/resource-quotas", label: "ResourceQuotas" },
        { path: "/administration/limit-ranges", label: "LimitRanges" },
        { path: "/administration/custom-resource-definitions", label: "CustomResourceDefinitions" },
        { path: "/administration/dynamic-plugins", label: "Dynamic Plugins" },
      ],
    },
  ];

  // Calculate content shift when AI panel is open
  const contentLeftPosition = isNavCollapsed 
    ? (isAIOpen ? 'left-[104px]' : 'left-[104px]') 
    : (isAIOpen ? 'left-[292px]' : 'left-[292px]');
  
  const contentRight = isAIOpen ? 'right-[420px]' : 'right-[16px]';
  const contentTop = impersonatedUser ? 'top-[126px]' : 'top-[66px]'; // Adjust for banner height

  return (
    <div className="bg-[#f8f8f8] dark:bg-[#0f0f0f] overflow-clip relative size-full transition-colors" data-name="Home">
      {/* Glass Effect Background - WITH gradient overlay */}
      <div className="absolute inset-0 no-glass:hidden">
        {/* Light mode background with gradient */}
        <div className="absolute inset-0 dark:hidden">
          <img 
            src="figma:asset/0063c8b2c924b83b2301cb4476c9f3da3f438e88.png" 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#e0f2fe]/30 via-[#f8f8f8]/50 to-[#fce7f3]/30" />
        </div>
        {/* Dark mode background with gradient */}
        <div className="absolute inset-0 hidden dark:block">
          <img 
            src="figma:asset/36e6362e0985ed0b78c1c2e915d3ed8df2963824.png" 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a]/20 via-[#0f0f0f]/50 to-[#7c2d12]/20" />
        </div>
      </div>

      {/* Masthead */}
      <div className="absolute left-0 right-0 top-0 z-20 h-[50px] bg-white dark:bg-[#1a1a1a] border-b border-[#e0e0e0] dark:border-[rgba(255,255,255,0.1)] shadow-[0px_1px_4px_0px_rgba(41,41,41,0.15)]" data-name="Masthead">
        <div className="flex items-center justify-between h-full px-[24px]">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-[16px]">
            <MainNavToggle onClick={() => setIsNavCollapsed(!isNavCollapsed)} isCollapsed={isNavCollapsed} />
            <div className="h-[37px] overflow-clip relative shrink-0 w-[108px]" data-name="Red Hat OpenShift logo masthead">
              <div className="absolute inset-[59.9%_57.93%_9.21%_31.48%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.494 12.3569"><path d={svgPaths.p3149000} fill="black" className="dark:fill-white" /></svg></div>
              <div className="absolute inset-[68.2%_49.06%_0.82%_43.51%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.7702 12.392"><path d={svgPaths.p37667600} fill="black" className="dark:fill-white" /></svg></div>
              <div className="absolute inset-[68.2%_40.71%_9.29%_52.02%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.5808 9.003"><path d={svgPaths.p3cfc2e80} fill="black" className="dark:fill-white" /></svg></div>
              <div className="absolute inset-[68.11%_32.77%_9.68%_60.67%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.74413 8.8842"><path d={svgPaths.p1e248880} fill="black" className="dark:fill-white" /></svg></div>
              <div className="absolute inset-[59.97%_23.44%_9.27%_68.16%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.91486 12.3026"><path d={svgPaths.p156d0f00} fill="black" className="dark:fill-white" /></svg></div>
              <div className="absolute inset-[59.43%_15.64%_9.68%_77.8%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.74249 12.3569"><path d={svgPaths.p1486fc00} fill="black" className="dark:fill-white" /></svg></div>
              <div className="absolute inset-[59.73%_12.38%_9.68%_85.87%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.06637 12.2368"><path d={svgPaths.p24ec5f00} fill="black" className="dark:fill-white" /></svg></div>
              <div className="absolute inset-[58.23%_6.15%_9.68%_88.58%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.21902 12.8363"><path d={svgPaths.p1e268b00} fill="black" className="dark:fill-white" /></svg></div>
              <div className="absolute inset-[61.95%_0.33%_9.31%_94.49%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.11361 11.4946"><path d={svgPaths.p7d1a200} fill="black" className="dark:fill-white" /></svg></div>
              <div className="absolute inset-[0.82%_73.15%_39.93%_0.28%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 31.3504 23.6969"><path d={svgPaths.p1ed3c680} fill="#EE0000" /></svg></div>
              <div className="absolute inset-[17.94%_77.21%_56.61%_5.45%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.4506 10.1798"><path d={svgPaths.p2a2f3d80} fill="black" className="dark:fill-white" /></svg></div>
              <div className="absolute inset-[13.96%_14.32%_53.8%_31.75%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 63.6313 12.8934"><path d={svgPaths.pd33a670} fill="black" className="dark:fill-white" /></svg></div>
            </div>
          </div>
          {/* Right: Utility icons + Avatar */}
          <div className="flex items-center gap-[24px]">
            <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
              <Help />
              <Notifications />
              <Apps />
            </div>
            <div 
              onClick={() => setIsAIOpen(true)}
              className="bg-white dark:bg-[rgba(255,255,255,0.05)] flex items-center gap-[4px] h-[37px] min-w-[40px] px-[8px] relative rounded-[999px] shrink-0 cursor-pointer hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.08)] transition-colors border border-[#8c8c8c] dark:border-[rgba(255,255,255,0.2)]"
            >
              <div className="overflow-clip relative shrink-0 size-[16px]" data-name="rh-ui-icon-ai-experience">
                <div className="absolute inset-[4.67%_4.68%_3.13%_3.11%]" data-name="icon">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.7534 14.7519">
                    <path d={svgPaths.p36bc1600} fill="var(--fill-0, #1F1F1F)" className="dark:fill-white" id="icon" />
                  </svg>
                </div>
              </div>
              <p className="font-['Red_Hat_Text:Regular',sans-serif] text-[#151515] dark:text-white text-[14px] text-center">10</p>
            </div>
            <ThemeToggle />
            <AvatarMd 
              impersonatedUser={impersonatedUser} 
              onImpersonate={() => setIsImpersonateModalOpen(true)} 
              onStopImpersonation={handleStopImpersonation} 
            />
          </div>
        </div>
      </div>

      {/* Impersonation Banner */}
      {impersonatedUser && (
        <div className="absolute left-[292px] right-[16px] top-[66px] z-10 bg-gradient-to-r from-[#0066cc] to-[#004080] dark:from-[#4dabf7] dark:to-[#339af0] rounded-[12px] shadow-lg">
          <div className="px-[20px] py-[12px] flex items-center justify-between">
            <div className="flex items-center gap-[12px]">
              <svg className="size-[20px] text-white" fill="none" viewBox="0 0 20 20">
                <path d="M10 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM5 12.5c0-.83.67-1.5 1.5-1.5h7c.83 0 1.5.67 1.5 1.5v.5H5v-.5zM2.5 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm15 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM1 12.5C1 11.67 1.67 11 2.5 11H5v2H1v-.5zm14 0V13.5h4v-1c0-.83-.67-1.5-1.5-1.5H15v1.5z" fill="currentColor" />
              </svg>
              <div>
                <p className="text-white font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[14px]">
                  Viewing as {impersonatedUser.name}
                </p>
                <p className="text-white/80 text-[12px]">
                  {impersonatedUser.role} • {impersonatedUser.department}
                </p>
              </div>
            </div>
            <button
              onClick={handleStopImpersonation}
              className="bg-white/20 hover:bg-white/30 text-white px-[16px] py-[8px] rounded-[8px] font-semibold text-[13px] transition-colors flex items-center gap-[8px]"
            >
              <X className="size-[14px]" />
              Stop Impersonation
            </button>
          </div>
        </div>
      )}

      {/* Collapsible Sidebar */}
      <div 
        className={`fixed left-[16px] top-[66px] z-20 transition-all duration-300 ease-in-out ${
          isNavCollapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
        data-name="Sidebar"
      >
        {/* Glassmorphic background */}
        <div className="absolute inset-0 bg-white/90 dark:bg-[#1a1a1a]/90 no-glass:bg-white no-glass:dark:bg-[#1a1a1a] backdrop-blur-xl no-glass:backdrop-blur-none rounded-[16px] border border-[#e0e0e0] dark:border-[rgba(255,255,255,0.08)] shadow-[0px_4px_10px_0px_rgba(41,41,41,0.1)]" />
        
        {/* Content */}
        <div className="relative p-[12px]">

          {/* Navigation Menu */}
          <div className="flex flex-col gap-[2px] max-h-[calc(100vh-110px)] overflow-y-auto pr-[4px]">
            {/* Home */}
            <MenuItem
              key="/"
              to="/"
              icon={menuItems[0].icon}
              label="Home"
              isActive={location.pathname === "/"}
              isCollapsed={isNavCollapsed}
            />

            {/* Favorites Section - Dynamic */}
            <div>
              <div 
                className={`block no-underline ${isNavCollapsed ? '' : 'cursor-pointer'}`}
                onClick={() => !isNavCollapsed && setIsFavoritesExpanded(!isFavoritesExpanded)}
              >
                <div
                  className={`content-stretch flex h-[40px] items-center ${isNavCollapsed ? 'justify-center rounded-[8px]' : 'justify-between px-[16px] rounded-[8px]'} w-full transition-all ${
                    isFavoritesExpanded && !isNavCollapsed
                      ? "bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.08)]" 
                      : "hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.04)]"
                  }`}
                  title={isNavCollapsed ? "Favorites" : undefined}
                >
                  {isNavCollapsed ? (
                    menuItems[1].icon
                  ) : (
                    <>
                      <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
                        {menuItems[1].icon}
                        <p className={`font-['Red_Hat_Text:Regular',sans-serif] leading-[normal] relative shrink-0 text-[14px] whitespace-nowrap ${
                          isFavoritesExpanded ? "text-[#151515] dark:text-white font-medium" : "text-[#151515] dark:text-[#e0e0e0]"
                        }`}>
                          Favorites {favorites.length > 0 && `(${favorites.length})`}
                        </p>
                      </div>
                      <div 
                        className={`overflow-clip relative shrink-0 size-[14px] transition-transform ${isFavoritesExpanded ? 'rotate-90' : ''}`}
                      >
                        <svg className="block size-full" fill="none" viewBox="0 0 6 10">
                          <path d="M1 1l4 4-4 4" stroke="#707070" className="dark:stroke-[#b0b0b0]" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Favorited Items */}
              {isFavoritesExpanded && !isNavCollapsed && (
                <div className="ml-[28px] mt-[2px] flex flex-col gap-[1px] pl-[12px]">
                  {favorites.length === 0 ? (
                    <div className="px-[12px] py-[10px]">
                      <p className="text-[13px] text-[#4d4d4d] dark:text-[#b0b0b0] italic">
                        No favorites yet. Click the star icon on any page to add it here.
                      </p>
                    </div>
                  ) : (
                    favorites.map((fav) => {
                      const isSubActive = location.pathname === fav.path || location.pathname.startsWith(fav.path + '/');
                      return (
                        <Link key={fav.id} to={fav.path} className="block no-underline">
                          <div
                            className={`px-[12px] py-[8px] rounded-[8px] cursor-pointer transition-all ${
                              isSubActive 
                                ? "bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.08)]" 
                                : "hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.04)]"
                            }`}
                          >
                            <p className={`font-['Red_Hat_Text:Regular',sans-serif] text-[14px] ${
                              isSubActive 
                                ? "text-[#151515] dark:text-white" 
                                : "text-[#4d4d4d] dark:text-[#b0b0b0]"
                            }`}>
                              {fav.name}
                            </p>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Rest of menu items (skip Home and Favorites) */}
            {menuItems.slice(2).map((item) => (
              <MenuItem
                key={item.path}
                to={item.path}
                icon={item.icon}
                label={item.label}
                isActive={location.pathname === item.path}
                subItems={item.subItems}
                isCollapsed={isNavCollapsed}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area - slides when AI panel opens */}
      <div 
        className={`absolute bottom-[16px] ${contentTop} transition-all duration-300 ease-in-out ${contentLeftPosition} ${contentRight}`}
      >
        <div className="bg-white/90 dark:bg-[#1a1a1a]/90 no-glass:bg-white no-glass:dark:bg-[#1a1a1a] backdrop-blur-xl no-glass:backdrop-blur-none rounded-[16px] border border-[#e0e0e0] dark:border-[rgba(255,255,255,0.08)] shadow-[0px_4px_10px_0px_rgba(41,41,41,0.15)] h-full overflow-y-auto overflow-x-hidden">
          <Outlet />
        </div>
      </div>

      {/* OpenShift LightSpeed Panel - slides in from right */}
      <LightSpeedPanel 
        isOpen={isAIOpen} 
        onClose={() => setIsAIOpen(false)}
        context="Hi John! I'm OpenShift LightSpeed, your AI assistant for cluster and operator management.\n\nI can help you with:\n• Cluster updates\n• Operator lifecycle management\n• General cluster information and health\n• Troubleshooting and remediation\n\nWhat would you like to know?"
      />

      {/* Impersonate User Modal */}
      <ImpersonateUserModal
        isOpen={isImpersonateModalOpen}
        onClose={() => setIsImpersonateModalOpen(false)}
        onImpersonate={handleImpersonate}
      />
    </div>
  );
}