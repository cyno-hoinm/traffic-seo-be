import { PackageType } from "../../enums/packageType.enum";
import { PackageAttributes } from "../../interfaces/Package.interface";
import Package from "../../models/Package.model";
import { Op } from "sequelize";

export const getPackageListRepo = async (): Promise<PackageAttributes[]> => {
  const packages = await Package.findAll({
    where: { isDeleted: false },
  });
  return packages;
};
export const getPackageByIdRepo = async (
  id: number
): Promise<PackageAttributes | null> => {
  const pkg = await Package.findByPk(id);
  return pkg;
};
export const createPackageRepo = async (
  pkg: PackageAttributes
): Promise<PackageAttributes> => {
  const newPackage = await Package.create(pkg);
  return newPackage;
};

export const updatePackageRepo = async (
  id: number,
  pkg: PackageAttributes
): Promise<PackageAttributes | null> => {
  const [affectedCount] = await Package.update(pkg, { where: { id } });
  if (affectedCount === 0) return null;
  return await Package.findByPk(id);
};

export const deletePackageRepo = async (id: number): Promise<boolean> => {
  const [affectedCount] = await Package.update(
    { isDeleted: true },
    { where: { id } }
  );
  return affectedCount > 0;
};

export const getPackageByNameRepo = async (
  name: string
): Promise<PackageAttributes | null> => {
  const pkg = await Package.findOne({ where: { name } });
  return pkg;
};

export const searchPackageRepo = async (
  key: string,
  type: PackageType,
  page: number,
  limit: number
): Promise<PackageAttributes[]> => {
  const pkg = await Package.findAll({
    where: { name: { [Op.like]: `%${key}%` }, type },
    offset: (page - 1) * limit,
    limit,
  });
  return pkg;
};
