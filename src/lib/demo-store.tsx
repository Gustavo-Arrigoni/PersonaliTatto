"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Check, X } from "lucide-react";
import { createDemoState } from "./demo-data";
import type { DemoState, Role } from "./types";

const STORAGE_KEY = "personalitatto:demo:v1";
interface DemoContextValue {
  state: DemoState;
  ready: boolean;
  update: (updater: (state: DemoState) => DemoState) => void;
  notify: (message: string) => void;
  login: (role: Role) => void;
  logout: () => void;
  reset: () => void;
}
const DemoContext = createContext<DemoContextValue | null>(null);

function restoreState(value: string | null): DemoState | null {
  if (!value) return null;
  try {
    const data: unknown = JSON.parse(value);
    if (!data || typeof data !== "object") return null;
    const state = data as Partial<DemoState>;
    if (
      state.version !== 1 ||
      !Array.isArray(state.studios) ||
      !Array.isArray(state.members) ||
      !Array.isArray(state.arts) ||
      !Array.isArray(state.projects) ||
      !Array.isArray(state.quotes) ||
      !Array.isArray(state.profiles)
    )
      return null;
    // A saved session must refer to an existing local demo profile.
    return {
      ...state,
      session: state.session
        ? (state.profiles.find((profile) => profile.id === state.session?.id) ??
          null)
        : null,
    } as DemoState;
  } catch {
    return null;
  }
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(createDemoState);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storageFailed = useRef(false);
  const notify = useCallback((text: string) => {
    setMessage(text);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setMessage(""), 4500);
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const saved = restoreState(window.localStorage.getItem(STORAGE_KEY));
        if (saved) setState(saved);
      } catch {
        storageFailed.current = true;
        notify(
          "Armazenamento local indisponível. Os dados ficarão apenas nesta sessão.",
        );
      }
      setReady(true);
    });
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY)
        setState(restoreState(event.newValue) ?? createDemoState());
    };
    window.addEventListener("storage", sync);
    return () => {
      active = false;
      window.removeEventListener("storage", sync);
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [notify]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      if (!storageFailed.current) {
        storageFailed.current = true;
        queueMicrotask(() =>
          notify(
            "Armazenamento cheio ou indisponível. As alterações ficam apenas nesta sessão.",
          ),
        );
      }
    }
  }, [state, ready, notify]);

  const update = useCallback(
    (updater: (state: DemoState) => DemoState) => setState(updater),
    [],
  );
  const login = useCallback(
    (role: Role) => {
      const profileId =
        role === "client"
          ? "client-demo"
          : role === "studio"
            ? "studio-demo"
            : "admin-demo";
      setState((current) => ({
        ...current,
        session:
          current.profiles.find((profile) => profile.id === profileId) ?? null,
      }));
      notify("Perfil de demonstração ativado neste navegador.");
    },
    [notify],
  );
  const logout = useCallback(() => {
    setState((current) => ({ ...current, session: null }));
    notify("Você saiu do perfil local.");
  }, [notify]);
  const reset = useCallback(() => {
    try {
      window.sessionStorage.removeItem("personalitatto:preview-draft");
    } catch {
      /* Optional preview state. */
    }
    setState(createDemoState());
    notify("Demonstração restaurada. Todos os dados locais foram redefinidos.");
  }, [notify]);

  return (
    <DemoContext.Provider
      value={{ state, ready, update, notify, login, logout, reset }}
    >
      <span hidden data-demo-ready={ready ? "true" : "false"} />
      {children}
      {message && (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            padding: "15px 18px",
            maxWidth: "calc(100vw - 32px)",
            width: "max-content",
            background: "#1b2b35",
            color: "#ebf1f4",
            border: "1px solid #466274",
            borderRadius: 12,
            boxShadow: "0 12px 48px #0008",
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 13,
          }}
        >
          <Check size={17} aria-hidden="true" />
          <span>{message}</span>
          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Fechar notificação"
            style={{
              background: "none",
              border: 0,
              color: "inherit",
              cursor: "pointer",
              padding: 2,
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </DemoContext.Provider>
  );
}

export function useDemo(): DemoContextValue {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo must be used within DemoProvider");
  return context;
}
