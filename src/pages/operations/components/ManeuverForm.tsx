import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countryService } from "@/services/country.service";
import { municipalityService } from "@/services/municipality.service";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";

import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";

import { fleetService } from "@/services/fleet.service";
import { clientService } from "@/services/client.services";
import { IClient } from "@/pages/lista-clientes/interfaces/client.interface";
import { maneuverService } from "@/services/maneuver.service";
import { toast } from "@/hooks/use-toast";
import { SupportVessel } from "../interfaces/suport_vessel.interface";
import { IFleet } from "../interfaces/fleet.interface";
import { ICountry } from "../interfaces/country.interface";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";


interface Vessel {
  id: string;
  name: string;
}

const mockManeuverTypes = [
  { id: "1", name: "Atracar" },
  { id: "2", name: "Desatrar" },
  { id: "3", name: "Anclar" },
  { id: "4", name: "Fondear" },
];
interface CreateManeuverFormProps {
  onSuccess: (newManeuver: any) => void;
  onCancel: () => void;
}

export function CreateManeuverForm({ onSuccess, onCancel }: CreateManeuverFormProps) {
  const form = useForm();
  const [requiresSupport, setRequiresSupport] = useState(false);
  const [supportVessels, setSupportVessels] = useState<SupportVessel[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [clients, setClients] = useState<IClient[]>([]);
  const [fleets, setFleet] = useState<IFleet[]>([]);
  const [countrys, setCountry] = useState<ICountry[]>([]);

  const [clientVessels, setClientVessels] = useState<Vessel[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const maneuverSchema = z.object({
    fleetId: z.string().min(1, "La embarcación es requerida"),
    clientId: z.string().min(1, "El cliente es requerido"),
    vesselId: z.string().min(1, "La embarcación del cliente es requerida"),
    maneuverTypeId: z.string().min(1, "El tipo de maniobra es requerido"),
    country: z.object({
      id: z.string().min(1, "El país es requerido"),
      name: z.string(),
      code: z.number(),
      currency_name: z.string()
    }, {
      required_error: "El país es requerido"
    }),
    municipalityId: z.string().min(1, "La ciudad es requerida"),
    plannedDate: z.string().min(1, "La fecha planeada es requerida")
      .refine((date) => {
        const selectedDate = new Date(date);
        const now = new Date();
        return selectedDate > now;
      }, "La fecha debe ser futura"),
    portName: z.string().min(1, "El nombre del puerto es requerido")
      .min(3, "El nombre del puerto debe tener al menos 3 caracteres")
      .max(100, "El nombre del puerto no puede exceder 100 caracteres")
  });

  type ManeuverFormData = z.infer<typeof maneuverSchema>;


  const validateManeuverForm = (data: any, requiresSupport: boolean, supportVessels: SupportVessel[]) => {
    const errors: Record<string, string> = {};

    // Validaciones básicas
    if (!data.fleetId) errors.fleetId = "La embarcación es requerida";
    if (!data.clientId) errors.clientId = "El cliente es requerido";
    if (!data.vesselId) errors.vesselId = "La embarcación del cliente es requerida";
    if (!data.maneuverTypeId) errors.maneuverTypeId = "El tipo de maniobra es requerido";

    // Validación de país
    if (!data.country || !data.country.id) {
      errors.country = "El país es requerido";
    }

    // Validación de ciudad
    if (!data.municipalityId) errors.municipalityId = "La ciudad es requerida";

    

    // Validación de puerto
    if (!data.portName) {
      errors.portName = "El nombre del puerto es requerido";
    } else if (data.portName.length < 3) {
      errors.portName = "El nombre del puerto debe tener al menos 3 caracteres";
    } else if (data.portName.length > 100) {
      errors.portName = "El nombre del puerto no puede exceder 100 caracteres";
    }

    // Validación de embarcaciones de apoyo si se requiere apoyo
    if (requiresSupport) {
      if (supportVessels.length === 0) {
        errors.supportVessels = "Debe agregar al menos una embarcación de apoyo";
      } else {
        supportVessels.forEach((vessel, index) => {
          if (!vessel.vesselId) {
            errors[`supportVessel-${index}`] = "La embarcación de apoyo es requerida";
          }
        });
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const loadCities = async (countryCode) => {
    if (!countryCode) {
      setCities([]);
      return;
    }

    setLoadingCities(true);
    try {
      const response = await municipalityService.getByCountry(countryCode);
      if (response.status === 200 || response.status === 201) {
        setCities(response.data);
      } else {
        setCities([]);
        toast({
          title: "Error",
          description: "No se pudieron cargar las ciudades",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading cities:", error);
      setCities([]);
      toast({
        title: "Error",
        description: "Error al cargar las ciudades",
        variant: "destructive",
      });
    } finally {
      setLoadingCities(false);
    }
  };


  // Manejar cambio de país
  const handleCountryChange = (countryId) => {
    setSelectedCountry(countryId);
    form.setValue('city', ''); // Resetear la selección de ciudad
  };

  useEffect(() => {
    listClient();
    listFleet();
    listCountry();
    if (selectedCountry) {
      console.log("selectedCountry ", selectedCountry);
      loadCities(selectedCountry);
    } else {
      setCities([]);
    }
  }, [selectedCountry]);

  const listClient = async () => {
    const response = await clientService.list();
    if (response.status == 200 || response.status == 201) {
      setClients(response.data);
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


  const listCountry = async () => {
    try {
      const response = await countryService.list();
      setCountry(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar los paises",
        variant: "destructive",
      });
    }
  };

 
  // Función para cargar las embarcaciones del cliente seleccionado
  const loadClientVessels = (clientId: string) => {
    const selectedClient = clients.find(client => client.id.toString() === clientId);
    if (selectedClient && selectedClient.vessels) {
      // Convertir las embarcaciones del cliente al formato Vessel
      const vessels: Vessel[] = selectedClient.vessels.map((vessel: any) => ({
        id: vessel.id.toString(),
        name: vessel.name
      }));
      setClientVessels(vessels);
    } else {
      setClientVessels([]);
    }
  };

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    loadClientVessels(clientId);
    form.setValue('clientVessel', ''); // Resetear la selección de embarcación del cliente
  };

  const addSupportVessel = () => {
    const newId = Date.now().toString();
    setSupportVessels([...supportVessels, { id: newId, vesselId: "" }]);
  };

  const removeSupportVessel = (id: string) => {
    setSupportVessels(supportVessels.filter(vessel => vessel.id !== id));
  };

  const updateSupportVessel = (id: string, vesselId: string) => {
    setSupportVessels(supportVessels.map(vessel =>
      vessel.id === id ? { ...vessel, vesselId } : vessel
    ));
  };


  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    const validation = validateManeuverForm(data, requiresSupport, supportVessels);

    if (!validation.isValid) {
      // Mostrar errores adicionales si los hay
      Object.entries(validation.errors).forEach(([field, message]) => {
        form.setError(field as any, { message });
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = {
        ...data,
        requiresSupport,
        countryId: data.country.id,

        supportVessels: requiresSupport ? supportVessels : []
      };

      const response = await maneuverService.create(formData)

      if(response.status == 200 || response.status == 201) {
        toast({
          title: "Maniobra registrada",
          description: response.data?.message || "Maniobra registrada exitosamente",
          variant: "default",
        });

        onSuccess(response.data)
      }

    } catch (error: any) {

      toast({
        title: "Error al guardar",
        description: "Ocurrió un error al guardar la maniobra",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const getInputBorderStyle = (fieldName: keyof ManeuverFormData) => {
    const error = form.formState.errors[fieldName];
    return error ? "border-red-500 focus:ring-red-500" : "";
  };

  const getSelectBorderStyle = (fieldName: keyof ManeuverFormData) => {
    const error = form.formState.errors[fieldName];
    return error ? "border-red-500" : "";
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Asignar Embarcación */}
          <FormField
            control={form.control}
            name="fleetId"
            render={({ field }) => {
              const error = form.formState.errors.fleetId;
              return (
                <FormItem>
                  <FormLabel className={error ? "text-foreground" : ""}>
                    Asignar Embarcación
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

          {/* Seleccionar Cliente */}
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => {
              const error = form.formState.errors.clientId;
              return (
                <FormItem>
                  <FormLabel className={error ? "text-foreground" : ""}>
                    Seleccionar Cliente
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleClientChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className={getSelectBorderStyle("clientId")}>
                        <SelectValue placeholder="Seleccionar Cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.clientName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {/* Seleccionar Embarcación del Cliente */}
          <FormField
            control={form.control}
            name="vesselId"
            render={({ field }) => {
              const error = form.formState.errors.vesselId;
              return (
                <FormItem>
                  <FormLabel className={error ? "text-foreground" : ""}>Seleccionar Embarcación del Cliente</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!selectedClientId}
                  >
                    <FormControl>
                      <SelectTrigger className={getSelectBorderStyle("vesselId")}>
                        <SelectValue placeholder="Seleccionar Embarcación para Cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clientVessels.length > 0 ? (
                        clientVessels.map((vessel) => (
                          <SelectItem key={vessel.id} value={vessel.id}>
                            {vessel.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="py-2 px-4 text-sm text-muted-foreground">
                          {selectedClientId ? 'El cliente no tiene embarcaciones' : 'Seleccione un cliente primero'}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {/* Tipo de Maniobra */}
          <FormField
            control={form.control}
            name="maneuverTypeId"
            render={({ field }) => {
              const error = form.formState.errors.maneuverTypeId;
              return (
                <FormItem>
                  <FormLabel className={error ? "text-foreground" : ""}>Tipo de Maniobra</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className={getSelectBorderStyle("maneuverTypeId")}>
                        <SelectValue placeholder="Seleccionar Tipo de Maniobra" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockManeuverTypes.map((type) => (
                        <SelectItem key={type.id} value={type.name}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        {/* Resto del código permanece igual */}
        {/* ... */}

        {/* Requiere apoyo */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="requiresSupport"
            checked={requiresSupport}
            onCheckedChange={(checked) => setRequiresSupport(checked === true)}
          />
          <label htmlFor="requiresSupport" className="text-sm font-medium">
            Requiere apoyo
          </label>
        </div>

        {/* Support Vessels Section */}
        {requiresSupport && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Embarcaciones de Apoyo</h3>
              <Button type="button" variant="outline" size="sm" onClick={addSupportVessel}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>

            {supportVessels.map((supportVessel) => (
              <div key={supportVessel.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <Select
                    value={supportVessel.vesselId}
                    onValueChange={(value) => updateSupportVessel(supportVessel.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar embarcación de apoyo" />
                    </SelectTrigger>
                    <SelectContent>
                      {fleets.map((vessel) => (
                        <SelectItem key={vessel.id} value={vessel.id?.toString() || ''}>
                          {vessel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeSupportVessel(supportVessel.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Ubicación de la Maniobra */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Ubicación de la Maniobra</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Seleccionar país */}
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => {
                const error = form.formState.errors.country;
                return (
                  <FormItem>
                    <FormLabel className={error ? "text-foreground" : ""}>
                      Seleccionar país
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const selectedCountry = countrys.find(country => country.id.toString() === value);
                        field.onChange(selectedCountry);
                        handleCountryChange(selectedCountry);
                      }}
                      value={field.value?.id?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className={getSelectBorderStyle("country")}>
                          <SelectValue placeholder="Seleccionar País">
                            {field.value ? field.value.name : "Seleccionar País"}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countrys.map((country) => (
                          <SelectItem key={country.id} value={country.id.toString()}>
                            {country.name}
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
              name="municipalityId"
              render={({ field }) => {
                const error = form.formState.errors.municipalityId;
                return (
                  <FormItem className="flex flex-col pt-3 m-0">
                    <FormLabel className={error ? "text-foreground" : ""}>
                      Seleccionar Ciudad
                    </FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className={`justify-between ${error ? "border-red-500" : ""}`}
                            disabled={!selectedCountry || loadingCities}
                          >
                            {field.value
                              ? cities.find(city => city.id.toString() === field.value)?.name
                              : selectedCountry ? "Seleccionar ciudad..." : "Seleccione un país primero"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 m-0">
                        <Command>
                          <CommandInput
                            placeholder="Buscar ciudad..."
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>No se encontraron ciudades.</CommandEmpty>
                            <CommandGroup>
                              {cities.map((city) => (
                                <CommandItem
                                  key={city.id}
                                  value={city.name}
                                  onSelect={() => {
                                    field.onChange(city.id.toString());
                                    setOpen(false);
                                  }}
                                >
                                  {city.name}
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      field.value === city.id.toString()
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

          </div>
        </div>

        {/* Fecha planeada */}
        <FormField
          control={form.control}
          name="plannedDate"
          render={({ field }) => {
            const error = form.formState.errors.plannedDate;
            return (
              <FormItem>
                <FormLabel className={error ? "text-foreground" : ""}>
                  Fecha planeada
                </FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    className={getInputBorderStyle("plannedDate")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* Escribir el nombre del puerto */}
        <FormField
          control={form.control}
          name="portName"
          render={({ field }) => {
            const error = form.formState.errors.portName;
            return (
              <FormItem>
                <FormLabel className={error ? "text-foreground" : ""}>
                  Escribir el nombre del puerto
                </FormLabel>
                <FormControl>
                  <Input
                    className={getInputBorderStyle("portName")}
                    placeholder="Nombre del Puerto"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "GUARDAR MANIOBRA"}
          </Button>
        </div>
      </form>
    </Form>
  );
}