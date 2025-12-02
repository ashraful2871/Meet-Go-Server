import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { userService } from "./user.service";

const requestHost = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const user = req.user;
    const result = await userService.requestHost(req.body, user);
    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Host request submitted successfully",
      data: result,
    });
  }
);

export const userController = {
  requestHost,
};
