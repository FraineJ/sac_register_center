import React, { useEffect, useState } from 'react';
import { ClientTable } from './components/ClientTable';
import { ClientForm } from './components/ClientForm';
import { IClient } from './interfaces/client.interface';
import { toast, useToast } from "@/hooks/use-toast";
import { clientService } from '@/services/client.services';
import { ToastAction } from '@radix-ui/react-toast';
export default function ClientList() {
  const [showForm, setShowForm] = useState(false);
  const [clients, setClients] = useState<IClient[]>([]);
  const [editingClient, setEditingClient] = useState<IClient | null>(null);


  useEffect(() => {
    listClient();
  }, []);

  const listClient = async () => {
    const response = await clientService.list();
    if (response.status == 200 || response.status == 201) {

      setClients(response.data)
    }
  };

  const handleCreateClient = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  const handleEditClient = (client: IClient) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleFormSubmit = async (clientData: Omit<IClient, 'id' | 'image'>) => {
    try {
      let response;
      let updatedClients;


      if (editingClient) {
        // Actualizar cliente existente
        response = await clientService.update(editingClient.id, clientData);
        updatedClients = clients.map(client =>
          client.id === editingClient.id ? response.data : client
        );
        toast({
          title: "Cliente actualizado",
          description: "Los datos del cliente se han actualizado correctamente",
        });
      } else {
        // Crear nuevo cliente
        response = await clientService.create(clientData);
        updatedClients = [...clients, response.data];
        toast({
          title: "Cliente registrado",
          description: "El nuevo cliente se ha registrado exitosamente",
        });
      }

      setClients(updatedClients);
      setShowForm(false);
      setEditingClient(null);

    } catch (error: any) {
      console.log('Error al guardar el usuario:', error);

      let errorMessage = 'Ocurrió un error al guardar el usuario';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // En tu handleSubmit o donde manejes el error:
      toast({
        title: error.message || "Error",
        description:
          error.errors?.[0] ??
          "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingClient(null);
  };

  const handleDeleteClient = async (clientId: number) => {
    //setClients(clients.filter(client => client.id !== clientId));
    try {

      const response = await clientService.delete(clientId);
      if (response.status == 200 || response.status == 201) {

        setClients(prev => prev.filter(client => client.id !== clientId));

        toast({
          title: "Usuario eliminado",
          description: `El cliente ha sido eliminado del sistema.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Ha ocurido un error al momento de eliminar el usuario",
          variant: "destructive",
        });
      }
    } catch (error: any) {

      toast({
        title: "Error al eliminar",
        description: error.details
          || error.message
          || "Ocurrió un error al intentar eliminar al cliente",
        variant: "destructive",
        action: (
          <ToastAction
            altText="Reintentar"
            onClick={() => handleDeleteWithVessel(clientId)}
          >
            Eliminar
          </ToastAction>
        ),
      });
    }
  };

  const handleDeleteWithVessel = async (clientId: number) => {
    console.log("clientId ", clientId);
    try {
      const clientToDelete = clients.find(client => client.id === clientId);

      if (!clientToDelete) {
        toast({
          title: "Error",
          description: "No se encontró el cliente a eliminar",
          variant: "destructive",
        });
        return;
      }

      const response = await clientService.deleteWithVessel(clientId);

      if (response.status >= 200 && response.status < 300) {
        setClients(prev => prev.filter(fleet => fleet.id !== clientId));

        toast({
          title: "Cliente eliminada",
          description: `El cliente ha sido eliminada correctamente.`,
          variant: "default",
        });
      } else {
        throw new Error(response.data?.message || 'Error desconocido al eliminar');
      }
    } catch (error: any) {

      toast({
        title: "Error al eliminar",
        description: "Ocurrió un error al intentar eliminar la cliente",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="">
      {!showForm ? (
        <ClientTable
          clients={clients}
          onCreateClient={handleCreateClient}
          onEditClient={handleEditClient}
          onDeleteClient={handleDeleteClient}
        />
      ) : (
        <ClientForm
          client={editingClient}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}