import express from "express";
import { validate } from "../middleware/validateMiddlware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  initiatePayment,
  handlePaymentSuccess,
  handlePaymentFail,
  handlePaymentCancel,
} from "../controller/payment.controller.js";
import {
  initiatePaymentSchema,
  paymentSuccessResponseSchema,
  verifyPaymentSchema,
} from "../schemas/payment.schema.js";

const router = express.Router();

/**
 * POST /api/payments/initiate
 * Initiate a payment session with Aamarpay
 * Requires: Authentication
 */

router.post(
  "/initiate",
  authMiddleware,
  validate(initiatePaymentSchema),
  initiatePayment,
);

/**
 * POST /api/payments/success
 * Handle successful payment redirect from Aamarpay
 * No auth required (Aamarpay redirects here)
 */

router.post(
  "/success",
  validate(paymentSuccessResponseSchema),
  handlePaymentSuccess,
);

/**
 * POST /api/payments/fail
 * Handle failed payment redirect from Aamarpay
 * No auth required (Aamarpay redirects here)
 */

router.post("/fail", handlePaymentFail);

/**
 * POST /api/payments/cancel
 * Handle cancelled payment redirect from Aamarpay
 * No auth required (User navigates away)
 */
router.post("/cancel", handlePaymentCancel);

/**
 * POST /api/payments/webhook
 * Aamarpay sends IPN (Instant Payment Notification) webhook here
 * TODO: Implement in Phase 5 with signature verification
 */

// router.post("/webhook", handleWebhookNotification);

export default router;
