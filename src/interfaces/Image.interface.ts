import { ImageType } from "../enums/imageType.enum";

export interface ImageAttributes {
  id?: number;
  type: ImageType;
  imageUrl?: string;
  imageBase64: string;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
