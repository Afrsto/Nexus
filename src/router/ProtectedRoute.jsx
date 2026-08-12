import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { ROUTES } from "@/constants/routes";
import LoadingScreen from "@/components/common/LoadingScreen";

export function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const validateSession = useAuthStore((s) => s.validateSession);
  const location = useLocation();

  useEffect(() => {
    if (hasHydrated) validateSession();
  }, [hasHydrated, validateSession, location.pathname]);

  if (!hasHydrated || isLoading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return children;
}

export function GuestRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const validateSession = useAuthStore((s) => s.validateSession);

  useEffect(() => {
    if (hasHydrated) validateSession();
  }, [hasHydrated, validateSession]);

  if (!hasHydrated || isLoading) return <LoadingScreen />;

  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
}
