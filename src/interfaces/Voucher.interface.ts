import { VoucherStatus } from "../enums/voucherStatus.enum";

export interface VoucherAttributes {
    id?: number;
    code: string;
    value: number;
    status: VoucherStatus;
    createdAt?: Date;
    updatedAt?: Date;
  }