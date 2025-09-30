import { IUser } from "../Users/interfaces/user.interface";

export interface ISchedule {
  id?: number,
  startDate: Date
  working_days?: number;
  rest_days?: number;
  user: IUser
}