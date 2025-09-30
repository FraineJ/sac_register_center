export interface IUser {
  id: string;
  name: string;
  last_name: string | null;
  phone_number: string | null;
  email: string;
  role_id: number;
  businessId: number;
  documentType: string;
  identification: string;
  salary: string;
  working_days?: number;
  rest_days?: number;
  status?: string;
  created_at?: string
  role : {
    id: number,
    name: string
  }
}