import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { Plus, Search, Filter, X, ChevronsUpDown, Check } from "lucide-react";
import { Input } from "@/components/ui/input";

import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

import { CreateManeuverForm } from './components/ManeuverForm';
import { maneuverService } from '@/services/maneuver.service';
import { format } from "date-fns";
import { IFleet } from "./interfaces/fleet.interface";

interface IManeuver {
  id: number;
  embarcacion: string;
  tipoManiobra: string;
  client: Iclient;
  fleet: IFleet,
  plannedDate: string;
  horaFinalizacion: string;
  status: "Programada" | "Reprogramada" | "Completada";
  maneuverTypeId: string,
  portName: string
}

interface Iclient {
  id: string;
  clientName: string;
  vessels: Ivercel[]
}

interface Ivercel {
  id: string;
  name: string;
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "Programada":
      return "secondary";
    case "Reprogramada":
      return "default";
    case "Completada":
      return "outline";
    default:
      return "secondary";
  }
};

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case "Programada":
      return "bg-orange-100 text-orange-800 hover:bg-orange-200";
    case "Reprogramada":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "Completada":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    default:
      return "";
  }
};

export default function Operations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todas");
  const [selectedManeuver, setSelectedManeuver] = useState<IManeuver | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Estado para controlar el diálogo
  const navigate = useNavigate();
  const [maneuvers, setManeuver] = useState<IManeuver[]>([]);

  useEffect(() => {
    listManeuver();
  }, []);

  const listManeuver = async () => {
    try {
      const response = await maneuverService.list();
      if (response.status == 200 || response.status == 201) {
        setManeuver(response.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar los paises",
        variant: "destructive",
      });
    }
  };

  const filteredData = maneuvers.filter((maneuver: any) => {
    const matchesSearch = maneuver.maneuverTypeId.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeTab === "todas") return matchesSearch;

    const statusMap = {
      "programadas": "Programada",
      "en-progreso": "Reprogramada",
      "completadas": "Completada"
    };

    return matchesSearch && maneuver.status === statusMap[activeTab as keyof typeof statusMap];
  });

  const handleRowClick = (maneuver: IManeuver) => {
    if (maneuver.status === "Completada") {
      navigate(`/maniobra-completada/${maneuver.id}`);
    } else {
      navigate(`/maniobra-detalle/${maneuver.id}`);
    }
  };

  const handleManeuverCreated = (newManeuver: IManeuver) => {
    // Agregar la nueva maniobra a la lista
    setManeuver(prev => [...prev, newManeuver]);
    // Cerrar el diálogo
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Maniobras</h1>
          <p className="text-muted-foreground">Gestión de operaciones marítimas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Maniobra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Maniobra</DialogTitle>
            </DialogHeader>
            <CreateManeuverForm
              onSuccess={handleManeuverCreated}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar maniobras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Content */}
      <Card>
        <CardHeader className="pb-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="programadas">Programadas</TabsTrigger>
              <TabsTrigger value="en-progreso">Reprogramada</TabsTrigger>
              <TabsTrigger value="completadas">Completadas</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="font-semibold">Unidad</TableHead>
                  <TableHead className="font-semibold">Maniobra</TableHead>
                  <TableHead className="font-semibold">Embarcación del cliente</TableHead>
                  <TableHead className="font-semibold">Fecha planeada</TableHead>
                  <TableHead className="font-semibold">Puerto</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="font-semibold text-center">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((maneuver) => (
                  <TableRow key={maneuver.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{maneuver.fleet.name}</TableCell>
                    <TableCell>
                      {maneuver.maneuverTypeId}

                    </TableCell>
                    <TableCell className="text-center">
                      {maneuver.client.vessels[0].name}
                    </TableCell>
                    <TableCell>
                      {format(new Date(maneuver.plannedDate), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell>{maneuver.portName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(maneuver.status)}
                        className={getStatusBadgeStyle(maneuver.status)}
                      >
                        {maneuver.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRowClick(maneuver)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {maneuver.status == 'Programada' ? 'Gestionar' : 'Ver detalle'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredData.length === 0 && (
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
    </div>
  );
}