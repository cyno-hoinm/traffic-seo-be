import { DistributionType } from "../enums/distribution.enum";
import { CampaignAttributes } from "./Campaign.interface";
import { KeywordType } from "../enums/keywordType.enum";

export interface KeywordAttributes {
  id?: number;
  campaignId: number | null; // Nullable if not always present
  campaigns? : CampaignAttributes
  name: string;
  cost: number;
  urls?: string;
  videoTitle?: string;
  status: string;
  timeOnSite: number;
  distribution: DistributionType;
  keywordType: KeywordType;
  traffic: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
