import { DistributionType } from "../enums/distribution.enum";
import { CampaignAttributes } from "./Campaign.interface";

export interface DirectLinkAttributes {
  id?: number;
  campaignId: number | null; // Nullable if not always present
  campaigns?: CampaignAttributes;
  cost: number;
  link: string; 
  status: string;
  timeOnSite: number;
  distribution: DistributionType;
  traffic: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
