import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Supply {
  id: string;
  name: string;
  quantity: number;
}

interface Step {
  title: string;
  description: string;
}

export interface MaintenanceDetailModel {
  id: string;
  activityTitle: string;
  name: string;
  supplies: Supply[];
  steps: Step[];
  responsibleRole: string;
  activityType: "preventivo" | "correctivo" | "predictivo" | string;
  preNoticeDate?: Date;
  initialDate?: Date;
  vesselDate?: Date;
  startDate?: Date;
  notifyDate?: Date;
  activationType?: "combustible" | "horas_automatico" | "horas_manual" | "calendario" | string;
  notificationValue?: string;
  teams: string[];
  fleetId: string;
  assignedTeam?: string;
  status: "pending" | "in-progress" | "completed" | "cancelled" | string;
  createdAt: Date;
  updatedAt: Date;
}

interface MaintenanceDetailProps {
  maintenance: MaintenanceDetailModel;
  onEdit: () => void;
  onBack: () => void;
}

export function MaintenanceDetail({ maintenance, onEdit, onBack }: MaintenanceDetailProps) {
  const formatDate = (date?: Date) => (date ? format(date, "PPP") : "No especificado");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "in-progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getActivityType = (type: string) => {
    switch (type) {
      case "preventivo":
        return "Preventivo";
      case "correctivo":
        return "Correctivo";
      case "predictivo":
        return "Predictivo";
      default:
        return type;
    }
  };

  const getActivationType = (type?: string) => {
    if (!type) return "No especificado";
    switch (type) {
      case "combustible":
        return "Combustible";
      case "horas_automatico":
        return "Horas de trabajo automático";
      case "horas_manual":
        return "Horas de trabajo manual";
      case "calendario":
        return "Calendario";
      default:
        return type;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "in-progress":
        return "En progreso";
      case "completed":
        return "Completado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  return (
    <div className="w-full mx-auto p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{maintenance.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={getStatusColor(maintenance.status)}>
              {getStatusText(maintenance.status)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Creado el {formatDate(maintenance.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Volver
          </Button>
          <Button onClick={onEdit}>Editar</Button>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información general */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo de actividad</p>
                  <p>{getActivityType(maintenance.activityType)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cargo del responsable</p>
                  <p>{maintenance.responsibleRole}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Centro de costo</p>
                  <p>{maintenance.fleetId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Equipo asignado</p>
                  <p>{maintenance.assignedTeam || "No asignado"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de activación */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Activación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo de activador</p>
                <p>{getActivationType(maintenance.activationType)}</p>
              </div>

              {maintenance.activationType === "calendario" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha de inicio</p>
                    <p>{formatDate(maintenance.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pre avisar</p>
                    <p>{formatDate(maintenance.preNoticeDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Notificar</p>
                    <p>{formatDate(maintenance.notifyDate)}</p>
                  </div>
                </div>
              ) : maintenance.activationType ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valor inicial</p>
                    <p>{maintenance.initialDate ? formatDate(maintenance.initialDate) : "No especificado"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valor a notificar</p>
                    <p>{maintenance.notificationValue || "No especificado"}</p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Pasos de la actividad */}
          <Card>
            <CardHeader>
              <CardTitle>Pasos de la Actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {maintenance.steps.map((step, index) => (
                  <div key={index} className="pb-4 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mt-1">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{step.title}</h3>
                        <p className="text-muted-foreground mt-1">{step.description}</p>
                      </div>
                    </div>
                    {index < maintenance.steps.length - 1 && (
                      <div className="ml-4 pl-7 pt-4">
                        <Separator />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Insumos */}
          <Card>
            <CardHeader>
              <CardTitle>Insumos Requeridos</CardTitle>
            </CardHeader>
            <CardContent>
              {maintenance.supplies.length > 0 ? (
                <div className="space-y-3">
                  {maintenance.supplies.map((supply) => (
                    <div key={supply.id} className="flex justify-between items-center py-2">
                      <span>{supply.name}</span>
                      <Badge variant="outline">{supply.quantity} unidades</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No se han agregado insumos</p>
              )}
            </CardContent>
          </Card>

          {/* Metadatos */}
          <Card>
            <CardHeader>
              <CardTitle>Información Adicional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Creado</p>
                <p>{formatDate(maintenance.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Última actualización</p>
                <p>{formatDate(maintenance.updatedAt)}</p>
              </div>
              {maintenance.teams?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Equipos relacionados</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {maintenance.teams.map((team, index) => (
                      <Badge key={index} variant="secondary">
                        {team}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Acciones rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full">
                Reprogramar
              </Button> 
              {maintenance.status === "pending" && (
                <Button className="w-full">Iniciar mantenimiento</Button>
              )}
              {maintenance.status === "in-progress" && (
                <Button className="w-full">Completar mantenimiento</Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
