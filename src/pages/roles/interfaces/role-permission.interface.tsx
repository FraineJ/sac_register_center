export interface RolePermission {
  id?: number;
  action_id: number;
  allowed: boolean;
  role_id?: string;
  sub_menu_id: number;
  menu_id: number;
}