export interface Tariff {
  id: number;
  code: string;
  name: string;
  currency: string;
  basePrice: number;
  chargeType: "Por hora" | "Por maniobra";
}