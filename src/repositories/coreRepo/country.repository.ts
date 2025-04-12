import { Country } from "../../models/index.model";
import { ErrorType } from "../../types/Error.type";

export const createCountryRepo = async (name: string): Promise<Country> => {
  try {
    const country = await Country.create({ name });
    return country;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const getAllCountriesRepo = async (): Promise<Country[]> => {
  try {
    const countries = await Country.findAll({
      where: { isDeleted: false },
      order: [["createdAt", "DESC"]],
    });
    return countries;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const getCountryByIdRepo = async (
  id: number
): Promise<Country | null> => {
  try {
    const country = await Country.findByPk(id);
    return country;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const getCountryByNameRepo = async (
  name: string
): Promise<Country | null> => {
  try {
    const country = await Country.findOne({ where: { name } });
    return country;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const updateCountryRepo = async (
  id: number,
  data: { name: string }
): Promise<Country | null> => {
  try {
    const country = await Country.findByPk(id);
    if (!country) return null;

    await country.update({ name: data.name });
    return country;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};

export const deleteCountryRepo = async (id: number): Promise<boolean> => {
  try {
    const country = await Country.findByPk(id);
    if (!country) return false;

    await country.update({ isDeleted: true });
    return true;
  } catch (error: any) {
    throw new ErrorType(error.name, error.message, error.code);
  }
};
