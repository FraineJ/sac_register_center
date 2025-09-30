import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { maneuverService } from '@/services/maneuver.service';
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { vesselService } from "@/services/vessel.service";
import { IFleet } from "./interfaces/fleet.interface";
import { fleetService } from "@/services/fleet.service";

interface Activity {
  id: string;
  title: string;
  date: string;
  time: string;
}

interface SupportVessel {
  id: string;
  name: string;
}

interface Maneuver {
  id: number;
  maneuverTypeId: string;
  requiresSupport: boolean;
  clientId: number;
  fleetId: number;
  vesselId: number;
  supportVessels: any[];
  countryId: number;
  municipalityId: number;
  plannedDate: string;
  startTime: string | null;
  endTime: string | null;
  portName: string;
  status: "Programada" | "En Progreso" | "Completada";
  businessId: number;
  createdAt: string;
  updatedAt: string;
  fleet: {
    id: number;
    name: string;
  };
  country: {
    id: number;
    name: string;
  };
  client: {
    id: number;
    clientName: string;
    vessels: Ivercel[]
  };
}

interface Ivercel {
  id: string;
  name: string;
}

export default function ManeuverDetails() {
  const { id } = useParams<{ id: string }>();
  const [maneuver, setManeuver] = useState<Maneuver | null>(null);
  const [loading, setLoading] = useState(true);
  const [vessels, setVessel] = useState([]);
  const [fleets, setFleet] = useState<IFleet[]>([]);


  // Activities state
  const [activities, setActivities] = useState<Activity[]>([

  ]);
  const [newActivity, setNewActivity] = useState({ title: "", date: "", time: "" });

  // Support vessels state
  const [selectedSupportVessels, setSelectedSupportVessels] = useState<SupportVessel[]>([]);
  const [availableSupportVessels, setAvailableSupportVessels] = useState<SupportVessel[]>([]);

  // Mock data for captains
  const mockCaptains = [
    { id: "1", name: "Juan Pérez" },
    { id: "2", name: "María García" },
    { id: "3", name: "Carlos López" },
  ];

  useEffect(() => {
    const fetchManeuver = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await maneuverService.listById(Number(id));

        if (response?.status === 200 || response?.status === 201) {
          setManeuver(response.data);
          listVesselByClient(response.data.client.id)

        }
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo cargar los detalles de la maniobra",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchManeuver();
    listFleet()
  }, [id]);

  const listFleet = async () => {
    try {
      const response = await fleetService.list();
      setFleet(response.data);

      // Transformar los datos de la flota para usar en support vessels
      const supportVesselsData = response.data.map((fleet: IFleet) => ({
        id: fleet.id.toString(),
        name: fleet.name
      }));

      setAvailableSupportVessels(supportVesselsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las embarcaciones",
        variant: "destructive",
      });
    }
  };

  const listVesselByClient = async (clientId: number) => {
    try {
      const response = await vesselService.listVersselByClient(clientId);
      if (response.status == 200 || response.status == 201) {
        setVessel(response.data);
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar los paises",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-6">Cargando detalles de la maniobra...</div>;
  }

  if (!maneuver) {
    return <div className="p-6">Maniobra no encontrada</div>;
  }

  // Parse the maneuver dates
  const maneuverDate = new Date(maneuver.plannedDate);
  const maneuverEndDate = maneuver.endTime ? new Date(maneuver.endTime) : null;

  // Format date for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long'
    });
  };

  // Activity functions
  const addActivity = () => {
    if (newActivity.title && newActivity.date && newActivity.time) {
      const activity: Activity = {
        id: Date.now().toString(),
        title: newActivity.title,
        date: newActivity.date,
        time: newActivity.time
      };
      setActivities([...activities, activity]);
      setNewActivity({ title: "", date: "", time: "" });
      toast({
        title: "Actividad agregada",
        description: "La actividad se agregó correctamente",
      });
    }
  };

  const removeActivity = (activityId: string) => {
    setActivities(activities.filter(activity => activity.id !== activityId));
    toast({
      title: "Actividad eliminada",
      description: "La actividad se eliminó correctamente",
    });
  };

  // Support vessel functions
  const addSupportVessel = (vesselId: string) => {
    const vessel = availableSupportVessels.find(v => v.id === vesselId);
    if (vessel) {
      setSelectedSupportVessels([...selectedSupportVessels, vessel]);
      setAvailableSupportVessels(availableSupportVessels.filter(v => v.id !== vesselId));
    }
  };

  const removeSupportVessel = (vesselId: string) => {
    const vessel = selectedSupportVessels.find(v => v.id === vesselId);
    if (vessel) {
      setAvailableSupportVessels([...availableSupportVessels, vessel].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedSupportVessels(selectedSupportVessels.filter(v => v.id !== vesselId));
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Detalle de la maniobra</h1>
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Motonave Card */}
          <Card>
            <CardHeader>
              <CardTitle>{maneuver.client.vessels[0].name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Unidad</p>
                    <p className="font-medium">{maneuver.fleet.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tipo de Maniobra</p>
                    <p className="font-medium">{maneuver.maneuverTypeId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cliente</p>
                    <p className="font-medium">{maneuver.client.clientName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Puerto</p>
                    <p className="font-medium">{maneuver.portName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">País</p>
                    <p className="font-medium">{maneuver.country.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Estado</p>
                    <Badge variant={maneuver.status === "Programada" ? "secondary" :
                      maneuver.status === "En Progreso" ? "default" : "outline"}>
                      {maneuver.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Fecha Planeada</p>
                    <p className="font-medium">{format(new Date(maneuver.plannedDate), "dd/MM/yyyy HH:mm")}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Requiere Apoyo</p>
                    <p className="font-medium">{maneuver.requiresSupport ? "Sí" : "No"}</p>
                  </div>
                </div>


                <div>
                  <Calendar
                    mode="single"
                    selected={maneuverDate}
                    className="rounded-md border p-2 mb-2"
                    disabled={(date) => {
                      // Only show the maneuver date
                      return date < maneuverDate || date > maneuverDate;
                    }}
                  />
                  <div className="flex justify-end">
                    <Button onClick={addActivity} size="sm">
                      <Plus className="h-4 w-4" /> Reprogramar
                    </Button>
                  </div>

                </div>

              </div>


            </CardContent>
          </Card>

          {/* Activities Card */}
          <Card>
            <CardHeader>
              <CardTitle>Actividades de la maniobra</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Add Activity Form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 border rounded-lg bg-muted/50">
                  <div>
                    <Label htmlFor="activity-title">Nombre de la actividad</Label>
                    <Input
                      id="activity-title"
                      placeholder="Ej: Zarpe del remolcador"
                      value={newActivity.title}
                      onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="activity-date">Fecha</Label>
                    <Input
                      id="activity-date"
                      type="date"
                      value={newActivity.date}
                      onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label htmlFor="activity-time">Hora</Label>
                      <Input
                        id="activity-time"
                        type="time"
                        value={newActivity.time}
                        onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                      />
                    </div>
                    <Button onClick={addActivity} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Activities List */}
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start justify-between gap-4 p-3 border rounded-lg">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-2 h-2 mt-2 rounded-full bg-primary"></div>
                        <div className="flex-1">
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(activity.date), "dd/MM/yyyy")} - {activity.time}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeActivity(activity.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Captain Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle>Seleccionar capitán</CardTitle>
            </CardHeader>
            <CardContent>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Elegir capitán para la maniobra" />
                </SelectTrigger>
                <SelectContent>
                  {mockCaptains.map((captain) => (
                    <SelectItem key={captain.id} value={captain.id}>
                      {captain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Support Vessels Card */}
          <Card>
            <CardHeader>
              <CardTitle>Embarcaciones de apoyo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Add Support Vessel */}
                {availableSupportVessels.length > 0 && (
                  <Select onValueChange={addSupportVessel}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Añadir embarcaciones" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSupportVessels.map((vessel) => (
                        <SelectItem key={vessel.id} value={vessel.id}>
                          {vessel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {availableSupportVessels.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay más embarcaciones disponibles
                  </p>
                )}

                {/* Selected Support Vessels */}
                <div className="space-y-3">
                  {selectedSupportVessels.map((vessel) => (
                    <div key={vessel.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <div>
                          <p className="font-medium">{vessel.name}</p>
                          <p className="text-sm text-muted-foreground">Embarcación asignada</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSupportVessel(vessel.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {selectedSupportVessels.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay embarcaciones de apoyo asignadas
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Calendar Card */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Calendario de la maniobra</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={maneuverDate}
                className="rounded-md border p-2"
                disabled={(date) => {
                  // Only show the maneuver date
                  return date < maneuverDate || date > maneuverDate;
                }}
              />
            </CardContent>
          </Card> */}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-4">
        <Button variant="outline" onClick={() => window.history.back()}>Cancelar</Button>
        <Button className="bg-blue-600 hover:bg-blue-700">Guardar cambios</Button>
        <Button className="hover:bg-blue-700">Enviar</Button>

      </div>
    </div>
  );
}