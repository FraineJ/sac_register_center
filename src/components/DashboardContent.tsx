import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Activity = {
  vessel: string;
  owner: string;
  certification: string;
  expiry: string; // YYYY-MM-DD
};

const activities: Activity[] = [
  { vessel: "Ocean Voyager", owner: "Ethan Carter", certification: "Certificado de Gestión de la Seguridad (SMC - ISM)", expiry: "2024-12-31" },
  { vessel: "Sea Serpent", owner: "Olivia Bennett", certification: "Certificado de Equipo de Seguridad (Safety Equipment)", expiry: "2024-11-15" },
  { vessel: "Aqua Explorer", owner: "Noah Thompson", certification: "Certificado Radioeléctrico de Seguridad (Safety Radio)", expiry: "2024-10-20" },
  { vessel: "Wave Rider", owner: "Ava Harris", certification: "Certificado de Construcción de Seguridad (Safety Construction)", expiry: "2024-09-05" },
  { vessel: "Coastal Cruiser", owner: "Liam Clark", certification: "Certificado Internacional de Seguridad del Buque (ISSC)", expiry: "2024-08-10" },
];

export function DashboardContent() {
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
            <p className="text-3xl font-semibold mt-2 text-slate-900">250</p>
          </div>
          <div className="rounded-lg border border-slate bg-white p-5">
            <p className="text-slate-600">Certificados vigentes</p>
            <p className="text-3xl font-semibold mt-2 text-slate-900">75</p>
          </div>
          <div className="rounded-lg border border-slate bg-white p-5">
            <p className="text-slate-600">Clientes registrado</p>
            <p className="text-3xl font-semibold mt-2 text-slate-900">20</p>
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
              <col className="w-[24%]" />
              <col className="w-[16%]" />
              <col className="w-[40%]" />
              <col className="w-[20%]" />
            </colgroup>

            <thead>
              <tr className="text-sm font-medium text-white bg-primary">
                <th scope="col" className="px-4 py-3 text-left">Nombre de la embarcación</th>
                <th scope="col" className="px-4 py-3 text-left">Cliente</th>
                <th scope="col" className="px-4 py-3 text-left">Nombre del certificado</th>
                <th scope="col" className="px-4 py-3 text-center">Fecha de expiración</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate text-sm">
              {activities.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-4 text-slate-900">
                    {row.vessel}
                  </td>

                  <td className="px-4 py-4">
                    <button
                      type="button"
                      className="text-sky-600 hover:underline"
                      onClick={() => { }}
                      aria-label={`Open ${row.owner}`}
                    >
                      {row.owner}
                    </button>
                  </td>

                  <td className="px-4 py-4">
                    {/* Más espacio + permite múltiples líneas */}
                    <span className="inline-flex items-start rounded-md bg-slate px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 whitespace-normal break-words">
                      {row.certification}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-center">
                    <span className="text-sky-600">{row.expiry}</span>
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
