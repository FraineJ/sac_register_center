export interface IVessel {
  id: string;
  name: string;
  capacity: number;
  tariff: number,
  characteristics: string;
  equipment: string;
  gps: boolean;
  documentation: string;
}

export interface IClient {
  id?: number;
  companyLogo?: string;
  clientName: string;
  description: string;
  email: string;
  identification: string;
  phone: string;
  address?: string;
  vessels: IVessel[];
  createdAt?: string;
}