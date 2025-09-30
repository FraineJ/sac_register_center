import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Maneuver {
  id: number;
  embarcacion: string;
  tipoManiobra: string;
  ubicacion: string;
  horaInicio: string;
  horaFinalizacion: string;
  estado: "Programada" | "En Progreso" | "Completada";
  vesselId: string;
  captain: string;
  fuelConsumption: string;
  equipmentHours: string;
  totalTime: string;
}

const mockManeuvers: Maneuver[] = [
  {
    id: 3,
    embarcacion: "Viajero Oceánico",
    tipoManiobra: "Atracando",
    ubicacion: "Puerto de San Francisco",
    horaInicio: "2024-07-15T08:00:00",
    horaFinalizacion: "2024-07-15T20:00:00",
    estado: "Completada",
    vesselId: "12345",
    captain: "Capitán Javier",
    fuelConsumption: "1500L",
    equipmentHours: "240 horas",
    totalTime: "12 horas"
  },
  {
    id: 6,
    embarcacion: "Saltador de Islas",
    tipoManiobra: "Anclando",
    ubicacion: "Isla Catalina",
    horaInicio: "2024-03-20T18:00:00",
    horaFinalizacion: "2024-03-20T19:00:00",
    estado: "Completada",
    vesselId: "67890",
    captain: "Capitán María",
    fuelConsumption: "800L",
    equipmentHours: "120 horas",
    totalTime: "6 horas"
  },
  {
    id: 9,
    embarcacion: "Saltador de Islas",
    tipoManiobra: "Anclando",
    ubicacion: "Isla Catalina",
    horaInicio: "2024-03-23T00:00:00",
    horaFinalizacion: "2024-03-23T01:00:00",
    estado: "Completada",
    vesselId: "11111",
    captain: "Capitán Carlos",
    fuelConsumption: "900L",
    equipmentHours: "150 horas",
    totalTime: "8 horas"
  }
];

const operationUpdates = [
  {
    id: 1,
    title: "Salida",
    time: "08:00 AM",
    icon: "→"
  },
  {
    id: 2,
    title: "Tránsito",
    time: "10:00 AM",
    icon: "📍"
  }
];

export default function CompletedManeuverDetails() {
  const { id } = useParams<{ id: string }>();
  const [maneuver, setManeuver] = useState<Maneuver | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      const foundManeuver = mockManeuvers.find(m => m.id.toString() === id);
      setManeuver(foundManeuver || mockManeuvers[0]);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

  if (loading) {
    return <div className="p-6">Cargando detalles de la maniobra...</div>;
  }

  if (!maneuver) {
    return <div className="p-6">Maniobra no encontrada</div>;
  }

  const maneuverDate = new Date(maneuver.horaInicio);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border bg-card p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.history.back()}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Detalle de la Maniobra - {maneuver.embarcacion}
              </h1>
              <p className="text-sm text-gray-500">
                Fecha: {formatDate(maneuverDate)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">Capitán: {maneuver.captain}</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Calendar and Vessel Details */}
          <div className="lg:col-span-4 space-y-6">
            {/* Calendar */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h3 className="font-semibold">Julio 2024</h3>
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="w-full"
              />
            </Card>

            {/* Vessel Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    🚢
                  </div>
                  Detalles de la maniobra
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Consumo de Combustible</p>
                    <p className="font-semibold">{maneuver.fuelConsumption}</p>
                  </div>
                
                </div>

                <div>
                  <p className="text-sm text-gray-500">Tiempo Total de Maniobra</p>
                  <p className="font-semibold">{maneuver.totalTime}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Map and Updates */}
          <div className="lg:col-span-8 space-y-6">
            {/* Map */}
            <Card className="h-96">
              <MapContainer
                center={[37.7749, -122.4194]} // San Francisco coordinates
                zoom={10}
                style={{ height: '384px', width: '100%' }}
                className="rounded-lg"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[37.7749, -122.4194]}>
                  <Popup>
                    {maneuver.ubicacion} - {maneuver.tipoManiobra}
                  </Popup>
                </Marker>
              </MapContainer>
            </Card>

            {/* Operation Updates */}
            <Card>
              <CardHeader>
                <CardTitle>Actualizaciones de la Operación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {operationUpdates.map((update) => (
                    <div key={update.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                        {update.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{update.title}</p>
                        <p className="text-sm text-gray-500">{update.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}