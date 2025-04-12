import { LinkStatus } from "../enums/linkStatus.enum";

export interface LinkAttributes {
  id?: number;
  campaignId: number;
  link: string;
  linkTo: string;
  distribution: string;
  traffic: number;
  anchorText: string;
  status: LinkStatus;
  url: string;
  page: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
