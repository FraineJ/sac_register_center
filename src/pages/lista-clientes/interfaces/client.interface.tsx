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
  profile_picture?: string;
  name: string;
  description: string;
  email: string;
  identification: string;
  phone_number: string;
  address?: string;
  created_at?: string;
  typePerson: PersonType,
  documentType: DocumentType,
  role_id: number;
}