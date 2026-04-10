import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ClusterUpdateDemoVariant } from "../components/AiAssessmentSection";

export const CLUSTER_UPDATE_DEMO_VARIANT_KEY = "ocp5-cluster-update-demo-variant";

function readVariant(): ClusterUpdateDemoVariant {
  try {
    const raw = localStorage.getItem(CLUSTER_UPDATE_DEMO_VARIANT_KEY);
    /** Explicit opt-in keeps the Manual + Agent storyline; default is agent-first (matches current prototype). */
    if (raw === "manual-and-agent") return "manual-and-agent";
    if (raw === "agent-only") return "agent-only";
  } catch {
    /* ignore */
  }
  return "agent-only";
}

type ClusterUpdateDemoContextValue = {
  demoVariant: ClusterUpdateDemoVariant;
  setDemoVariant: (v: ClusterUpdateDemoVariant) => void;
};

const ClusterUpdateDemoContext = createContext<ClusterUpdateDemoContextValue | null>(null);

export function ClusterUpdateDemoProvider({ children }: { children: ReactNode }) {
  const [demoVariant, setDemoVariantState] = useState<ClusterUpdateDemoVariant>(() => readVariant());

  const setDemoVariant = useCallback((v: ClusterUpdateDemoVariant) => {
    setDemoVariantState(v);
    try {
      localStorage.setItem(CLUSTER_UPDATE_DEMO_VARIANT_KEY, v === "agent-only" ? "agent-only" : "manual-and-agent");
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ demoVariant, setDemoVariant }), [demoVariant, setDemoVariant]);

  return <ClusterUpdateDemoContext.Provider value={value}>{children}</ClusterUpdateDemoContext.Provider>;
}

export function useClusterUpdateDemoVariant(): ClusterUpdateDemoContextValue {
  const ctx = useContext(ClusterUpdateDemoContext);
  if (!ctx) {
    throw new Error("useClusterUpdateDemoVariant must be used within ClusterUpdateDemoProvider");
  }
  return ctx;
}
