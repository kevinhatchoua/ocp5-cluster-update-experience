import { Link, Outlet, useLocation } from "react-router";
import { forwardRef, useState, useEffect, type ComponentType } from "react";
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
  MastheadMain,
  MastheadToggle,
  MenuToggle,
  Nav,
  NavExpandable,
  NavItem,
  NavList,
  Page,
  PageSidebar,
  PageSidebarBody,
  PageToggleButton,
  SkipToContent,
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

function MastheadIconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Button variant="plain" type="button" aria-label={label} data-name={label}>
      {children}
    </Button>
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
 * NavExpandable wraps non-string titles in a single .pf-v6-c-nav__link-text node.
 * Mirror NavItem’s icon + text structure inside that wrapper so icons align like the
 * “With item icons” example: https://staging.patternfly.org/components/navigation#with-item-icons
 */
function navExpandableTitleWithIcon(Icon: IconComponent, label: string) {
  return (
    <Flex
      display={{ default: "inlineFlex" }}
      alignItems={{ default: "alignItemsCenter" }}
      style={{
        minWidth: "var(--pf-t--global--spacer--0, 0px)",
        columnGap: "var(--pf-v6-c-nav__link--ColumnGap)",
      }}
    >
      <span className={css(navStyles.navLinkIcon)}>
        <Icon aria-hidden />
      </span>
      <span className={css(navStyles.navLinkText)}>{label}</span>
    </Flex>
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
    <NavExpandable
      groupId={groupId}
      title={navExpandableTitleWithIcon(Icon, label)}
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
    </NavExpandable>
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
    <Masthead data-name="Masthead">
      <MastheadMain>
        <MastheadToggle>
          <PageToggleButton id="layout-nav-toggle" aria-label="Global navigation" isHamburgerButton />
        </MastheadToggle>
        <Toolbar id="layout-masthead-toolbar" ouiaId="layout-masthead-toolbar" isFullHeight>
          <ToolbarContent>
            <ToolbarItem>
              <MastheadBrand data-name="Red Hat OpenShift logo masthead">
                <NavItemLink
                  to="/"
                  style={{
                    color: "var(--pf-t--global--text--Color--100)",
                    textDecoration: "none",
                  }}
                >
                  <Content
                    component="span"
                    style={{
                      fontSize: "var(--pf-t--global--FontSize--md)",
                      fontWeight: "var(--pf-t--global--font--weight--body--bold)",
                    }}
                  >
                    OpenShift
                  </Content>
                </NavItemLink>
              </MastheadBrand>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      </MastheadMain>
      <MastheadContent>
        <Toolbar id="layout-masthead-toolbar-end" ouiaId="layout-masthead-toolbar-end" isFullHeight>
          <ToolbarContent>
            <ToolbarGroup gap={{ default: "gapSm" }} align={{ default: "alignEnd" }}>
              <ToolbarItem>
                <MastheadIconButton label="Help">
                  <QuestionCircleIcon aria-hidden />
                </MastheadIconButton>
              </ToolbarItem>
              <ToolbarItem>
                <MastheadIconButton label="Notifications">
                  <BellIcon aria-hidden />
                </MastheadIconButton>
              </ToolbarItem>
              <ToolbarItem>
                <MastheadIconButton label="Application launcher">
                  <ThIcon aria-hidden />
                </MastheadIconButton>
              </ToolbarItem>
              <ToolbarItem>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setIsAIOpen(true)}
                  aria-label="Open OpenShift LightSpeed"
                  style={{
                    color: "var(--pf-t--global--palette--blue--50)",
                  }}
                >
                  <Flex gap={{ default: "gapSm" }} alignItems={{ default: "alignItemsCenter" }} display={{ default: "inlineFlex" }}>
                    <RobotIcon aria-hidden />
                    <span>10</span>
                  </Flex>
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

            <NavExpandable
              groupId="layout-favorites"
              title={navExpandableTitleWithIcon(
                StarIcon,
                `Favorites${favorites.length > 0 ? ` (${favorites.length})` : ""}`
              )}
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
            </NavExpandable>

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
