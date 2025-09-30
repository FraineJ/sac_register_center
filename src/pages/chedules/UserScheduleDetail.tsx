import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Calendar as CalendarIcon, Clock, User, Plus, ChevronLeft, ChevronRight, Umbrella, Save } from "lucide-react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addMonths, subMonths, addDays, isBefore, isAfter } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { scheduleService } from "@/services/schedule.service";

interface WorkDay {
  date: string;
  startTime: string;
  endTime: string;
}

interface ScheduleDetail {
  id: number;
  startDate: string;
  workDays: WorkDay[];
  repeatMonthly: boolean;
  businessId: number;
  userId: number;
  working_days: number;
  rest_days: number;
  vacationStartDate: string;
  vacationDays: number;
  user: {
    id: number;
    name: string;
    email: string;
    last_name: string;
  };
}

interface Novelty {
  id?: string;
  date: string;
  type: string;
  observation?: string;
  scheduleId: number;
}

const noveltyTypes = [
  "No asistió",
  "Permiso",
  "Incapacidad médica",
  "Cambio de turno",
  "Llegada tarde",
  "Salida anticipada",
  "Horas extras"
];

const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return [
    { value: `${hour}:00`, label: `${hour}:00` },
    { value: `${hour}:30`, label: `${hour}:30` }
  ];
}).flat();

