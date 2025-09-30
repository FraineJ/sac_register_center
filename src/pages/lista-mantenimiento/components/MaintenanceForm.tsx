import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X, Info } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { IFleet } from "@/pages/operations/interfaces/fleet.interface";
import { fleetService } from "@/services/fleet.service";
import { toast } from "@/hooks/use-toast";
import { rolService } from "@/services/rol.services";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";



interface Step {
  id?: string;
  title: string;
  description: string;
  supplies?: Supply[]; // Añadir esta propiedad
}

interface Supply {
  id: string;
  name: string;
  quantity: number;
}

const maintenanceSchema = z.object({
  // Paso 1: Datos Actividad
  activityTitle: z.string().min(1, "El título es requerido"),
  name: z.string().min(1, "El nombre es requerido"),
  supplies: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "El nombre del insumo es requerido"),
    quantity: z.number().min(1, "La cantidad debe ser al menos 1")
  })).min(1, "Debe agregar al menos un insumo"),

  // Paso 2: Pasos de la Actividad  
  steps: z.array(z.object({
    title: z.string().min(1, "El título del paso es requerido"),
    description: z.string().min(1, "La descripción es requerida")
  })).min(1, "Debe agregar al menos un paso"),

  // Paso 3: Datos adicionales
  responsibleRole: z.string().min(1, "Cargo del responsable es requerido"),
  activityType: z.string().min(1, "Tipo de actividad es requerido"),
  preNoticeDate: z.date().optional(),
  initialDate: z.date().optional(),
  preAlertNumber: z.number(),
  noticeNumber: z.number().optional(),
  vesselDate: z.date().optional(),
  startDate: z.date().optional(),
  notifyDate: z.date().optional(),
  activationType: z.string().optional(),
  activationFrequency: z.number().optional(),
  notificationValue: z.string().optional(),
  teams: z.array(z.string()).default([]),
  fleetId: z.string().min(1, "La embarcación es requerida"),
  assignedTeam: z.string().optional()
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

interface MaintenanceFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editingMaintenance?: any; // Datos del mantenimiento a editar
}

interface Role {
  id?: string;
  name: string;
  description: string;
}

