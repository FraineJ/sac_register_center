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
import Roles from "./pages/Roles";
import Fleet from "./pages/fleet/Fleet";
import Operations from "./pages/operations/Operations";
import NotFound from "./pages/NotFound";
import UserSchedule from "./pages/chedules/UserSchedule";
import UserScheduleDetail from "./pages/chedules/UserScheduleDetail";
import Tarifario from "./pages/tarifario/Tarifario";
import ClientList from "./pages/lista-clientes/ClientList";
import { ListaMantenimiento } from "./pages/lista-mantenimiento/ListaMantenimiento";
import ManeuverDetails from "./pages/operations/ManeuverDetails";
import CompletedManeuverDetails from "./pages/operations/CompletedManeuverDetails";
import { MaintenanceDetail } from "./pages/lista-mantenimiento/DetalleMantenimiento";
import Equipment from "./pages/equipment/Equipment";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<Index />} />
            <Route path="usuarios" element={<Users />} />
            <Route path="horarios-de-trabajo" element={<UserSchedule />} />
            <Route path="horario-usuario-detalle/:id" element={<UserScheduleDetail />} />
            <Route path="maniobras" element={<Operations />} />
            <Route path="lista-embarcaciones" element={<Fleet />} />
            <Route path="lista-clientes" element={<ClientList />} />
            <Route path="lista-mantenimiento" element={<ListaMantenimiento />} />
            <Route path="configuracion/empresa" element={<Company />} />
            <Route path="configuracion/rol" element={<Roles />} />
            <Route path="configuracion/tarifario" element={<Tarifario />} />
            <Route path="equipos" element={<Equipment />} />

            <Route path="maniobra-detalle/:id" element={<ManeuverDetails />} />
            <Route path="maniobra-completada/:id" element={<CompletedManeuverDetails />} />


          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
