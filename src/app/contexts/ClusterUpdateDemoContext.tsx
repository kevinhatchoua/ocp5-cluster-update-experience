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
    if (localStorage.getItem(CLUSTER_UPDATE_DEMO_VARIANT_KEY) === "agent-only") return "agent-only";
  } catch {
    /* ignore */
  }
  return "manual-and-agent";
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