export function MaintenanceForm({ onSuccess, onCancel, editingMaintenance }: MaintenanceFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [supplies, setSupplies] = useState([{ id: "1", name: "", quantity: 1 }]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [fleets, setFleet] = useState<IFleet[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedActivationType, setSelectedActivationType] = useState<string>("");


  const form = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      activityTitle: editingMaintenance?.activityTitle || "",
      name: editingMaintenance?.name || editingMaintenance?.activityTitle || "",
      supplies: supplies,
      steps: steps,
      responsibleRole: editingMaintenance?.responsibleName || "",
      activityType: editingMaintenance?.activityType?.toLowerCase() || "",
      teams: selectedTeams,
      fleetId: "",
      notificationValue: "",
      assignedTeam: ""
    }
  });

  useEffect(() => {
    listFleet();
    listRoles();

    // Si hay datos de edición, cargar los valores
    if (editingMaintenance) {
      form.setValue("activityTitle", editingMaintenance.activityTitle);
      form.setValue("name", editingMaintenance.name || editingMaintenance.activityTitle);
      form.setValue("responsibleRole", editingMaintenance.responsibleName);
      form.setValue("activityType", editingMaintenance.activityType.toLowerCase());

      if (editingMaintenance.plannedDate) {
        form.setValue("startDate", new Date(editingMaintenance.plannedDate));
      }
    }
  }, [editingMaintenance]);

  const onSubmit = (data: MaintenanceFormData) => {
    console.log("Datos del mantenimiento:", data);
    onSuccess();
  };

  const nextStep = async () => {
    // Validate current step before proceeding
    let fieldsToValidate = [];

    if (currentStep === 1) {
      fieldsToValidate = ['name', 'responsibleRole', 'activityType', 'fleetId'];
      if (selectedActivationType === "calendario") {
        fieldsToValidate.push('startDate');
      } else if (selectedActivationType) {
        fieldsToValidate.push('initialDate', 'notificationValue');
      }
    } else if (currentStep === 2) {
      fieldsToValidate = ['steps'];
    } else if (currentStep === 3) {
      fieldsToValidate = ['supplies'];
    }

    const isValid = await form.trigger(fieldsToValidate as any);

    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else if (isValid && currentStep === 3) {
      form.handleSubmit(onSubmit)();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addSupply = () => {
    const newSupply = { id: Date.now().toString(), name: "", quantity: 1 };
    const updatedSupplies = [...supplies, newSupply];
    setSupplies(updatedSupplies);
    form.setValue("supplies", updatedSupplies);
  };

  const removeSupply = (index: number) => {
    const newSupplies = supplies.filter((_, i) => i !== index);
    setSupplies(newSupplies);
    form.setValue("supplies", newSupplies);
  };

  const updateSupply = (index: number, field: string, value: string | number) => {
    const newSupplies = [...supplies];
    newSupplies[index] = { ...newSupplies[index], [field]: value };
    setSupplies(newSupplies);
    form.setValue("supplies", newSupplies);
  };

  const addStep = () => {
    const newStep = { title: "", description: "" };
    const updatedSteps = [...steps, newStep];
    setSteps(updatedSteps);
    form.setValue("steps", updatedSteps);
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);
    form.setValue("steps", newSteps);
  };

  const updateStep = (index: number, field: string, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
    form.setValue("steps", newSteps);
  };

  const toggleTeam = (team: string) => {
    const newTeams = selectedTeams.includes(team)
      ? selectedTeams.filter(t => t !== team)
      : [...selectedTeams, team];
    setSelectedTeams(newTeams);
    form.setValue("teams", newTeams);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === currentStep ? 'bg-primary text-primary-foreground' :
            step < currentStep ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
            }`}>
            {step}
          </div>
          {step < 3 && <div className="w-20 h-0.5 bg-muted mx-2" />}
        </div>
      ))}
    </div>
  );

  const renderStepTitle = () => {
    const titles = [
      "Datos Actividad",
      "Pasos de La Actividad",
      "Insumos de Actividad"
    ];
    return (
      <h2 className="text-mb font-semibold text-center mb-6">
        {titles[currentStep - 1]}
      </h2>
    );
  };

  const listFleet = async () => {
    try {
      const response = await fleetService.list();
      setFleet(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las embarcaciones",
        variant: "destructive",
      });
    }
  };

  const listRoles = async () => {
    try {
      const response = await rolService.list();
      setRoles(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los roles",
        variant: "destructive",
      });
    }
  };

  const getSelectBorderStyle = (fieldName: keyof MaintenanceFormData) => {
    return form.formState.errors[fieldName] ? "border-destructive" : "";
  };

  const handleActivationTypeChange = (value: string) => {
    setSelectedActivationType(value);
    form.setValue("activationType", value);

    // Clear related fields when activation type changes
    if (value !== "calendario") {
      form.setValue("startDate", undefined);
      form.setValue("preNoticeDate", undefined);
      form.setValue("notifyDate", undefined);
    } else {
      form.setValue("initialDate", undefined);
      form.setValue("notificationValue", "");
    }
  };


  const getFrequencyTooltip = (activationType: string) => {
    switch (activationType) {
      case "combustible":
        return "Cantidad de combustible que deben consumirse para generar una actividad de mantenimiento";
      case "horas_automatico":
        return "Horas de operación automática que deben acumularse para generar una actividad mantenimiento";
      case "horas_manual":
        return "Horas de operación manual que deben registrarse para de generar una actividad mantenimiento";
      case "calendario":
        return "Días que deben transcurrir entre cada mantenimiento programado";
      default:
        return "Configure la frecuencia con la que se generarán los mantenimientos automáticamente";
    }
  };

  const addStepSupply = (stepIndex: number) => {
    const updatedSteps = [...steps];
    if (!updatedSteps[stepIndex].supplies) {
      updatedSteps[stepIndex].supplies = [];
    }
    updatedSteps[stepIndex].supplies!.push({
      id: Date.now().toString(),
      name: '',
      quantity: 1
    });
    setSteps(updatedSteps);
  };

  const removeStepSupply = (stepIndex: number, supplyIndex: number) => {
    const updatedSteps = [...steps];
    updatedSteps[stepIndex].supplies!.splice(supplyIndex, 1);
    setSteps(updatedSteps);
  };

  const updateStepSupply = (stepIndex: number, supplyIndex: number, field: string, value: any) => {
    const updatedSteps = [...steps];
    if (!updatedSteps[stepIndex].supplies) {
      updatedSteps[stepIndex].supplies = [];
    }
    updatedSteps[stepIndex].supplies![supplyIndex] = {
      ...updatedSteps[stepIndex].supplies![supplyIndex],
      [field]: value
    };
    setSteps(updatedSteps);
  };

  return (
    <div className="w-full mx-auto p-6 rounded-lg border">
      {renderStepIndicator()}
      {renderStepTitle()}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Paso 1: Datos Actividad */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ingrese el nombre de la actividad" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="responsibleRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo Del Responsable</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar Cargo Del Responsable" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id || role.name} value={role.name}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="activityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona El Tipo De Actividad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="preventivo">Preventivo</SelectItem>
                          <SelectItem value="correctivo">Correctivo</SelectItem>
                          <SelectItem value="predictivo">Predictivo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="activationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de activador</FormLabel>
                      <Select
                        onValueChange={handleActivationTypeChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo de activador" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="combustible">Combustible</SelectItem>
                          <SelectItem value="horas_automatico">Horas de trabajo automático</SelectItem>
                          <SelectItem value="horas_manual">Horas de trabajo manual</SelectItem>
                          <SelectItem value="calendario">Calendario</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Mostrar campos según el tipo de activador */}
                {selectedActivationType === "calendario" ? (
                  <>
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de inicio</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Selecciona Una Fecha</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="activationFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frecuencia</FormLabel>
                          <Select
                            defaultValue={field.value.toString() ?? ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo de frecuencia" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="7">Semanal</SelectItem>
                              <SelectItem value="15">Quicenal</SelectItem>
                              <SelectItem value="30">Mensual</SelectItem>
                              <SelectItem value="183">Semestral</SelectItem>
                              <SelectItem value="365">Anual</SelectItem>

                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preNoticeDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pre avisar</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Selecciona Una Fecha</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notifyDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notificar</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Selecciona Una Fecha</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : selectedActivationType && (
                  <>
                    <FormField
                      control={form.control}
                      name="initialDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor inicial</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ingrese el valor inicial"
                              value={field.value ? new Date(field.value).getTime() : ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value ? new Date(parseInt(value)) : undefined);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notificationValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1 mb-4">
                            Frecuencia
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 cursor-help text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>{getFrequencyTooltip(selectedActivationType)}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={
                                selectedActivationType === "calendario"
                                  ? "Días entre mantenimientos"
                                  : "Valor umbral"
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Espacio vacío para mantener el layout de 3 columnas */}
                    <FormField
                      control={form.control}
                      name="preAlertNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pre avisar</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={
                                selectedActivationType === "combustible"
                                  ? "Ej: 50 (litros restantes para notificar)"
                                  : selectedActivationType === "horas_automatico"
                                    ? "Ej: 10 (horas restantes para notificar)"
                                    : selectedActivationType === "horas_manual"
                                      ? "Ej: 5 (horas restantes para notificar)"
                                      : "Valor para pre-notificación"
                              }
                              value={field.value ? new Date(field.value).getTime() : ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value ? new Date(parseInt(value)) : undefined);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="noticeNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notificar</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                                placeholder={
                                selectedActivationType === "combustible"
                                  ? "Cantidad restantes para notificar"
                                  : selectedActivationType === "horas_automatico"
                                    ? "Ej: 4 (horas restantes para notificar)"
                                    : selectedActivationType === "horas_manual"
                                      ? "Ej: 5 (horas restantes para notificar)"
                                      : "Valor para pre-notificación"
                              }
                              value={field.value ? new Date(field.value).getTime() : ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value ? new Date(parseInt(value)) : undefined);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">

                <FormField
                  control={form.control}
                  name="fleetId"
                  render={({ field }) => {
                    const error = form.formState.errors.fleetId;
                    return (
                      <FormItem>
                        <FormLabel className={error ? "text-destructive" : ""}>
                          Unidad
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className={getSelectBorderStyle("fleetId")}>
                              <SelectValue placeholder="Seleccionar Embarcación" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fleets.map((vessel) => (
                              <SelectItem key={vessel.id} value={vessel.id?.toString() || ''}>
                                {vessel.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="assignedTeam"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>
                          Asignar a Equipo
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar Equipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="team1">Equipo 1</SelectItem>
                            <SelectItem value="team2">Equipo 2</SelectItem>
                            <SelectItem value="team3">Equipo 3</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
            </div>
          )}

          {/* Paso 2: Pasos de la Actividad con Insumos */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Paso {index + 1}</h3>
                    {steps.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeStep(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name={`steps.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título del paso</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Título del paso"
                            onChange={(e) => {
                              field.onChange(e);
                              updateStep(index, 'title', e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`steps.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Descripción detallada del paso"
                            onChange={(e) => {
                              field.onChange(e);
                              updateStep(index, 'description', e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Insumos para este paso específico */}
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-medium">Insumos para este paso</h4>

                    {step.supplies?.map((supply, supplyIndex) => (
                      <div key={supplyIndex} className="grid grid-cols-12 gap-4 items-end p-3 bg-muted/30 rounded-md">
                        <div className="col-span-5">
                          <FormItem>
                            <FormLabel>Insumo</FormLabel>
                            <Input
                              placeholder="Nombre del insumo"
                              value={supply.name || ''}
                              onChange={(e) => updateStepSupply(index, supplyIndex, 'name', e.target.value)}
                            />
                          </FormItem>
                        </div>

                        <div className="col-span-4">
                          <FormItem>
                            <FormLabel>Cantidad</FormLabel>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Cantidad"
                              value={supply.quantity || ''}
                              onChange={(e) => updateStepSupply(index, supplyIndex, 'quantity', parseInt(e.target.value) || 0)}
                            />
                          </FormItem>
                        </div>

                        <div className="col-span-3">
                          {(step.supplies?.length || 0) > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() => removeStepSupply(index, supplyIndex)}
                              className="w-full"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      onClick={() => addStepSupply(index)}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Insumo a este Paso
                    </Button>
                  </div>
                </div>
              ))}

              <Button type="button" onClick={addStep} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Paso
              </Button>
            </div>
          )}

          {/* Paso 3: Resumen de la Actividad */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-lg mb-4">Resumen de la Actividad</h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="font-medium mb-2">Información General</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Nombre:</span> {form.getValues('name')}</p>
                      <p><span className="font-medium">Responsable:</span> {form.getValues('responsibleRole')}</p>
                      <p><span className="font-medium">Tipo:</span> {form.getValues('activityType')}</p>
                      <p><span className="font-medium">Activador:</span> {form.getValues('activationType')}</p>
                      <p><span className="font-medium">Centro de costo:</span> {
                        fleets.find(f => f.id?.toString() === form.getValues('fleetId'))?.name
                      }</p>
                      <p><span className="font-medium">Equipo asignado:</span> {form.getValues('assignedTeam')}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Configuración de Notificaciones</h4>
                    <div className="space-y-2 text-sm">
                      {selectedActivationType === "calendario" ? (
                        <>
                          <p><span className="font-medium">Fecha inicio:</span> {
                            form.getValues('startDate') ? format(form.getValues('startDate'), "PPP") : 'No definido'
                          }</p>
                          <p><span className="font-medium">Pre-aviso:</span> {
                            form.getValues('preNoticeDate') ? format(form.getValues('preNoticeDate'), "PPP") : 'No definido'
                          }</p>
                          <p><span className="font-medium">Notificación:</span> {
                            form.getValues('notifyDate') ? format(form.getValues('notifyDate'), "PPP") : 'No definido'
                          }</p>
                        </>
                      ) : (
                        <>
                          <p><span className="font-medium">Frecuencia:</span> {form.getValues('notificationValue') || 'No definido'}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Pasos de la Actividad</h4>
                  <div className="space-y-4">
                    {steps.map((step, index) => (
                      <div key={index} className="p-3 border rounded-md">
                        <h5 className="font-medium">Paso {index + 1}: {step.title}</h5>
                        <p className="text-sm text-muted-foreground mb-3">{step.description}</p>

                        {step.supplies && step.supplies.length > 0 && (
                          <div className="mt-2">
                            <h6 className="text-sm font-medium mb-1">Insumos requeridos:</h6>
                            <ul className="text-sm space-y-1">
                              {step.supplies.map((supply, sIndex) => (
                                <li key={sIndex}>• {supply.name} - Cantidad: {supply.quantity}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={currentStep === 1 ? onCancel : prevStep}
            >
              {currentStep === 1 ? 'Cancelar' : 'Atrás'}
            </Button>

            <Button
              type="button"
              onClick={nextStep}
            >
              {currentStep === 3 ? 'Finalizar' : 'Siguiente'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}