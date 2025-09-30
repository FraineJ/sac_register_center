import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Activity = {
  vessel: string;
  owner: string;
  status: "Active" | "Pending" | "Expired";
  expiry: string; // YYYY-MM-DD
};

const activities: Activity[] = [
  { vessel: "Ocean Voyager", owner: "Ethan Carter",  status: "Active",  expiry: "2024-12-31" },
  { vessel: "Sea Serpent",   owner: "Olivia Bennett", status: "Pending", expiry: "2024-11-15" },
  { vessel: "Aqua Explorer", owner: "Noah Thompson",  status: "Expired", expiry: "2024-10-20" },
  { vessel: "Wave Rider",    owner: "Ava Harris",     status: "Active",  expiry: "2024-09-05" },
  { vessel: "Coastal Cruiser", owner: "Liam Clark",   status: "Pending", expiry: "2024-08-10" },
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
            <p className="text-slate-600">Total Vessels</p>
            <p className="text-3xl font-semibold mt-2 text-slate-900">1,250</p>
          </div>
          <div className="rounded-lg border border-slate bg-white p-5">
            <p className="text-slate-600">Active Certifications</p>
            <p className="text-3xl font-semibold mt-2 text-slate-900">875</p>
          </div>
          <div className="rounded-lg border border-slate bg-white p-5">
            <p className="text-slate-600">Registered Users</p>
            <p className="text-3xl font-semibold mt-2 text-slate-900">520</p>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="px-6 mt-8 pb-10">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Activity</h2>

        <div className="rounded-lg border border-slate bg-white overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-4 gap-4 px-4 py-3 text-sm font-medium text-slate-700 bg-white">
            <div>Vessel Name</div>
            <div>Owner</div>
            <div>Certification Status</div>
            <div>Expiry Date</div>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate" />

          {/* Rows */}
          <ul className="divide-y divide-slate">
            {activities.map((row, idx) => (
              <li key={idx} className="grid grid-cols-4 gap-4 px-4 py-4 text-sm items-center">
                <div className="text-slate-900">{row.vessel}</div>

                <div>
                  <button
                    type="button"
                    className="text-sky-600 hover:underline"
                    onClick={() => {}}
                    aria-label={`Open ${row.owner}`}
                  >
                    {row.owner}
                  </button>
                </div>

                <div>
                  <span className="inline-flex items-center rounded-md bg-slate text-slate-700 px-3 py-1 text-xs font-medium">
                    {row.status}
                  </span>
                </div>

                <div className="text-sky-600">{row.expiry}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
