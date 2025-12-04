import { StatusCodes } from "http-status-codes";
import { prisma } from "../../shared/prisma";
import ApiError from "../../Error/error";
import { EventStatus } from "@prisma/client";

const createReview = async (email: string, payload: any) => {
  const { eventId, rating, comment } = payload;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError("User not found", StatusCodes.NOT_FOUND);

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { host: true },
  });
  if (!event) throw new ApiError("Event not found", StatusCodes.NOT_FOUND);
  console.log(event);
  // 1️⃣ Check if user joined the event
  const participant = await prisma.eventParticipant.findFirst({
    where: {
      eventId,
      userId: user.id,
      status: EventStatus.COMPLETED,
    },
  });

  if (!participant)
    throw new ApiError(
      "You can review only after attending the event",
      StatusCodes.FORBIDDEN
    );

  // 2️⃣ Prevent duplicate reviews
  const alreadyReviewed = await prisma.review.findFirst({
    where: { eventId, userId: user.id },
  });

  if (alreadyReviewed)
    throw new ApiError(
      "You have already reviewed this event",
      StatusCodes.BAD_REQUEST
    );

  // 3️⃣ Create Review
  const review = await prisma.review.create({
    data: {
      userId: user.id,
      eventId,
      hostId: event.hostId,
      rating,
      comment,
    },
  });

  // 4️⃣ Update host rating
  const reviewStats = await prisma.review.aggregate({
    where: { hostId: event.hostId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.host.update({
    where: { id: event.hostId },
    data: {
      rating: reviewStats._avg.rating || 0,
      reviewCount: reviewStats._count.rating || 0,
    },
  });

  return review;
};

const getAllEventReviews = async (eventId: string) => {
  return prisma.review.findMany({
    where: { eventId },
    include: {
      user: {
        select: {
          name: true,
          profilePicture: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};
export const reviewService = {
  createReview,
  getAllEventReviews,
};
