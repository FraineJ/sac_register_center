import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Filter, Calendar, Upload, ImageIcon, Edit, Trash2, Eye, Plus, FileText, ArrowLeft } from 'lucide-react';
import { fleetService } from '@/services/fleet.service';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@radix-ui/react-toast';
import ViewFleetUser from './components/ViewFleetUser';
import { clientService } from '@/services/client.services';
import { IClient } from '../lista-clientes/interfaces/client.interface';
import { listDocumentService } from '@/services/list_document.service';
import { IListDocument } from './interfaces/list_document';
import { useNavigate } from 'react-router-dom';


interface IDocument {
  id: string;
  file: File | null;
  expirationDate: string;
  name?: string;
  type?: string;
  expires: boolean;
  listDocumentId: string
}

interface IFleet {
  id?: string,
  name: string,
  identification: string,
  flag: string,
  type: string,
  capacity: number,
  documents: IDocument[],
  image: File | null,
  status?: string,
  createdAt?: string
}

const FleetUser = () => {
  const { toast } = useToast();
  const [fleets, setFleet] = useState<IFleet[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [documents, setDocuments] = useState<IDocument[]>([
    {
      id: '1',
      file: null,
      expirationDate: '',
      name: '',
      type: '',
      expires: true,
      listDocumentId: ''
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<IClient[]>([]);
  const [listDocuments, setListDocuments] = useState<IListDocument[]>([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    identification: '',
    flag: '',
    type: '',
    capacity: '',
    documents: [],
    image: null as File | null,
    armador: ''
  });


  useEffect(() => {
    listClient();
    listFleet();
    getListDocument();
  }, []);

  const viewVessel = (vesselId: string) => {
    // Navegar directamente a la página de edición usando el ID
    navigate(`/fleet-details/${vesselId}`);
  };

  const listFleet = async () => {

    const userData = localStorage.getItem("dataUser");
    const user = JSON.parse(userData)

    try {
      const response = await fleetService.getFleetByUser(user.userData.id);
      setFleet(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las embarcaciones",
        variant: "destructive",
      });
    }
  };

  // Datos simulados de embarcaciones registradas
  const registeredVessels = [];


  const listClient = async () => {
    const response = await clientService.list();
    if (response.status == 200 || response.status == 201) {

      setClients(response.data)
    }
  };

  const getListDocument = async () => {
    const response = await listDocumentService.get();
    if (response.status == 200 || response.status == 201) {

      setListDocuments(response.data)
    }
  };


  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showForm && (<Button
              variant="outline"
              size="icon"
             
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>)}
            <h1 className="text-3xl font-bold text-foreground">Mis Embarcaciones</h1>
          </div>
        </div>
      </div>


      <div>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Embarcaciones Registradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Matricula</TableHead>
                    <TableHead>Bandera</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className='text-center'>Capacidad</TableHead>
                    <TableHead className='text-center'>Fecha de Registro</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fleets.map((vessel) => (
                    <TableRow key={vessel.id}>
                      <TableCell className="font-medium">{vessel.name}</TableCell>
                      <TableCell>{vessel.identification}</TableCell>
                      <TableCell>{vessel.flag}</TableCell>
                      <TableCell>{vessel.type}</TableCell>
                      <TableCell className='text-center'>{vessel.capacity}</TableCell>

                      <TableCell className='text-center'>{new Date(vessel.createdAt).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm"
                            className="h-8 w-8 p-0 hover:bg-indigo-400 hover:text-white"
                            onClick={() => viewVessel(vessel.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {fleets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No hay embarcaciones disponibles.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default FleetUser;
