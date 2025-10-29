import { RolePermission } from "./role-permission.interface";


export interface Role {
  id?: string;
  name: string;
  description: string;
  permissions: RolePermission[];
}