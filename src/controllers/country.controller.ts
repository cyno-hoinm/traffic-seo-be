import { Request, Response } from "express";
import statusCode from "../constants/statusCode"; // Adjust path
import {
  createCountryRepo,
  getAllCountriesRepo,
  getCountryByIdRepo,
  getCountryByNameRepo,
  updateCountryRepo,
  deleteCountryRepo,
} from "../repositories/country.repository"; // Adjust path
import { ResponseType } from "../types/Response.type"; // Adjust path
import { CountryAttributes } from "../interfaces/Country.interface";

// Create a new country
export const createCountry = async (
  req: Request,
  res: Response<ResponseType<CountryAttributes>>
): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Country name is required",
        error: "Missing required field",
      });
      return;
    }

    const existingCountry = await getCountryByNameRepo(name);
    if (existingCountry) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Country with this name already exists",
        error: "Duplicate country name",
      });
      return;
    }

    const country = await createCountryRepo(name);
    res.status(statusCode.CREATED).json({
      status: true,
      message: "Country created successfully",
      data: {
        id: country.id,
        name: country.name,
        createdAt: country.createdAt,
        updatedAt: country.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error creating country",
      error: error.message,
    });
  }
};

// Get all countries
export const getAllCountries = async (
  req: Request,
  res: Response<ResponseType<CountryAttributes[]>>
): Promise<void> => {
  try {
    const countries = await getAllCountriesRepo();
    res.status(statusCode.OK).json({
      status: true,
      message: "Countries retrieved successfully",
      data: countries.map((country: CountryAttributes) => ({
        id: country.id,
        name: country.name,
        createdAt: country.createdAt,
        updatedAt: country.updatedAt,
      })),
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching countries",
      error: error.message,
    });
  }
};

// Get country by ID
export const getCountryById = async (
  req: Request,
  res: Response<ResponseType<CountryAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const country = await getCountryByIdRepo(Number(id));

    if (!country) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Country not found",
        error: "Resource not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Country retrieved successfully",
      data: {
        id: country.id,
        name: country.name,
        createdAt: country.createdAt,
        updatedAt: country.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error fetching country",
      error: error.message,
    });
  }
};

// Update country
export const updateCountry = async (
  req: Request,
  res: Response<ResponseType<CountryAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Country name is required",
        error: "Missing required field",
      });
      return;
    }

    const country = await updateCountryRepo(Number(id), name);

    if (!country) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Country not found",
        error: "Resource not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Country updated successfully",
      data: {
        id: country.id,
        name: country.name,
        createdAt: country.createdAt,
        updatedAt: country.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error updating country",
      error: error.message,
    });
  }
};

// Delete country
export const deleteCountry = async (
  req: Request,
  res: Response<ResponseType<CountryAttributes>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const success = await deleteCountryRepo(Number(id));

    if (!success) {
      res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Country not found",
        error: "Resource not found",
      });
      return;
    }

    res.status(statusCode.OK).json({
      status: true,
      message: "Country deleted successfully",
    });
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Error deleting country",
      error: error.message,
    });
  }
};
