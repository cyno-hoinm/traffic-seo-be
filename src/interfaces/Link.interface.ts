import { DistributionType } from "../enums/distribution.enum";
import { IndexStatus } from "../enums/indexStatus.enum";
import { LinkStatus } from "../enums/linkStatus.enum";


export interface LinkAttributes {
  id?: number;
  campaignId: number;
  link: string;
  linkTo?: string;
  distribution: DistributionType;
  traffic?: number;
  anchorText?: string;
  status: LinkStatus;
  indexStatus?: IndexStatus;
  url?: string;
  page?: string;
  cost: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
