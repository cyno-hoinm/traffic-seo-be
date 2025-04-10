import { Request, Response } from "express";
import statusCode from "../constants/statusCode"; // Adjust path
import {
  createVoucherRepo,
  getAllVouchersRepo,
  getVoucherByIdRepo,
  updateVoucherRepo,
  deleteVoucherRepo,
  findVoucherByCodeRepo,
} from "../repositories/voucher.repository"; // Adjust path
import { ResponseType } from "../types/Response.type"; // Adjust path
import { VoucherAttributes } from "../interfaces/Voucher.interface";
import { VoucherStatus } from "../enums/voucherStatus.enum";

// Create a new voucher
export const createVoucher = async (
  req: Request,
  res: Response<ResponseType<VoucherAttributes>>
): Promise<void> => {
  try {
    const { value, status } = req.body;

    if (value === undefined || isNaN(value)) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Valid value is required",
        error: "Missing or invalid field",
      });
      return;
    }

    if (!status || !Object.values(VoucherStatus).includes(status)) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Valid status is required (ACTIVE, USED, EXPIRED)",
        error: "Invalid field",
      });
      return;
    }

    const voucher = await createVoucherRepo({ value, status });
    res.status(statusCode.CREATED).json({
      status: true,
      message: "Voucher created successfully",
      data: {
        id: voucher.id,
        code: voucher.code,
        value: voucher.value,
        status: voucher.status,
        createdAt: voucher.createdAt,
        updatedAt: voucher.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error creating voucher",
      error: error.message,
    });
  }
};

// Get all vouchers (unchanged)
export const getAllVouchers = async (
  req: Request,
  res: Response<ResponseType<VoucherAttributes[]>>
): Promise<void> => {
  try {
    const vouchers = await getAllVouchersRepo();
    res.status(statusCode.OK).json({
      status: true,
      message: "Vouchers retrieved successfully",
      data: vouchers.map((voucher: VoucherAttributes) => ({
        id: voucher.id,
        code: voucher.code,
        value: voucher.value,
        status: voucher.status,
        createdAt: voucher.createdAt,
        updatedAt: voucher.updatedAt,
      })),
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching vouchers",
      error: error.message,
    });
  }
};

// Get voucher by ID (unchanged)
export const getVoucherById = async (
  req: Request,
  res: Response<ResponseType<VoucherAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const voucher = await getVoucherByIdRepo(Number(id));

    if (!voucher) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Voucher not found",
        error: "Resource not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Voucher retrieved successfully",
      data: {
        id: voucher.id,
        code: voucher.code,
        value: voucher.value,
        status: voucher.status,
        createdAt: voucher.createdAt,
        updatedAt: voucher.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching voucher",
      error: error.message,
    });
  }
};

// Get voucher by code (new function)
export const getVoucherByCode = async (
  req: Request,
  res: Response<ResponseType<VoucherAttributes>>
): Promise<void> => {
  try {
    const { code } = req.params;

    if (!code) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Voucher code is required",
        error: "Missing required field",
      });
      return;
    }

    const voucher = await findVoucherByCodeRepo(code.toUpperCase()); // Ensure uppercase

    if (!voucher) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Voucher not found",
        error: "Resource not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Voucher retrieved successfully",
      data: {
        id: voucher.id,
        code: voucher.code,
        value: voucher.value,
        status: voucher.status,
        createdAt: voucher.createdAt,
        updatedAt: voucher.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching voucher by code",
      error: error.message,
    });
  }
};

// Update voucher (unchanged)
export const updateVoucher = async (
  req: Request,
  res: Response<ResponseType<VoucherAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const { value, status } = req.body;

    if (
      (value !== undefined && isNaN(value)) ||
      (status && !Object.values(VoucherStatus).includes(status))
    ) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Valid value or status (ACTIVE, USED, EXPIRED) is required",
        error: "Invalid field",
      });
      return;
    }

    const updateData: { value?: number; status?: VoucherStatus } = {};
    if (value !== undefined) updateData.value = value;
    if (status) updateData.status = status;

    const voucher = await updateVoucherRepo(Number(id), updateData);

    if (!voucher) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Voucher not found",
        error: "Resource not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Voucher updated successfully",
      data: {
        id: voucher.id,
        code: voucher.code,
        value: voucher.value,
        status: voucher.status,
        createdAt: voucher.createdAt,
        updatedAt: voucher.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error updating voucher",
      error: error.message,
    });
  }
};

// Delete voucher (unchanged)
export const deleteVoucher = async (
  req: Request,
  res: Response<ResponseType<VoucherAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const success = await deleteVoucherRepo(Number(id));

    if (!success) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Voucher not found",
        error: "Resource not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Voucher deleted successfully",
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error deleting voucher",
      error: error.message,
    });
  }
};
