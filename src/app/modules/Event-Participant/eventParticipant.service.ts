import { StatusCodes } from "http-status-codes";
import ApiError from "../../Error/error";
import { prisma } from "../../shared/prisma";
import { ParticipantStatus, PaymentStatus } from "@prisma/client";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const joinEvent = async (eventId: string, email: string) => {
  // 1. Get user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError("User not found", StatusCodes.NOT_FOUND);
  }

  // 2. Get event
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });
  if (!event) {
    throw new ApiError("Event not found", StatusCodes.NOT_FOUND);
  }

  // 3. Prevent joining past events
  if (new Date(event.date) < new Date()) {
    throw new ApiError(
      "This event has already passed",
      StatusCodes.BAD_REQUEST
    );
  }

  // 4. Prevent joining full events
  const participantCount = await prisma.eventParticipant.count({
    where: { eventId },
  });
  if (event.maxParticipants && participantCount >= event.maxParticipants) {
    throw new ApiError("Event is already full", StatusCodes.BAD_REQUEST);
  }

  // 5. Prevent duplicate joining
  const alreadyJoined = await prisma.eventParticipant.findFirst({
    where: {
      eventId,
      userId: user.id,
      status: ParticipantStatus.JOINED,
    },
  });
  if (alreadyJoined) {
    throw new ApiError(
      "You have already joined this event",
      StatusCodes.BAD_REQUEST
    );
  }

  // 6. Create event participant (PENDING PAYMENT)
  const eventParticipant = await prisma.eventParticipant.create({
    data: {
      eventId,
      userId: user.id,
      status: ParticipantStatus.JOINED,
      bookingStatus: PaymentStatus.PENDING,
    },
  });

  // 7. Get host
  const host = await prisma.host.findUniqueOrThrow({
    where: { id: event.hostId },
  });
  if (!host) {
    throw new ApiError("Host not found", StatusCodes.NOT_FOUND);
  }

  // 8. Create Payment DB Record
  const payment = await prisma.payment.create({
    data: {
      eventId,
      userId: user.id,
      hostId: host.id,
      participantId: eventParticipant.id,
      amount: event.joiningFee ?? 0,
      currency: "BDT",
      provider: "stripe",
      status: PaymentStatus.PENDING,
    },
  });

  // 9. Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd", // optional: BDT not supported on Stripe
          product_data: {
            name: event.name,
          },
          unit_amount: Math.round((event.joiningFee ?? 0) * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.CLIENT_URL}/payment-success?paymentId=${payment.id}`,
    cancel_url: `${process.env.CLIENT_URL}/payment-failed?paymentId=${payment.id}`,
    metadata: {
      paymentId: payment.id,
      participantId: eventParticipant.id,
      eventId,
      userId: user.id,
    },
  });
  console.log(session);
  // 10. Return the Stripe checkout URL
  return {
    message: "Event joined successfully — redirect to Stripe",
    checkoutUrl: session.url,
    participantId: eventParticipant.id,
    paymentId: payment.id,
  };
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
