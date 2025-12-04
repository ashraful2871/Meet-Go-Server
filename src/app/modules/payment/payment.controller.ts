import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { stripe } from "../../helper/stripe";
import sendResponse from "../../shared/sendResponse";
import { paymentService } from "./payment.service";

const handleStripeWebhookPayment = catchAsync(
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret =
      "whsec_6f5d1b83bccace488539d35ead90c0af7f8966d0f4a5bf5d06a322e8724faf21";

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error("⚠️ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    const result = await paymentService.handleStripeWebhookPayment(event);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Webhook req send successfully",
      data: result,
    });
  }
);

export const paymentController = {
  handleStripeWebhookPayment,
};
