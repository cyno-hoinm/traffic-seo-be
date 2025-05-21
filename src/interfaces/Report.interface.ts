import { ReportStatus } from "../enums/reportStatus.enum";

export interface ReportAttributes {
  id?: number;
  userId: number;
  title: string;
  content: string;
  imgIds: number[];
  isDeleted?: boolean;
  status?: ReportStatus;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
} 