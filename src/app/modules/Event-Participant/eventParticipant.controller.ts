import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { eventParticipantService } from "./eventParticipant.service";
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const joinEvent = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await eventParticipantService.joinEvent(
      req.params.eventId,
      req.user.email
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Event joined successfully",
      data: result,
    });
  }
);

const leaveEvent = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await eventParticipantService.leaveEvent(
      req.params.eventId,
      req.user.email
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Event left successfully",
      data: result,
    });
  }
);

const getMyJoinedEvents = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await eventParticipantService.mgetMyJoinedEvents(
      req.user.email
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "My joined events fetched successfully",
      data: result,
    });
  }
);

const getEventParticipants = catchAsync(async (req: Request, res: Response) => {
  const result = await eventParticipantService.getEventParticipants(
    req.params.eventId
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Event participants fetched successfully",
    data: result,
  });
});

export const eventParticipantController = {
  joinEvent,
  leaveEvent,
  getMyJoinedEvents,
  getEventParticipants,
};
