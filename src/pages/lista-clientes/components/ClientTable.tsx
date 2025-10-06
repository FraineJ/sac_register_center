import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Plus, Search, Users, Ship } from 'lucide-react';
import { IClient } from '../interfaces/client.interface';

interface ClientTableProps {
  clients: IClient[];
  onCreateClient: () => void;
  onEditClient: (client: IClient) => void;
  onDeleteClient: (clientId: number) => void;
}

export function ClientTable({ clients, onCreateClient, onEditClient, onDeleteClient }: ClientTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.identification.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  };


  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}


      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Lista de Armador</h1>
              <p className="text-muted-foreground">
                Gestiona la información de tus armadores y sus embarcaciones
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={onCreateClient} className="gap-2">
              <Plus className="h-4 w-4" />
              Crear Armador
            </Button>

          </div>
        </div>
      </div>


      {/* Clients Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Armadores Registrados
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar armadores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Total: <strong>{clients.length}</strong></span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {clients.length === 0 ? 'No hay armadores registrados' : 'No se encontraron armadores'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {clients.length === 0
                  ? 'Comienza agregando tu primer cliente.'
                  : 'Intenta ajustar tu búsqueda.'
                }
              </p>
              {clients.length === 0 && (
                <Button onClick={onCreateClient} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Crear Primer Armador
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Armador</TableHead>
                    <TableHead>Identificación</TableHead>
                    <TableHead className='text-center'>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead className='text-center'>Fecha Registro</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {client.profile_picture && (
                            <img
                              src={client.profile_picture}
                              alt="Logo"
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{client.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{client.identification}</TableCell>
                      <TableCell className='text-center'>{client.email}</TableCell>
                      <TableCell>{client.phone_number}</TableCell>
                  
                      <TableCell className='text-center'>
                        {client.created_at ? formatDate(client.created_at) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditClient(client)}
                            className="h-8 w-8 p-0 hover:bg-info/10 hover:text-info"
                            title="Editar"
                          >
                            <Edit className="h-3 w-3" />
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
                                  Esta acción no se puede deshacer. Se eliminará permanentemente el cliente
                                  <strong> {client.name}</strong> y todas sus embarcaciones asociadas.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDeleteClient(client.id)}
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
                </TableBody>
              </Table>
            </div>

          )}
        </CardContent>
      </Card>
    </div>
  );
}