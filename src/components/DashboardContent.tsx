import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IFleet } from "@/pages/operations/interfaces/fleet.interface";
import { clientService } from "@/services/client.services";
import { fleetService } from "@/services/fleet.service";
import { useEffect, useState } from "react";
import { toast } from "./ui/use-toast";
import { IClient } from "@/pages/lista-clientes/interfaces/client.interface";
import { IFleetDocument } from "./interfaces/dashboard.interface";
import { formatDate } from "date-fns";
import { Button } from "./ui/button";
import { Edit, Eye } from "lucide-react";

type Activity = {
  vessel: string;
  owner: string;
  certification: string;
  expiry: string; // YYYY-MM-DD
};

export function DashboardContent() {
  // Mover los estados dentro del componente
  const [fleets, setFleet] = useState<IFleet[]>([]);
  const [clients, setClients] = useState<IClient[]>([]);
  const [fleetsDocumentExpire, setFleetDocumentExpire] = useState<IFleetDocument[]>([]);


  const activities: Activity[] = [
    { vessel: "Ocean Voyager", owner: "Ethan Carter", certification: "Certificado de Gestión de la Seguridad (SMC - ISM)", expiry: "2024-12-31" },
    { vessel: "Sea Serpent", owner: "Olivia Bennett", certification: "Certificado de Equipo de Seguridad (Safety Equipment)", expiry: "2024-11-15" },
    { vessel: "Aqua Explorer", owner: "Noah Thompson", certification: "Certificado Radioeléctrico de Seguridad (Safety Radio)", expiry: "2024-10-20" },
    { vessel: "Wave Rider", owner: "Ava Harris", certification: "Certificado de Construcción de Seguridad (Safety Construction)", expiry: "2024-09-05" },
    { vessel: "Coastal Cruiser", owner: "Liam Clark", certification: "Certificado Internacional de Seguridad del Buque (ISSC)", expiry: "2024-08-10" },
  ];

  // Mover las funciones dentro del componente
  const listFleet = async () => {
    try {
      const response = await fleetService.list();
      setFleet(response.data);
    } catch (error: any) {
      // Verificar si es un error del servidor (5xx)
      const isServerError = error?.response?.status >= 500 ||
        error?.code === 'ECONNREFUSED' ||
        error?.code === 'NETWORK_ERROR';

      if (isServerError) {
        toast({
          title: "Error del servidor",
          description: "No se pudieron cargar las embarcaciones. Por favor, intente más tarde.",
          variant: "destructive",
        });
      }
      // No mostrar toast para errores 4xx (del cliente)
    }
  };

  const listDocumentsExpire = async () => {
    try {
      const response = await fleetService.listDocumentExpire();
      setFleetDocumentExpire(response.data);
    } catch (error: any) {
      // Verificar si es un error del servidor (5xx)
      const isServerError = error?.response?.status >= 500 ||
        error?.code === 'ECONNREFUSED' ||
        error?.code === 'NETWORK_ERROR';

      if (isServerError) {
        toast({
          title: "Error del servidor",
          description: "No se pudieron cargar las embarcaciones. Por favor, intente más tarde.",
          variant: "destructive",
        });
      }
      // No mostrar toast para errores 4xx (del cliente)
    }
  };

  const listClient = async () => {
    try {
      const response = await clientService.list();
      if (response.status == 200 || response.status == 201) {
        setClients(response.data);
      }
    } catch (error: any) {
      // Verificar si es un error del servidor (5xx)
      const isServerError = error?.response?.status >= 500 ||
        error?.code === 'ECONNREFUSED' ||
        error?.code === 'NETWORK_ERROR';

      if (isServerError) {
        toast({
          title: "Error del servidor",
          description: "No se pudieron cargar los clientes. Por favor, intente más tarde.",
          variant: "destructive",
        });
      }
      // No mostrar toast para errores 4xx (del cliente)
    }
  };

  // Mover el useEffect dentro del componente
  useEffect(() => {
    listClient();
    listFleet();
    listDocumentsExpire()
  }, []);


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
      </div>

      {/* Overview */}
      <section className="px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-lg border border-slate bg-white p-5">
            <p className="text-slate-600">Total de Embarcaciones</p>
            <p className="text-3xl font-semibold mt-2 text-slate-900">{fleets.length}</p>
          </div>
          <div className="rounded-lg border border-slate bg-white p-5">
            <p className="text-slate-600">Certificados a expirar</p>
            <p className="text-3xl font-semibold mt-2 text-slate-900">{fleetsDocumentExpire.length}</p>
          </div>
          <div className="rounded-lg border border-slate bg-white p-5">
            <p className="text-slate-600">Compañias registradas</p>
            <p className="text-3xl font-semibold mt-2 text-slate-900">{clients.length}</p>
          </div>
        </div>
      </section>

      <section className="px-6 mt-8 pb-10">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Certificados prontos a vencer
        </h2>

        <div className="rounded-lg border border-slate bg-white overflow-hidden">
          <table className="min-w-full table-fixed">
            {/* Control de anchos de columnas (la 3ra es más ancha) */}
            <colgroup>
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[20%]" />
              <col className="w-[14%]" />
              <col className="w-[14%]" />
              <col className="w-[14%]" />
            </colgroup>

            <thead>
              <tr className="text-sm font-medium text-white bg-primary">
                <th scope="col" className="px-4 py-3 text-center">Nombre de la embarcación</th>
                <th scope="col" className="px-4 py-3 text-center">Compañias</th>
                <th scope="col" className="px-4 py-3 text-center">Nombre del certificado</th>
                <th scope="col" className="px-4 py-3 text-center">Nombre del documento</th>
                <th scope="col" className="px-4 py-3 text-center">Fecha de expiración</th>
                <th scope="col" className="px-4 py-3 text-center">Inicio de ventana</th>
                <th scope="col" className="px-4 py-3 text-center">Fin de ventana</th>
                <th scope="col" className="px-4 py-3 text-center">Acción</th>

              </tr>
            </thead>

            <tbody className="divide-y divide-slate text-sm">
              {fleetsDocumentExpire.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-4 text-slate-900">
                    {row.fleet.name}
                  </td>

                  <td className="px-4 py-4 text-slate-900 text-center">
                    {row.fleet.user.name}
                  </td>

                  <td className="px-4 py-4 ">
                    {/* Más espacio + permite múltiples líneas */}
                    <span className="inline-flex items-start rounded-md bg-slate px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 whitespace-normal break-words">
                      {row.listDocument.name}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-center">
                    <span className="text-sky-600">{row.name}</span>
                  </td>

                  <td className="px-4 py-4 text-center">
                    <span className="text-sky-600"> {formatDate(row.expirationDate)}</span>
                   
                  </td>

                  <td className="px-4 py-4 text-center">
                    <span className="text-sky-600"> {formatDate(row.windowStart)}</span>
                   
                  </td>

                  <td className="px-4 py-4 text-center">
                    <span className="text-sky-600"> {formatDate(row.windowEnd)}</span>
                   
                  </td>

                  <td className="px-4 py-4 text-center">
                    <Button
                            variant="ghost"
                            size="sm"
                           
                            className="h-8 w-8 p-0 hover:bg-info/10 hover:text-info"
                            title="Ver documento"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}