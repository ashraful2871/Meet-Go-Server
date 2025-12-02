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
const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.login(req.body);
  const { accessToken, refreshToken, needPasswordChange } = result;

  res.cookie("accessToken", accessToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60,
  });
  res.cookie("refreshToken", refreshToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 90,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Login Successfully",
    data: { needPasswordChange },
  });
});

export const authController = {
  userRegistration,
  login,
};
