import { CampaignAttributes } from "./Campaign.interface";

export interface GoogleMapReviewAttributes {
  id?: number;
  googleMapUrl: string;
  stars: number;
  location: string;
  campaignId: number | null; // Nullable if not always present
  campaigns?: CampaignAttributes;
  cost: number;
  content: string;
  imgUrls?: string[];
  isDeleted?: boolean;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}
