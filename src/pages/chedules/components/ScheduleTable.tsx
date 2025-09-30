import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ISchedule } from "../chedules.interface";

interface ScheduleTableProps {
  schedules: ISchedule[];
  onEdit: (schedule: ISchedule) => void;
  onDelete: (scheduleId: string) => void;
  onNewSchedule: () => void;
}

export default function ScheduleTable({ schedules, onEdit, onDelete, onNewSchedule }: ScheduleTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Horarios Asignados</CardTitle>
        <Button onClick={onNewSchedule} className="flex items-center gap-2">
          Nuevo Horario
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead className="text-center">Fecha de Inicio</TableHead>
                <TableHead className="text-center">Días trabajados</TableHead>
                <TableHead className="text-center">Días de descanso</TableHead>
                <TableHead className="text-left">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">{schedule.user.name} {schedule.user.last_name}</TableCell>
                  <TableCell className="text-center">{format(new Date(schedule.startDate), "dd/MM/yyyy")}</TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm text-muted-foreground">{schedule.working_days}</span>
                  </TableCell>
                  <TableCell className="text-center">{schedule.rest_days ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-info/10 hover:text-info"
                        onClick={() => onEdit(schedule)}
                        title="Gestionar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        title="Eliminar"
                        onClick={() => onDelete(schedule.id.toString())}
                      >
                        <Trash2 className="h-4 w-4" />
                   
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {schedules.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No hay horarios disponibles.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

      </CardContent>
    </Card>
  );
}