import { PackageType } from "../enums/packageType.enum";


export interface PackageAttributes {
  id?: number;
  name: string;
  description: string;
  type: PackageType;
  price: number;
  bonus: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
    