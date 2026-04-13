import { Link, Outlet, useLocation } from "react-router";
import {
  forwardRef,
  useContext,
  useEffect,
  useId,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  applyThemeToDocument,
  readThemePreferences,
  writeThemePreferences,
} from "@/lib/documentTheme";
import {
  Banner,
  Button,
  Content,
  Dropdown,
  DropdownGroup,
  DropdownItem,
  Divider,
  Flex,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadLogo,
  MastheadMain,
  MastheadToggle,
  MenuToggle,
  Nav,
  NavContext,
  NavItem,
  NavList,
  Page,
  PageSidebar,
  PageSidebarBody,
  PageSidebarContext,
  PageToggleButton,
  SkipToContent,
  Switch,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from "@patternfly/react-core";
import { css } from "@patternfly/react-styles";
import navStyles from "@patternfly/react-styles/css/components/Nav/nav.mjs";
import displayStyles from "@patternfly/react-styles/css/utilities/Display/display.mjs";
import flexStyles from "@patternfly/react-styles/css/utilities/Flex/flex.mjs";
import sizingStyles from "@patternfly/react-styles/css/utilities/Sizing/sizing.mjs";
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
import RhMicronsCaretDownIcon from "@patternfly/react-icons/dist/esm/icons/rh-microns-caret-down-icon";
import ImpersonateUserModal from "./ImpersonateUserModal";
import { usePermissions } from "../contexts/PermissionsContext";
import { useChat } from "../contexts/ChatContext";
import { useFavorites } from "../contexts/FavoritesContext";
import { useClusterUpdateDemoVariant } from "../contexts/ClusterUpdateDemoContext";

interface ImpersonatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

/**
 * PatternFly NavItem renders the custom component with `href` set from its `to` prop.
 * React Router’s Link expects `to`, not `href`, so plain `component={Link}` never navigates.
 */
const NavItemLink = forwardRef<HTMLAnchorElement, React.ComponentProps<typeof Link> & { href?: string }>(
  function NavItemLink({ href, to, ...rest }, ref) {
    const destination = to ?? href;
    return destination != null ? <Link ref={ref} to={destination} {...rest} /> : null;
  }
);

function MastheadIconButton({ label, icon }: { label: string; icon: React.ReactNode }) {
  return <Button variant="plain" type="button" aria-label={label} data-name={label} icon={icon} />;
}

/** Cluster Update prototype: Manual + Agent (5.1) vs Agent only (5.0). Persists via {@link ClusterUpdateDemoContext}. */
function ClusterUpdateDemoMastheadSwitch() {
  const { demoVariant, setDemoVariant } = useClusterUpdateDemoVariant();
  const isManualAndAgent = demoVariant === "manual-and-agent";
  return (
    <Switch
      id="cluster-update-demo-experience-switch"
      isChecked={isManualAndAgent}
      onChange={(_e, checked) => setDemoVariant(checked ? "manual-and-agent" : "agent-only")}
      label={
        isManualAndAgent ? (
          <>
            Manual + Agent <Content component="small">· OCP 5.1</Content>
          </>
        ) : (
          <>
            Agent only <Content component="small">· OCP 5.0</Content>
          </>
        )
      }
      aria-label={
        isManualAndAgent
          ? "Cluster update demo: Manual and agent mode, OpenShift 5.1"
          : "Cluster update demo: Agent only mode, OpenShift 5.0"
      }
    />
  );
}

type IconComponent = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;

interface MenuConfigItem {
  path: string;
  label: string;
  icon: IconComponent;
  subItems?: { path: string; label: string }[];
}

function subPathMatches(pathname: string, basePath: string): boolean {
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

function subRoutesActive(pathname: string, subItems: { path: string }[]) {
  return subItems.some((s) => subPathMatches(pathname, s.path));
}

/** Among sibling sub-routes under one expandable, only the longest matching path is current (avoids double-active prefixes). */
function activeSubPath(pathname: string, subItems: { path: string }[]): string | null {
  const matches = subItems.filter((s) => subPathMatches(pathname, s.path));
  if (matches.length === 0) return null;
  return matches.reduce((a, b) => (b.path.length > a.path.length ? b : a)).path;
}

/**
 * PatternFly `NavExpandable` wraps non-string titles in a single link-text node, so icon
 * + label cannot match `NavItem` markup (icon span, text span, toggle as siblings). This
 * component mirrors the intended expandable button DOM for the sidebar.
 */
function AppNavExpandable({
  groupId,
  title,
  icon,
  isActive = false,
  isExpanded = false,
  onExpand,
  children,
  className,
  id: idProp,
  ...props
}: Omit<React.ComponentProps<"li">, "title"> & {
  groupId: string | number;
  title: string;
  icon: ReactNode;
  isActive?: boolean;
  isExpanded?: boolean;
  onExpand?: (event: React.MouseEvent<HTMLButtonElement>, nextExpanded: boolean) => void;
  id?: string;
}) {
  const generatedId = useId();
  const navId = idProp ?? generatedId;
  const { onToggle } = useContext(NavContext);
  const { isSidebarOpen = true } = useContext(PageSidebarContext);
  const [expandedState, setExpandedState] = useState(isExpanded);

  useEffect(() => {
    setExpandedState(isExpanded);
  }, [isExpanded]);

  const handleExpand = (event: React.MouseEvent<HTMLButtonElement>) => {
    const next = !expandedState;
    if (onExpand) {
      onExpand(event, next);
    } else {
      setExpandedState(next);
      onToggle?.(event, groupId, next);
    }
  };

  return (
    <li
      className={css(
        navStyles.navItem,
        expandedState && navStyles.modifiers.expanded,
        isActive && navStyles.modifiers.current,
        className
      )}
      {...props}
    >
      <button
        type="button"
        className={css(navStyles.navLink)}
        id={navId}
        onClick={handleExpand}
        aria-expanded={expandedState}
        tabIndex={isSidebarOpen ? undefined : -1}
      >
        <span className={css(navStyles.navLinkIcon)}>{icon}</span>
        <span className={css(navStyles.navLinkText)}>{title}</span>
        <span className={css(navStyles.navToggle)}>
          <span className={css(navStyles.navToggleIcon)}>
            <RhMicronsCaretDownIcon />
          </span>
        </span>
      </button>
      <section
        className={css(navStyles.navSubnav)}
        aria-labelledby={navId}
        hidden={expandedState ? undefined : true}
        {...(!expandedState && { inert: "" })}
      >
        <ul className={css(navStyles.navList)} role="list">
          {children}
        </ul>
      </section>
    </li>
  );
}

function ExpandableNavRouteGroup({
  groupId,
  label,
  icon: Icon,
  pathname,
  subItems,
}: {
  groupId: string;
  label: string;
  icon: IconComponent;
  pathname: string;
  subItems: { path: string; label: string }[];
}) {
  const groupHasActiveChild = subRoutesActive(pathname, subItems);
  const currentSubPath = activeSubPath(pathname, subItems);
  const [expanded, setExpanded] = useState(groupHasActiveChild);

  useEffect(() => {
    if (groupHasActiveChild) setExpanded(true);
  }, [groupHasActiveChild]);

  return (
    <AppNavExpandable
      groupId={groupId}
      title={label}
      icon={<Icon aria-hidden />}
      isActive={false}
      isExpanded={expanded}
      onExpand={(_e, next) => setExpanded(next)}
    >
      {subItems.map((sub) => (
        <NavItem
          key={sub.path}
          itemId={sub.path}
          isActive={currentSubPath === sub.path}
          to={sub.path}
          component={NavItemLink}
        >
          {sub.label}
        </NavItem>
      ))}
    </AppNavExpandable>
  );
}

function AvatarMd({
  impersonatedUser,
  onImpersonate,
  onStopImpersonation,
}: {
  impersonatedUser: ImpersonatedUser | null;
  onImpersonate: () => void;
  onStopImpersonation: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const displayName = impersonatedUser ? impersonatedUser.name : "John Smith";
  const displayEmail = impersonatedUser ? impersonatedUser.email : "john.smith@redhat.com";
  const displayInitials = impersonatedUser
    ? impersonatedUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "JS";

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      popperProps={{ direction: "down", position: "end" }}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          variant="plain"
          data-name="avatar-MD"
          aria-label="User menu"
          onClick={() => setIsOpen((o) => !o)}
          isExpanded={isOpen}
        >
          {displayInitials}
        </MenuToggle>
      )}
      onSelect={() => setIsOpen(false)}
    >
      <DropdownGroup
        label={
          <Flex direction={{ default: "column" }} gap={{ default: "gapXs" }}>
            <Content component="p">{displayName}</Content>
            <Content component="small">{displayEmail}</Content>
            {impersonatedUser ? (
              <Content component="small">
                {impersonatedUser.role} • {impersonatedUser.department}
              </Content>
            ) : null}
          </Flex>
        }
      >
        <DropdownItem itemId="account" icon={<UserIcon aria-hidden />} onClick={() => setIsOpen(false)}>
          My Account
        </DropdownItem>
        <DropdownItem itemId="prefs" icon={<CogIcon aria-hidden />} onClick={() => setIsOpen(false)}>
          User Preferences
        </DropdownItem>
        <DropdownItem itemId="roles" icon={<UserCogIcon aria-hidden />} onClick={() => setIsOpen(false)}>
          Role Management
        </DropdownItem>
      </DropdownGroup>
      <Divider component="li" />
      {impersonatedUser ? (
        <DropdownItem
          itemId="stop-impersonate"
          icon={<MinusCircleIcon aria-hidden />}
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
          icon={<UsersIcon aria-hidden />}
          onClick={() => {
            onImpersonate();
            setIsOpen(false);
          }}
        >
          Impersonate User
        </DropdownItem>
      )}
      <Divider component="li" />
      <DropdownItem itemId="logout" icon={<SignOutAltIcon aria-hidden />} isDanger onClick={() => setIsOpen(false)}>
        Logout
      </DropdownItem>
    </Dropdown>
  );
}

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => readThemePreferences().dark);
  const [isGlass, setIsGlass] = useState(() => readThemePreferences().glass);
  const [isOpen, setIsOpen] = useState(false);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    const next = { dark: newIsDark, glass: isGlass };
    applyThemeToDocument(next);
    writeThemePreferences(next);
  };

  const setGlass = (glass: boolean) => {
    setIsGlass(glass);
    const next = { dark: isDark, glass };
    applyThemeToDocument(next);
    writeThemePreferences(next);
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      popperProps={{ position: "end", enableFlip: true }}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          variant="plain"
          onClick={() => setIsOpen((o) => !o)}
          isExpanded={isOpen}
          aria-label="Theme and display options"
          data-name="ThemeToggle"
        >
          {isDark ? <SunIcon aria-hidden /> : <MoonIcon aria-hidden />}
        </MenuToggle>
      )}
      onSelect={() => setIsOpen(false)}
    >
      <DropdownGroup label="Theme mode">
        <DropdownItem itemId="toggle-theme" onClick={() => toggleTheme()}>
          {isDark ? "Switch to light theme" : "Switch to dark theme"}
        </DropdownItem>
      </DropdownGroup>
      <Divider component="li" />
      <DropdownGroup label="Glass effect">
        {isGlass ? (
          <DropdownItem itemId="glass-off" onClick={() => setGlass(false)}>
            Disable glass effect
          </DropdownItem>
        ) : (
          <DropdownItem itemId="glass-on" onClick={() => setGlass(true)}>
            Enable glass effect
          </DropdownItem>
        )}
      </DropdownGroup>
    </Dropdown>
  );
}

