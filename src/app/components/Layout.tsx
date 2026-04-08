import { Link, Outlet, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { X } from "@/lib/pfIcons";
import {
  Button,
  Dropdown,
  DropdownGroup,
  DropdownItem,
  Divider,
  MenuToggle,
  Switch,
} from "@patternfly/react-core";
import AngleRightIcon from "@patternfly/react-icons/dist/esm/icons/angle-right-icon";
import BarsIcon from "@patternfly/react-icons/dist/esm/icons/bars-icon";
import BellIcon from "@patternfly/react-icons/dist/esm/icons/bell-icon";
import ChartLineIcon from "@patternfly/react-icons/dist/esm/icons/chart-line-icon";
import CogIcon from "@patternfly/react-icons/dist/esm/icons/cog-icon";
import CubesIcon from "@patternfly/react-icons/dist/esm/icons/cubes-icon";
import GlobeIcon from "@patternfly/react-icons/dist/esm/icons/globe-icon";
import HammerIcon from "@patternfly/react-icons/dist/esm/icons/hammer-icon";
import HddIcon from "@patternfly/react-icons/dist/esm/icons/hdd-icon";
import HomeIcon from "@patternfly/react-icons/dist/esm/icons/home-icon";
import MinusCircleIcon from "@patternfly/react-icons/dist/esm/icons/minus-circle-icon";
import MoonIcon from "@patternfly/react-icons/dist/esm/icons/moon-icon";
import ProjectDiagramIcon from "@patternfly/react-icons/dist/esm/icons/project-diagram-icon";
import QuestionCircleIcon from "@patternfly/react-icons/dist/esm/icons/question-circle-icon";
import RobotIcon from "@patternfly/react-icons/dist/esm/icons/robot-icon";
import ServerIcon from "@patternfly/react-icons/dist/esm/icons/server-icon";
import SignOutAltIcon from "@patternfly/react-icons/dist/esm/icons/sign-out-alt-icon";
import StarIcon from "@patternfly/react-icons/dist/esm/icons/star-icon";
import SunIcon from "@patternfly/react-icons/dist/esm/icons/sun-icon";
import ThIcon from "@patternfly/react-icons/dist/esm/icons/th-icon";
import UserCogIcon from "@patternfly/react-icons/dist/esm/icons/user-cog-icon";
import UserIcon from "@patternfly/react-icons/dist/esm/icons/user-icon";
import UsersIcon from "@patternfly/react-icons/dist/esm/icons/users-icon";
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

const mastheadIconBtnClass =
  "!flex !h-10 !w-10 !shrink-0 !items-center !justify-center !rounded-full !p-0";

function MainNavToggle({ onClick, isCollapsed }: { onClick: () => void; isCollapsed: boolean }) {
  return (
    <Button
      variant="plain"
      type="button"
      onClick={onClick}
      className={`${mastheadIconBtnClass} !rounded-lg !w-12`}
      aria-label={isCollapsed ? "Expand navigation" : "Collapse navigation"}
      data-name="Main Nav Toggle"
    >
      <BarsIcon className="size-[18px] text-[#1F1F1F] dark:text-white" aria-hidden />
    </Button>
  );
}

function MastheadIconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Button variant="plain" type="button" aria-label={label} className={mastheadIconBtnClass} data-name={label}>
      {children}
    </Button>
  );
}

