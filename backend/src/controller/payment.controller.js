import { prisma } from "../prisma/client.js";
import {
  generateTransactionId,
  createPaymentRequest,
  validatePaymentResponse,
  mapAamarpayResponseToTransaction,
  verifyTransactionAmount,
  extractMerchantTransactionId,
  callAamarPayAPI,
} from "../utils/amarpay.js";

/**
 * POST /api/payments/initiate
 * Initiate payment with Aamarpay
 * Frontend sends transaction details, backend creates payment URL
 */

export const initiatePayment = async (req, res) => {
  try {
    const validateDate = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, error: "User not authenticated" });
    }

    const {
      transactionId,
      amount,
      currency,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      customerCity,
      customerCountry,
      description,
    } = validateDate;

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (transaction.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized: Transaction does not belong to user",
      });
    }

    // Verify amount matches
    if (parseFloat(transaction.amount) !== parseFloat(amount)) {
      return res.status(400).json({
        success: false,
        error: "Amount mismatch between request and transaction",
      });
    }

    // Skip payment if already completed
    if (transaction.status === "completed") {
      return res.status(400).json({
        success: false,
        error: "Payment already completed for this transaction",
      });
    }

    // Skip payment if already completed
    if (transaction.status === "completed") {
      return res.status(400).json({
        success: false,
        error: "Payment already completed for this transaction",
      });
    }

    const amarpayTranId = generateTransactionId();

    // Construct success/fail/cancel URLs with locale support
    const baseUrl = process.env.FRONTEND_BASE_URL || "http://localhost:3000";
    const locale = "en"; // TODO: Get locale from request or user preference

    const paymentRequestData = {
      transactionId: amarpayTranId,
      amount: amount,
      customerName: customerName,
      customerEmail: customerEmail,
      customerPhone: customerPhone,
      customerAddress: customerAddress,
      customerCity: customerCity,
      customerCountry: customerCountry,
      description: description,
      successUrl: `${baseUrl}/${locale}/payment-success?txn=${transactionId}`,
      failUrl: `${baseUrl}/${locale}/payment-failed?txn=${transactionId}`,
      cancelUrl: `${baseUrl}/${locale}/payment-cancelled?txn=${transactionId}`,
    };

    // Call Aamarpay API
    const paymentRequest = createPaymentRequest(paymentRequestData);

    // Call Aamarpay API
    const aamarpayResponse = await callAamarPayAPI(paymentRequest);

    // Update transaction with Aamarpay transaction ID
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        amarpayTranId: amarpayTranId,
        status: "pending", // Transaction is pending until is payment is confirmed
        transactionId: transactionId,
        message:
          "Payment initialization successful. Redirecting ot Aamarpay...",
      },
    });

    return res.status(200).json({
      success: true,
      payment_url: aamarpayResponse.payment_url,
    });
  } catch (error) {
    console.error("Initiate payment error", error.message);
    return res.status(500).json({
      sucess: false,
      error: error.message || "Failed to initiate payment. Try again",
    });
  }
};

export const handlePaymentSuccess = async (req, res) => {
  try {
    const responseData = req.body;

    // Validate Aamarpay response format
    if (!validatePaymentResponse(responseData)) {
      return res.status(400).json({
        success: false,
        error: "Invalid payment respoise from Aamarpay",
      });
    }

    // Extract merchant transaction ID
    const merTxnId = extractMerchantTransactionId(responseData);

    // Find transaction in database
    const transaction = await prisma.transaction.findFirst({
      where: {
        amarpayTranId: merTxnId,
      },
    });

    if (!transaction) {
      console.warn(`Transaction not found for mer_txnid: ${merTxnId}`);
      return res.status(404).json({
        success: false,
        error: "Transaction not found",
      });
    }

    // Verify amount matches (security check)
    if (!verifyTransactionAmount(transaction.amount, responseData.amount)) {
      console.error(
        `Amount verification failed for transaction: ${transaction.id}`,
      );
      return res.status(400).json({
        success: false,
        error: "Payment amount verification failed",
      });
    }

    // Map Aamarpay response to transaction update
    const updateData = mapAamarpayResponseToTransaction(responseData);

    // Update transaction in database
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      transactionId: transaction.id,
      amarpayTransactionId: responseData.pg_txnid,
      amount: responseData.amount,
      currency: responseData.currency,
      status: updatedTransaction.status,
      message: "Payment successful",
    });
  } catch (error) {
    console.error("Payment Success Handler Error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to process payment confirmation. Please contact support.",
    });
  }
};

export const handlePaymentFail = async (req, res) => {
  try {
    const responseData = req.body;

    // Extract merchant transaction ID
    const merTxnId = extractMerchantTransactionId(responseData);

    // Find transaction
    const transaction = await prisma.transaction.findFirst({
      where: {
        amarpayTranId: merTxnId,
      },
    });

    if (!transaction) {
      console.warn(`Transaction not found for failed payment: ${merTxnId}`);
      return res.status(404).json({
        success: false,
        error: "Transaction not found",
      });
    }

    // Map response and update status to failed
    const updateData = mapAamarpayResponseToTransaction(responseData);

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: updateData,
    });

    // TODO: Send failure notification email to customer

    return res.status(200).json({
      success: false,
      transactionId: transaction.id,
      amarpayTransactionId: responseData.pg_txnid || null,
      status: updatedTransaction.status,
      reason:
        responseData.reason || responseData.error_title || "Payment failed",
      message: "Payment could not be processed",
    });
  } catch (error) {
    console.error("Payment Fail Handler Error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to process payment failure. Please contact support.",
    });
  }
};

export const handlePaymentCancel = async (req, res) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        error: "Transaction ID is required",
      });
    }

    // Find and update transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: "Transaction not found",
      });
    }

    // Update status to cancelled only if not already completed
    if (transaction.status !== "completed") {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: "cancelled",
          updatedAt: new Date(),
        },
      });
    }

    return res.status(200).json({
      success: true,
      transactionId,
      status: "cancelled",
      message: "Payment has been cancelled",
    });
  } catch (error) {
    console.error("Payment Cancel Handler Error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to cancel payment",
    });
  }
};
