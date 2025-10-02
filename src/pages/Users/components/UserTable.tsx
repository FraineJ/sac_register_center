import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Edit, Trash2, Lock, Unlock, UserPlus, Weight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { IUser } from "@/pages/Users/interfaces/user.interface";

interface UserTableProps {
  users: IUser[];
  onEdit: (user: IUser) => void;
  onDelete: (userId: string) => void;
  onToggleBlock: (userId: string) => void;
  onAddNew: () => void;
}

export function UserTable({ users, onEdit, onDelete, onToggleBlock, onAddNew }: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone_number.includes(searchTerm) ||
    user.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(Number(value));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  return (
    <div className="space-y-6  p-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">Administra los usuarios del sistema</p>
        </div>
        <Button
          variant="default"
          onClick={onAddNew}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Search and Stats */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg">Lista de Usuarios</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <span>Total: <strong className="text-foreground">{users.length}</strong></span>
            <span>Activos: <strong className="text-success">{users.filter(u => u.status === "ACTIVE").length}</strong></span>
            <span>Bloqueados: <strong className="text-destructive">{users.filter(u => u.status === 'INACTIVE').length}</strong></span>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda' : 'No hay usuarios registrados'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>name</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-center">Fecha Registro</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">
                            {user.name} {user.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium">{user.documentType}</div>
                          <div className="text-sm text-muted-foreground">{user.identification}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{user.role.name ?? ""}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            user.status == "INACTIVE"
                              ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                              : "bg-success-light text-success-foreground hover:bg-success-light/80"
                          }
                        >
                          {user.status == "INACTIVE" ? 'Bloqueado' : 'Activo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground text-center">
                          {formatDate(user.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          {/* Editar */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(user)}
                            className="h-8 w-8 p-0 hover:bg-info/10 hover:text-info"
                            title="Editar usuario"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {/* Bloquear/Desbloquear */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onToggleBlock(user.id)}
                            className={`h-8 w-8 p-0 ${user.status
                                ? "hover:bg-success/10 hover:text-success"
                                : "hover:bg-warning/10 hover:text-warning"
                              }`}
                            title={user.status == "INACTIVE" ? "Desbloquear usuario" : "Bloquear usuario"}
                          >
                            {user.status == "ACTIVE" ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                          </Button>

                          {/* Eliminar */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                title="Eliminar usuario"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente el usuario{" "}
                                  <strong>{user.name} {user.last_name}</strong> del sistema.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDelete(user.id)}
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
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No hay usuarios disponibles.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}