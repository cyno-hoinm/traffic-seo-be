import { DistributionType } from "../enums/distribution.enum";
import { keywordStatus } from "../enums/keywordStatus.enum";

export interface KeywordAttributes {
  id?: number;
  campaignId: number | null; // Nullable if not always present
  name: string;
  cost: number;
  urls?: string[];
  status: string;
  distribution: DistributionType;
  traffic: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
