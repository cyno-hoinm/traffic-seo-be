import { VoucherStatus } from "../../enums/voucherStatus.enum";
import { VoucherAttributes } from "../../interfaces/Voucher.interface";
import { Voucher } from "../../models/index.model";
import { ErrorType } from "../../types/Error.type";
import { generateVoucherCode } from "../../utils/generate";

export const createVoucherRepo = async (data: {
  value: number;
  status: VoucherStatus;
}): Promise<VoucherAttributes> => {
  try {
    let code = generateVoucherCode();
    let existingVoucher = await findVoucherByCodeRepo(code);

    let attempts = 0;
    const maxAttempts = 10;
    while (existingVoucher && attempts < maxAttempts) {
      code = generateVoucherCode();
      existingVoucher = await findVoucherByCodeRepo(code);
      attempts++;
    }

    if (existingVoucher) {
      throw new ErrorType(
        "DuplicateError",
        "Unable to generate unique voucher code after multiple attempts"
      );
    }

    const voucher = await Voucher.create({ code, ...data });
    return voucher;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const findVoucherByCodeRepo = async (
  code: string
): Promise<VoucherAttributes | null> => {
  try {
    const voucher = await Voucher.findOne({ where: { code } });
    return voucher;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const getAllVouchersRepo = async (): Promise<VoucherAttributes[]> => {
  try {
    const vouchers = await Voucher.findAll({
      where: { isDeleted: false },
      order: [["createdAt", "DESC"]],
    });
    return vouchers;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const getVoucherByIdRepo = async (
  id: number
): Promise<Voucher | null> => {
  try {
    const voucher = await Voucher.findByPk(id);
    return voucher;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const updateVoucherRepo = async (
  id: number,
  data: { value?: number; status?: VoucherStatus }
): Promise<Voucher | null> => {
  try {
    const voucher = await Voucher.findByPk(id);
    if (!voucher) return null;

    await voucher.update(data);
    return voucher;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const deleteVoucherRepo = async (id: number): Promise<boolean> => {
  try {
    const voucher = await Voucher.findByPk(id);
    if (!voucher) return false;

    await voucher.update({ isDeleted: true });
    return true;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};
