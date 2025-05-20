import { Request, Response } from "express";
import statusCode from "../../constants/statusCode";
import {
  createReportRepository,
  getReportListRepository,
  updateStatusReportRepository,
} from "../../repositories/commonRepo/report.repository";
import { createNewImage } from "../../repositories/commonRepo/image.repository";
import { ImageType } from "../../enums/imageType.enum";

export const createReportController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, title, content } = req.body;
    const images = req.files;

    if (!images || !Array.isArray(images) || images.length === 0) {
      res
        .status(statusCode.BAD_REQUEST)
        .json({ message: "No images provided" });
      return;
    }

    // Create images first and collect their IDs
    const imageIds = await Promise.all(
      images.map(async (image: any) => {
        const base64Image = `data:${
          image.mimetype
        };base64,${image.buffer.toString("base64")}`;
        const newImage = await createNewImage({
          imageBase64: base64Image,
          type: ImageType.REPORT,
          createdBy: userId,
        });
        return newImage.id;
      })
    );

    // Create report with the collected image IDs
    const report = await createReportRepository({
      userId,
      title,
      content,
      imgIds: imageIds,
    });

    res.status(statusCode.CREATED).json(report);
  } catch (error: any) {
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const getReportUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, status, page, limit } = req.body;
    const reports = await getReportListRepository(userId, status, page, limit);

    if ("total" in reports) {
      // Paginated response
      const response = {
        total: reports.total,
        data: reports.reports.map((report: any) => {
          const { imgIds, ...reportData } = report.toJSON();
          return {
            ...reportData,
            imagesUrl: imgIds.map(
              (imgId: number) =>
                `${process.env.DEV_URL}/api/auth/image/${imgId}`
            ),
          };
        }),
      };
      res.status(statusCode.OK).json(response);
    } else {
      // Non-paginated response
      const response = reports.map((report: any) => {
        const { imgIds, ...reportData } = report.toJSON();
        return {
          ...reportData,
          imagesUrl: imgIds.map(
            (imgId: number) => `${process.env.DEV_URL}/api/auth/image/${imgId}`
          ),
        };
      });
      res.status(statusCode.OK).json(response);
    }
  } catch (error: any) {
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const updateReportController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await updateStatusReportRepository(Number(id), status);
    res.status(statusCode.OK).json({ message: "Report updated successfully" });
  } catch (error: any) {
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};
