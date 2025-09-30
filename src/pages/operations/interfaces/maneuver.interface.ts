// Operations.tsx
export interface Maneuver {
  id: number;
  embarcacion: string;
  tipoManiobra: string;
  ubicacion: string;
  horaInicio: string;
  horaFinalizacion: string;
  estado: "Programada" | "En Progreso" | "Completada";
}