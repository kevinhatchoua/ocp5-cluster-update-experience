# OCP Cluster Update UX Prototype

Interactive React/TypeScript prototype for exploring OpenShift Container Platform 5.x cluster update workflows. Built with Vite, Tailwind CSS v4, and React Router v7.

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** 9+

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173/administration/cluster-update](http://localhost:5173/administration/cluster-update) to view the Cluster Update page.

### Build for Production

```bash
npm run build
npm run preview
```

## Key Flows

### Cluster Update Plan (`/administration/cluster-update`)

The main entry point. Three tabs:

- **Update Plan** — Choose between manual and agent-based update modes, view cluster details, select a channel, browse available versions, run pre-checks, and initiate updates.
- **Cluster Operators** — View installed operators, their OCP version compatibility, and bulk-update operators required before a cluster upgrade.
- **Update History** — Review past update results with status, timing, and duration.

### Version Detail (`/administration/cluster-update/version/:version`)

Drill into a specific version to see risk assessment, release highlights (features, security fixes, bug fixes), and errata advisories.

### Pre-flight Checks (`/administration/cluster-update/preflight`)

Automated pre-flight validation covering CVO health, API server availability, etcd cluster health, node readiness, PDB validation, PVC binding, and network policy compatibility.

### Update In-Progress (`/administration/cluster-update/in-progress`)

Live progress view showing control plane and worker node update status with real-time progress bars.

### Update Complete / Failed

Post-update summary screens showing duration, node counts, and next steps.

### Agent-Based Updates

When "Agent-based updates" is selected, a dedicated panel provides:
- **Agent Configuration** — Update schedule, max unavailable nodes, automatic rollback toggle
- **Agent Status** — Monitoring dashboard with agent state, next scheduled check, target version, and rollback policy
- **Lightspeed Integration** — Ask AI for configuration and monitoring guidance

### OpenShift Lightspeed (OLS) Integration

AI chatbot drawer accessible from multiple touchpoints:
- "AI recommendations" button in Available Updates section
- "Ask Lightspeed" buttons in Agent Mode panels
- Contextual responses based on where the chatbot was invoked

### Pre-Check Modal

Inline pre-flight check simulation with pass/fail states for:
- Cluster health, Operator compatibility, API deprecation
- Storage availability, Certificate validity, Node readiness

## Ecosystem Pages

The prototype also includes operator lifecycle management flows:

- **Software Catalog** (`/ecosystem/software-catalog`) — Browse and install operators
- **Installed Operators** (`/ecosystem/installed-operators`) — Manage installed operator subscriptions
- **Operator Update** — Approve or preview operator updates with dependency analysis

## Project Structure

```
src/
  app/
    components/       # Shared components (Layout, Breadcrumbs, LightSpeedPanel)
    pages/
      administration/ # Cluster update, settings, and admin pages
      ecosystem/      # Operator catalog and lifecycle pages
      workloads/      # Pods, deployments, topology views
      compute/        # Node detail pages
    routes.ts         # React Router configuration
  styles/             # Tailwind CSS, theme, and font definitions
public/
  assets/             # Static image assets
```

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** with `@vitejs/plugin-react` and `@tailwindcss/vite`
- **Tailwind CSS v4** for utility-first styling
- **React Router v7** for client-side routing
- **Lucide React** for iconography
- **Red Hat Display / Red Hat Text / Red Hat Mono** fonts

## External Links

All external links point to current OpenShift Container Platform documentation:

- [Release Notes](https://docs.openshift.com/container-platform/latest/release_notes/ocp-4-18-release-notes.html)
- [Understanding Update Channels](https://docs.openshift.com/container-platform/latest/updating/understanding_updates/understanding-update-channels-releases.html)
- [Introduction to Updates](https://docs.openshift.com/container-platform/latest/updating/understanding_updates/intro-to-updates.html)
- [Upgrading Operators](https://docs.openshift.com/container-platform/latest/operators/admin/olm-upgrading-operators.html)
- [Red Hat Console](https://console.redhat.com/openshift)
