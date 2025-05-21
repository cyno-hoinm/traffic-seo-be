import { CampaignStatus } from "../enums/campaign.enum";
import { DirectLinkAttributes } from "./DirectLink.interface";
import { KeywordAttributes } from "./Keyword.interface";
import { LinkAttributes } from "./Link.interface";
import { UserAttributes } from "./User.interface";

export interface CampaignAttributes  {
  id?: number;
  userId: number;
  users? : UserAttributes
  countryId: number;
  name: string;
  campaignTypeId: number;
  device: string;
  title: string;
  startDate: Date;
  endDate: Date;
  totalTraffic?: number;
  cost?: number;
  totalCost? : number;
  domain: string;
  search: string;
  linksCount?: number;
  keywordsCount?: number;
  keywords?: KeywordAttributes[]
  links?: LinkAttributes[];
  directLinks?: DirectLinkAttributes[];
  isDeleted?: boolean;
  status: CampaignStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
