import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminRoute } from "./components/auth/AdminRoute";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { Home } from "./pages/Home";
import { Machines } from "./pages/Machines";
import { EquipmentDetail } from "./pages/EquipmentDetail";
import { PartDetail } from "./pages/PartDetail";
import { Alerts } from "./pages/Alerts";
import { History as HistoryPage } from "./pages/History";
import { Settings } from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppProvider>
          {/* v7 future flags opted-in early: silences React Router's upgrade
              advisories (startTransition + relative splat path) with no behavior
              change for this route tree. */}
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              {/* Unprotected Login route */}
              <Route path="/login" element={<Login />} />

              {/* Protected app routes requiring authenticated operator */}
              <Route element={<ProtectedRoute />}>
                <Route
                  element={
                    <Layout>
                      <Outlet />
                    </Layout>
                  }
                >
                  <Route path="/" element={<Home />} />
                  <Route path="/machines" element={<Machines />} />
                  <Route path="/equipment/:machineId" element={<EquipmentDetail />} />
                  <Route path="/part/:partId" element={<PartDetail />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/alerts/:alertId" element={<Alerts />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route element={<AdminRoute />}>
                    <Route path="/settings/thresholds" element={<Settings />} />
                    <Route path="/settings/users" element={<Settings />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;