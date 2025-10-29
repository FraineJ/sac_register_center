import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tree, TreeNode } from "@/components/ui/tree";
import { toast } from "@/hooks/use-toast";
import { Shield, Plus, Edit, Trash2, Save, X, Settings, Users, Truck, Wrench, Briefcase, Building, UserCheck, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { rolService } from '@/services/rol.services';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { menuService } from "@/services/menu.service";
import { RolePermission } from "./interfaces/role-permission.interface";
import { Role } from "./interfaces/rol.interface";

interface SubMenuAction {
  id: number;
  action: string;
  sub_menu_id: number;
  menu_id?: number;
}



interface SubMenu {
  icon: string;
  route: string;
  name: string;
  order: number;
  status: string;
  created_at: string;
  menu_id: number;
  permissions: SubMenuAction[];
}

interface MenuItem {
  id: number;
  name: string;
  icon: string;
  route: string;
  order: number;
  status: string;
  premiun: boolean;
  createdAt: string;
  role_id: number;
  sub_menus: SubMenu[];
}



export default function Roles() {
  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as RolePermission[]
  });

  useEffect(() => {
    listMenu()
    listRoles();
  }, []);

  const handleCreateRole = () => {
    setSelectedRole(null);
    setFormData({ name: "", description: "", permissions: [] });
    setIsDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions.map(perm => ({
        id: perm.id,
        action_id: perm.action_id,
        allowed: perm.allowed,
        role_id: role.id,
        sub_menu_id: perm.sub_menu_id,
        menu_id: perm.menu_id
      }))
    });
    setIsDialogOpen(true);
  };

  const handleDeleteRole = async (role_id: string) => {
    try {
      setRoles(prev => prev.filter(role => role.id !== role_id));
      const response = await rolService.delete(role_id);

      if (response.status >= 200 && response.status < 300) {
        toast({
          title: "Rol eliminado",
          description: "El rol ha sido eliminado exitosamente.",
        });
        return true;
      }
      throw new Error(response.data?.message || "Error al eliminar el rol");
    } catch (error) {
      const refreshedRoles = await rolService.list();
      setRoles(refreshedRoles.data);

      toast({
        title: "Error al eliminar el rol",
        description: "No se puede eliminar porque hay usuarios con esté rol",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const trimmedName = formData.name.trim();
    const basicErr = isValidRoleName(trimmedName);
    if (basicErr) {
      setNameError(basicErr);
      toast({ title: "Nombre inválido", description: basicErr, variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (!isUniqueRoleName(trimmedName, selectedRole?.id)) {
      const msg = "Ya existe un rol con ese nombre.";
      setNameError(msg);
      toast({ title: "Duplicado", description: msg, variant: "destructive" });
      setIsLoading(false);
      return;
    }


    try {
      if (selectedRole) {
        const updateData = {
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions.map(p => ({
            action_id: p.action_id,
            allowed: p.allowed,
            sub_menu_id: p.sub_menu_id,
            menu_id: p.menu_id,
            ...(p.id && { id: p.id })
          }))
        };

        const response = await rolService.update(updateData, selectedRole.id);

        if (response.status >= 200 && response.status < 300) {
          listRoles();
          toast({
            title: "Rol actualizado",
            description: "El rol ha sido actualizado exitosamente.",
          });
        } else {
          throw new Error(response.data?.message || "Error al actualizar el rol");
        }
      } else {
        const newRole = {
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions.map(p => ({
            action_id: p.action_id,
            allowed: p.allowed,
            sub_menu_id: p.sub_menu_id,
            menu_id: p.menu_id
          }))
        };

        const response = await rolService.create(newRole);
        if ([200, 201].includes(response.status)) {
          setRoles(prev => [...prev, response.data]);
          toast({
            title: "Rol creado",
            description: "El rol ha sido creado exitosamente.",
          });
        } else {
          throw new Error(response.data?.message || "Error al crear el rol");
        }
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ha ocurrido un error",
        variant: "destructive",
      });
    }
    finally {
      setIsLoading(false); // Desactivar loading
    }
  };

  const handlePermissionChange = (action: SubMenuAction, checked: boolean) => {
    setFormData(prev => {
      const newPermission: RolePermission = {
        action_id: action.id,
        allowed: true,
        sub_menu_id: action.sub_menu_id,
        menu_id: action.menu_id || 0,
        role_id: selectedRole?.id
      };

      if (checked) {
        return {
          ...prev,
          permissions: [
            ...prev.permissions.filter(p =>
              p.action_id !== action.id ||
              p.sub_menu_id !== action.sub_menu_id
            ),
            newPermission
          ]
        };
      } else {
        return {
          ...prev,
          permissions: prev.permissions.filter(p =>
            p.action_id !== action.id ||
            p.sub_menu_id !== action.sub_menu_id
          )
        };
      }
    });
  };

  const isPermissionChecked = (action: SubMenuAction) => {
    return formData.permissions.some(
      p => p.action_id === action.id &&
        p.sub_menu_id === action.sub_menu_id
    );
  };

  const getMenuIcon = (menuName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      "Inicio": <Settings className="h-4 w-4" />,
      "Usuarios": <Users className="h-4 w-4" />,
      "Flota": <Truck className="h-4 w-4" />,
      "Mantenimiento": <Wrench className="h-4 w-4" />,
      "Operaciones": <Briefcase className="h-4 w-4" />,
      "Configuración": <Settings className="h-4 w-4" />,
      "Empresa": <Building className="h-4 w-4" />,
      "Rol": <UserCheck className="h-4 w-4" />
    };
    return iconMap[menuName] || <Settings className="h-4 w-4" />;
  };

  const transformActionText = (text: string): string => {
    switch (text) {
      case 'LIST':
        return 'Listar';
      case 'CREATE':
        return 'Guardar';
      case 'DELETE':
        return 'Eliminar';
      case 'UPDATE':
        return 'Actualizar';
      default:
        return text;
    }
  };

  const convertMenuToTreeNodes = (): TreeNode[] => {
    if (!menuData || menuData.length === 0) return [];

    return menuData.map((menu) => ({
      id: `menu-${menu.id}`,
      label: menu.name,
      icon: getMenuIcon(menu.name),
      data: { type: 'menu', id: menu.id },
      children: [
        ...(menu.sub_menus?.map((subMenu) => ({
          id: `submenu-${subMenu.menu_id}-${subMenu.name}`,
          label: subMenu.name,
          icon: getMenuIcon(subMenu.route),
          data: { type: 'submenu', id: subMenu.menu_id },
          children: subMenu.permissions.map((action) => ({
            id: `action-${action.id}-${subMenu.menu_id}`,
            label: transformActionText(action.action), // Aplicar transformación aquí
            icon: <UserCheck className="h-3 w-3" />,
            data: {
              ...action,
              menu_id: menu.id
            } as SubMenuAction,
            selectable: true
          }))
        })) || [])
      ]
    }));
  };

  const treeData = convertMenuToTreeNodes();

  const customNodeTemplate = (node: TreeNode, options: any) => {
    const isPermission = node.id.startsWith('action-');
    const actionData = node.data as SubMenuAction;
    const isSelected = isPermission && isPermissionChecked(actionData);

    return (
      <div className="tree-node">
        <div
          className={cn(
            "flex items-center py-2 px-2 hover:bg-muted rounded cursor-pointer select-none",
            isSelected && "bg-accent text-accent-foreground"
          )}
          style={{ paddingLeft: `${8 + (options.level * 20)}px` }}
        >
          <div className="flex items-center space-x-2 flex-1">
            {options.hasChildren && (
              <button
                type="button"
                className="p-1 hover:bg-muted rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  options.onToggle?.(node);
                }}
              >
                {options.expanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
            )}
            {!options.hasChildren && <div className="w-5" />}

            {isPermission && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => handlePermissionChange(
                  actionData,
                  !!checked
                )}
                onClick={(e) => e.stopPropagation()}
              />
            )}

            <div className="flex items-center space-x-2">
              {node.icon}
              <Label className={cn(
                "text-sm cursor-pointer",
                !isPermission ? "font-medium" : "font-normal"
              )}>
                {node.label}
              </Label>
            </div>
          </div>
        </div>

        {options.hasChildren && options.expanded && (
          <div className="tree-children">
            {node.children?.map((child) => (
              <div key={child.id}>
                {customNodeTemplate(child, {
                  ...options,
                  level: options.level + 1,
                  expanded: true,
                  hasChildren: child.children && child.children.length > 0
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const listRoles = async () => {
    try {
      const response = await rolService.list();
      setRoles(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los roles",
        variant: "destructive",
      });
    }
  };

  const listMenu = async () => {
    try {
      const response = await menuService.getMenu();
      setMenuData(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los roles",
        variant: "destructive",
      });
    }
  };

  const isValidRoleName = (name: string) => {
    const trimmed = name.trim();
    if (trimmed.length < 3) return "El nombre debe tener al menos 3 caracteres.";
    // Permite letras, números, espacios y - _ . (ajusta si necesitas)
    const re = /^[\p{L}\p{N}\s._-]+$/u;
    if (!re.test(trimmed)) return "Usa solo letras, números, espacios y (.-_).";
    return "";
  };

  const isUniqueRoleName = (name: string, ignoreId?: string) => {
    const target = name.trim().toLowerCase();
    return !roles.some(r =>
      r.name?.trim().toLowerCase() === target &&
      (ignoreId ? r.id !== ignoreId : true)
    );
  };


  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Gestión de Roles</h1>
        </div>
        <Button onClick={handleCreateRole}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Rol
        </Button>
      </div>

      <div className="grid gap-4">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg">{role.name}</CardTitle>
                <CardDescription>{role.description}</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm" onClick={() => handleEditRole(role)}
                  className="h-8 w-8 p-0 hover:bg-info/10 hover:text-info"
                  title="Editar"
                >
                  <Edit className="h-4 w-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Eliminar"
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-3 w-3" />

                    </Button>

                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará permanentemente el Rol de
                        <strong> {role.name}</strong>.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteRole(role.id || '')}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRole ? "Editar Rol" : "Crear Nuevo Rol"}
            </DialogTitle>
            <DialogDescription>
              {selectedRole ? "Modifica la información del rol" : "Crea un nuevo rol y asigna los permisos correspondientes"}
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Input
                  id="roleName"
                  value={formData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({ ...prev, name: val }));
                    const msg = isValidRoleName(val);
                    setNameError(msg);
                  }}
                  placeholder="Nombre del rol"
                  required
                />
                {nameError && <p className="text-xs text-destructive mt-1">{nameError}</p>}

              </div>
              <div className="space-y-2">
                <Label htmlFor="roleDescription">Descripción</Label>
                <Textarea
                  id="roleDescription"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Descripción del rol"
                  rows={2}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Permisos del Sistema</h3>
              <div className="overflow-y-auto">
                <Tree
                  value={treeData}
                  nodeTemplate={customNodeTemplate}
                  expandedKeys={treeData.map(node => node.id)}
                  className="min-h-64"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button type="button"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    {selectedRole ? "Actualizando..." : "Creando..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {selectedRole ? "Actualizar" : "Crear"} Rol
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}