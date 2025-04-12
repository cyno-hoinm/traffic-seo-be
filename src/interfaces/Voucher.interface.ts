import { VoucherStatus } from "../enums/voucherStatus.enum";

export interface VoucherAttributes {
    id?: number;
    code: string;
    value: number;
    status: VoucherStatus;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }