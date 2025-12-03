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

const getAllEvents = catchAsync(async (req: Request, res: Response) => {
  const result = await eventService.getAllEvents();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Events fetched successfully",
    data: result,
  });
});

const getSingleEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await eventService.getSingleEvent(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Event details fetched successfully",
    data: result,
  });
});

const updateEvent = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const { email } = req.user;
    const eventId = req.params.id;

    const result = await eventService.updateEvent(email, eventId, req.body);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Event updated successfully",
      data: result,
    });
  }
);

const deleteEvent = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const { email } = req.user;
    const eventId = req.params.id;

    const result = await eventService.deleteEvent(email, eventId);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Event deleted successfully",
      data: result,
    });
  }
);

export const eventController = {
  createEvent,
  getAllEvents,
  getSingleEvent,
  updateEvent,
  deleteEvent,
};
