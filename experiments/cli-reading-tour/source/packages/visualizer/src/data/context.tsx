import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { loadCodeMap, type LoadOutcome } from "./loader.js";
import type { CodeMap } from "../types.js";

interface CodeMapState {
  data: CodeMap | null;
  loading: boolean;
  error: string | null;
}

const CodeMapContext = createContext<CodeMapState>({
  data: null,
  loading: true,
  error: null,
});

export function CodeMapProvider({
  children,
  url = "/codemap.json",
}: {
  children: ReactNode;
  url?: string;
}) {
  const [state, setState] = useState<CodeMapState>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    loadCodeMap(url).then((outcome: LoadOutcome) => {
      if (cancelled) return;
      if (outcome.ok) {
        setState({ data: outcome.data, loading: false, error: null });
      } else {
        setState({ data: null, loading: false, error: outcome.error });
      }
    });

    return () => { cancelled = true; };
  }, [url]);

  return (
    <CodeMapContext.Provider value={state}>
      {children}
    </CodeMapContext.Provider>
  );
}

export function useCodeMap(): CodeMapState {
  return useContext(CodeMapContext);
}
