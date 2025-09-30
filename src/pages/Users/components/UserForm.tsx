import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { rolService } from "@/services/rol.services";
import { userService } from "@/services/user.services";
import { IUser } from "@/pages/Users/interfaces/user.interface";
import { ArrowLeft } from "lucide-react";

interface UserFormProps {
  user?: IUser;
  onSubmit: (user: Omit<IUser, 'id'>) => void;
  onCancel: () => void;
}

interface Role {
  id: number;
  name: string;
}

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    phone_number: '',
    email: '',
    role_id: 0,
    documentType: 'CC',
    identification: '',
    salary: '0'
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true); // Cambiado a true
  const [isFormReady, setIsFormReady] = useState(false); // Nuevo estado
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      await listRoles();

      if (user) {
        setFormData({
          name: user.name,
          last_name: user.last_name || '',
          phone_number: user.phone_number || '',
          email: user.email,
          role_id: user.role_id,
          documentType: user.documentType || 'CC',
          identification: user.identification || '',
          salary: user.salary || '0',
        });
      }
      setIsFormReady(true); // Marcar formulario como listo
    };

    loadData();
  }, [user]);


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo no es válido';
    }
    if (!formData.phone_number?.trim()) newErrors.phone_number = 'El teléfono es requerido';
    if (!formData.role_id) newErrors.role_id = 'El rol es requerido';
    if (!formData.documentType) newErrors.tipoDocumento = 'El tipo de documento es requerido';
    if (!formData.identification) newErrors.identification = 'La identificación es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const userData = {
        ...formData,
        last_name: formData.last_name || null,
        phone_number: formData.phone_number || null,
        documentType: formData.documentType,
        identification: formData.identification,
        salary: formData.salary || '0',
      };

      let response;

      if (user) {
        response = await userService.update(user.id, userData);

        if (response.status == 200 || response.status == 201) {

          toast({
            title: "Usuario actualizado",
            description: "Los datos del usuario se han actualizado correctamente",
          });
        }

      } else {
        response = await userService.create(userData);

        if (response.status == 200 || response.status == 201) {
          toast({
            title: "Usuario registrado",
            description: "El nuevo usuario se ha registrado exitosamente",
          });
        }
      }

      onSubmit(response.data);

    } catch (error: any) {
      console.error('Error al guardar el usuario:', error);

      let errorMessage = 'Ocurrió un error al guardar el usuario';
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

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={onCancel}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Usuario</h1>
          </div>
          
        </div>
      </div>

      <Card className="w-full  mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">
            {user ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isFormReady ? (
            <div className="text-center py-8">Cargando formulario...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ingrese el nombre"
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                {/* Apellido */}
                <div className="space-y-2">
                  <Label htmlFor="last_name">Apellido</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    placeholder="Ingrese el apellido"
                  />
                </div>

                {/* Teléfono */}
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Teléfono *</Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number || ''}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    placeholder="Ingrese teléfono de contacto"
                    className={errors.phone_number ? "border-destructive" : ""}
                  />
                  {errors.phone_number && <p className="text-sm text-destructive">{errors.phone_number}</p>}
                </div>

                {/* Correo electrónico */}
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Ingrese el correo electrónico"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                {/* Tipo de documento */}
                <div className="space-y-2">
                  <Label htmlFor="tipoDocumento">Tipo de documento *</Label>
                  <Select
                    value={formData.documentType}
                    onValueChange={(value) => handleInputChange('documentType', value)}
                  >
                    <SelectTrigger className={errors.documentType ? "border-destructive" : ""}>
                      <SelectValue placeholder="Seleccione tipo de documento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CC">Cédula de Ciudadanía (CC)</SelectItem>
                      <SelectItem value="CE">Cédula de Extranjería (CE)</SelectItem>
                      <SelectItem value="PE">Pasaporte (PE)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.documentType && <p className="text-sm text-destructive">{errors.documentType}</p>}
                </div>

                {/* Identificación */}
                <div className="space-y-2">
                  <Label htmlFor="identification">Número de identificación *</Label>
                  <Input
                    id="identification"
                    value={formData.identification}
                    onChange={(e) => handleInputChange('identification', e.target.value)}
                    placeholder="Ingrese número de identificación"
                    className={errors.identification ? "border-destructive" : ""}
                  />
                  {errors.identification && <p className="text-sm text-destructive">{errors.identification}</p>}
                </div>

                {/* Rol */}
                {/* Rol */}
                <div className="space-y-2">
                  <Label htmlFor="role_id">Rol <small>(Cargo)</small> *</Label>
                  <Select
                    value={formData.role_id.toString()} // Convertir a string
                    onValueChange={(value) => handleInputChange('role_id', parseInt(value))} // Convertir a número
                  >
                    <SelectTrigger className={errors.role_id ? "border-destructive" : ""}>
                      <SelectValue placeholder={loadingRoles ? "Cargando roles..." : "Seleccione un rol"} />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}> {/* Los valores deben ser string */}
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role_id && <p className="text-sm text-destructive">{errors.role_id}</p>}
                </div>

                {/* Salario */}
                <div className="space-y-2">
                  <Label htmlFor="salary">Salario (día)</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => handleInputChange('salary', e.target.value)}
                    placeholder="Ingrese el salario"
                  />
                </div>
              </div>



              {/* Botones */}
              <div className="flex gap-4 pt-6 justify-end">
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="border-border hover:bg-secondary"
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {user ? 'Actualizar Usuario' : 'Registrar Usuario'}
                </Button>
              </div>
            </form>
          )
          }
        </CardContent>
      </Card>
    </div>

  );
}