import { Request, Response } from "express";
import { ResponseType } from "../../types/Response.type";
import { findUserByEmailRepo } from "../../repositories/commonRepo/user.repository";
import { comparePassword, signToken } from "../../utils/utils";
import statusCode from "../../constants/statusCode";

export const loginUser = async (
  req: Request,
  res: Response<ResponseType<any>>
): Promise<any> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res
        .status(statusCode.BAD_REQUEST)
        .json({ status: false, message: "Email and password are required" });
      return;
    }

    // Fetch user with role using the repository
    const user = await findUserByEmailRepo(email);

    // Check if user exists
    if (!user) {
      res
        .status(statusCode.UNAUTHORIZED)
        .json({ status: false, message: "Invalid email or password" });
      return;
    }

    // Verify password (assuming it's hashed in the database)
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      res
        .status(statusCode.UNAUTHORIZED)
        .json({ status: false, message: "Invalid email or password" });
      return;
    }

    const token = signToken(user.toJSON());

    res.status(statusCode.OK).json({
      status: true,
      message: "Login successful",
      data: {
        token: token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          isDeleted: user.isDeleted,
          role: user.role, // Include role if needed
        },
      },
    });
    return;
  } catch (error: any) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
