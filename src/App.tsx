import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Users from "./pages/Users/Users";
import Company from "./pages/Company";
import Roles from "./pages/roles/Roles";
import Fleet from "./pages/fleet/Fleet";
import Operations from "./pages/operations/Operations";
import NotFound from "./pages/NotFound";
import UserSchedule from "./pages/chedules/UserSchedule";
import UserScheduleDetail from "./pages/chedules/UserScheduleDetail";
import ClientList from "./pages/lista-clientes/ClientList";
import { ListaMantenimiento } from "./pages/lista-mantenimiento/ListaMantenimiento";
import ManeuverDetails from "./pages/operations/ManeuverDetails";
import CompletedManeuverDetails from "./pages/operations/CompletedManeuverDetails";
import { MaintenanceDetail } from "./pages/lista-mantenimiento/DetalleMantenimiento";
import Equipment from "./pages/equipment/Equipment";
import FleetDetails from "./pages/fleet/components/FleetDetails";
import { HomeView } from "./pages/home/HomeView";
import ViewFleetUser from "./pages/fleet-user/components/ViewFleetUser";
import FleetUser from "./pages/fleet-user/FleetUser";
import ProfileView from "./pages/profile/ProfilePage";
import ForgotPassword from "./pages/forgot-password/ForgotPassword";
import ResetPassword from "./pages/reset-password/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
          <Route path="/" element={<AppLayout />}>
            <Route path="dashboard" element={<Index />} />
            <Route path="inicio" element={<HomeView />} />

            <Route path="usuarios" element={<Users />} />
            <Route path="maniobras" element={<Operations />} />
            <Route path="lista-embarcaciones" element={<Fleet />} />
            <Route path="lista-clientes" element={<ClientList />} />
            <Route path="lista-mantenimiento" element={<ListaMantenimiento />} />
            <Route path="configuracion/empresa" element={<Company />} />
            <Route path="configuracion/rol" element={<Roles />} />
            <Route path="equipos" element={<Equipment />} />
            <Route path="fleet-details/:id" element={<FleetDetails />} />
            <Route path="view-fleet/:id" element={<ViewFleetUser />} />
            <Route path="embarcaciones" element={<FleetUser />} />
            <Route path="perfil" element={<ProfileView />} />
           




            

          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
