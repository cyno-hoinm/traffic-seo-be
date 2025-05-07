import { ImageAttributes } from "../../interfaces/Image.interface";
import { Image } from "../../models/index.model";

export const createNewImage = async (imageData: ImageAttributes) => {
  const newImage = await Image.create(imageData);
  return newImage;
};
