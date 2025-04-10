import { DistributionType } from "../enums/distribution.enum";

export interface KeywordAttributes {
  id?: number;
  campaignId: number;
  name: string;
  url: string[];
  distribution: DistributionType;
  traffic : number;
  createdAt?: Date;
  updatedAt?: Date;
}
