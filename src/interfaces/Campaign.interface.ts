import { CampaignStatus } from "../enums/campaign.enum";
import { CampaignTypeAttributes } from "./CampaignType.interface";
import { KeywordAttributes } from "./Keyword.interface";
import { LinkAttributes } from "./Link.interface";

export interface CampaignAttributes  {
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
  cost?: number;
  domain: string;
  search: string;
  linksCount?: number;
  keywordsCount?: number;
  keywords?: KeywordAttributes[]
  links?: LinkAttributes[];
  isDeleted?: boolean;
  status: CampaignStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
