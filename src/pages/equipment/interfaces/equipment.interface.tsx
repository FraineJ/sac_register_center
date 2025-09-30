export interface IEquipment {
  id: number;
  code: string;
  name: string;
  currency: string;
  value: number;
  description: string,
  fleetId: string,
  hasHourmeter: boolean,
  hourmeter: number
}