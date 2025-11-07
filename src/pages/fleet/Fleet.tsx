import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Filter, Calendar, Upload, ImageIcon, Edit, Trash2, Eye, Plus, FileText, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { fleetService } from '@/services/fleet.service';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ToastAction } from '@radix-ui/react-toast';
import FleetDetails from './components/FleetDetails';
import { clientService } from '@/services/client.services';
import { IClient } from '../lista-clientes/interfaces/client.interface';
import { listDocumentService } from '@/services/list_document.service';
import { IListDocument } from './interfaces/list_document';
import { useNavigate } from 'react-router-dom';
import { Role } from '../roles/interfaces/rol.interface';
import { rolService } from '@/services/rol.services';
import { MultiSelect } from './components/MultiSelect';


interface IDocument {
  id: string;
  file: File | null;
  expirationDate: string;
  name?: string;
  type?: string;
  expires: boolean;
  listDocumentId: string,
  shareWith: (string | number)[];
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

const Fleet = () => {
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [fleets, setFleet] = useState<IFleet[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVessel, setEditingVessel] = useState<any>(null);
  const [documents, setDocuments] = useState<IDocument[]>([
    {
      id: '1',
      file: null,
      expirationDate: '',
      name: '',
      type: '',
      expires: true,
      listDocumentId: '',
      shareWith: []

    }
  ]);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<IClient[]>([]);
  const [listDocuments, setListDocuments] = useState<IListDocument[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<(string | number)[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    identification: '',
    flag: '',
    type: '',
    capacity: '',
    documents: [],
    image: null as File | null,
    armador: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    identification: '',
    flag: '',
    type: '',
    armador: ''
  });

  useEffect(() => {
    listClient();
    listFleet();
    getListDocument();
    listRoles();
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFiles(e.dataTransfer.files);
        setFormData(prev => ({ ...prev, image: file }));
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFiles(e.target.files);
        setFormData(prev => ({ ...prev, image: file })); // ← Esto es importante
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDeleteImage = () => {
    setSelectedFiles(null);
    setUploadedImage(null);
    setFormData(prev => ({ ...prev, image: null }));
  };

  const countries = [
    "Argentina", "Brasil", "Chile", "Colombia", "Ecuador", "Perú", "Uruguay", "Venezuela"
  ];

  const vesselTypes = [
    "Carguero", "Petrolero", "Portacontenedores", "Pesquero", "Crucero", "Ferry", "Remolcador"
  ];

  const addDocument = () => {
    // Validar documentos actuales antes de agregar uno nuevo
    if (!validateCurrentDocuments()) {
      return;
    }

    setDocuments([...documents, {
      id: Date.now().toString(),
      file: null,
      expirationDate: '',
      name: '',
      type: '',
      expires: true,
      listDocumentId: '',
      shareWith: [] // Inicializar con array vacío
    }]);
  };

  const removeDocument = (id: string) => {
    setDocuments(documents.filter(docItem => docItem.id !== id));
  };

  const updateDocument = (id: string, field: keyof IDocument, value: any) => {

    setDocuments(documents.map(docItem =>
      docItem.id === id ? { ...docItem, [field]: value } : docItem
    ));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {
      name: !formData.name ? 'El nombre es requerido' : '',
      identification: !formData.identification ? 'La matricula es requerida' : '',
      flag: !formData.flag ? 'La bandera es requerida' : '',
      type: !formData.type ? 'El tipo de embarcación es requerido' : '',
      armador: !formData.armador ? 'Debe seleccionar un armador' : ''
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (!validateForm()) {
  //     toast({
  //       title: "Error de validación",
  //       description: "Por favor complete todos los campos requeridos",
  //       variant: "destructive",
  //     });
  //     return;
  //   }



  //   setLoading(true);

  //   try {
  //     const formDataToSend = new FormData();

  //     // 1. Agregar la imagen como "logo" (nombre que espera el backend)
  //     if (formData.image) {
  //       formDataToSend.append('logo', formData.image);
  //     }

  //     // 2. Agregar campos individuales del fleet (no como JSON string)
  //     formDataToSend.append('name', formData.name);
  //     formDataToSend.append('identification', formData.identification);
  //     formDataToSend.append('flag', formData.flag);
  //     formDataToSend.append('type', formData.type);
  //     formDataToSend.append('capacity', formData.capacity);
  //     formDataToSend.append('user_id', formData.armador);

  //     // 3. Agregar documentos como archivos y metadatos
  //     const validDocuments = documents.filter(doc => doc.file && doc.expirationDate);

  //     validDocuments.forEach((doc, index) => {
  //       if (doc.file) {
  //         // Agregar el archivo del documento
  //         formDataToSend.append(`documents[${index}][file]`, doc.file);
  //         // Agregar metadatos del documento
  //         formDataToSend.append(`documents[${index}][name]`, doc.name || doc.file.name);
  //         formDataToSend.append(`documents[${index}][expirationDate]`, doc.expirationDate);
  //         formDataToSend.append(`documents[${index}][expires]`, doc.expires.toString());
  //         formDataToSend.append(`documents[${index}][listDocumentId]`, doc.listDocumentId);
  //         formDataToSend.append(`documents[${index}][shareWith]`, JSON.stringify(doc.shareWith));

  //       }
  //     });

  //     if (editingVessel) {
  //       await handleUpdateVessel(editingVessel.id, formDataToSend);
  //     } else {

  //       const hasInvalidDocuments = documents.some(doc =>
  //         (doc.file && doc.expires && !doc.expirationDate) ||
  //         (!doc.file && doc.expirationDate)
  //       );

  //       if (hasInvalidDocuments) {
  //         toast({
  //           title: "Error en documentos",
  //           description: "Cada documento debe tener tanto archivo como fecha de vencimiento",
  //           variant: "destructive",
  //         });
  //         return;
  //       }
  //       await handleCreateVessel(formDataToSend); // Cambiado a formDataToSend
  //     }

  //     resetForm();

  //   } catch (error) {
  //     handleSubmitError(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // 1. Agregar la imagen como "logo"
      if (formData.image) {
        formDataToSend.append('logo', formData.image);
      }

      // 2. Agregar campos individuales
      formDataToSend.append('name', formData.name);
      formDataToSend.append('identification', formData.identification);
      formDataToSend.append('flag', formData.flag);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('capacity', formData.capacity);
      formDataToSend.append('user_id', formData.armador);

      // 3. Agregar documentos - manejar tanto existentes como nuevos
      const validDocuments = documents.filter(doc => {
        // Para edición: incluir documentos existentes (tienen name pero no file)
        // y documentos nuevos (tienen file)
        const hasExistingFile = !!doc.name && !doc.file;
        const hasNewFile = !!doc.file;

        // Validar según si expira o no
        if (doc.expires) {
          return (hasExistingFile || hasNewFile) && doc.expirationDate;
        } else {
          return hasExistingFile || hasNewFile;
        }
      });

      console.log('Valid documents for submission:', validDocuments);

      validDocuments.forEach((doc, index) => {
        // Agregar archivo si es nuevo
        if (doc.file) {
          formDataToSend.append(`documents[${index}][file]`, doc.file);
        }

        // Agregar metadatos (para ambos: nuevos y existentes)
        formDataToSend.append(`documents[${index}][name]`, doc.name || doc.file?.name || '');
        formDataToSend.append(`documents[${index}][expirationDate]`, doc.expirationDate || '');
        formDataToSend.append(`documents[${index}][expires]`, doc.expires.toString());
        formDataToSend.append(`documents[${index}][listDocumentId]`, doc.listDocumentId);

        // Para documentos existentes, incluir el ID si existe
        if (doc.id && !doc.file) {
          formDataToSend.append(`documents[${index}][id]`, doc.id);
        }

        // Para arrays, enviar como string JSON
        if (Array.isArray(doc.shareWith)) {
          formDataToSend.append(`documents[${index}][shareWith]`, JSON.stringify(doc.shareWith));
        }
      });

      // DEBUG: Verificar lo que se envía
      console.log('FormData contents:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      if (editingVessel) {
        await handleUpdateVessel(editingVessel.id, formDataToSend);
      } else {
        await handleCreateVessel(formDataToSend);
      }

      resetForm();

    } catch (error) {
      handleSubmitError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVessel = async (formDataToSend) => {
    try {
      const response = await fleetService.create(formDataToSend);

      if (response.status >= 200 && response.status < 300) {
        setFleet(prev => [...prev, response.data]);
        toast({
          title: "Embarcación creada",
          description: response.data?.message || "La embarcación se registró exitosamente",
          variant: "default",
        });
        listFleet(); // Recargar la lista
      }

      return response;
    } catch (error) {
      throw {
        ...error,
        context: 'create',
        userMessage: error.response?.data?.message ||
          "No se pudo crear la embarcación. Verifique los datos e intente nuevamente."
      };
    }
  };

  const handleUpdateVessel = async (vesselId: number, formDataToSend) => {
    try {
      const response = await fleetService.update(vesselId, formDataToSend);

      toast({
        title: "Embarcación actualizada",
        description: response.data?.message || "Los cambios se guardaron correctamente",
        variant: "default",
      });

      return response;
    } catch (error) {
      throw {
        ...error,
        context: 'update',
        userMessage: error.response?.data?.message ||
          "No se pudieron guardar los cambios. Verifique los datos e intente nuevamente."
      };
    }
  };


  const handleSubmitError = (error: any) => {
    console.error(`Error in ${error.context || 'operation'}:`, error);

    toast({
      title: "Error",
      description: error.userMessage ||
        "Ocurrió un error inesperado. Por favor intente más tarde.",
      variant: "destructive",
      ...(error.context === 'update' && {
        action: (
          <ToastAction
            altText="Reintentar"
            onClick={() => handleSubmit}
          >
            Reintentar
          </ToastAction>
        ),
      }),
    });
  };



  const resetForm = () => {
    setFormData({
      name: '',
      identification: '',
      flag: '',
      type: '',
      capacity: '',
      documents: [],
      image: null,
      armador: ''
    });
    setSelectedFiles(null);
    setUploadedImage(null);
    setDocuments([{ file: null, expirationDate: '', id: '1', expires: true, listDocumentId: '', shareWith: [] }]);
    setShowForm(false);
    setEditingVessel(null);
  };




  const editVessel = (vessel: any) => {
    setEditingVessel(vessel);
    setFormData({
      name: vessel.name,
      identification: vessel.identification,
      flag: vessel.flag,
      type: vessel.type,
      capacity: vessel.capacity.toString(),
      documents: vessel.documents || [],
      image: null, // No establecer image aquí para evitar conflictos
      armador: vessel.user_id.toString(),
    });

    // Usar la imagen existente si está disponible
    if (vessel.logo || vessel.image) {
      setUploadedImage(vessel.logo || vessel.image);
    }

    // Manejar documentos existentes
    if (vessel.documents && vessel.documents.length > 0) {
      setDocuments(vessel.documents.map((doc: any, index: number) => {
        const expirationDate = doc.expirationDate
          ? new Date(doc.expirationDate).toISOString().split('T')[0]
          : '';

        return {
          id: doc.id?.toString() || `doc-${index}`,
          file: null, // Mantener como null para documentos existentes
          expirationDate: expirationDate,
          name: doc.name || '',
          type: doc.type || doc.name?.split('.').pop() || '',
          expires: doc.expires !== undefined ? doc.expires : true,
          listDocumentId: doc.listDocumentId?.toString() || '',
          shareWith: doc.shareWith || [] // Mantener los roles del documento
        };
      }));
    } else {
      setDocuments([{
        id: '1',
        file: null,
        expirationDate: '',
        name: '',
        type: '',
        expires: true,
        listDocumentId: '',
        shareWith: []
      }]);
    }

    setShowForm(true);
  };




  const viewVessel = (vesselId: string) => {
    // Navegar directamente a la página de edición usando el ID
    navigate(`/fleet-details/${vesselId}`);
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


  const handledeleteWithDocuments = async (fleetId: string) => {
    try {
      const fleetToDelete = fleets.find(fleet => fleet.id === fleetId);

      if (!fleetToDelete) {
        toast({
          title: "Error",
          description: "No se encontró la embarcación a eliminar",
          variant: "destructive",
        });
        return;
      }

      const response = await fleetService.deleteWithDocuments(fleetId);

      if (response.status >= 200 && response.status < 300) {
        setFleet(prev => prev.filter(fleet => fleet.id !== fleetId));

        toast({
          title: "Embarcación eliminada",
          description: `La embarcación ${fleetToDelete.name} ha sido eliminada correctamente.`,
          variant: "default",
        });
      } else {
        throw new Error(response.data?.message || 'Error desconocido al eliminar');
      }
    } catch (error: any) {

      toast({
        title: "Error al eliminar",
        description: "Ocurrió un error al intentar eliminar la embarcación",
        variant: "destructive"
      });
    }
  };

  const handleDeleteFleet = async (fleetId: string) => {
    try {
      const fleetToDelete = fleets.find(fleet => fleet.id === fleetId);

      if (!fleetToDelete) {
        toast({
          title: "Error",
          description: "No se encontró la embarcación a eliminar",
          variant: "destructive",
        });
        return;
      }

      const response = await fleetService.delete(fleetId);

      if (response.status >= 200 && response.status < 300) {
        setFleet(prev => prev.filter(fleet => fleet.id !== fleetId));

        toast({
          title: "Embarcación eliminada",
          description: `La embarcación "${fleetToDelete.name}" (${fleetToDelete.identification}) ha sido eliminada correctamente.`,
          variant: "default",
        });
      } else {
        throw new Error(response.data?.message || 'Error desconocido al eliminar');
      }
    } catch (error: any) {

      toast({
        title: "Error al eliminar",
        description: error.response?.data?.message
          || error.message
          || "Ocurrió un error al intentar eliminar la embarcación",
        variant: "destructive",
        action: (
          <ToastAction
            altText="Reintentar"
            onClick={() => handledeleteWithDocuments(fleetId)}
          >
            Eliminar
          </ToastAction>
        ),
      });
    }
  };


  // Datos simulados de embarcaciones registradas
  const registeredVessels = [];
  const [viewingVessel, setViewingVessel] = useState<any | null>(null);

  // if (viewingVessel) {
  //   return (
  //     <FleetDetails
  //       vessel={viewingVessel}
  //       onClose={() => setViewingVessel(null)}
  //       onEdit={(vessel) => {
  //         setViewingVessel(null);
  //         editVessel(vessel);
  //       }}
  //     />
  //   );
  // }

  const handleDocumentFileSelect = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      console.log("file ", file);

      // Validar tamaño del archivo (opcional: máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast({
          title: "Archivo muy grande",
          description: "El archivo no puede ser mayor a 10MB",
          variant: "destructive",
        });
        return;
      }

      // Validar tipo de archivo
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de archivo no permitido",
          description: "Solo se permiten PDF, Word, Excel e imágenes",
          variant: "destructive",
        });
        return;
      }

      // Actualizar el documento
      updateDocument(id, 'file', file);
      //updateDocument(id, 'name', file.name);
      //updateDocument(id, 'type', file.type);

      toast({
        title: "Archivo cargado",
        description: `${file.name} se ha cargado correctamente`,
        variant: "default",
      });
    }
  };


  const validateCurrentDocuments = (): boolean => {
    const incompleteDocuments = documents.filter(docItem => {
      const hasFile = docItem.file !== null;
      const hasExistingFile = !!docItem.name;

      if (docItem.expires) {
        // Para documentos que expiran, necesitan fecha y archivo (nuevo o existente)
        if ((hasFile || hasExistingFile) && !docItem.expirationDate) {
          return true;
        }
        if (!hasFile && !hasExistingFile && docItem.expirationDate) {
          return true;
        }
      } else {
        // Para documentos que no expiran, solo necesitan archivo (nuevo o existente)
        if (!hasFile && !hasExistingFile) {
          return true;
        }
      }

      return false;
    });

    if (incompleteDocuments.length > 0) {
      toast({
        title: "Documento incompleto",
        description: "Complete la información del documento actual antes de agregar uno nuevo",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // Función auxiliar para validar fechas
  const isValidDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };


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

  const listRoles = async () => {
    try {
      const response = await rolService.list();

      // Agregar el objeto al primer elemento del array
      const rolesWithClient = [
        {
          "id": 10000,
          "name": "Solo Yo",
          "description": "Compartir solo conmigo, otro usuario no podra ver este documento",
          "permissions": [
            {
              "id": 57,
              "action": "LIST",
              "action_id": 22,
              "allowed": true,
              "role_id": 62,
              "sub_menu_id": 11,
              "menu_id": 8
            },
            {
              "id": 86,
              "action": "LIST",
              "action_id": 23,
              "allowed": true,
              "role_id": 62,
              "sub_menu_id": 12,
              "menu_id": 9
            }
          ]
        },
        ...response.data
      ];

      setRoles(rolesWithClient);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los roles",
        variant: "destructive",
      });
    }
  };

  // const handleRolesChange = (selectedRoleIds: string[]) => {
  //   setFormData(prev => ({ ...prev, roles: selectedRoleIds }));
  // };

  const handleRolesChange = (docId: string, selectedRoleIds: (string | number)[]) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === docId
          ? { ...doc, shareWith: selectedRoleIds }
          : doc
      )
    );
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
              onClick={resetForm}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>)}
            <h1 className="text-3xl font-bold text-foreground">Flota</h1>
          </div>
          <div className="flex gap-3">
            {!showForm && (
              <Button
                onClick={() => {
                  setShowForm(true);
                  setEditingVessel(null);
                }}
                className="flex items-center gap-2"
              >
                Nuevo
              </Button>
            )}
          </div>
        </div>
      </div>

      {showForm ? (
        /* Formulario de creación/edición */
        <div className="grid grid-cols-1">
          <form onSubmit={handleSubmit}>
            <Card className='mb-4'>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  {editingVessel ? 'Editar embarcación' : 'Nueva embarcación'}
                </CardTitle>
              </CardHeader>

              <CardContent className="px-6 pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
                  {/* Left Section - Image Upload */}
                  <div className="space-y-6">
                    <div className="h-60 min-h-fit">
                      {uploadedImage ? (
                        <div className="relative h-full rounded-lg overflow-hidden border">
                          <img
                            src={uploadedImage}
                            alt="Imagen de la embarcación"
                            className="w-full h-full object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={handleDeleteImage}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className={`
                  border-2 border-dashed rounded-lg h-full flex flex-col items-center justify-center
                  transition-colors cursor-pointer border-border
                  ${dragActive
                              ? 'border-primary bg-primary/5'
                              : 'border-muted-foreground/25 hover:border-primary/50'
                            }
                `}
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onClick={() => document.getElementById('file-upload')?.click()}
                        >
                          <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileSelect}
                          />
                          <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-lg font-medium text-foreground mb-2">
                            Seleccione o arrastre un archivo
                          </p>
                          <p className="text-sm text-muted-foreground text-center">
                            Arrastra y suelta archivos de imagen aquí, o haz clic para seleccionar
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Section - Registration Form */}
                  <div className="space-y-6">

                    <div className='flex flex-col lg:flex-row gap-4'>
                      <div className="space-y-2 w-full">
                        <Label htmlFor="name">Nombre *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Ingrese el nombre de la embarcación"
                          className={errors.name ? "border-destructive" : "w-full"}
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                      </div>

                      <div className="space-y-2 w-full">
                        <Label htmlFor="identification">Matricula *</Label>
                        <Input
                          id="identification"
                          value={formData.identification}
                          onChange={handleInputChange}
                          placeholder="Ingrese la matricula"
                          className={errors.identification ? "border-destructive" : "w-full"}
                        />
                        {errors.identification && <p className="text-sm text-destructive">{errors.identification}</p>}
                      </div>
                    </div>

                    <div className='flex flex-col lg:flex-row gap-4 mt-4'>
                      {/* Bandera */}
                      <div className="space-y-2 w-full">
                        <Label htmlFor="flag">Bandera *</Label>
                        <Select
                          name="flag"
                          value={formData.flag}
                          onValueChange={(value) => handleSelectChange('flag', value)}
                        >
                          <SelectTrigger className={errors.flag ? "border-destructive" : ""}>
                            <SelectValue placeholder="Seleccione un país" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.flag && <p className="text-sm text-destructive">{errors.flag}</p>}
                      </div>

                      {/* Capacidad */}
                      <div className="space-y-2 w-full">
                        <Label htmlFor="capacity">Tonelajes de registro bruto (opcional)</Label>
                        <Input
                          id="capacity"
                          value={formData.capacity}
                          onChange={handleInputChange}
                          type="text"
                          placeholder="Ingrese la capacidad"
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className='flex flex-col lg:flex-row gap-4 mt-4'>
                      <div className="space-y-2 w-full">
                        <Label htmlFor="armador">Seleccionar armador *</Label>
                        <Select
                          name="armador"
                          value={formData.armador}
                          onValueChange={(value) => handleSelectChange('armador', value)}
                        >
                          <SelectTrigger className={errors.armador ? "border-destructive" : ""}>
                            <SelectValue
                              placeholder={
                                formData.armador
                                  ? `Armador seleccionado: ${formData.armador}`
                                  : "Seleccione el armador"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map((armador) => (
                              <SelectItem key={armador.id} value={armador.id.toString()}>
                                {armador.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.armador && <p className="text-sm text-destructive">{errors.armador}</p>}

                      </div>

                      {/* Tipo de embarcación */}
                      <div className="space-y-2 w-full">
                        <Label htmlFor="type">Tipo de embarcación *</Label>
                        <Select
                          name="type"
                          value={formData.type}
                          onValueChange={(value) => handleSelectChange('type', value)}
                        >
                          <SelectTrigger className={errors.type ? "border-destructive" : ""}>
                            <SelectValue placeholder="Seleccione el tipo de embarcación" />
                          </SelectTrigger>
                          <SelectContent>
                            {vesselTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
                      </div>
                    </div>

                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  Documentos de la embarcación
                </CardTitle>
              </CardHeader>

              <CardContent className="px-6 pb-2">
                <div className="space-y-3 mt-4">
                  {documents.map((docItem, index) => (
                    <div key={docItem.id} className={`flex items-center gap-3 p-3 border rounded-lg ${(docItem.file && !docItem.expirationDate) || (!docItem.file && docItem.expirationDate)
                      ? 'border-destructive bg-destructive/5'
                      : 'border-border'
                      }`}>
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`expires-${docItem.id}`}
                                checked={docItem.expires}
                                onChange={(e) => {
                                  const newValue = e.target.checked;
                                  console.log('Checkbox changed:', newValue);
                                  setDocuments(prev =>
                                    prev.map(doc =>
                                      doc.id === docItem.id
                                        ? {
                                          ...doc,
                                          expires: newValue,
                                          expirationDate: newValue ? doc.expirationDate : ''
                                        }
                                        : doc
                                    )
                                  );
                                }}
                                className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                              />
                              <Label htmlFor={`expires-${docItem.id}`} className="text-sm font-medium">
                                ¿Documento expira?
                              </Label>
                            </div>
                          </div>

                          <div className="w-48 space-y-2">
                            <Label htmlFor={`listDocumentId-${docItem.id}`}>Tipo de documento *</Label>
                            <Select
                              value={docItem.listDocumentId}
                              onValueChange={(value) => updateDocument(docItem.id, 'listDocumentId', value)}
                            >
                              <SelectTrigger
                                id={`listDocumentId-${docItem.id}`}
                                className={!docItem.listDocumentId ? "border-destructive" : ""}
                              >
                                <SelectValue placeholder="Seleccione tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                {listDocuments.map((listDoc) => (
                                  <SelectItem key={listDoc.id} value={listDoc.id.toString()}>
                                    {listDoc.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {!docItem.listDocumentId && (
                              <p className="text-xs text-destructive">Tipo de documento requerido</p>
                            )}
                          </div>


                          {/* Columna 2: Selección de archivo con tamaño limitado */}
                          <div className="flex-1 space-y-2 min-w-0">
                            <div className="flex items-center gap-2 mb-4">
                              <Label>Documento {index + 1} *</Label>
                            </div>

                            <div className="space-y-2">
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                                className="hidden"
                                id={`document-${docItem.id}`}
                                onChange={(e) => handleDocumentFileSelect(docItem.id, e)}
                              />

                              <div className="flex gap-2 items-center">
                                {/* Botón de selección de archivo con ancho fijo */}
                                <div className="w-80 min-w-48"> {/* Ancho fijo de 192px (12rem) */}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full justify-start truncate"
                                    onClick={() => window.document.getElementById(`document-${docItem.id}`)?.click()}
                                  >
                                    <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span className="truncate block">
                                      {docItem.file ? docItem.file.name : (docItem.name || 'Seleccionar archivo...')}
                                    </span>
                                  </Button>
                                </div>

                                {/* Botón de eliminar */}
                                {(docItem.file || docItem.name) && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      updateDocument(docItem.id, 'file', null);
                                      updateDocument(docItem.id, 'name', '');
                                      updateDocument(docItem.id, 'type', '');
                                    }}
                                    className="text-destructive flex-shrink-0"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>

                              {/* Información del archivo */}
                              {(docItem.file || docItem.name) && (
                                <div className="text-xs text-muted-foreground space-y-1">
                                  <p className="truncate max-w-48"> {/* Mismo ancho máximo */}
                                    {docItem.file ? `Nuevo archivo: ${docItem.type}` : `Archivo existente: ${docItem.name}`}
                                    {docItem.file && ` • Tamaño: ${(docItem.file.size / 1024 / 1024).toFixed(2)} MB`}
                                  </p>
                                  {(docItem.file && docItem.expires && !docItem.expirationDate) && (
                                    <p className="text-destructive">Fecha de expiración requerida</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>


                          <div className="flex-1 space-y-2 min-w-0">
                            <div className="flex items-center gap-2 mb-4">
                              <Label htmlFor={`roles-${docItem.id}`}>Compartir con</Label>
                            </div>
                            <MultiSelect
                              id={`roles-${docItem.id}`}
                              options={roles}
                              selectedValues={docItem.shareWith} // Usar shareWith del documento específico
                              onValueChange={(values) => handleRolesChange(docItem.id, values)} // Pasar docId
                              placeholder="Seleccionar roles..."
                              displayKey="name"
                              showBadgeCount={true}
                            />
                          </div>



                          {docItem.expires ? (
                            <div className="w-48 space-y-2">
                              <Label>Fecha de expiración *</Label>
                              <Input
                                type="date"
                                value={docItem.expirationDate}
                                onChange={(e) => updateDocument(docItem.id, 'expirationDate', e.target.value)}
                                className="text-sm"
                                min={new Date().toISOString().split('T')[0]}
                              />
                              {(!docItem.file && !docItem.name && docItem.expirationDate) && (
                                <p className="text-xs text-destructive">Archivo requerido</p>
                              )}
                            </div>
                          ) : (
                            <div className="w-48 space-y-2">
                              <Label>Fecha de expiración</Label>
                              <div className="px-3 py-2 text-sm text-muted-foreground border border-border rounded-md bg-muted/50">
                                No aplica
                              </div>
                            </div>
                          )}


                          {/* Botón eliminar documento (solo si hay más de uno) */}
                          {documents.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeDocument(docItem.id)}
                              className="text-destructive hover:text-destructive mt-6 flex-shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      {documents.filter(d => (d.file || d.name) && d.expirationDate && d.type).length} de {documents.length} documentos completos
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addDocument}
                      className="flex items-center gap-2"
                      disabled={documents.length >= 5}
                    >
                      <Plus className="h-4 w-4" />
                      Agregar documento {documents.length >= 5 && '(Máximo 5)'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* Botones */}
            <div className='w-full flex justify-end'>
              <div className="flex justify-end gap-4 pt-3 ">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={resetForm}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : (editingVessel ? 'Actualizar' : 'Guardar')} Embarcación
                </Button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        /* Tabla de Embarcaciones Registradas */
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Embarcaciones Registradas</CardTitle>
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
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm"
                              className="h-8 w-8 p-0 hover:bg-indigo-400 hover:text-white"
                              onClick={() => viewVessel(vessel.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-sky-400 hover:text-white"
                              onClick={() => editVessel(vessel)} // Pasar solo el ID
                            >
                              <Edit className="h-4 w-4" />
                            </Button>


                            {/* Eliminar */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-red-400 hover:text-white "
                                  title="Eliminar embarcación"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar embarcación?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se eliminará permanentemente la embarcación{" "}
                                    <strong>{vessel.name}</strong> del sistema.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteFleet(vessel.id)}
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
      )}
    </div>
  );
};

export default Fleet;
