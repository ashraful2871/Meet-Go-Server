import { StatusCodes } from "http-status-codes";
import ApiError from "../../Error/error";
import { prisma } from "../../shared/prisma";
import { VerificationStatus } from "@prisma/client";

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
export const eventService = {
  createEvent,
};
