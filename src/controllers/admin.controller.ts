import { Request, Response } from "express";
import statusCode from "../constants/statusCode";
import { AdminAttributes } from "../interfaces/Admin.interface";
import { getListAdminRepository } from "../repositories/Admin.repository";
import { ErrorType } from "../types/Error.type";
import { ResponseType } from "../types/Response.type";

const getListAdmin = async (
  req: Request,
  res: Response<ResponseType<AdminAttributes>>
): Promise<void> => {
  try {
    const listAdmin: AdminAttributes[] = await getListAdminRepository();
    const response: ResponseType<AdminAttributes> = {
      status: true,
      message: "User fetched successfully",
      data: listAdmin ? listAdmin : [],
    };
    res.status(statusCode.OK).json(response);
    return;
  } catch (error: any) {
    const response: ResponseType<AdminAttributes> = {
      status: false,
      message: "Failed to login",
      error: (error as ErrorType) ? error.message : "Internal server error",
    };
    res.status(statusCode.INTERNAL_SERVER_ERROR).json(response);
    return;
  }
};

export { getListAdmin };
