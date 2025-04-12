import { CampaignStatus } from "../enums/campaign.enum";
import { CampaignTypeAttributes } from "./CampaignType.interface";

export interface CampaignAttributes {
  id?: number;
  userId: number;
  countryId: number;
  name: string;
  campaignTypeId: CampaignTypeAttributes;
  device: string;
  timeCode: string;
  startDate: Date;
  endDate: Date;
  totalTraffic: number;
  cost: number;
  domain: string;
  search: string;
  keyword: string;
  isDeleted?: boolean;
  status: CampaignStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
