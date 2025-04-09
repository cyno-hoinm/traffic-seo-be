import { CampaignStatus } from "../enums/campaign.enum";

export interface CampaignAttributes {
  id?: number;
  userId: number;
  countryId: number;
  name: string;
  type: string;
  device: string;
  timeCode: string;
  startDate: Date;
  endDate: Date;
  totalTraffic: number;
  cost: number;
  domain: string;
  search: string;
  keyword: string;
  status: CampaignStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
