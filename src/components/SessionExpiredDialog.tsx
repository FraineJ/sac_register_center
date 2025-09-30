import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SessionExpiredDialogProps {
  open: boolean;
  onExtendSession: () => void;
  onLogout: () => void;
}

export function SessionExpiredDialog({ 
  open, 
  onExtendSession, 
  onLogout 
}: SessionExpiredDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sesión Expirada</AlertDialogTitle>
          <AlertDialogDescription>
            Tu sesión ha expirado. ¿Deseas volver a iniciar sesión para continuar trabajando?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onLogout}>
            Volver a Iniciar Sesión
          </AlertDialogAction> 
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}