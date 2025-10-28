import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IFleet } from "@/pages/operations/interfaces/fleet.interface";
import { fleetService } from "@/services/fleet.service";
import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { IFleetDocument } from "@/components/interfaces/dashboard.interface";
import WelcomeCard from "./components/WelcomeCardWithAvatar";

interface UserData {
  name: string;
  lastName: string;
  role?: string;
}

export function HomeView() {
  // Mover los estados dentro del componente
  const [fleets, setFleet] = useState<IFleet[]>([]);
  const [fleetsDocumentExpire, setFleetDocumentExpire] = useState<IFleetDocument[]>([]);
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData>({
    name: "",
    lastName: ""
  });


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

    const userData = localStorage.getItem('dataUser');
    const parsedData = JSON.parse(userData);

    setUserData(parsedData.userData);

    try {
      const response = await fleetService.listDocumentExpireByUser(parsedData.userData.id);
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


  // Mover el useEffect dentro del componente
  useEffect(() => {
    listFleet();
    listDocumentsExpire()
  }, []);


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  const viewVessel = (vesselId: string) => {
    navigate(`/fleet-details/${vesselId}`);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Inicio</h1>
      </div>

      <div className="px-6">
        <WelcomeCard name={userData.name} ></WelcomeCard>
      </div>


      <section className="px-6 mt-8 pb-10">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Certificados prontos a vencer
        </h2>




        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <table className="min-w-full table-fixed">
            {/* Control de anchos de columnas */}
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
                <th scope="col" className="px-4 py-3 text-center">Compañías</th>
                <th scope="col" className="px-4 py-3 text-center">Nombre del certificado</th>
                <th scope="col" className="px-4 py-3 text-center">Nombre del documento</th>
                <th scope="col" className="px-4 py-3 text-center">Fecha de expiración</th>
                <th scope="col" className="px-4 py-3 text-center">Inicio de ventana</th>
                <th scope="col" className="px-4 py-3 text-center">Fin de ventana</th>
                <th scope="col" className="px-4 py-3 text-center">Acción</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-sm">
              {fleetsDocumentExpire.length > 0 ? (
                fleetsDocumentExpire.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-4 text-slate-900">
                      {row.fleet.name}
                    </td>

                    <td className="px-4 py-4 text-slate-900 text-center">
                      {row.fleet.user.name}
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-flex items-start rounded-md bg-slate-100 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 whitespace-normal break-words">
                        {row.listDocument.name}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className="text-sky-600">{row.name}</span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className="text-sky-600">{formatDate(row.expirationDate)}</span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className="text-sky-600">{formatDate(row.windowStart)}</span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className="text-sky-600">{formatDate(row.windowEnd)}</span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewVessel(row.fleet.id.toString())}
                        className="h-8 w-8 p-0 hover:bg-info/10 hover:text-info"
                        title="Ver documento"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="rounded-full bg-slate-100 p-4 mb-3">
                        <svg
                          className="w-8 h-8 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-slate-700 mb-1">
                        No se encontraron documentos
                      </h3>
                      <p className="text-sm max-w-md">
                        No hay documentos próximos a expirar en este momento.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}