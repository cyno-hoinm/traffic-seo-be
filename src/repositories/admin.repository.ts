import { AdminAttributes } from "../interfaces/Admin.interface";
import Admin from "../models/Admin.model";
import { ErrorType } from "../types/Error.type";

export const getListAdminRepository = async (): Promise<AdminAttributes[]> => {
  try {
    const admins = await Admin.findAll();
    return admins;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};
