export interface Maintenance {
  id: number;
  activityTitle: string;
  responsibleName: string;
  activityType: 'Preventivo' | 'Correctivo' | 'Predictivo';
  plannedDate: string;
  status: 'Pendiente' | 'En progreso' | 'Completado';
  vesselName: string;
  description?: string;
  steps?: MaintenanceStep[];
  supplies?: MaintenanceSupply[];
}

export interface MaintenanceStep {
  id: string;
  title: string;
  description: string;
  order: number;
  completed?: boolean;
}

export interface MaintenanceSupply {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  used?: boolean;
}

export interface MaintenanceFormData {
  activityTitle: string;
  responsibleRole: string;
  activityType: string;
  preNoticeDate?: Date;
  vesselDate?: Date;
  startDate?: Date;
  notifyDate?: Date;
  activationType?: string;
  teams: string[];
  supplies: MaintenanceSupply[];
  steps: Omit<MaintenanceStep, 'id' | 'order'>[];
}