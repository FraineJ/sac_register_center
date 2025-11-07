import { useEffect, useState } from "react";

import { useToast } from "@/hooks/use-toast";
import { userService } from "@/services/user.services";
import { IUser } from "./interfaces/user.interface";
import { UserTable } from "./components/ColaboradoresTable";
import { UserForm } from "./components/ColaboradoresForm";
import { ToastAction } from "@radix-ui/react-toast";

// Datos de ejemplo para mostrar funcionalidad
const mockUsers: IUser[] = [
];


export default function Colaboradores() {
  const { toast } = useToast();
  const [users, setUsers] = useState<IUser[]>(mockUsers);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | undefined>(undefined);

  useEffect(() => {
    listColaboradores();
  }, []);

  const handleAddUser = (userData: Omit<IUser, 'id' | 'created_at'>) => {
  

    const newUser: IUser = userData;


    setUsers(prev => [newUser, ...prev]);
    setShowForm(false);

    toast({
      title: "Colaboradores registrado",
      description: `${userData.name} ${userData.last_name ?? ""} ha sido registrado exitosamente.`,
    });
  };

  const handleEditUser = (userData: Omit<IUser, 'id' | 'created_at'>) => {
    if (!editingUser) return;

    setUsers(prev => prev.map(user =>
      user.id === editingUser.id
        ? { ...userData, id: editingUser.id, created_at: editingUser.created_at }
        : user
    ));

    setEditingUser(undefined);
    setShowForm(false);

    toast({
      title: "Colaboradores actualizado",
      description: `Los datos de ${userData.name} ${userData.last_name ?? ""} han sido actualizados.`,
    });
  };

  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find(user => user.id === userId);

    try {
      const response = await userService.delete(userId);
      if (response.status == 200 || response.status == 201) {

        setUsers(prev => prev.filter(user => user.id !== userId));

        toast({
          title: "Colaboradores eliminado",
          description: `${userToDelete?.name} ${userToDelete?.last_name ?? ""} ha sido eliminado del sistema.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Ha ocurido un error al momento de eliminar el usuario",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.log("error ", error)
      toast({
        title: "Error al eliminar",
        description: error?.details
          || error.message
          || "Ocurrió un error al intentar eliminar usuario",
        variant: "destructive",
        action: (
          <ToastAction
            altText="Reintentar"
            onClick={() => handledeleteUserDocuments(userId)}
          >
            Eliminar
          </ToastAction>
        ),
      });
    }
  };


  const handledeleteUserDocuments = async (userId: string) => {
    try {
      const userDelete = users.find(user => user.id === userId);

      if (!userDelete) {
        toast({
          title: "Error",
          description: "No se encontró la embarcación a eliminar",
          variant: "destructive",
        });
        return;
      }

      const response = await userService.deleteUserWithSchedule(userId);

      if (response.status >= 200 && response.status < 300) {
        setUsers(prev => prev.filter(fleet => fleet.id !== userId));

        toast({
          title: "Colaboradores eliminada",
          description: `El usuario ${userDelete.name} ha sido eliminada correctamente.`,
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


  const handleToggleBlock = async (userId: string) => {
    try {
      setUsers(prev => prev.map(user => {
        if (user.id === userId) {
          // Determinar el nuevo estado
          const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
          const isBlocking = newStatus === 'INACTIVE';

          // Llamar al servicio con el nuevo estado
          userService.blocked(userId, { status: newStatus })
            .catch(error => {
              console.error("Error al actualizar estado:", error);
              toast({
                title: "Error",
                description: `No se pudo ${isBlocking ? 'bloquear' : 'desbloquear'} al usuario.`,
                variant: "destructive"
              });
            }
            );

          // Mostrar notificación
          toast({
            title: isBlocking ? "Colaboradores bloqueado" : "Colaboradores desbloqueado",
            description: `${user.name} ${user.last_name ?? ""} ha sido ${isBlocking ? 'bloqueado' : 'desbloqueado'}.`,
          });

          // Retornar usuario actualizado
          return { ...user, status: newStatus };
        }
        return user;
      }));
    } catch (error) {
      console.error("Error en handleToggleBlock:", error);
    }
  };

  const handleStartEdit = (user: IUser) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingUser(undefined);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(undefined);
  };

  const listColaboradores = async () => {
    const response = await userService.listcCollaborators();
    if (response.status == 200 || response.status == 201) {

      setUsers(response.data)
    }
  };

  const handleSubmit = editingUser ? handleEditUser : handleAddUser;

  if (showForm) {
    return (
      <UserForm
        user={editingUser}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      <UserTable
        users={users}
        onEdit={handleStartEdit}
        onDelete={handleDeleteUser}
        onToggleBlock={handleToggleBlock}
        onAddNew={handleAddNew}
      />
    </div>

  );
}