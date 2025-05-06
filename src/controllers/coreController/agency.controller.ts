import { Request, Response } from "express";
import statusCode from "../../constants/statusCode";
import { ResponseType } from "../../types/Response.type";
import { AgencyAttributes } from "../../interfaces/Agency.interface";
import {
  createAgencyRepo,
  findAgencyByIdRepo,
  findAllAgenciesRepo,
  updateAgencyRepo,
  deleteAgencyRepo,
  searchAgencyRepo,
  getAgenciesByUserIdRepo,
} from "../../repositories/coreRepo/agency.repository";
import {  uuIDv4 } from "../../utils/generate";
import { AuthenticatedRequest } from "../../types/AuthenticateRequest.type";


// Create a new agency
export const createAgency = async (
  req: AuthenticatedRequest,
  res: Response<ResponseType<AgencyAttributes>>
): Promise<void> => {
  try {

    const user = req.data;
    if (!user || !user.id) {
      res.status(statusCode.UNAUTHORIZED).json({
        status: false,
        message: "Unauthorized",
      });
      return;
    }
    const {
      bankName,
      bankAccount,
      accountHolder
    } = req.body
    const inviteCode = uuIDv4()
    const userId = user.id

    const agency = await createAgencyRepo({
      userId,
      inviteCode,
      bankName,
      bankAccount,
      accountHolder,
      status: 1,
      isDeleted: false });

    res.status(statusCode.CREATED).json({
      status: true,
      message: "Agency created successfully",
      data: agency,
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get a agency by ID
export const getAgencyById = async (
  req: Request,
  res: Response<ResponseType<AgencyAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const agencyId = parseInt(id, 10);

    if (isNaN(agencyId)) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid input",
        error: "Invalid agency ID",
      });
      return;
    }

    const agency = await findAgencyByIdRepo(agencyId);

    if (!agency) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Agency not found",
        error: "Agency not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Agency retrieved successfully",
      data: agency,
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAgencyByUserId = async (
  req: Request,
  res: Response<ResponseType<AgencyAttributes>>
): Promise<void> => {
  try {
    const { userId} = req.body
    const agencies = await getAgenciesByUserIdRepo(userId);
    if (!agencies) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Agency not found",
        error: "Not found"
      })
      return
    }
    res.status(statusCode.OK).json({
      status: true,
      message: "Agencies retrieved successfully",
      data: agencies,
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

export const getMyAgency = async (
  req: AuthenticatedRequest,
  res: Response<ResponseType<AgencyAttributes>>
): Promise<void> => {
  try {
    const user = req.data;
    if (!user || !user.id) {
      res.status(statusCode.UNAUTHORIZED).json({
        status: false,
        message: "Unauthorized",
      });
      return;
    }
    const userId = user.id
    const agencies = await getAgenciesByUserIdRepo(userId);
    // if (!agencies) {
    //   res.status(statusCode.NOT_FOUND).json({
    //     status: true,
    //     message: "Agency not found",
    //     error: "Not found",
    //     data: undefined
    //   })
    //   return
    // }
    res.status(statusCode.OK).json({
      status: true,
      message: "Agencies retrieved successfully",
      data: agencies || undefined,
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}


// Get all agencies
export const getAllAgencies = async (
  req: Request,
  res: Response<ResponseType<AgencyAttributes[]>>
): Promise<void> => {
  try {
    const agencies = await findAllAgenciesRepo();

    res.status(statusCode.OK).json({
      status: true,
      message: "Agencies retrieved successfully",
      data: agencies,
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update a agency by ID
export const updateAgency = async (
  req: Request,
  res: Response<ResponseType<AgencyAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const {  } = req.body;
    const agencyId = parseInt(id, 10);

    if (isNaN(agencyId)) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid input",
        error: "Invalid agency ID",
      });
      return;
    }

    // if (!name) {
    //   res.status(statusCode.BAD_REQUEST).json({
    //     status: false,
    //     message: "Validation failed",
    //     error: "Agency name is required to update",
    //   });
    //   return;
    // }

    const existingAgency = await findAgencyByIdRepo(agencyId);
    if (existingAgency) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Agency update failed",
        error: "Agency name already exists",
      });
      return;
    }

    const updatedAgency = await updateAgencyRepo(agencyId, {

    });

    if (!updatedAgency) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Agency not found",
        error: "Agency not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Agency updated successfully",
      data: updatedAgency,
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete a agency by ID
export const deleteAgency = async (
  req: Request,
  res: Response<ResponseType<AgencyAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const agencyId = parseInt(id, 10);

    if (isNaN(agencyId)) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid input",
        error: "Invalid agency ID",
      });
      return;
    }

    const deleted = await deleteAgencyRepo(agencyId);

    if (!deleted) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Agency not found",
        error: "Agency not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Agency deleted successfully",
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


export const searchAgencies = async (
  req: Request,
  res: Response<ResponseType<any>>
): Promise<void> => {
  try {
    const { key, page, limit } = req.body;

    const pageSizeNum = parseInt(page as string, 10);
    const pageLimitNum = parseInt(limit as string, 10);

    if (isNaN(pageSizeNum) || pageSizeNum < 0) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid input",
        error: "pageSize must be a non-negative integer",
      });
      return;
    }
    if (isNaN(pageLimitNum) || pageLimitNum < 0) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid input",
        error: "pageLimit must be a non-negative integer",
      });
      return;
    }

    const { agencies, total } = await searchAgencyRepo(
      key as string | undefined,
      pageSizeNum,
      pageLimitNum
    );

    if (pageSizeNum === 0 || pageLimitNum === 0) {
      res.status(statusCode.OK).json({
        status: true,
        message: "agencies retrieved successfully",
        data: {
          total: total,
          list: agencies,
        },
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "agencies retrieved successfully",
      pageSize: pageSizeNum,
      pageLimit: pageLimitNum,
      totalPages: Math.ceil(total / pageLimitNum),
      data: {
        total: total,
        list: agencies,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
