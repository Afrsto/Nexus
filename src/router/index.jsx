import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ROUTES } from "@/constants/routes";
import { ProtectedRoute, GuestRoute } from "./ProtectedRoute";
import AppLayout from "@/layouts/AppLayout";
import AuthLayout from "@/layouts/AuthLayout";
import LoadingScreen from "@/components/common/LoadingScreen";

const HomePage = lazy(() => import("@/pages/HomePage"));
const ChatsPage = lazy(() => import("@/pages/ChatsPage"));
const RoomsPage = lazy(() => import("@/pages/RoomsPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const ExplorePage = lazy(() => import("@/pages/ExplorePage"));
const FriendsPage = lazy(() => import("@/pages/FriendsPage"));

function withSuspense(page) {
  return <Suspense fallback={<LoadingScreen />}>{page}</Suspense>;
}

/** Strip leading slash for nested route paths under `/`. */
function childPath(route) {
  return route.replace(/^\//, "");
}

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: withSuspense(<HomePage />) },
      { path: childPath(ROUTES.CHATS), element: withSuspense(<ChatsPage />) },
      { path: childPath(ROUTES.CHAT), element: withSuspense(<ChatsPage />) },
      { path: childPath(ROUTES.ROOMS), element: withSuspense(<RoomsPage />) },
      { path: childPath(ROUTES.ROOM), element: withSuspense(<RoomsPage />) },
      { path: childPath(ROUTES.ROOM_CHANNEL), element: withSuspense(<RoomsPage />) },
      { path: childPath(ROUTES.NOTIFICATIONS), element: withSuspense(<NotificationsPage />) },
      { path: childPath(ROUTES.PROFILE), element: withSuspense(<ProfilePage />) },
      { path: childPath(ROUTES.PROFILE_USER), element: withSuspense(<ProfilePage />) },
      { path: childPath(ROUTES.SETTINGS), element: withSuspense(<SettingsPage />) },
      { path: childPath(ROUTES.EXPLORE), element: withSuspense(<ExplorePage />) },
      { path: childPath(ROUTES.FRIENDS), element: withSuspense(<FriendsPage />) },
    ],
  },
  {
    element: (
      <GuestRoute>
        <AuthLayout />
      </GuestRoute>
    ),
    children: [
      { path: ROUTES.LOGIN, element: withSuspense(<LoginPage />) },
      { path: ROUTES.REGISTER, element: withSuspense(<RegisterPage />) },
    ],
  },
  { path: ROUTES.NOT_FOUND, element: withSuspense(<NotFoundPage />) },
]);
