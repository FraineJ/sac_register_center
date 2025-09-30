import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Building, ImageIcon, Save, Trash2 } from "lucide-react";
import { companyService } from "@/services/company.service";

interface Company {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  web_side: string;
}

export default function Company() {
  const [company, setCompany] = useState<Company>({
    id: 0,
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    web_side: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);


  useEffect(() => {
    listBussine();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);


    const data = {
      description: company.description,
      address: company.address,
      web_side: company.web_side,
      phone: company.phone,
      logo: ""
    }

    try {
      // Si la empresa ya existe (tiene ID), actualizamos
      if (company.id > 0) {
        await companyService.update(company.id, data);
        toast({
          title: "Empresa actualizada",
          description: "La información de la empresa ha sido guardada exitosamente.",
        });
      }
    } catch (error: any) {
      console.error("Error al guardar empresa:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo guardar la información de la empresa",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof Company, value: string) => {
    setCompany(prev => ({ ...prev, [field]: value }));
  };

  const listBussine = async () => {
    try {
      setIsLoading(true);
      const response = await companyService.list();

      // Si hay empresas, tomamos la primera (asumiendo solo una empresa)
      if (response.status == 200 || response.status == 201) {
        setCompany(response.data);
      } else {
        // Si no hay empresas, resetear a valores por defecto
        setCompany({
          id: 0,
          name: "",
          description: "",
          address: "",
          phone: "",
          email: "",
          web_side: ""
        });
      }
    } catch (error: any) {
      console.error("Error al cargar empresa:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo cargar la información de la empresa",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFiles(e.dataTransfer.files);
        //setFormData(prev => ({ ...prev, image: file }));
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
    //setFormData(prev => ({ ...prev, image: null }));
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
          //setFormData(prev => ({ ...prev, image: file }));
          const reader = new FileReader();
          reader.onload = (e) => {
            setUploadedImage(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        }
      }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center space-x-2">
          <Building className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Configuración de Empresa</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center items-center h-40">
              <p>Cargando información de la empresa...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-2">
        <Building className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Configuración de Empresa</h1>
      </div>

      <Card>
        <CardHeader>
      
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Empresa</Label>
                <Input
                  id="name"
                  value={company.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Nombre de la empresa"
                  required
                  disabled={true}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Corporativo</Label>
                <Input
                  id="email"
                  type="email"
                  value={company.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="email@empresa.com"
                  disabled={true}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={company.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+57 300 123 4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="web_side">Sitio Web</Label>
                <Input
                  id="web_side"
                  value={company.web_side}
                  onChange={(e) => handleChange("web_side", e.target.value)}
                  placeholder="www.empresa.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={company.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Dirección completa de la empresa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={company.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Descripción de la empresa"
                rows={4}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="space-x-2"
                disabled={isSaving}
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? "Guardando..." : "Guardar Cambios"}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}