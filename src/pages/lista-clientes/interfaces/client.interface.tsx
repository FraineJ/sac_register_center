export type PersonType = 'natural' | 'juridica';
export type DocumentType = 'cedula_ciudadania' | 'cedula_extranjeria' | 'pasaporte' | 'nit' | 'otros';

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
  personType: PersonType,
  documentType: DocumentType
}