import { VoucherStatus } from "../enums/voucherStatus.enum";
import { Voucher } from "../models/index.model";
import { ErrorType } from "../types/Error.type";
import { generateVoucherCode } from "../utils/generate";

// Create a new voucher with unique code
export const createVoucherRepo = async (data: {
  value: number;
  status: VoucherStatus;
}): Promise<Voucher> => {
  try {
    let code = generateVoucherCode();
    let existingVoucher = await findVoucherByCodeRepo(code);

    // Regenerate code if it already exists (rare, but possible)
    let attempts = 0;
    const maxAttempts = 10; // Prevent infinite loop
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
// Find voucher by code
export const findVoucherByCodeRepo = async (
  code: string
): Promise<Voucher | null> => {
  try {
    const voucher = await Voucher.findOne({ where: { code } });
    return voucher;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};
// Get all vouchers
export const getAllVouchersRepo = async (): Promise<Voucher[]> => {
  try {
    const vouchers = await Voucher.findAll();
    return vouchers;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

// Get voucher by ID
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

// Update voucher
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

// Delete voucher
export const deleteVoucherRepo = async (id: number): Promise<boolean> => {
  try {
    const voucher = await Voucher.findByPk(id);
    if (!voucher) return false;

    await voucher.destroy();
    return true;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};
