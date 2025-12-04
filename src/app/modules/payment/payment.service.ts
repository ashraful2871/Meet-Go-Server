import Stripe from "stripe";
import { prisma } from "../../shared/prisma";
import { PaymentStatus } from "@prisma/client";

const handleStripeWebhookPayment = async (event: Stripe.Event) => {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;

      const paymentId = session.metadata.paymentId;
      const participantId = session.metadata.participantId;

      if (!paymentId || !participantId) {
        console.error("❌ Missing metadata");
        return;
      }

      // --- PAYMENT SUCCESS ---
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status:
            session.payment_status === "paid"
              ? PaymentStatus.COMPLETED
              : PaymentStatus.FAILED,
          transactionId: session.payment_intent,
        },
      });

      await prisma.eventParticipant.update({
        where: { id: participantId },
        data: {
          bookingStatus:
            session.payment_status === "paid"
              ? PaymentStatus.COMPLETED
              : PaymentStatus.FAILED,
        },
      });

      // Update host earnings (optional)
      const payment = await prisma.payment.findUniqueOrThrow({
        where: { id: paymentId },
      });

      if (payment) {
        await prisma.host.update({
          where: { id: payment.hostId },
          data: {
            totalEarnings: { increment: payment.amount },
            totalParticipants: { increment: 1 },
          },
        });
      }

      console.log("✔ Payment Completed & Participant Updated");
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
};

export const paymentService = {
  handleStripeWebhookPayment,
};
