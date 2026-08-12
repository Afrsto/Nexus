import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { router } from "@/router";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import ErrorBoundary from "@/components/common/ErrorBoundary";

const AUTH_HYDRATE_TIMEOUT_MS = 2000;

function markAuthHydrated() {
  useAuthStore.setState({ hasHydrated: true, isLoading: false });
}

export default function App() {
  const hydrate = useThemeStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const finish = () => markAuthHydrated();

    if (useAuthStore.persist.hasHydrated()) {
      finish();
    }

    const unsub = useAuthStore.persist.onFinishHydration(finish);
    const timer = setTimeout(finish, AUTH_HYDRATE_TIMEOUT_MS);

    return () => {
      unsub();
      clearTimeout(timer);
    };
  }, []);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            fontFamily: "var(--font-body)",
            fontSize: 14,
          },
          success: { iconTheme: { primary: "var(--teal)", secondary: "var(--bg-card)" } },
          error: { iconTheme: { primary: "var(--red)", secondary: "var(--bg-card)" } },
        }}
      />
    </ErrorBoundary>
  );
}
