import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Loader, ClipboardList, Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast, useToast } from "@/hooks/use-toast";
import { EquipmentService } from "@/services/equipment.service";
import { IEquipment } from "./interfaces/equipment.interface";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { IFleet } from "../operations/interfaces/fleet.interface";
import { fleetService } from "@/services/fleet.service";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const currencies = [
  { value: "COP", label: "COP - Peso Colombiano" },
  { value: "USD", label: "USD - Dólar Americano" },
  { value: "MXN", label: "MXN - Peso Mexicano" },
  { value: "EUR", label: "EUR - Euro" }
];

const billingTypes = [
  { value: "HOURLY", label: "Por hora" },
  { value: "MANEUVER", label: "Por maniobra" }
];

function EquipmentForm({ Equipment, onSubmit, onCancel }: {
  Equipment?: IEquipment;
  onSubmit: (data: Omit<IEquipment, 'id'>) => void;
  onCancel: () => void;
}) {

  useEffect(() => {
    listFleet();
  }, []);

  const form = useForm({
    defaultValues: {
      code: Equipment?.code || "",
      name: Equipment?.name || "",
      currency: Equipment?.currency || "",
      value: Equipment?.value,
      description: Equipment?.description,
      fleetId: Equipment?.fleetId,
      hasHourmeter: Equipment?.hasHourmeter || false, // Nuevo campo
      hourmeter: Equipment?.hourmeter || 0 // Nuevo campo
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fleets, setFleet] = useState<IFleet[]>([]);

  // Observar cambios en hasHourmeter para mostrar/ocultar el campo horómetro
  const hasHourmeter = form.watch("hasHourmeter");

  const validateForm = (data: any) => {
    const newErrors: Record<string, string> = {};

    if (!data.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!data.code.trim()) newErrors.code = 'El código es requerido';

    if (!data.fleetId) {
      newErrors.fleetId = 'La embarcación es requerida';
    }

    // Validar horómetro solo si tiene horómetro activado
    if (data.hasHourmeter && (!data.hourmeter || isNaN(data.hourmeter) || data.hourmeter < 0)) {
      newErrors.hourmeter = 'El valor del horómetro es requerido y debe ser mayor o igual a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (data: any) => {
    if (!validateForm(data)) return;

    try {
      const EquipmentData = {
        ...data,
        value: parseFloat(data.value),
        hourmeter: data.hasHourmeter ? parseFloat(data.hourmeter) : 0 // Solo enviar si tiene horómetro
      };

      if (Equipment) {
        console.log(" Equipment ", Equipment);
        const response = await EquipmentService.update(Equipment.id, EquipmentData);
        if (response.status >= 200 || response.status < 200) {
          onCancel();
          onSubmit(response.data);
          toast({
            title: "Tarifa actualizada",
            description: "La tarifa se ha actualizado correctamente",
          });
        }
      } else {
        // Si estamos creando una nueva tarifa
        const response = await EquipmentService.create(EquipmentData);
        if (response.status === 200 || response.status === 201) {
          onSubmit(response.data);
          toast({
            title: "Tarifa creada",
            description: "La tarifa se ha creado correctamente",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Ocurrió un error al procesar el activo",
        variant: "destructive"
      });
    }
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Código */}
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ingrese un código"
                    className={errors.code ? "border-destructive" : ""}
                  />
                </FormControl>
                <FormMessage />
                {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
              </FormItem>
            )}
          />

          {/* Nombre */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ingrese el nombre del activo"
                    className={errors.name ? "border-destructive" : ""}
                  />
                </FormControl>
                <FormMessage />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fleetId"
            render={({ field }) => {
              const error = errors.fleetId; // Cambiar a errors del estado local
              return (
                <FormItem>
                  <FormLabel className={error ? "text-destructive" : ""}>
                    Asignar Embarcación *
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className={error ? "border-destructive" : ""}>
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
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </FormItem>
              );
            }}
          />

          <div>
            {/* Checkbox para horómetro */}
            <FormField
              control={form.control}
              name="hasHourmeter"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="flex gap-2">
                      ¿El activo maneja horómetro?
                      {hasHourmeter && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Ingrese el valor actual del horómetro en horas</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </FormLabel>

                    <FormDescription>
                      {/* Campo horómetro (condicional) */}

                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {hasHourmeter && (
              <FormField
                control={form.control}
                name="hourmeter"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        className={errors.hourmeter ? "border-destructive" : ""}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        min="0"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                    {errors.hourmeter && <p className="text-sm text-destructive">{errors.hourmeter}</p>}

                  </FormItem>
                )}
              />
            )}

          </div>


          {/* Moneda */}
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moneda</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Precio Base */}
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className={errors.value ? "border-destructive" : ""}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <div className="relative">
                    <textarea
                      {...field}
                      rows={4}
                      placeholder="Ingrese una descripción detallada del activo"
                      className={`flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-vertical ${errors.description ? "border-destructive focus-visible:ring-destructive" : ""
                        }`}
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                      {field.value?.length || 0} caracteres
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            {Equipment ? "Actualizar" : "Crear"} Activo
          </Button>
        </div>
      </form>
    </Form>
  );
}


export default function Equipment() {
  const { toast } = useToast();
  const [Equipments, setEquipments] = useState<IEquipment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<IEquipment | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {

    listEquipment();
  }, []);

  const listEquipment = async () => {
    setIsLoading(true);
    try {
      const response = await EquipmentService.list();

      // Opción 1: Verificación simple
      setEquipments(response.data || []);

    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudieron cargar los equipos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Cargando lista de tarifas</p>
        </div>
      </div>
    );
  }

  const handleAddEquipment = (EquipmentData: IEquipment) => { // ✅ Ahora recibe Equipment completo (con id)
    // El backend debería devolver la tarifa con el ID real
    if (EquipmentData.id) {
      setEquipments(prev => [EquipmentData, ...prev]);
    } else {
      // Si por alguna razón no viene ID, recargamos la lista
      listEquipment();
    }

    setShowForm(false);

    toast({
      title: "Activo creado",
      description: `${EquipmentData.name} ha sido creado exitosamente.`,
    });
  };

  const handleEditEquipment = (EquipmentData: IEquipment) => { // ✅ Ahora recibe Equipment completo
    if (!editingEquipment) return;

    setEquipments(prev => prev.map(Equipment =>
      Equipment.id === editingEquipment.id
        ? { ...EquipmentData } // Usar los datos actualizados del backend
        : Equipment
    ));

    setEditingEquipment(undefined);
    setShowForm(false);

    toast({
      title: "Activo actualizado",
      description: `${EquipmentData.name} ha sido actualizado exitosamente.`,
    });
  };

  const handleDeleteEquipment = async (EquipmentId: number) => {


    const response = await EquipmentService.delete(EquipmentId);

    if (response.status == 200 || response.status == 201) {
      const EquipmentToDelete = Equipments.find(Equipment => Equipment.id === EquipmentId);
      setEquipments(prev => prev.filter(Equipment => Equipment.id !== EquipmentId));

      toast({
        title: "Activo eliminado",
        description: `${EquipmentToDelete?.name} ha sido eliminado del sistema.`,
        variant: "destructive"
      });

    } else {
      toast({
        title: "Activo eliminado",
        description: `Ha ocurrido un error al  eliminado el activo.`,
        variant: "destructive"
      });
    }

  };

  const handleStartEdit = (Equipment: IEquipment) => {
    setEditingEquipment(Equipment);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingEquipment(undefined);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEquipment(undefined);
  };

  const handleSubmit = editingEquipment ? handleEditEquipment : handleAddEquipment;

  const EmptyState = ({ title, description, action }) => (
    <div className="w-full  flex flex-col items-center justify-center text-center">
      <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );

  return (
    <div className="min-h-screen flex w-full bg-background">

      <div className="flex-1 p-6">
        <div className="flex items-center gap-3 mb-4 justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Lista de Activos</h1>
            <p className="text-muted-foreground">
              Gestiona la información de tus activos
            </p>
          </div>
          <div>
            <Button className="bg-primary hover:bg-primary/90"
              onClick={handleAddNew}
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Activo
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle >
              Gestión de activos
            </CardTitle>
            <Dialog open={showForm} onOpenChange={setShowForm}>

              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingEquipment ? "Editar" : "Crear"} Activo
                  </DialogTitle>
                </DialogHeader>
                <EquipmentForm
                  Equipment={editingEquipment}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>

          <CardContent>
            {Equipments.length === 0 ? (
              <EmptyState
                title="No hay equipos registrados"
                description="Crea tu primera activo para comenzar"
                action={<Button onClick={handleAddNew}>Crear Activo</Button>}
              />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Moneda</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Equipments.map((Equipment) => (
                      <TableRow key={Equipment.id}>
                        <TableCell className="font-medium">{Equipment.code}</TableCell>
                        <TableCell>{Equipment.name}</TableCell>
                        <TableCell>{Equipment.currency}</TableCell>
                        <TableCell>
                          {Equipment.value.toLocaleString('en-US', {
                            style: 'currency',
                            currency: Equipment.currency
                          })}
                        </TableCell>
                        <TableCell>
                          {Equipment.description || ''}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-info/10 hover:text-info"
                              title="Editar"
                              onClick={() => handleStartEdit(Equipment)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Eliminar"
                                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive">
                                  <Trash2 className="h-3 w-3" />

                                </Button>

                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se eliminará permanentemente el Activo con código
                                    <strong> {Equipment.code}</strong>.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteEquipment(Equipment.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}