import { UserAttributes } from "./User.interface";

export interface AgencyAttributes {
  id?: number;
  userId: number;
  users?: UserAttributes;
  inviteCode: string;
  bankName: string;
  bankAccount: string;
  accountHolder: string;
  isDeleted: boolean;
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
}
