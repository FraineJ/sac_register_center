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
import { rolService } from '@/services/rol.services';

interface ClientFormProps {
  client: IClient | null;
  onSubmit: (clientData: IClient) => void;
  onCancel: () => void;
}

interface Role {
  id: number;
  name: string;
}

export function ClientForm({ client, onSubmit, onCancel }: ClientFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    profile_picture: '',
    name: '',
    description: '',
    email: '',
    identification: '',
    phone_number: '',
    address: '',
    typePerson: 'natural' as PersonType, // Nuevo campo: tipo de persona
    documentType: 'cedula_ciudadania' as DocumentType,
    role_id: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true); // Cambiado a true
  
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
        profile_picture: client.profile_picture || '',
        name: client.name,
        description: client.description,
        email: client.email,
        identification: client.identification,
        phone_number: client.phone_number,
        address: client.address || '',
        typePerson: client.typePerson || 'natural',
        documentType: client.documentType || 'cedula_ciudadania',
        role_id: client.role_id
      });
    }
    listRoles();
  }, [client]);

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInputChangeRol = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));

    // Si cambia el tipo de persona, resetear el tipo de documento al valor por defecto
    if (name === 'typePerson') {
      const defaultDocumentType = value === 'natural' ? 'cedula_ciudadania' : 'nit';
      setFormData(prev => ({ 
        ...prev, 
        typePerson: value as PersonType,
        documentType: defaultDocumentType as DocumentType
      }));
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const clientData = {
        ...formData,
        profile_picture: "",
      };

      // Notificar al padre con los datos y dejar que él maneje la API
      onSubmit(clientData);

      // Resetear el formulario solo si es creación
      if (!client) {
        setFormData({
          profile_picture: '',
          name: '',
          description: '',
          email: '',
          identification: '',
          phone_number: '',
          address: '',
          typePerson: 'natural',
          documentType: 'cedula_ciudadania',
          role_id: ''
        });
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

    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo no es válido';
    }
    if (!formData.identification?.trim()) newErrors.identification = 'El número de identificación es requerido';
    if(!formData.typePerson.trim()) newErrors.typePerson = 'El tipo de persona es requerido';
    if(!formData.documentType.trim()) newErrors.documentType = 'El tipo de documento es requerido';
    
    if(!formData.role_id.trim()) newErrors.role_id = 'El rol es requerido';


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

   const listRoles = async () => {
      try {
        setLoadingRoles(true);
        const response = await rolService.list();
        setRoles(response.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los roles",
          variant: "destructive",
        });
      } finally {
        setLoadingRoles(false);
      }
    };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-2 flex gap-2">
        <Button variant="outline" onClick={onCancel} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">
          {client ? 'Editar Armador' : 'Registro de armador'}
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
                {client ? 'Editar cliente' : 'Nuevo cliente'}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit}>
                {/* Tipo de Persona y Tipo de Documento */}
                <div className='flex row gap-2 mb-2'>
                  <div className="space-y-2 w-full">
                    <Label htmlFor="typePerson">Tipo de Persona *</Label>
                    <Select
                      name="typePerson"
                      value={formData.typePerson}
                      onValueChange={(value) => handleSelectChange('typePerson', value)}
                    >
                      <SelectTrigger className={errors.typePerson ? "border-destructive" : ""}>
                        <SelectValue placeholder="Seleccione el tipo de persona" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="natural">Persona Natural</SelectItem>
                        <SelectItem value="juridica">Persona Jurídica</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.typePerson && <p className="text-sm text-destructive">{errors.typePerson}</p>}

                  </div>

                  <div className="space-y-2 w-full">
                    <Label htmlFor="documentType">Tipo de Documento *</Label>
                    <Select
                      name="documentType"
                      value={formData.documentType}
                      onValueChange={(value) => handleSelectChange('documentType', value)}
                    >
                      <SelectTrigger className={errors.documentType ? "border-destructive" : ""}>
                        <SelectValue placeholder="Seleccione el tipo de documento" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes[formData.typePerson].map((docType) => (
                          <SelectItem key={docType.value} value={docType.value}>
                            {docType.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.documentType && <p className="text-sm text-destructive">{errors.documentType}</p>}

                  </div>
                </div>

                {/* Client Name */}
                <div className='flex row gap-2 mb-2'>
                  <div className="space-y-2 w-full">
                    <Label htmlFor="name">
                      {formData.typePerson === 'natural' ? 'Nombre Completo *' : 'Razón Social *'}
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={
                        formData.typePerson === 'natural' 
                          ? "Ingrese el nombre completo" 
                          : "Ingrese la razón social"
                      }
                      className={errors.name ? "border-destructive w-full" : "w-full"}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
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

                  {/* phone_number */}
                  <div className="space-y-2 w-full">
                    <Label htmlFor="phone_number">Teléfono</Label>
                    <Input
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      placeholder="Ingrese el número de teléfono"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-2">
                  <Label htmlFor="role_id">Rol <small>(Cargo)</small> *</Label>
                  <Select
                    value={parseInt(formData.role_id) !== 0 ? String(formData.role_id) : undefined}
                    onValueChange={(value) => handleInputChangeRol('role_id', value)}
                  >
                    <SelectTrigger className={errors.role_id ? "border-destructive" : ""}>
                      <SelectValue placeholder={loadingRoles ? "Cargando roles..." : "Seleccione un rol"} />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={String(role.id)}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role_id && <p className="text-sm text-destructive">{errors.role_id}</p>}
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

            

                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-3">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {client ? 'Actualizar Armador' : 'Guardar'}
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