function NavMenuChevron({ expanded, emphasize }: { expanded: boolean; emphasize: boolean }) {
  return (
    <span
      className={`relative inline-flex shrink-0 size-[14px] items-center justify-center transition-transform ${expanded ? "rotate-90" : ""}`}
      aria-hidden
    >
      <AngleRightIcon
        className={
          emphasize
            ? "size-[14px] text-[#151515] dark:text-white"
            : "size-[14px] text-[#707070] dark:text-[#b0b0b0]"
        }
      />
    </span>
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

  const avatarToggleClass = impersonatedUser
    ? "bg-[#e0e0e0] dark:bg-[#2a2a2a]"
    : "bg-[#b9e5e5]";

  const menuIconMuted = { className: "size-[16px] text-[#4d4d4d] dark:text-[#b0b0b0]", "aria-hidden": true as const };

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      popperProps={{ direction: "down", position: "end" }}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          variant="plain"
          className={`${avatarToggleClass} !flex !size-9 !shrink-0 !items-center !justify-center !rounded-full !border !border-[#9ad8d8] !p-1 hover:!opacity-80`}
          data-name="avatar-MD"
          aria-label="User menu"
          onClick={() => setIsOpen((o) => !o)}
          isExpanded={isOpen}
        >
          <span className="font-['Red_Hat_Display:SemiBold',sans-serif] text-[14px] font-semibold leading-6 text-[#151515]">
            {displayInitials}
          </span>
        </MenuToggle>
      )}
      onSelect={() => setIsOpen(false)}
    >
      <DropdownGroup
        label={
          <div className="text-left">
            <div className="font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[14px] text-[#151515] dark:text-white">
              {displayName}
            </div>
            <div className="mt-[2px] text-[12px] text-[#4d4d4d] dark:text-[#b0b0b0]">
              {displayEmail}
            </div>
            {impersonatedUser && (
              <div className="mt-[4px] text-[11px] font-semibold text-[#0066cc] dark:text-[#4dabf7]">
                {impersonatedUser.role} • {impersonatedUser.department}
              </div>
            )}
          </div>
        }
      >
        <DropdownItem itemId="account" icon={<UserIcon {...menuIconMuted} />} onClick={() => setIsOpen(false)}>
          My Account
        </DropdownItem>
        <DropdownItem itemId="prefs" icon={<CogIcon {...menuIconMuted} />} onClick={() => setIsOpen(false)}>
          User Preferences
        </DropdownItem>
        <DropdownItem itemId="roles" icon={<UserCogIcon {...menuIconMuted} />} onClick={() => setIsOpen(false)}>
          Role Management
        </DropdownItem>
      </DropdownGroup>
      <Divider component="li" />
      {impersonatedUser ? (
        <DropdownItem
          itemId="stop-impersonate"
          icon={<MinusCircleIcon className="size-[16px] text-[#d4183d]" aria-hidden />}
          isDanger
          onClick={() => {
            onStopImpersonation();
            setIsOpen(false);
          }}
        >
          Stop Impersonation
        </DropdownItem>
      ) : (
        <DropdownItem
          itemId="impersonate"
          icon={<UsersIcon className="size-[16px] text-[#0066cc] dark:text-[#4dabf7]" aria-hidden />}
          onClick={() => {
            onImpersonate();
            setIsOpen(false);
          }}
        >
          Impersonate User
        </DropdownItem>
      )}
      <Divider component="li" />
      <DropdownItem itemId="logout" icon={<SignOutAltIcon className="size-[16px] text-[#d4183d]" aria-hidden />} isDanger onClick={() => setIsOpen(false)}>
        Logout
      </DropdownItem>
    </Dropdown>
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

  return (
    <div className="relative">
      <Button
        variant="plain"
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={mastheadIconBtnClass}
        aria-label="Theme and display options"
        aria-expanded={isExpanded}
        data-name="ThemeToggle"
      >
        {isDark ? (
          <SunIcon className="size-4 text-[#1F1F1F] dark:text-white" aria-hidden />
        ) : (
          <MoonIcon className="size-4 text-[#1F1F1F]" aria-hidden />
        )}
      </Button>

      {/* Theme Options Menu */}
      {isExpanded && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsExpanded(false)} aria-hidden />
          <div className="absolute right-0 top-[48px] z-40 w-[220px] app-glass-panel overflow-hidden">
            <div className="border-b border-[rgba(0,0,0,0.08)] px-4 py-3 dark:border-[rgba(255,255,255,0.08)]">
              <p className="mb-2 text-[11px] font-semibold uppercase text-[#4d4d4d] dark:text-[#b0b0b0]">Theme Mode</p>
              <Button
                variant="plain"
                type="button"
                onClick={toggleTheme}
                className="!flex w-full items-center justify-between rounded-full px-3 py-2"
              >
                <span className="text-[13px] text-[#151515] dark:text-white">{isDark ? "Dark" : "Light"}</span>
                <span
                  className={`flex size-4 items-center justify-center rounded-full ${isDark ? "bg-[#4dabf7]" : "bg-[#f59f00]"}`}
                  aria-hidden
                >
                  {isDark ? (
                    <MoonIcon className="size-2.5 text-white" />
                  ) : (
                    <SunIcon className="size-2.5 text-white" />
                  )}
                </span>
              </Button>
            </div>
            <div className="px-4 py-3">
              <p className="mb-2 text-[11px] font-semibold uppercase text-[#4d4d4d] dark:text-[#b0b0b0]">Glass Effect</p>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] text-[#151515] dark:text-white">{isGlass ? "Enabled" : "Disabled"}</span>
                <Switch
                  id="layout-glass-effect"
                  isChecked={isGlass}
                  onChange={(_e, checked) => {
                    if (checked) {
                      document.documentElement.classList.remove("no-glass");
                    } else {
                      document.documentElement.classList.add("no-glass");
                    }
                    setIsGlass(checked);
                  }}
                  aria-label="Toggle glass effect"
                />
              </div>
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

  const shouldHighlight = Boolean(
    isActive ||
      subItems?.some(
        (item) => location.pathname === item.path || location.pathname.startsWith(item.path + "/")
      )
  );

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
            <NavMenuChevron expanded={isExpanded} emphasize={shouldHighlight} />
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
            <NavMenuChevron expanded={false} emphasize={shouldHighlight} />
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

  const navIconMuted = "size-4 shrink-0 text-[#707070] dark:text-[#b0b0b0]";
  const navIconActive = "size-4 shrink-0 text-[#151515] dark:text-white";

  const menuItems = [
    {
      path: "/",
      label: "Home",
      icon: (
        <HomeIcon
          className={location.pathname === "/" ? navIconActive : navIconMuted}
          aria-hidden
        />
      ),
    },
    {
      path: "/favorites",
      label: "Favorites",
      icon: (
        <StarIcon
          className={
            location.pathname === "/favorites" || location.pathname.startsWith("/favorites/")
              ? navIconActive
              : navIconMuted
          }
          aria-hidden
        />
      ),
    },
    {
      path: "/ecosystem",
      label: "Ecosystem",
      icon: <ProjectDiagramIcon className={navIconMuted} aria-hidden />,
      subItems: [
        { path: "/ecosystem/software-catalog", label: "Software Catalog" },
        { path: "/ecosystem/installed-operators", label: "Installed Operators" },
        { path: "/ecosystem/helm", label: "Helm" },
      ],
    },
    {
      path: "/workloads",
      label: "Workloads",
      icon: <CubesIcon className={navIconMuted} aria-hidden />,
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
      icon: <GlobeIcon className={navIconMuted} aria-hidden />,
    },
    {
      path: "/storage",
      label: "Storage",
      icon: <HddIcon className={navIconMuted} aria-hidden />,
    },
    {
      path: "/builds",
      label: "Builds",
      icon: <HammerIcon className={navIconMuted} aria-hidden />,
    },
    {
      path: "/observe",
      label: "Observe",
      icon: <ChartLineIcon className={navIconMuted} aria-hidden />,
    },
    {
      path: "/compute",
      label: "Compute",
      icon: <ServerIcon className={navIconMuted} aria-hidden />,
    },
    {
      path: "/user-management",
      label: "User Management",
      icon: <UsersIcon className={navIconMuted} aria-hidden />,
    },
    {
      path: "/administration",
      label: "Administration",
      icon: <CogIcon className={navIconMuted} aria-hidden />,
      subItems: [
        { path: "/administration/cluster-update", label: "Cluster Update" },
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
    <div
      className="bg-[var(--app-page-canvas)] no-glass:bg-[var(--app-page-canvas-no-glass)] overflow-clip relative size-full transition-colors"
      data-name="Home"
    >
      {/* Glass canvas: abstract gradients only (evokes console-style light/dark environments — not literal screenshots) */}
      <div className="absolute inset-0 no-glass:hidden pointer-events-none" aria-hidden>
        <div className="absolute inset-0 dark:hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#f8f9fb] via-[#eceef4] to-[#f3f1f8]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_85%_at_12%_8%,rgba(224,240,255,0.55),transparent_52%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_92%_96%,rgba(245,230,240,0.35),transparent_48%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(158deg,rgba(255,255,255,0.55)_0%,transparent_38%,transparent_62%,rgba(232,236,246,0.4)_100%)]" />
        </div>
        <div className="absolute inset-0 hidden dark:block">
          <div className="absolute inset-0 bg-gradient-to-br from-[#121018] via-[#181222] to-[#0c0a10]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_65%_at_8%_18%,rgba(76,29,149,0.28),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_88%_78%,rgba(30,64,175,0.22),transparent_52%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_48%_102%,rgba(55,48,163,0.18),transparent_50%)]" />
        </div>
      </div>

      {/* Masthead */}
      <div className="absolute left-0 right-0 top-0 z-20 h-[50px] bg-[var(--app-masthead-bg)] border-b border-[var(--app-masthead-border)] shadow-[0px_1px_4px_0px_rgba(41,41,41,0.15)] dark:shadow-[0px_1px_4px_0px_rgba(0,0,0,0.4)]" data-name="Masthead">
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
              <MastheadIconButton label="Help">
                <QuestionCircleIcon className="size-4 text-[#1F1F1F] dark:text-white" aria-hidden />
              </MastheadIconButton>
              <MastheadIconButton label="Notifications">
                <BellIcon className="size-4 text-[#1F1F1F] dark:text-white" aria-hidden />
              </MastheadIconButton>
              <MastheadIconButton label="Application launcher">
                <ThIcon className="size-4 text-[#1F1F1F] dark:text-white" aria-hidden />
              </MastheadIconButton>
            </div>
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsAIOpen(true)}
              className="!flex !h-[37px] !min-w-[40px] !shrink-0 !items-center !gap-1 !rounded-full !border !border-[#8c8c8c] !bg-white !px-2 hover:!bg-[rgba(0,0,0,0.03)] dark:!border-[rgba(255,255,255,0.2)] dark:!bg-[rgba(255,255,255,0.05)] dark:hover:!bg-[rgba(255,255,255,0.08)]"
              aria-label="Open OpenShift LightSpeed"
            >
              <RobotIcon className="size-4 text-[#1F1F1F] dark:text-white" aria-hidden />
              <span className="font-['Red_Hat_Text:Regular',sans-serif] text-[14px] text-[#151515] dark:text-white">10</span>
            </Button>
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
        <div className="absolute left-[292px] right-[16px] top-[66px] z-10 bg-gradient-to-r from-[#0066cc] to-[#004d99] dark:from-[#b9dafc] dark:to-[#92c5f9] rounded-[12px] shadow-lg">
          <div className="px-[20px] py-[12px] flex items-center justify-between">
            <div className="flex items-center gap-[12px]">
              <UsersIcon className="size-5 text-white dark:text-[#151515]" aria-hidden />
              <div>
                <p className="text-white dark:text-[#151515] font-['Red_Hat_Display:SemiBold',sans-serif] font-semibold text-[14px]">
                  Viewing as {impersonatedUser.name}
                </p>
                <p className="text-white/80 dark:text-[#4d4d4d] text-[12px]">
                  {impersonatedUser.role} • {impersonatedUser.department}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              type="button"
              onClick={handleStopImpersonation}
              className="!border-white/40 !bg-white/20 !text-white hover:!bg-white/30 dark:!text-[#151515] dark:!border-[#151515]/20 dark:!bg-[#151515]/10"
            >
              <X className="size-3.5" aria-hidden />
              Stop Impersonation
            </Button>
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
        <div className="absolute inset-0 app-glass-panel" />
        
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
                      <NavMenuChevron expanded={isFavoritesExpanded} emphasize={isFavoritesExpanded} />
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
        <div className="app-glass-panel h-full overflow-y-auto overflow-x-hidden">
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