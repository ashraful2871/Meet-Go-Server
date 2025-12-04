import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { reviewService } from "./review.service";
import { Request, Response } from "express";

const createReview = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await reviewService.createReview(req.user.email, req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Review submitted successfully",
      data: result,
    });
  }
);
export const reviewController = {
  createReview,
};
