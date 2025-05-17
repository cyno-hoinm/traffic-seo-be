import { ImageType } from "../../enums/imageType.enum";
import { ImageAttributes } from "../../interfaces/Image.interface";
import { Image } from "../../models/index.model";

export const createNewImage = async (imageData: ImageAttributes) => {
  const newImage = await Image.create(imageData);
  return newImage;
};
export const getAllReportImages = async (userId?: number) => {
  const whereCondition = userId
    ? { type: ImageType.REPORT, createdBy: userId }
    : { type: ImageType.REPORT };
  const images = await Image.findAll({
    where: whereCondition,
  });
  return images;
};
