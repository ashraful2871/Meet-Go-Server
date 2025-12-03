import { StatusCodes } from "http-status-codes";
import ApiError from "../../Error/error";
import { prisma } from "../../shared/prisma";
import { ParticipantStatus, PaymentStatus } from "@prisma/client";

const joinEvent = async (eventId: string, email: string) => {
  // Get user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError("User not found", StatusCodes.NOT_FOUND);
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new ApiError("Event not found", StatusCodes.NOT_FOUND);
  }
  // Prevent joining CLOSED, CANCELLED, COMPLETED
  if (new Date(event.date) < new Date()) {
    throw new ApiError(
      "This event has already passed",
      StatusCodes.BAD_REQUEST
    );
  }

  // Prevent joining CLOSED, CANCELLED, COMPLETED
  const participantCount = await prisma.eventParticipant.count({
    where: { eventId },
  });

  if (event.maxParticipants && participantCount >= event.maxParticipants) {
    throw new ApiError("Event is already full", StatusCodes.BAD_REQUEST);
  }

  // Check if user already joined
  const alreadyJoined = await prisma.eventParticipant.findFirst({
    where: {
      eventId,
      userId: user?.id,
      status: ParticipantStatus.JOINED,
    },
  });

  if (alreadyJoined) {
    throw new ApiError(
      "You have already joined this event",
      StatusCodes.BAD_REQUEST
    );
  }

  // create participant
  const eventParticipant = await prisma.eventParticipant.create({
    data: {
      eventId,
      userId: user?.id,
      status: ParticipantStatus.JOINED,
      bookingStatus: PaymentStatus.PENDING,
    },
  });

  return eventParticipant;
};

const leaveEvent = async (eventId: string, email: string) => {
  // Get user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError("User not found", StatusCodes.NOT_FOUND);
  }

  const participant = await prisma.eventParticipant.findFirst({
    where: { eventId, userId: user?.id, status: ParticipantStatus.JOINED },
  });

  if (!participant) {
    throw new ApiError(
      "You are not a participant of this event",
      StatusCodes.BAD_REQUEST
    );
  }

  const updated = await prisma.eventParticipant.update({
    where: { id: participant.id },
    data: { status: ParticipantStatus.CANCELLED },
  });

  return updated;
};

const mgetMyJoinedEvents = async (email: string) => {
  // Get user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError("User not found", StatusCodes.NOT_FOUND);
  }
  const myJoinedEvents = await prisma.eventParticipant.findMany({
    where: {
      userId: user.id,
      status: ParticipantStatus.JOINED,
    },
    include: {
      event: true,
    },
  });
  return myJoinedEvents;
};

const getEventParticipants = async (eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });
  if (!event) {
    throw new ApiError("Event not found", StatusCodes.NOT_FOUND);
  }

  return await prisma.eventParticipant.findMany({
    where: { eventId },
    include: {
      user: true,
    },
  });
};

export const eventParticipantService = {
  joinEvent,
  leaveEvent,
  mgetMyJoinedEvents,
  getEventParticipants,
};
