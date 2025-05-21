// do crud report repository
import Report from "../../models/Report.model";
import { ReportAttributes } from "../../interfaces/Report.interface";
import { ReportStatus } from "../../enums/reportStatus.enum";
export const createReportRepository = async (report: ReportAttributes) => {
  const newReport = await Report.create(report);
  return newReport;
};

export const getReportByIdRepository = async (id: number) => {
  const report = await Report.findByPk(id);
  return report;
};

export const updateStatusReportRepository = async (
  id: number,
  status: ReportStatus
) => {
  const updatedReport = await Report.update({ status }, { where: { id } });
  return updatedReport;
};

export const deleteReportRepository = async (id: number) => {
  const deletedReport = await Report.update(
    { isDeleted: true },
    { where: { id } }
  );
  return deletedReport;
};

export const getReportListRepository = async (
  userId: number,
  status: ReportStatus,
  page: number,
  limit: number
) => {
  const whereCondition: any = { isDeleted: false };
  if (userId) whereCondition.userId = userId;
  if (status) whereCondition.status = status;
  if (page && limit && page > 0 && limit > 0) {
    const offset = (page - 1) * limit;
    const { count, rows: reports } = await Report.findAndCountAll({
      where: whereCondition,
      offset,
      limit,
    });
    return {
      total: count,
      reports,
    };
  } else {
    const reports = await Report.findAll({ where: whereCondition });
    return reports;
  }
};
