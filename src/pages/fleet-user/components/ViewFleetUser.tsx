
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Download,
  Calendar,
  Flag,
  Ship,
  User,
  Gauge,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building,
  Search,
  Filter,
  Bell,
  Clock,
  Eye
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { fleetService } from '@/services/fleet.service';
import { toast } from '@/components/ui/use-toast';

interface IFleet {
  id?: string;
  name: string;
  identification: string;
  flag: string;
  type: string;
  capacity: number;
  isOwner: boolean;
  documents: Array<{
    id: string;
    name: string;
    url?: string;
    expirationDate?: string;
    uploadedAt?: string;
    expires?: boolean;
    windowStart?: string;
    windowEnd?: string;
    notification?: Array<{
      fleetDocumentId: number
    }>
  }>;
  image?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  businessId?: number;
  user?: {
    id: number;
    name: string;
    email: string;
    documentType: string;
    identification: string;
    address: string;
    phone?: string;
    companyName?: string;
    taxId?: string;
  };

}

// Servicio para obtener los datos de la embarcación
const fetchVesselData = async (id: string): Promise<IFleet> => {

  const dataUser = localStorage.getItem("dataUser");
  const parsedData = JSON.parse(dataUser);

  try {
    const response = await fleetService.getFleetById(Number(id), parsedData.userData.id);
    return response.data;
  } catch (error) {
    toast({
      title: "Error",
      description: "No se pudieron cargar las embarcaciones",
      variant: "destructive",
    });
  }
};

const ViewFleetUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vessel, setVessel] = useState<IFleet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVesselData = async () => {
      if (!id) {
        setError('ID de embarcación no proporcionado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const vesselData = await fetchVesselData(id);
        setVessel(vesselData);
        setError(null);
      } catch (err) {
        setError('Error al cargar los datos de la embarcación');
        console.error('Error loading vessel data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadVesselData();
  }, [id]);

  const handleClose = () => {
    navigate(-1); // Regresa a la página anterior
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-ES');
  };

  const getStatusBadge = (status?: string) => {
    const s = status?.toLowerCase();
    if (s === 'inactive') return <Badge variant="secondary" className="bg-gray-500">Inactivo</Badge>;
    if (s === 'maintenance') return <Badge variant="outline" className="border-yellow-500 text-yellow-700">En mantenimiento</Badge>;
    if (s === 'active') return <Badge className="bg-green-500">Activo</Badge>;
    return <Badge variant="outline">Desconocido</Badge>;
  };

  const getDocumentStatus = (document: any) => {
    if (!document.expirationDate) return { status: 'unknown', label: 'Sin fecha', variant: 'secondary' as const };

    const expiration = new Date(document.expirationDate);
    const today = new Date();
    const diffTime = expiration.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'expired', label: 'Vencido', variant: 'destructive' as const };
    } else if (diffDays <= 30) {
      return { status: 'warning', label: 'Por vencer', variant: 'default' as const };
    } else {
      return { status: 'valid', label: 'Vigente', variant: 'outline' as const };
    }
  };

  const handleDownloadDocument = async (documentItem: any) => {
    if (documentItem?.url) {
      try {
        const response = await fleetService.downloadFile(documentItem.url);

        // Crear un blob con la respuesta
        const blob = new Blob([response.data], {
          type: response.headers['content-type']
        });

        // Crear URL temporal para el blob
        const downloadUrl = window.URL.createObjectURL(blob);

        // Crear elemento anchor para la descarga
        const link = document.createElement('a');
        link.href = downloadUrl;

        // Obtener el nombre del archivo de los headers o generar uno
        const contentDisposition = response.headers['content-disposition'];
        let fileName = documentItem.name || 'document';

        // Intentar extraer el nombre del archivo del header Content-Disposition
        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
          if (fileNameMatch && fileNameMatch.length === 2) {
            fileName = fileNameMatch[1];
          }
        }

        link.setAttribute('download', fileName);
        document.body.appendChild(link);

        // Simular click para descargar
        link.click();

        // Limpiar
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);

      } catch (error) {
        console.error('Error downloading file:', error);
        // Puedes mostrar una notificación al usuario aquí
      }
    } else {
      console.log('Descargando documento simulado:', documentItem);
    }
  };

  const handleNotifyClient = (document: any) => {
    console.log('Notificar al cliente sobre:', document.name);
    // Implementar lógica de notificación
  };

  const handleViewHistory = (documentUrl: string, documentName: string) => {

    // Validaciones
    if (!documentUrl) {
      return;
    }

    try {
      const url = new URL(documentUrl);

      // Lista de extensiones que los navegadores pueden visualizar directamente
      const viewableExtensions = [
        // Documentos
        '.pdf', '.txt', '.html', '.htm',
        // Imágenes
        '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp',
        // Audio/Video
        '.mp3', '.mp4', '.webm', '.ogg',
        // Otros
        '.json', '.xml', '.csv'
      ];

      const extension = documentUrl.toLowerCase().substring(documentUrl.lastIndexOf('.'));

      if (viewableExtensions.includes(extension)) {
        window.open(documentUrl, '_blank');
      } else {

        toast(
          {
            title: "Error al abrir el documento",
            description: `El archivo ${documentName} puede no poder visualizarse en el navegador`,
            variant: "destructive"
          }
        );


      }

    } catch (error) {
      toast(
        {
          title: "Error al abrir el documento",
          description: `El archivo ${documentName} puede no poder visualizarse en el navegador`,
          variant: "destructive"
        }
      );
      window.open(documentUrl, '_blank');
    }
  };

  // Estados de carga y error
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información de la embarcación...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">❌</div>
          <p className="text-gray-900 font-semibold mb-2">Error</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleClose} className="rounded-lg">
            Volver
          </Button>
        </div>
      </div>
    );
  }

  if (!vessel) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 font-semibold mb-2">Embarcación no encontrada</p>
          <p className="text-gray-600 mb-4">La embarcación solicitada no existe.</p>
          <Button onClick={handleClose} className="rounded-lg">
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={handleClose} className="rounded-lg">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detalles de la Embarcación</h1>
              <p className="text-gray-600">Información completa y documentos asociados</p>
            </div>
          </div>
          <div className="flex items-center gap-2">

            <Button onClick={handleClose} className="rounded-lg">
              Cerrar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Columna izquierda - Información de la Embarcación */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información de la Embarcación */}
            <div className="bg-white rounded-lg border border-slate-300 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de la Embarcación</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <section className="">
                  {vessel.image ? (
                    <div className="rounded-xl overflow-hidden border bg-black/5">
                      <img
                        src={vessel.image}
                        alt={`Imagen de ${vessel.name}`}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-64 border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground bg-muted/30">
                      <div className="text-center">
                        <Ship className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Sin imagen</p>
                      </div>
                    </div>
                  )}
                </section>
                <div className='space-y-4'>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nombre</label>
                    <p className="text-gray-900 font-semibold">{vessel.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Registro</label>
                    <p className="text-gray-900 font-semibold">{vessel.identification}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Bandera</label>
                    <div className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-900">{vessel.flag}</span>
                    </div>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tipo</label>
                    <div className="flex items-center gap-2">
                      <Ship className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-900">{vessel.type}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Estado</label>
                    <div className="mt-1">{getStatusBadge(vessel.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Capacidad</label>
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-900">{vessel.capacity} toneladas</span>
                    </div>
                  </div>
                </div>


              </div>
            </div>
          </div>

        
        </div>

        {/* Documentos */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Documentos</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre..."
                  className="pl-9 w-64 rounded-lg"
                />
              </div>
              <Button variant="outline" className="rounded-lg">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>

          {/* Tabla de Documentos */}
          <div className="rounded-lg border border-slate-300 bg-white overflow-hidden">
            <table className="min-w-full table-fixed">
              <colgroup>
                <col className="w-[20%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
                <col className="w-[18%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
              </colgroup>

              <thead>
                <tr className="text-sm font-medium text-white bg-primary">
                  <th scope="col" className="px-4 py-3 text-left">Documento</th>
                  <th scope="col" className="px-4 py-3 text-center">Inicio de Ventana</th>
                  <th scope="col" className="px-4 py-3 text-center">Fin de Ventana</th>
                  <th scope="col" className="px-4 py-3 text-center">Fecha de Expiración</th>
                  <th scope="col" className="px-4 py-3 text-center">Estado</th>
                  <th scope="col" className="px-4 py-3 text-center">Cliente Notificado</th>
                  <th scope="col" className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 text-sm">
                {vessel.documents && vessel.documents.length > 0 ? (
                  vessel.documents.map((doc) => {
                    const statusInfo = getDocumentStatus(doc);
                    return (
                      <tr key={doc.id} className="hover:bg-slate-50">
                        <td className="px-4 py-4 text-slate-900">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-slate-400 flex-shrink-0" />
                            <span className="font-medium break-words">{doc.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-700 text-center">
                          {doc.windowStart ? formatDate(doc.windowStart) : '—'}
                        </td>
                        <td className="px-4 py-4 text-slate-700 text-center">
                          {doc.windowEnd ? formatDate(doc.windowEnd) : '—'}
                        </td>
                        <td className="px-4 py-4 text-slate-700 text-center">
                          {doc.expirationDate ? formatDate(doc.expirationDate) : '—'}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Badge
                            variant={statusInfo.variant}
                            className={`rounded-full ${statusInfo.status === 'expired' ? 'bg-red-100 text-red-800 border-red-200' :
                              statusInfo.status === 'warning' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                'bg-green-100 text-green-800 border-green-200'
                              }`}
                          >
                            {statusInfo.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                            <span className="text-slate-600 text-sm">{doc.notification.length > 0 ? 'Si' : 'No'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadDocument(doc)}
                              className="h-8 w-8 p-0 rounded-lg text-slate-600 hover:text-sky-600 hover:bg-slate-100"
                              aria-label="Ver documento"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                      
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewHistory(doc.url, doc.name)}
                              className="h-8 w-8 p-0 rounded-lg text-slate-600 hover:text-sky-600 hover:bg-slate-100"
                              aria-label="Ver historial"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                      <p>No hay documentos asociados a esta embarcación</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewFleetUser;
