import { useEffect, useState } from "react";
import { Calendar as CalendarIconLarge } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { userService } from "@/services/user.services";
import { scheduleService } from "@/services/schedule.service";
import { IUser } from "../Users/interfaces/user.interface";
import { ISchedule } from "./chedules.interface";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import ScheduleTable from "./components/ScheduleTable";
import ScheduleCreator from "./components/ScheduleCreator";

export default function UserSchedule() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [users, setUsers] = useState<IUser[]>([]);
  const [schedules, setSchedule] = useState<ISchedule[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);

  useEffect(() => {
    listSchedule();
    listUsers();
  }, []);

  const handleSaveSchedule = async (scheduleData: any) => {
    setSaving(true);
    try {
      const response = await scheduleService.create(scheduleData);

      if (response.status == 200 || response.status == 201) {
        setSchedule(prevSchedule => [...prevSchedule, response.data]);

        toast({
          title: "Horario guardado",
          description: scheduleData.repeatMonthly
            ? "El horario se repetirá automáticamente cada mes"
            : "El horario ha sido asignado exitosamente al usuario",
        });

        setShowForm(false);
        setEditingSchedule(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al guardar el horario",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSchedule = () => {
    setShowForm(false);
    setEditingSchedule(null);
  };

  const handleNewSchedule = () => {
    setShowForm(true);
    setEditingSchedule(null);
  };

  const listSchedule = async () => {
    try {
      const response = await scheduleService.list();
      if (response.status === 200 || response.status === 201) {
        setSchedule(response.data);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const listUsers = async () => {
    try {
      const response = await userService.list();
      if (response.status === 200 || response.status === 201) {
        setUsers(response.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar los usuarios",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (schedule: ISchedule) => {
    navigate(`/horario-usuario-detalle/${schedule.id}`);
  };

  const handleDelete = (scheduleId: string) => {
    setScheduleToDelete(scheduleId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!scheduleToDelete) return;

    try {
      const response = await scheduleService.delete(scheduleToDelete);
      if (response.status == 200 || response.status == 201) {
        setSchedule(prev => prev.filter(item => item.id !== Number(scheduleToDelete)));

        toast({
          title: "Horario eliminado",
          description: "El horario ha sido eliminado exitosamente",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar el horario",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setScheduleToDelete(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <CalendarIconLarge className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Horario de Usuario</h1>
          <p className="text-muted-foreground">Gestiona los horarios laborales de los usuarios</p>
        </div>
      </div>

      {showForm ? (
        <ScheduleCreator
          users={users}
          onSave={handleSaveSchedule}
          onCancel={handleCancelSchedule}
          saving={saving}
          editingSchedule={editingSchedule}
        />
      ) : (
        <ScheduleTable
          schedules={schedules}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onNewSchedule={handleNewSchedule}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El horario será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}