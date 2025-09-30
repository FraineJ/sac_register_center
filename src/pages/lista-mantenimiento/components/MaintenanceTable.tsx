import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Trash2, Eye } from "lucide-react";
import { MaintenanceDetail, MaintenanceDetailModel } from "../DetalleMantenimiento";
import { MaintenanceForm } from "./MaintenanceForm";

// Interfaz base de la tabla (tuya)
export interface Maintenance {
  id: number;
  activityTitle: string;
  responsibleName: string;
  activityType: "Preventivo" | "Correctivo" | "Predictivo" | string;
  plannedDate: string; // ISO string
  status: "Pendiente" | "En progreso" | "Completado" | "Cancelado" | string;
  vesselName: string;
}

export function MaintenanceTable() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado para mostrar el detalle
  const [selected, setSelected] = useState<Maintenance | null>(null);
  // Estado para mostrar el formulario de edición
  const [editingMaintenance, setEditingMaintenance] = useState<Maintenance | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    // Datos de ejemplo
    const mockData: Maintenance[] = [
      {
        id: 1,
        activityTitle: "Cambio de aceite motor principal",
        responsibleName: "Juan Pérez",
        activityType: "Preventivo",
        plannedDate: "2024-01-15",
        status: "Pendiente",
        vesselName: "Embarcación Alpha",
      },
      {
        id: 2,
        activityTitle: "Revisión sistema hidráulico",
        responsibleName: "María García",
        activityType: "Correctivo",
        plannedDate: "2024-01-20",
        status: "En progreso",
        vesselName: "Marimar",
      },
    ];

    const timer = setTimeout(() => {
      setMaintenances(mockData);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const handleView = (maintenance: Maintenance) => {
    setSelected(maintenance);
  };

  const handleEdit = (maintenance: Maintenance) => {
    setEditingMaintenance(maintenance);
    setShowEditDialog(true);
  };

  const handleDelete = (id: number) => {
    // aquí harías tu delete real
    setMaintenances((prev) => prev.filter((m) => m.id !== id));
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    setEditingMaintenance(null);
    // Aquí podrías recargar la lista de mantenimientos
    // listMaintenances();
  };

  const handleEditCancel = () => {
    setShowEditDialog(false);
    setEditingMaintenance(null);
  };

  // Adaptador: Maintenance (tabla) -> MaintenanceDetailModel (detalle)
  const toDetailModel = (m: Maintenance): MaintenanceDetailModel => {
    const statusMap: Record<string, MaintenanceDetailModel["status"]> = {
      "Pendiente": "pending",
      "En progreso": "in-progress",
      "Completado": "completed",
      "Cancelado": "cancelled",
    };

    const typeMap: Record<string, MaintenanceDetailModel["activityType"]> = {
      "Preventivo": "preventivo",
      "Correctivo": "correctivo",
      "Predictivo": "predictivo",
    };

    return {
      id: String(m.id),
      activityTitle: m.activityTitle,
      name: `${m.vesselName} — ${m.activityTitle}`,
      supplies: [
        { id: "1", name: "Aceite 15W-40", quantity: 4 },
        { id: "2", name: "Filtro de aceite", quantity: 1 },
      ],
      steps: [
        { title: "Preparación", description: "Asegurar el área y apagar el equipo." },
        { title: "Drenaje", description: "Drenar aceite usado según protocolo." },
        { title: "Cambio filtro", description: "Reemplazar filtro y juntas." },
        { title: "Relleno", description: "Cargar aceite nuevo al nivel especificado." },
        { title: "Prueba", description: "Encender y verificar fugas y niveles." },
      ],
      responsibleRole: m.responsibleName,
      activityType: typeMap[m.activityType] ?? m.activityType.toLowerCase(),
      startDate: new Date(m.plannedDate),
      preNoticeDate: new Date(m.plannedDate),
      notifyDate: new Date(m.plannedDate),
      activationType: "calendario",
      notificationValue: undefined,
      teams: ["Equipo A"],
      fleetId: "Centro de costo 1",
      assignedTeam: undefined,
      status: statusMap[m.status] ?? "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };

  if (loading) {
    return <div className="text-center py-8">Cargando mantenimientos...</div>;
  }

  // Si hay seleccionado, muestra el detalle
  if (selected) {
    const detail = toDetailModel(selected);
    return (
      <MaintenanceDetail
        maintenance={detail}
        onEdit={() => console.log("Editar dentro del detalle", detail.id)}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>Plan de Mantenimiento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unidad</TableHead>
                <TableHead>Título de Actividad</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Fecha Planificada</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="w-[120px]">Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maintenances.map((maintenance) => (
                <TableRow key={maintenance.id}>
                  <TableCell>{maintenance.vesselName}</TableCell>
                  <TableCell className="font-medium">{maintenance.activityTitle}</TableCell>
                  <TableCell>{maintenance.responsibleName}</TableCell>
                  <TableCell>{maintenance.plannedDate}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        maintenance.activityType === "Preventivo"
                          ? "bg-green-100 text-green-800"
                          : maintenance.activityType === "Correctivo"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {maintenance.activityType}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        maintenance.status === "Pendiente"
                          ? "bg-yellow-100 text-yellow-800"
                          : maintenance.status === "En progreso"
                          ? "bg-blue-100 text-blue-800"
                          : maintenance.status === "Completado"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {maintenance.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(maintenance)}
                        aria-label={`Ver mantenimiento ${maintenance.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(maintenance)}
                        aria-label={`Editar mantenimiento ${maintenance.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(maintenance.id)}
                        aria-label={`Eliminar mantenimiento ${maintenance.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {maintenances.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No hay mantenimientos disponibles.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Dialog para editar mantenimiento */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Mantenimiento</DialogTitle>
          </DialogHeader>
          <MaintenanceForm
            onSuccess={handleEditSuccess}
            onCancel={handleEditCancel}
            editingMaintenance={editingMaintenance}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
