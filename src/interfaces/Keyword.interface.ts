import { DistributionType } from "../enums/distribution.enum";

export interface KeywordAttributes {
  id?: number;
  campaignId: number | null; // Nullable if not always present
  name: string;
  urls?: string[];
  distribution: DistributionType;
  traffic : number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
