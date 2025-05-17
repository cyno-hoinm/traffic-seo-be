import { Request, Response } from "express";
import { createNewImage } from "../../repositories/commonRepo/image.repository";
import statusCode from "../../constants/statusCode";
import { ImageType } from "../../enums/imageType.enum";
export const createImageController = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "No image file provided",
        error: "Missing field",
      });
      return;
    }

    // Convert buffer to base64
    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64"
    )}`;
    await createNewImage({
      imageBase64: base64Image,
      type: ImageType.REPORT,
    });
    res.status(statusCode.CREATED).json({
      status: true,
      message: "Image created successfully",
    });
  } catch (error) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      error: error,
    });
  }
};
