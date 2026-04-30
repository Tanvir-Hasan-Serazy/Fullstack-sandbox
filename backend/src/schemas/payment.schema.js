import { z } from "zod";

/**
 * Schema for initiating a payment
 * Validates data sent from frontend to /api/payments/initiate
 */

export const initiatePaymentSchema = z.object({
  transactionId: z
    .string()
    .min(1, "Transaction ID is required")
    .max(32, "Transaction ID must be 32 character or less"),

  amount: z
    .string()
    .transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num)) {
        return undefined;
      }
      return num;
    })
    .pipe(z.number().positive("Amount must be greater than 0")),

  customerName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(40, "Name must be 40 character or less")
    .regex(
      /^[a-zA-Z\s\-'.]+$/,
      "Name can only contain letters, spaces, hyphens, apostrophes, and periods",
    ),

  customerAddress: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(255, "Address must be 255 characters or less"),

  customerCity: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City must be 100 characters or less"),

  customerCountry: z
    .string()
    .min(2, "Country must be at least 2 characters")
    .max(100, "Country must be 100 characters or less"),

  description: z
    .string()
    .max(255, "Description must be 255 characters or less")
    .optional(),
});

export const paymentSuccessResponseSchema = z
  .object({
    pg_txnid: z.string().min(1, "Payment gateway transaction ID is required"),

    mer_txnid: z.string().min(1, "Merchant transaction ID is required"),

    amount: z
      .string()
      .transform((val) => parseFloat(val))
      .pipe(z.number().positive("Amount must be positive")),
    status_code: z.string().regex(/^[0237]$/, "Invalid status code"),

    pay_status: z
      .string()
      .refine(
        (val) => ["Successful", "Failed", "Expired"].includes(val),
        "Invalid pay status",
      ),
    card_type: z.string().optional(),

    bank_txn: z.string().optional(),
    pg_service_charge_bdt: z
      .string()
      .optional()
      .transform((val) => (val ? parseFloat(val) : null)),

    store_amount: z
      .string()
      .optional()
      .transform((val) => (val ? parseFloat(val) : null)),

    cus_name: z.string().optional(),

    cus_email: z.string().optional(),

    cus_phone: z.string().optional(),

    // Allow additional fields from Aamarpay
  })
  .passthrough();

export const verifyPaymentSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
  status: z
    .enum(["completed", "failed", "cancelled", "expired"], {
      errorMap: () => ({
        message: "Status must be one of: completed, failed, cancelled, expired",
      }),
    })
    .optional(),
});

export const getPaymentSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
});

export const aamarpayWebhookSchema = z
  .object({
    pg_txnid: z.string(),
    mer_txnid: z.string(),
    pay_status: z.string(),
    status_code: z.string(),
    amount: z.string(),
    // Add other fields as needed
  })
  .passthrough();