export default function Layout() {
  const [isImpersonateModalOpen, setIsImpersonateModalOpen] = useState(false);
  const [isFavoritesExpanded, setIsFavoritesExpanded] = useState(false);
  const location = useLocation();

  const { impersonatedUser, setImpersonatedUser } = usePermissions();

  const { isOpen: isAIOpen, setIsOpen: setIsAIOpen } = useChat();

  const { favorites } = useFavorites();

  const handleImpersonate = (user: {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
  }) => {
    setImpersonatedUser(user);
  };

  const handleStopImpersonation = () => {
    setImpersonatedUser(null);
  };

  const menuConfig: MenuConfigItem[] = [
    { path: "/", label: "Home", icon: HomeIcon },
    { path: "/favorites", label: "Favorites", icon: StarIcon },
    {
      path: "/ecosystem",
      label: "Ecosystem",
      icon: ProjectDiagramIcon,
      subItems: [
        { path: "/ecosystem/software-catalog", label: "Software Catalog" },
        { path: "/ecosystem/installed-operators", label: "Installed Operators" },
        { path: "/ecosystem/helm", label: "Helm" },
      ],
    },
    {
      path: "/workloads",
      label: "Workloads",
      icon: CubesIcon,
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
    { path: "/networking", label: "Networking", icon: GlobeIcon },
    { path: "/storage", label: "Storage", icon: HddIcon },
    { path: "/builds", label: "Builds", icon: HammerIcon },
    { path: "/observe", label: "Observe", icon: ChartLineIcon },
    { path: "/compute", label: "Compute", icon: ServerIcon },
    { path: "/user-management", label: "User Management", icon: UsersIcon },
    {
      path: "/administration",
      label: "Administration",
      icon: CogIcon,
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

  const favoritesPathActive =
    location.pathname === "/favorites" || location.pathname.startsWith("/favorites/");
  const favoriteRouteActive = favorites.some(
    (f) => location.pathname === f.path || location.pathname.startsWith(`${f.path}/`)
  );
  const favoritesGroupActive = favoritesPathActive || favoriteRouteActive;
  const activeFavoritePath = activeSubPath(
    location.pathname,
    favorites.map((f) => ({ path: f.path }))
  );

  useEffect(() => {
    if (favoritesGroupActive) setIsFavoritesExpanded(true);
  }, [favoritesGroupActive]);

  const masthead = (
    <Masthead display={{ default: "inline" }}>
      <MastheadMain>
        <MastheadToggle>
          <PageToggleButton id="layout-nav-toggle" aria-label="Global navigation" isHamburgerButton />
        </MastheadToggle>
        <MastheadBrand>
          <MastheadLogo component={NavItemLink} href="/">
            OpenShift
          </MastheadLogo>
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent>
        <Toolbar id="layout-masthead-toolbar-end" ouiaId="layout-masthead-toolbar-end" isFullHeight>
          <ToolbarContent alignItems="center">
            <ToolbarGroup gap={{ default: "gapSm" }} align={{ default: "alignEnd" }} alignItems="center">
              <ToolbarItem>
                <ClusterUpdateDemoMastheadSwitch />
              </ToolbarItem>
              <ToolbarItem>
                <MastheadIconButton label="Help" icon={<QuestionCircleIcon aria-hidden />} />
              </ToolbarItem>
              <ToolbarItem>
                <MastheadIconButton label="Notifications" icon={<BellIcon aria-hidden />} />
              </ToolbarItem>
              <ToolbarItem>
                <MastheadIconButton label="Application launcher" icon={<ThIcon aria-hidden />} />
              </ToolbarItem>
              <ToolbarItem>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setIsAIOpen(true)}
                  aria-label="Open OpenShift LightSpeed"
                  icon={<RobotIcon aria-hidden />}
                  iconPosition="start"
                >
                  10
                </Button>
              </ToolbarItem>
              <ToolbarItem>
                <ThemeToggle />
              </ToolbarItem>
              <ToolbarItem>
                <AvatarMd
                  impersonatedUser={impersonatedUser}
                  onImpersonate={() => setIsImpersonateModalOpen(true)}
                  onStopImpersonation={handleStopImpersonation}
                />
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      </MastheadContent>
    </Masthead>
  );

  const sidebar = (
    <PageSidebar id="layout-sidebar" data-name="Sidebar">
      <PageSidebarBody>
        <Nav aria-label="Global">
          <NavList>
            <NavItem
              itemId="layout-nav-home"
              isActive={location.pathname === "/"}
              to="/"
              component={NavItemLink}
              icon={<HomeIcon aria-hidden />}
            >
              Home
            </NavItem>

            <AppNavExpandable
              groupId="layout-favorites"
              title={`Favorites${favorites.length > 0 ? ` (${favorites.length})` : ""}`}
              icon={<StarIcon aria-hidden />}
              isActive={false}
              isExpanded={isFavoritesExpanded}
              onExpand={(_e, next) => setIsFavoritesExpanded(next)}
            >
              {favorites.length === 0 ? (
                <NavItem itemId="layout-favorites-empty" preventDefault to="#" onClick={(e) => e.preventDefault()}>
                  No favorites yet. Star a page to add it here.
                </NavItem>
              ) : (
                favorites.map((fav) => (
                  <NavItem
                    key={fav.id}
                    itemId={fav.id}
                    isActive={activeFavoritePath === fav.path}
                    to={fav.path}
                    component={NavItemLink}
                  >
                    {fav.name}
                  </NavItem>
                ))
              )}
            </AppNavExpandable>

            {menuConfig.slice(2).map((item) => {
              if (item.subItems) {
                return (
                  <ExpandableNavRouteGroup
                    key={item.path}
                    groupId={`layout-nav-${item.path.replace(/\//g, "-")}`}
                    label={item.label}
                    icon={item.icon}
                    pathname={location.pathname}
                    subItems={item.subItems}
                  />
                );
              }
              const ItemIcon = item.icon;
              const itemActive =
                location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
              return (
                <NavItem
                  key={item.path}
                  itemId={item.path}
                  isActive={itemActive}
                  to={item.path}
                  component={NavItemLink}
                  icon={<ItemIcon aria-hidden />}
                >
                  {item.label}
                </NavItem>
              );
            })}
          </NavList>
        </Nav>
      </PageSidebarBody>
    </PageSidebar>
  );

  const impersonationBanner =
    impersonatedUser !== null ? (
      <Banner status="info" aria-label="Impersonation active">
        <Flex
          justifyContent={{ default: "justifyContentSpaceBetween" }}
          alignItems={{ default: "alignItemsCenter" }}
          flexWrap={{ default: "wrap" }}
          gap={{ default: "gapMd" }}
        >
          <Flex gap={{ default: "gapMd" }} alignItems={{ default: "alignItemsCenter" }}>
            <UsersIcon aria-hidden />
            <Flex direction={{ default: "column" }} gap={{ default: "gapXs" }}>
              <Content component="p">Viewing as {impersonatedUser.name}</Content>
              <Content component="small">
                {impersonatedUser.role} • {impersonatedUser.department}
              </Content>
            </Flex>
          </Flex>
          <Button variant="link" onClick={handleStopImpersonation}>
            Stop impersonation
          </Button>
        </Flex>
      </Banner>
    ) : undefined;

  return (
    <>
      <div
        className={css(
          sizingStyles.h_100,
          displayStyles.displayFlex,
          flexStyles.flexDirectionColumn,
          flexStyles.flexShrink_1
        )}
        style={{ minHeight: "var(--pf-t--global--spacer--0, 0px)" }}
      >
        <div
          className={css(
            flexStyles.flex_1,
            displayStyles.displayFlex,
            flexStyles.flexDirectionColumn,
            flexStyles.flexShrink_1
          )}
          style={{ minHeight: "var(--pf-t--global--spacer--0, 0px)" }}
        >
          <Page
            className={css(sizingStyles.h_100)}
            isManagedSidebar
            isContentFilled
            masthead={masthead}
            sidebar={sidebar}
            skipToContent={<SkipToContent href="#app-main-container">Skip to content</SkipToContent>}
            mainContainerId="app-main-container"
            mainAriaLabel="OpenShift console"
            banner={impersonationBanner}
          >
            <div
              className={css(
                sizingStyles.h_100,
                displayStyles.displayFlex,
                flexStyles.flexDirectionColumn,
                flexStyles.flexShrink_1,
                flexStyles.flex_1
              )}
              style={
                isAIOpen
                  ? {
                      paddingInlineEnd: "var(--pf-v6-c-drawer__panel--m-width, 26.25rem)",
                      transition:
                        "padding-inline-end var(--pf-t--global--transition--Duration, 0.3s) var(--pf-t--global--transition--TimingFunction, ease-in-out)",
                    }
                  : {
                      transition:
                        "padding-inline-end var(--pf-t--global--transition--Duration, 0.3s) var(--pf-t--global--transition--TimingFunction, ease-in-out)",
                    }
              }
            >
              <Outlet />
            </div>
          </Page>
        </div>
      </div>

      <ImpersonateUserModal
        isOpen={isImpersonateModalOpen}
        onClose={() => setIsImpersonateModalOpen(false)}
        onImpersonate={handleImpersonate}
      />
    </>
  );
}
