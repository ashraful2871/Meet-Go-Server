import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { eventService } from "./event.service";

const createEvent = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const { email } = req.user;
    const result = await eventService.createEvent(email, req.body);

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Event created successfully",
      data: result,
    });
  }
);

export const eventController = {
  createEvent,
};