export default function UserScheduleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<ScheduleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showNoveltyDialog, setShowNoveltyDialog] = useState(false);
  const [noveltyType, setNoveltyType] = useState("");
  const [noveltyObservation, setNoveltyObservation] = useState("");
  const [novelties, setNovelties] = useState<Novelty[]>([]);
  const [saving, setSaving] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editingWorkDay, setEditingWorkDay] = useState<WorkDay | null>(null);
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");

  useEffect(() => {
    if (id) {
      loadScheduleDetail(id);
    }
  }, [id]);

  const loadScheduleDetail = async (scheduleId) => {
    try {
      setLoading(true);
      const response = await scheduleService.listById(scheduleId);
      if (response.status == 200 || response.status == 201) {
        setSchedule(response.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar el detalle del horario",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isWorkDay = (date: Date) => {
    if (!schedule) return false;

    // Primero verificar si es un día laboral definido explícitamente
    const explicitWorkDay = schedule.workDays.some(workDay =>
      isSameDay(new Date(workDay.date), date)
    );

    if (explicitWorkDay) return true;

    // Si no es un día explícito, verificar según el patrón
    const startDate = new Date(schedule.startDate);
    // Si la fecha es anterior al inicio del horario, no es día laboral
    if (isBefore(date, startDate)) return false;

    const daysSinceStart = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const cycleDays = schedule.working_days + schedule.rest_days;
    const cyclePosition = daysSinceStart % cycleDays;

    return cyclePosition < schedule.working_days && daysSinceStart >= 0;
  };

  const isRestDay = (date: Date) => {
    if (!schedule) return false;

    // Primero verificar si es un día de descanso según el patrón
    const startDate = new Date(schedule.startDate);
    // Si la fecha es anterior al inicio del horario, no es día de descanso
    if (isBefore(date, startDate)) return false;

    const daysSinceStart = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const cycleDays = schedule.working_days + schedule.rest_days;
    const cyclePosition = daysSinceStart % cycleDays;

    return cyclePosition >= schedule.working_days && daysSinceStart >= 0;
  };

  const getWorkDaySchedule = (date: Date) => {
    if (!schedule) return undefined;

    // Buscar día laboral explícito
    const explicitWorkDay = schedule.workDays.find(workDay =>
      isSameDay(new Date(workDay.date), date)
    );

    if (explicitWorkDay) return explicitWorkDay;

    // Si no hay día explícito pero es día laboral según el patrón, usar horario por defecto
    if (isWorkDay(date)) {
      return {
        date: date.toISOString(),
        startTime: "08:00", // Horario por defecto
        endTime: "17:00"    // Horario por defecto
      };
    }

    return undefined;
  };

  const hasNovelty = (date: Date) => {
    return novelties.some(novelty =>
      isSameDay(new Date(novelty.date), date)
    );
  };

  const getNovelty = (date: Date) => {
    return novelties.find(novelty =>
      isSameDay(new Date(novelty.date), date)
    );
  };

  const isVacationDay = (date: Date) => {
    if (!schedule || !schedule.vacationStartDate || !schedule.vacationDays) return false;

    const startDate = new Date(schedule.vacationStartDate);
    const endDate = addDays(startDate, schedule.vacationDays - 1);
    return date >= startDate && date <= endDate;
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);

    // Obtener información del día laboral si existe
    const workDayInfo = getWorkDaySchedule(date);
    if (workDayInfo) {
      setEditingWorkDay(workDayInfo);
      setNewStartTime(workDayInfo.startTime);
      setNewEndTime(workDayInfo.endTime);
    } else {
      setEditingWorkDay(null);
      setNewStartTime("");
      setNewEndTime("");
    }

    // Si ya existe una novedad para este día, cargar sus datos
    const existingNovelty = getNovelty(date);
    if (existingNovelty) {
      setNoveltyType(existingNovelty.type);
      setNoveltyObservation(existingNovelty.observation || "");
    } else {
      setNoveltyType("");
      setNoveltyObservation("");
    }

    setShowNoveltyDialog(true);
  };

  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const handleSaveNovelty = async () => {
    if (!selectedDate || !schedule) return;

    setSaving(true);
    try {
      const noveltyData: Novelty = {
        date: selectedDate.toISOString(),
        type: noveltyType,
        observation: noveltyObservation,
        scheduleId: schedule.id
      };

      // Actualizar el estado local
      const existingIndex = novelties.findIndex(n =>
        isSameDay(new Date(n.date), selectedDate)
      );

      if (existingIndex >= 0) {
        // Actualizar novedad existente
        const updatedNovelties = [...novelties];
        updatedNovelties[existingIndex] = { ...noveltyData, id: novelties[existingIndex].id };
        setNovelties(updatedNovelties);
      } else {
        // Agregar nueva novedad
        setNovelties([...novelties, { ...noveltyData, id: Date.now().toString() }]);
      }

      toast({
        title: "Novedad guardada",
        description: "La novedad ha sido registrada exitosamente",
      });

      setShowNoveltyDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al guardar la novedad",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Agregar esta función para actualizar el horario
  const updateWorkDaySchedule = (date: Date, startTime: string, endTime: string) => {
    if (!schedule) return;

    const dateString = date.toISOString().split('T')[0];
    const updatedWorkDays = [...schedule.workDays];
    const existingIndex = updatedWorkDays.findIndex(wd =>
      wd.date.startsWith(dateString)
    );

    if (existingIndex >= 0) {
      // Actualizar día existente
      updatedWorkDays[existingIndex] = {
        ...updatedWorkDays[existingIndex],
        startTime,
        endTime
      };
    } else {
      // Agregar nuevo día laboral
      updatedWorkDays.push({
        date: date.toISOString(),
        startTime,
        endTime
      });
    }

    // Actualizar el estado del horario
    setSchedule({
      ...schedule,
      workDays: updatedWorkDays
    });
  };

  // Modificar handleUpdateWorkHours para usar esta función
  const handleUpdateWorkHours = async () => {
    if (!selectedDate || !schedule || !newStartTime || !newEndTime) return;

    setSaving(true);
    try {
      // Actualizar el estado local
      updateWorkDaySchedule(selectedDate, newStartTime, newEndTime);

      // Aquí iría la llamada al API para guardar los cambios
      // await scheduleService.updateWorkDay(schedule.id, selectedDate.toISOString(), newStartTime, newEndTime);

      toast({
        title: "Horario actualizado",
        description: `Las horas de trabajo para el ${format(selectedDate, 'dd/MM/yyyy')} han sido actualizadas a ${newStartTime} - ${newEndTime}`,
      });

      setShowNoveltyDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar el horario",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Cargando detalle del horario...</p>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">No se encontró el horario</p>
          <Button onClick={() => navigate("/horario-usuario")} className="mt-4">
            Volver al listado
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/horarios-de-trabajo")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Detalle del Horario</h1>
          
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información del Usuario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Nombre Completo</Label>
              <p className="text-lg font-medium">
                {schedule.user.name} {schedule.user.last_name}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Email</Label>
              <p className="text-sm">{schedule.user.email}</p>
            </div>
            <div className="pt-2 border-t space-y-2">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Patrón de Trabajo</Label>
                <div className="mt-2 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Días laborales:</span> {schedule.working_days}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Días de descanso:</span> {schedule.rest_days}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Fecha de inicio de vacaciones:</span> {schedule.vacationStartDate ? format(new Date(schedule.vacationStartDate), "dd/MM/yyyy") : "No definida"}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Número de días de vacaciones:</span> {schedule.vacationDays || 0}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={schedule.repeatMonthly ? "default" : "secondary"}>
                      {schedule.repeatMonthly ? "Repetición mensual" : "Horario único"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-2">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendario de Trabajo
            </CardTitle>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Días laborales</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Días de descanso</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Vacaciones</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Con novedad</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-2 border-b">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  Hoy
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0">
              {/* Week Days Header */}
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                <div key={day} className="p-2 text-xs font-medium text-muted-foreground text-center border-b">
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {getDaysInMonth().map((date, index) => {
                const isCurrentMonth = format(date, 'M') === format(currentMonth, 'M');
                const isToday = isSameDay(date, new Date());
                const workDay = getWorkDaySchedule(date);
                const novelty = getNovelty(date);
                const isWork = isWorkDay(date);
                const isRest = isRestDay(date);
                const isVacation = isVacationDay(date);

                return (
                  <div
                    key={index}
                    className={`
                      min-h-[80px] p-1 border-r border-b cursor-pointer hover:bg-muted/50 transition-colors
                      ${!isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : ''}
                      ${isToday ? 'bg-primary/10' : ''}
                      ${isVacation ? 'bg-blue-50 hover:bg-blue-100' : ''}
                      ${isWork && !isVacation ? 'bg-green-50 hover:bg-green-100' : ''}
                      ${isRest && !isVacation ? 'bg-red-50 hover:bg-red-100' : ''}
                      ${novelty ? 'bg-yellow-50 hover:bg-yellow-100' : ''}
                    `}
                    onClick={() => handleDayClick(date)}
                  >
                    <div className="flex flex-col h-full">
                      <div className={`
                        text-sm font-medium mb-1
                        ${isToday ? 'text-primary font-bold' : ''}
                        ${!isCurrentMonth ? 'text-muted-foreground' : ''}
                      `}>
                        {format(date, 'd')}
                      </div>

                      {isVacation && (
                        <div className="text-xs space-y-1 flex-1">
                          <div className="bg-blue-500 text-white px-1 py-0.5 rounded text-center flex items-center justify-center gap-1">
                            <Umbrella className="h-3 w-3" />
                            Vacaciones
                          </div>
                        </div>
                      )}

                      {workDay && !isVacation && (
                        <div className="text-xs space-y-1 flex-1">
                          <div className="bg-green-500 text-white px-1 py-0.5 rounded text-center">
                            {workDay.startTime} - {workDay.endTime}
                          </div>
                        </div>
                      )}

                      {novelty && (
                        <div className="text-xs">
                          <div className="bg-yellow-500 text-white px-1 py-0.5 rounded text-center truncate">
                            {novelty.type}
                          </div>
                        </div>
                      )}

                      {isRest && !workDay && !isVacation && (
                        <div className="text-xs">
                          <div className="bg-red-500 text-white px-1 py-0.5 rounded text-center">
                            Descanso
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Novelty Dialog */}
      <Dialog open={showNoveltyDialog} onOpenChange={setShowNoveltyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gestión de Día Laboral</DialogTitle>
            <DialogDescription>
              {selectedDate && (
                <>Fecha seleccionada: {format(selectedDate, 'dd/MM/yyyy')}</>
              )}
            </DialogDescription>
          </DialogHeader>

          {editingWorkDay && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="start-time">Hora de inicio</Label>
                <Select value={newStartTime} onValueChange={setNewStartTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar hora..." />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="end-time">Hora de fin</Label>
                <Select value={newEndTime} onValueChange={setNewEndTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar hora..." />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleUpdateWorkHours}
                disabled={!newStartTime || !newEndTime || saving}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Guardando..." : "Actualizar Horario"}
              </Button>

              <div className="border-t pt-4 mt-4">
                <Label className="text-sm font-medium">Agregar Novedad</Label>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="novelty-type">Tipo de Novedad</Label>
              <Select value={noveltyType} onValueChange={setNoveltyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar novedad..." />
                </SelectTrigger>
                <SelectContent>
                  {noveltyTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="observation">Observación (Opcional)</Label>
              <Textarea
                id="observation"
                placeholder="Comentarios adicionales..."
                value={noveltyObservation}
                onChange={(e) => setNoveltyObservation(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoveltyDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveNovelty} disabled={!noveltyType || saving}>
              {saving ? "Guardando..." : "Guardar Novedad"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}