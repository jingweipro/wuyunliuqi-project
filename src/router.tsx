import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Classics from "./pages/Classics";
import HealthAdvice from "./pages/HealthAdvice";
import ResetPassword from "./pages/ResetPassword";
import Admin from "./pages/Admin";
import Sponsor from "./pages/Sponsor";
import BaZi from "./pages/BaZi";
import ZiWei from "./pages/ZiWei";
import LiYangBo from "./pages/LiYangBo";

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
    {
      path: "/sponsor",
      name: 'sponsor',
      element: <Sponsor />,
    },
    {
      path: "/bazi",
      name: 'bazi',
      element: <BaZi />,
    },
    {
      path: "/ziwei",
      name: 'ziwei',
      element: <ZiWei />,
    },
    {
      path: "/liyangbo",
      name: 'liyangbo',
      element: <LiYangBo />,
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
