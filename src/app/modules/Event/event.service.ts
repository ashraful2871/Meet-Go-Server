import { StatusCodes } from "http-status-codes";
import ApiError from "../../Error/error";
import { prisma } from "../../shared/prisma";
import { EventStatus, VerificationStatus } from "@prisma/client";

const createEvent = async (email: string, payload: any) => {
  const host = await prisma.host.findUniqueOrThrow({
    where: {
      email: email,
    },
  });

  if (!host) {
    throw new ApiError(
      "You must be a verified host to create an event",
      StatusCodes.FORBIDDEN
    );
  }

  if (host.verificationStatus !== VerificationStatus.APPROVED) {
    throw new ApiError(
      "Your host verification is not approved yet",
      StatusCodes.UNAUTHORIZED
    );
  }

  const event = await prisma.event.create({
    data: {
      ...payload,
      hostId: host.id,
      userId: host.userId,
    },
  });

  return event;
};

const getAllEvents = async () => {
  return prisma.event.findMany({
    where: { status: EventStatus.OPEN },
    include: {
      eventCategory: true,
      host: true,
      reviews: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const getAllHostEvent = async (email: string) => {
  const host = await prisma.host.findUniqueOrThrow({
    where: { email },
  });

  if (!host) {
    throw new ApiError("Host not found", StatusCodes.NOT_FOUND);
  }

  const events = await prisma.event.findMany({
    where: { hostId: host.id },
    include: {
      eventCategory: true,
      host: true,
      reviews: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return events;
};

const getSingleEvent = async (eventId: string) => {
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
    include: {
      eventCategory: true,
      host: true,
      eventParticipants: true,
      reviews: true,
    },
  });

  if (!event) {
    throw new ApiError("Event not found", StatusCodes.NOT_FOUND);
  }

  return event;
};

const updateEvent = async (email: string, eventId: string, payload: any) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new ApiError("Event not found", StatusCodes.NOT_FOUND);
  }

  const host = await prisma.host.findUniqueOrThrow({
    where: { email },
  });

  // Ensure only the owner (host) can update
  if (event.hostId !== host.id) {
    throw new ApiError(
      "You are not allowed to update this event",
      StatusCodes.FORBIDDEN
    );
  }

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: payload,
  });

  return updated;
};

const deleteEvent = async (email: string, eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new ApiError("Event not found", StatusCodes.NOT_FOUND);
  }
  const host = await prisma.host.findUniqueOrThrow({
    where: { email },
  });

  if (event.hostId !== host.id) {
    throw new ApiError(
      "You are not allowed to delete this event",
      StatusCodes.FORBIDDEN
    );
  }

  const deleted = await prisma.event.delete({
    where: { id: eventId },
  });

  return deleted;
};

export const eventService = {
  createEvent,
  getAllEvents,
  getAllHostEvent,
  getSingleEvent,
  updateEvent,
  deleteEvent,
};
