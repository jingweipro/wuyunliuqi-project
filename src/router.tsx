import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";

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
