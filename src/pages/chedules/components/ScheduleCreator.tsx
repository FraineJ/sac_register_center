import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Clock, User, Calendar as CalendarIconLarge, Save, X, Copy, RefreshCw, ChevronLeft, ChevronRight, Umbrella } from "lucide-react";
import { format, addDays, addMonths, differenceInDays, isSameDay, startOfDay, isAfter, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, subMonths, getMonth, getYear } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { IUser } from "../../Users/interfaces/user.interface";
import { Slider } from "@/components/ui/slider";


interface WorkDay {
  date: Date;
  startTime: string;
  endTime: string;
}

interface SchedulePattern {
  workDays: WorkDay[];
  restDays: Date[];
}

interface ScheduleCreatorProps {
  users: IUser[];
  onSave: (scheduleData: any) => void;
  onCancel: () => void;
  saving: boolean;
  editingSchedule?: any;
}

const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return [
    { value: `${hour}:00`, label: `${hour}:00` },
    { value: `${hour}:30`, label: `${hour}:30` }
  ];
}).flat();

export default function ScheduleCreator({ users, onSave, onCancel, saving, editingSchedule }: ScheduleCreatorProps) {
  const [selectedUser, setSelectedUser] = useState<IUser>();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [vacationStartDate, setVacationSelectedDate] = useState<Date>();
  const [schedulePattern, setSchedulePattern] = useState<SchedulePattern>({ workDays: [], restDays: [] });
  const [selectedUserData, setSelectedUserData] = useState<IUser | null>(null);
  const [vacationDays, setVacationDays] = useState<number | null>(null);
  const [repeatMonthly, setRepeatMonthly] = useState(true);
  const [isDefineVacation, setDefineVacation] = useState(false);
  const [bulkStartTime, setBulkStartTime] = useState("08:00");
  const [bulkEndTime, setBulkEndTime] = useState("17:00");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [workingDays, setWorkingDays] = useState(5);
  const [restDays, setRestDays] = useState(2);

  useEffect(() => {
    if (selectedUser && selectedDate) {
      const userData = users.find(u => u.id === selectedUser.id);
      setSelectedUserData(userData || null);
      const visualPattern = generateYearlyPattern(selectedDate);
      setSchedulePattern(visualPattern);
    }
  }, [selectedUser, selectedDate, users, repeatMonthly, isDefineVacation, bulkStartTime, bulkEndTime, workingDays, restDays]);

  // MODIFICADO: Ahora usa workingDays y restDays de los sliders
  const generateYearlyPattern = (startDate: Date): SchedulePattern => {
    if (!startDate || workingDays <= 0) return { workDays: [], restDays: [] };

    const pattern: SchedulePattern = { workDays: [], restDays: [] };
    const cycleDays = workingDays + restDays;
    let currentDate = new Date(startDate);

    // Generate pattern for the rest of the current year
    const currentYear = getYear(startDate);
    const endOfYear = new Date(currentYear, 11, 31); // December 31st

    let dayIndex = 0;
    while (currentDate <= endOfYear) {
      const cyclePosition = dayIndex % cycleDays;
      const isWorkDay = cyclePosition < workingDays;

      if (isWorkDay) {
        pattern.workDays.push({
          date: new Date(currentDate),
          startTime: bulkStartTime,
          endTime: bulkEndTime,
        });
      } else {
        pattern.restDays.push(new Date(currentDate));
      }

      currentDate = addDays(currentDate, 1);
      dayIndex++;
    }

    return pattern;
  };

  const updateWorkDayTime = (date: Date, field: 'startTime' | 'endTime', value: string) => {
    setSchedulePattern(prev => ({
      ...prev,
      workDays: prev.workDays.map(workDay =>
        isSameDay(workDay.date, date)
          ? { ...workDay, [field]: value }
          : workDay
      )
    }));
  };

  const applyBulkTimes = () => {
    setSchedulePattern(prev => ({
      ...prev,
      workDays: prev.workDays.map(workDay => ({
        ...workDay,
        startTime: bulkStartTime,
        endTime: bulkEndTime
      }))
    }));

    toast({
      title: "Horarios aplicados",
      description: "Los horarios se han aplicado a todos los días laborales",
    });
  };

  const handleUserChange = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setSelectedUser(user);
    setSelectedUserData(user || null);
  };

  const isValidStartDate = (date: Date) => {
    const today = startOfDay(new Date());
    return isAfter(date, today) || isSameDay(date, today);
  };

  const handleSave = () => {
    if (!selectedUser || !selectedDate) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    if (!isValidStartDate(selectedDate)) {
      toast({
        title: "Error",
        description: "La fecha de inicio no puede ser anterior a hoy",
        variant: "destructive"
      });
      return;
    }

    const scheduleData = generateScheduleToSave(
      schedulePattern,
      selectedDate,
      repeatMonthly,
      isDefineVacation,
      vacationStartDate || new Date(),
      vacationDays || 0,
      workingDays, // MODIFICADO: Usa workingDays del slider
      restDays // MODIFICADO: Usa restDays del slider
    );

    onSave(scheduleData);
  };

  const generateScheduleToSave = (
    visualPattern: SchedulePattern,
    startDate: Date,
    repeatMonthly: boolean,
    isDefineVacation: boolean,
    vacationStartDate: Date,
    vacationDays: number,
    workingDays: number, // MODIFICADO: Parámetro actualizado
    restDays: number // MODIFICADO: Parámetro actualizado
  ) => {
    const workDaysToSave = visualPattern.workDays
      .filter(workDay => differenceInDays(workDay.date, startDate) >= 0)
      .slice(0, workingDays);

    return {
      userId: selectedUser?.id || '',
      startDate,
      workDays: workDaysToSave,
      repeatMonthly,
      isDefineVacation,
      working_days: workingDays, // MODIFICADO: Usa workingDays del slider
      rest_days: restDays, // MODIFICADO: Usa restDays del slider
      vacationStartDate,
      vacationDays: vacationDays
    };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const isWorkDay = (date: Date) => {
    return schedulePattern.workDays.some(workDay => isSameDay(workDay.date, date));
  };

  const isRestDay = (date: Date) => {
    return schedulePattern.restDays.some(restDay => isSameDay(restDay, date));
  };

  const getWorkDaySchedule = (date: Date) => {
    return schedulePattern.workDays.find(workDay => isSameDay(workDay.date, date));
  };

  const isVacationDay = (date: Date) => {
    if (!vacationStartDate || !vacationDays) return false;
    const startDate = new Date(vacationStartDate);
    const endDate = addDays(startDate, vacationDays - 1);
    return date >= startDate && date <= endDate;
  };

  // Set current month to show from current month onwards
  useEffect(() => {
    const today = new Date();
    setCurrentMonth(today);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User and Date Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {editingSchedule ? 'Editar Horario' : 'Configuración Inicial'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* User Selector */}
            <div className="space-y-2">
              <Label htmlFor="user">Usuario</Label>
              <Select
                value={selectedUser?.id || ""}
                onValueChange={handleUserChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar usuario..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name} {user.last_name}</span>
                        {user.working_days && user.rest_days && (
                          <span className="text-xs text-muted-foreground">
                            {user.working_days}d trabajo, {user.rest_days}d descanso
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Días trabajados al mes */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Días trabajados al mes</Label>
              <div className="space-y-3">
                <Slider
                  value={[workingDays]}
                  onValueChange={(value) => setWorkingDays(value[0])}
                  max={31}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 día</span>
                  <span className="font-medium text-foreground">{workingDays} días</span>
                  <span>31 días</span>
                </div>
              </div>
            </div>


            {/* Start Date Calendar */}
            <div className="space-y-2">
              <Label>Fecha de Inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Seleccionar fecha..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => !isValidStartDate(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {selectedDate && !isValidStartDate(selectedDate) && (
                <p className="text-sm text-destructive">
                  La fecha debe ser hoy o una fecha futura
                </p>
              )}
            </div>


            {/* Días de descanso al mes */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Días de descanso al mes</Label>
              <div className="space-y-3">
                <Slider
                  value={[restDays]}
                  onValueChange={(value) => setRestDays(value[0])}
                  max={31}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0 días</span>
                  <span className="font-medium text-foreground">{restDays} días</span>
                  <span>31 días</span>
                </div>
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-4">
              {/* Repeat Monthly */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Repetir mensualmente</Label>
                  <p className="text-xs text-muted-foreground">
                    El horario se aplicará automáticamente cada mes
                  </p>
                </div>
                <Switch
                  checked={repeatMonthly}
                  onCheckedChange={setRepeatMonthly}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Definir vacaciones</Label>
                </div>
                <Switch
                  checked={isDefineVacation}
                  onCheckedChange={setDefineVacation}
                />
              </div>

              {isDefineVacation && (
                <div>
                  <div className="space-y-2">
                    <Label>Fecha de Inicio de vacaciones</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !vacationStartDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {vacationStartDate ? format(vacationStartDate, "PPP") : "Seleccionar fecha..."}
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={vacationStartDate}
                          onSelect={setVacationSelectedDate}
                          disabled={(date) => !isValidStartDate(date)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    {vacationStartDate && !isValidStartDate(vacationStartDate) && (
                      <p className="text-sm text-destructive">
                        La fecha debe ser hoy o una fecha futura
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vacationDays">Días de vacaciones</Label>
                    <Input
                      id="vacationDays"
                      type="number"
                      min="1"
                      value={vacationDays || ""}
                      onChange={(e) => setVacationDays(parseInt(e.target.value) || 0)}
                      placeholder="Ingrese cantidad de días"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* User Information - MODIFICADO: Ahora muestra información del patrón configurado */}
            {selectedUserData && (
              <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">Patrón de Trabajo Configurado</h4>
                <div className="text-xs text-muted-foreground">
                  <p><span className="font-medium">Días laborales:</span> {workingDays}</p>
                  <p><span className="font-medium">Días de descanso:</span> {restDays}</p>
                  <p><span className="font-medium">Ciclo total:</span> {workingDays + restDays} días</p>
                </div>
                {selectedUserData.working_days && selectedUserData.rest_days && (
                  <div className="text-xs text-blue-600 mt-2">
                    <p><span className="font-medium">Patrón original del usuario:</span> {selectedUserData.working_days}d trabajo, {selectedUserData.rest_days}d descanso</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Yearly Calendar Pattern */}
        {selectedDate && selectedUserData && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIconLarge className="h-5 w-5" />
                Patrón de Horario - Año {getYear(selectedDate)}
              </CardTitle>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Días laborales</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Días de descanso</span>
                </div>
                {isDefineVacation && vacationStartDate && vacationDays && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Vacaciones</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-4 border-b">
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
                    disabled={getMonth(currentMonth) < getMonth(new Date()) && getYear(currentMonth) <= getYear(new Date())}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateMonth('next')}
                    disabled={getYear(currentMonth) > getYear(selectedDate) || (getYear(currentMonth) === getYear(selectedDate) && getMonth(currentMonth) >= 11)}
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
                  const isWork = isWorkDay(date);
                  const isRest = isRestDay(date);
                  const isVacation = isVacationDay(date);

                  return (
                    <div
                      key={index}
                      className={`
                        min-h-[80px] p-1 border-r border-b transition-colors
                        ${!isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : ''}
                        ${isToday ? 'bg-primary/10' : ''}
                        ${isVacation ? 'bg-blue-50' : ''}
                        ${isWork && !isVacation ? 'bg-green-50' : ''}
                        ${isRest && !isVacation ? 'bg-red-50' : ''}
                      `}
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
        )}
      </div>

      {/* Bulk Schedule Configuration */}
      {schedulePattern.workDays.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5" />
              Asignación de Horarios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Bulk Times */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 flex-1">
                <Label className="text-sm font-medium min-w-fit">Horario para todos:</Label>
                <Select value={bulkStartTime} onValueChange={setBulkStartTime}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground">-</span>
                <Select value={bulkEndTime} onValueChange={setBulkEndTime}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={applyBulkTimes}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Aplicar a todos
                </Button>
              </div>
            </div>

            {/* Individual Time Editing (first 30 days) */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Editar horarios individuales (primeros 30 días del año)
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {schedulePattern.workDays.slice(0, 30).map((workDay, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <div className="w-16 text-sm font-medium">
                      {format(workDay.date, "dd/MM")}
                    </div>
                    <div className="flex items-center gap-1 flex-1">
                      <Select
                        value={workDay.startTime}
                        onValueChange={(value) => updateWorkDayTime(workDay.date, 'startTime', value)}
                      >
                        <SelectTrigger className="w-20 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map((time) => (
                            <SelectItem key={time.value} value={time.value}>
                              {time.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-xs text-muted-foreground">-</span>
                      <Select
                        value={workDay.endTime}
                        onValueChange={(value) => updateWorkDayTime(workDay.date, 'endTime', value)}
                      >
                        <SelectTrigger className="w-20 h-8 text-xs">
                          <SelectValue />
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
                  </div>
                ))}
              </div>
              {schedulePattern.workDays.length > 30 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Mostrando los primeros 30 días laborales. Los horarios se aplicarán al patrón completo del año.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {selectedUser && selectedDate && schedulePattern.workDays.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onCancel}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1"
                disabled={saving || !isValidStartDate(selectedDate)}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Guardando...' : (editingSchedule ? 'Actualizar' : 'Guardar')} Horario
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}