import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Loader, ClipboardList } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast, useToast } from "@/hooks/use-toast";
import { tariffService } from "@/services/msterList.service";
import { IMsterList } from "./interfaces/master-list.interface";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';



function MasterList({ msterList, onSubmit, onCancel }: {
  msterList?: IMsterList;
  onSubmit: (data: Omit<IMsterList, 'id'>) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    defaultValues: {
 
      name: msterList?.name || "",
      description: msterList?.description || "",
 
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (data: any) => {
    const newErrors: Record<string, string> = {};

    if (!data.name.trim()) newErrors.name = 'El nombre es requerido';


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (data: any) => {
    if (!validateForm(data)) return;

    try {
      const tariffData = {
        ...data,
        basePrice: parseFloat(data.basePrice)
      };

      if (msterList) {
        console.log(" msterList ", msterList);
        const response = await tariffService.update(msterList.id, tariffData);
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
        const response = await tariffService.create(tariffData);
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
        description: error.response?.data?.message || "Ocurrió un error al procesar la tarifa",
        variant: "destructive"
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
     
      

          {/* Nombre */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ingrese el nombre del tarifario"
                    className={errors.name ? "border-destructive" : ""}
                  />
                </FormControl>
                <FormMessage />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
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
            {msterList ? "Actualizar" : "Crear"} 
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function () {
  const { toast } = useToast();
  const [tariffs, setTariffs] = useState<IMsterList[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTariff, setEditingTariff] = useState<IMsterList | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {

    listTariff();
  }, []);

  const listTariff = async () => {
    setIsLoading(true);
    try {
      const response = await tariffService.list();

      // Opción 1: Verificación simple
      setTariffs(response.data || []);

    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudieron cargar las tarifas",
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

  const handleAddTariff = (tariffData: IMsterList) => { // ✅ Ahora recibe IMsterList completo (con id)
    // El backend debería devolver la tarifa con el ID real
    if (tariffData.id) {
      setTariffs(prev => [tariffData, ...prev]);
    } else {
      // Si por alguna razón no viene ID, recargamos la lista
      listTariff();
    }

    setShowForm(false);

    toast({
      title: " creado",
      description: `${tariffData.name} ha sido creado exitosamente.`,
    });
  };

  const handleEditTariff = (tariffData: IMsterList) => { // ✅ Ahora recibe IMsterList completo
    if (!editingTariff) return;

    setTariffs(prev => prev.map(msterList =>
      msterList.id === editingTariff.id
        ? { ...tariffData } // Usar los datos actualizados del backend
        : msterList
    ));

    setEditingTariff(undefined);
    setShowForm(false);

    toast({
      title: " actualizado",
      description: `${tariffData.name} ha sido actualizado exitosamente.`,
    });
  };

  const handleDeleteTariff = async (tariffId: number) => {


    const response = await tariffService.delete(tariffId);

    if (response.status == 200 || response.status == 201) {
      const tariffToDelete = tariffs.find(msterList => msterList.id === tariffId);
      setTariffs(prev => prev.filter(msterList => msterList.id !== tariffId));

      toast({
        title: " eliminado",
        description: `${tariffToDelete?.name} ha sido eliminado del sistema.`,
        variant: "destructive"
      });

    } else {
      toast({
        title: " eliminado",
        description: `Ha ocurrido un error al  eliminado la tarifa.`,
        variant: "destructive"
      });
    }

  };

  const handleStartEdit = (msterList: IMsterList) => {
    setEditingTariff(msterList);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingTariff(undefined);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTariff(undefined);
  };

  const handleSubmit = editingTariff ? handleEditTariff : handleAddTariff;

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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Gestión de Tarifarios</CardTitle>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear 
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingTariff ? "Editar" : "Crear"} 
                  </DialogTitle>
                </DialogHeader>
                <MasterList
                  msterList={editingTariff}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>

          <CardContent>
            {tariffs.length === 0 ? (
              <EmptyState
                title="No hay tarifas registradas"
                description="Crea tu primera tarifa para comenzar"
                action={<Button onClick={handleAddNew}>Crear Tarifa</Button>}
              />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Moneda</TableHead>
                      <TableHead>Precio Base</TableHead>
                      <TableHead>Tipo de Cobro</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tariffs.map((msterList) => (
                      <TableRow key={msterList.id}>
                        <TableCell>{msterList.name}</TableCell>
                        <TableCell>{msterList.description}</TableCell>
                
                        <TableCell className="text-center">
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-info/10 hover:text-info"
                              title="Editar"
                              onClick={() => handleStartEdit(msterList)}
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
                                    Esta acción no se puede deshacer. Se eliminará permanentemente el  con código
                                    <strong> {msterList.name}</strong>.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteTariff(msterList.id)}
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