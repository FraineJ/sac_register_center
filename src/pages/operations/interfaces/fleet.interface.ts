export interface IFleet {
  id?: number;
  name: string;
  identification: string;
  flag: string;
  type: string;
  capacity: number;
  isOwner: string;
  documents: [];
  image: File | null;
  status?: string;
  createdAt?: string;
}
