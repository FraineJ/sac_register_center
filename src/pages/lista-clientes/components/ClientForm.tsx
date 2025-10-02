import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Ship, Plus, Edit, Trash2, ArrowLeft, ImageIcon } from 'lucide-react';
import { IClient, IVessel, PersonType, DocumentType } from '../interfaces/client.interface';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ClientFormProps {
  client: IClient | null;
  onSubmit: (clientData: IClient) => void;
  onCancel: () => void;
}


export function ClientForm({ client, onSubmit, onCancel }: ClientFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    companyLogo: '',
    clientName: '',
    description: '',
    email: '',
    identification: '',
    phone: '',
    address: '',
    personType: 'natural' as PersonType, // Nuevo campo: tipo de persona
    documentType: 'cedula_ciudadania' as DocumentType // Nuevo campo: tipo de documento
  });
  
  const [vessels, setVessels] = useState<IVessel[]>([]);
  const [editingVessel, setEditingVessel] = useState<IVessel | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const vesselTypes = [
    "Carguero", "Petrolero", "Contenedor", "Pesquero", "Crucero", "Ferry", "Remolcador"
  ];
  
  const [vesselForm, setVesselForm] = useState({
    name: '',
    capacity: 0,
    tariff: 0,
    characteristics: '',
    equipment: '',
    gps: false,
    documentation: ''
  });
  

  // Opciones de tipo de documento según el tipo de persona
  const documentTypes = {
    natural: [
      { value: 'cedula_ciudadania', label: 'Cédula de Ciudadanía' },
      { value: 'cedula_extranjeria', label: 'Cédula de Extranjería' },
      { value: 'pasaporte', label: 'Pasaporte' }
    ],
    juridica: [
      { value: 'nit', label: 'NIT' },
      { value: 'otros', label: 'Otros' }
    ]
  };

  useEffect(() => {
    if (client) {
      setFormData({
        companyLogo: client.companyLogo || '',
        clientName: client.clientName,
        description: client.description,
        email: client.email,
        identification: client.identification,
        phone: client.phone,
        address: client.address || '',
        personType: client.personType || 'natural',
        documentType: client.documentType || 'cedula_ciudadania'
      });
      setVessels(client.vessels);
    }
  }, [client]);

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));

    // Si cambia el tipo de persona, resetear el tipo de documento al valor por defecto
    if (name === 'personType') {
      const defaultDocumentType = value === 'natural' ? 'cedula_ciudadania' : 'nit';
      setFormData(prev => ({ 
        ...prev, 
        personType: value as PersonType,
        documentType: defaultDocumentType as DocumentType
      }));
    }
  };

  const handleVesselInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVesselForm(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || 0 : value
    }));
  };

  const handleVesselSelectChange = (name: string, value: string) => {
    setVesselForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddVessel = () => {
    if (!vesselForm.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la embarcación es requerido",
        variant: "destructive"
      });
      return;
    }

    const newVessel: IVessel = {
      id: editingVessel?.id || Date.now().toString(),
      ...vesselForm
    };

    if (editingVessel) {
      setVessels(vessels.map(v => v.id === editingVessel.id ? newVessel : v));
    } else {
      setVessels([...vessels, newVessel]);
    }

    setVesselForm({
      name: '',
      capacity: 0,
      characteristics: '',
      equipment: '',
      tariff: 0,
      gps: false,
      documentation: ''
    });
    setEditingVessel(null);
  };

  const handleEditVessel = (vessel: IVessel) => {
    setEditingVessel(vessel);
    setVesselForm({
      name: vessel.name,
      capacity: vessel.capacity,
      tariff: Number(vessel.tariff),
      characteristics: vessel.characteristics,
      equipment: vessel.equipment,
      gps: vessel.gps,
      documentation: vessel.documentation
    });
  };

  const handleDeleteVessel = (vesselId: string) => {
    setVessels(vessels.filter(v => v.id !== vesselId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const clientData = {
        ...formData,
        companyLogo: "",
        vessels: vessels.map(v => ({
          ...v,
          tariff: Number(v.tariff) || 0,
          capacity: Number(v.capacity) || 0
        }))
      };

      // Notificar al padre con los datos y dejar que él maneje la API
      onSubmit(clientData);

      // Resetear el formulario solo si es creación
      if (!client) {
        setFormData({
          companyLogo: '',
          clientName: '',
          description: '',
          email: '',
          identification: '',
          phone: '',
          address: '',
          personType: 'natural',
          documentType: 'cedula_ciudadania'
        });
        setVessels([]);
        setUploadedImage(null);
      }

    } catch (error: any) {
      let errorMessage = 'Ocurrió un error al guardar el cliente';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

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

  const handleDeleteImage = () => {
    setSelectedFiles(null);
    setUploadedImage(null);
    setFormData(prev => ({ ...prev, image: null }));
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
        setFormData(prev => ({ ...prev, image: file }));
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName.trim()) newErrors.clientName = 'El nombre es requerido';
    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo no es válido';
    }
    if (!formData.identification?.trim()) newErrors.identification = 'El número de identificación es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-2 flex gap-2">
        <Button variant="outline" onClick={onCancel} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">
          {client ? 'Editar Cliente' : 'Registro de clientes y embarcaciones'}
        </h1>
      </div>

      {/* Client Information */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 mb-4">

        {/* Company Logo */}
        <div className="space-y-2">
          <Card className="h-96">
            <CardContent className="p-3 h-full">
              {uploadedImage ? (
                <div className="relative h-full rounded-lg overflow-hidden">
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
                      transition-colors cursor-pointer
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
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                {editingVessel ? 'Editar cliente' : 'Nuevo cliente'}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit}>
                {/* Tipo de Persona y Tipo de Documento */}
                <div className='flex row gap-2 mb-2'>
                  <div className="space-y-2 w-full">
                    <Label htmlFor="personType">Tipo de Persona *</Label>
                    <Select
                      name="personType"
                      value={formData.personType}
                      onValueChange={(value) => handleSelectChange('personType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el tipo de persona" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="natural">Persona Natural</SelectItem>
                        <SelectItem value="juridica">Persona Jurídica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 w-full">
                    <Label htmlFor="documentType">Tipo de Documento *</Label>
                    <Select
                      name="documentType"
                      value={formData.documentType}
                      onValueChange={(value) => handleSelectChange('documentType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el tipo de documento" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes[formData.personType].map((docType) => (
                          <SelectItem key={docType.value} value={docType.value}>
                            {docType.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Client Name */}
                <div className='flex row gap-2 mb-2'>
                  <div className="space-y-2 w-full">
                    <Label htmlFor="clientName">
                      {formData.personType === 'natural' ? 'Nombre Completo *' : 'Razón Social *'}
                    </Label>
                    <Input
                      id="clientName"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      placeholder={
                        formData.personType === 'natural' 
                          ? "Ingrese el nombre completo" 
                          : "Ingrese la razón social"
                      }
                      className={errors.clientName ? "border-destructive w-full" : "w-full"}
                    />
                    {errors.clientName && <p className="text-sm text-destructive">{errors.clientName}</p>}
                  </div>

                  {/* Identification */}
                  <div className="space-y-2 w-full">
                    <Label htmlFor="identification">Número de Documento *</Label>
                    <Input
                      id="identification"
                      name="identification"
                      value={formData.identification}
                      onChange={handleInputChange}
                      placeholder="Ingrese el número de documento"
                      className={errors.identification ? "border-destructive w-full" : "w-full"}
                    />
                    {errors.identification && <p className="text-sm text-destructive">{errors.identification}</p>}
                  </div>
                </div>

                <div className='flex row gap-2 mb-2'>
                  {/* Email */}
                  <div className="space-y-2 w-full">
                    <Label htmlFor="email">Correo electrónico *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Ingrese el correo electrónico"
                      className={errors.email ? "border-destructive w-full" : "w-full"}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2 w-full">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Ingrese el número de teléfono"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2 mb-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Descripción del cliente"
                    className="min-h-[50px]"
                  />
                </div>

                {/* Address */}
                <div className="space-y-2 mb-3">
                  <Label htmlFor="address">Dirección (Opcional)</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Ingrese la dirección"
                  />
                </div>

                {/* Vessel Information */}
                <Card className='p'>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ship className="h-5 w-5" />
                      Información de la motonave
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {/* Existing Vessels */}
                    {vessels.length > 0 && (
                      <div className="space-y-4">
                        {vessels.map((vessel, index) => (
                          <div key={vessel.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Ship className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium">{vessel.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Identificación: {vessel.characteristics},
                                  Tipo de embarcación {vessel.capacity},
                                  Armador: {vessel.documentation}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditVessel(vessel)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteVessel(vessel.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add/Edit Vessel Form */}
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="vesselName">Nombre de la embarcación</Label>
                          <Input
                            id="vesselName"
                            name="name"
                            value={vesselForm.name}
                            onChange={handleVesselInputChange}
                            placeholder="Nombre de la embarcación"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="characteristics">Identificación</Label>
                          <Input
                            id="characteristics"
                            name="characteristics"
                            value={vesselForm.characteristics}
                            onChange={handleVesselInputChange}
                            placeholder="Ingrese la identificación"
                          />
                        </div>

                        <div className="space-y-2 w-full">
                          <Label htmlFor="equipment">Tipo de embarcación</Label>
                          <Select
                            name="equipment"
                            value={vesselForm.equipment}
                            onValueChange={(value) => handleVesselSelectChange('equipment', value)}
                          >
                            <SelectTrigger>
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

                        <div className="space-y-2">
                          <Label htmlFor="documentation">Armador</Label>
                          <Input
                            id="documentation"
                            name="documentation"
                            value={vesselForm.documentation}
                            onChange={handleVesselInputChange}
                            placeholder="Nombre del armador"
                          />
                        </div>
                      </div>

                  
                      <Button type="button" onClick={handleAddVessel} className="gap-2">
                        <Plus className="h-4 w-4" />
                        {editingVessel ? 'Actualizar embarcación' : 'Añadir embarcación'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-3">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {client ? 'Actualizar Cliente' : 'Guardar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}