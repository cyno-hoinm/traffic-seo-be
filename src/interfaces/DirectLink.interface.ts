import { DistributionType } from "../enums/distribution.enum";
import { DirectLinkType } from "../enums/directLinkType.enum";
import { CampaignAttributes } from "./Campaign.interface";

export interface DirectLinkAttributes {
  id?: number;
  campaignId: number | null; // Nullable if not always present
  campaigns?: CampaignAttributes;
  cost: number;
  link: string; 
  status: string;
  timeOnSite: number;
  type : DirectLinkType;
  distribution: DistributionType;
  traffic: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
