import { Request, Response } from "express";
import {
  createPackageRepo,
  deletePackageRepo,
  getPackageByIdRepo,
  getPackageListRepo,
  searchPackageRepo,
  updatePackageRepo,
} from "../../repositories/moneyRepo/packge.deposit";
import statusCode from "../../constants/statusCode";
export const getAllPackageList = async (req: Request, res: Response) => {
  try {
    const packages = await getPackageListRepo();
    res.status(statusCode.OK).json({
      status: true,
      message: "Get all package list successfully",
      data: packages,
    });
  } catch (error) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Get all package list failed",
      error: error,
    });
  }
};

export const getPackageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pkg = await getPackageByIdRepo(Number(id));
    res.status(statusCode.OK).json({
      status: true,
      message: "Get package by id successfully",
      data: pkg,
    });
  } catch (error) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Get package by id failed",
      error: error,
    });
  }
};

export const createPackage = async (req: Request, res: Response) => {
  try {
    const { name, description, price, type, bonus } = req.body;
    const pkg = await createPackageRepo({ name, description, price, type, bonus });
    res.status(statusCode.OK).json({
      status: true,
      message: "Create package successfully",
      data: pkg,
    });
  } catch (error) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Create package failed",
      error: error,
    });
  }
};

export const updatePackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, type, bonus } = req.body;
    const pkg = await updatePackageRepo(Number(id), {
      name,
      description,
      price,
      type,
      bonus,
    });
    res.status(statusCode.OK).json({
      status: true,
      message: "Update package successfully",
      data: pkg,
    });
  } catch (error) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Update package failed",
      error: error,
    });
  }
};

export const deletePackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pkg = await deletePackageRepo(Number(id));
    res.status(statusCode.OK).json({
      status: true,
      message: "Delete package successfully",
      data: pkg,
    });
  } catch (error) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Delete package failed",
      error: error,
    });
  }
};

export const searchPackage = async (req: Request, res: Response) => {
  try {
    const { key, type, page, limit } = req.body;
    const pkg = await searchPackageRepo(key, type, page, limit);
    res.status(statusCode.OK).json({
      status: true,
      message: "Search package successfully",
      data: pkg,
    });
  } catch (error) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Search package failed",
      error: error,
    });
  }
};
