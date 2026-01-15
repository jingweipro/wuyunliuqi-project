import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Classics from "./pages/Classics";
import HealthAdvice from "./pages/HealthAdvice";
import ResetPassword from "./pages/ResetPassword";
import Admin from "./pages/Admin";

export const routers = [
    {
      path: "/",
      name: 'home',
      element: <Index />,
    },
    {
      path: "/login",
      name: 'login',
      element: <LoginPage />,
    },
    {
      path: "/dashboard",
      name: 'dashboard',
      element: <Dashboard />,
    },
    {
      path: "/classics",
      name: 'classics',
      element: <Classics />,
    },
    {
      path: "/health-advice",
      name: 'health-advice',
      element: <HealthAdvice />,
    },
    {
      path: "/reset-password",
      name: 'reset-password',
      element: <ResetPassword />,
    },
    {
      path: "/admin",
      name: 'admin',
      element: <Admin />,
    },
    /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
    {
      path: "*",
      name: '404',
      element: <NotFound />,
    },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
