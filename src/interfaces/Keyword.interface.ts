import { DistributionType } from "../enums/distribution.enum";
import { CampaignAttributes } from "./Campaign.interface";

export interface KeywordAttributes {
  id?: number;
  campaignId: number | null; // Nullable if not always present
  campaigns? : CampaignAttributes
  name: string;
  cost: number;
  urls?: string;
  status: string;
  distribution: DistributionType;
  traffic: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
