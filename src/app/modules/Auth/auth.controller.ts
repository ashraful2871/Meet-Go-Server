import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { authServices } from "./auth.service";
import { Request, Response } from "express";

const userRegistration = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.userRegistration(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "User Registered successfully",
    data: result,
  });
});

export const authController = {
  userRegistration,
};
