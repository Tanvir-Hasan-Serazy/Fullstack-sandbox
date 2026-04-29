import axios from "axios";
import crypto from "crypto";

const AAMARPAY_STATUS = {
  SUCCESS: "2",
  FAILED: "7",
  EXPIRED: "3",
};

const AAMARPAY_URL =
  process.env.AAMARPAY_API_URL || "https://sandbox.aamarpay.com/jsonpost.php";

export const generateTransactionId = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");

  // Generate 6 random hex character
  const random = crypto.randomBytes(3).toString("hex");

  const txnId = `TXN-${dateStr}-${random}`;

  //Safety check - should always be 19 character, well within 32 characters
  if (txnId.length > 32) {
    throw new Error(`Generated txnIds exceeds 32 chars: ${txnId}`);
  }

  return txnId;
};

export const createPaymentRequest = (transactionData) => {
  const {
    transactionId,
    amount,
    currency,
    customerName,
    customerEmail,
    customerPhone,
    description,
    successUrl,
    failUrl,
    cancelUrl,
  } = transactionData;

  //   Validate required fields
  const required = {
    transactionId,
    amount,
    customerName,
    customerEmail,
    customerPhone,
    successUrl,
    failUrl,
    cancelUrl,
  };

  for (const [key, value] of Object.entries(required)) {
    if (value === undefined || value === null || value === "") {
      throw new Error(`createPaymentRequest: Missing  required field ${key}`);
    }
  }

  return {
    store_id: process.env.AAMARPAY_STORE_ID || "aamarpaytest",

    // Aamarpay calls this "tran_id" — your unique transaction identifier
    tran_id: transactionId,

    // Amount must be a string formatted to 2 decimal places e.g. "1000.00"
    amount: parseFloat(amount).toFixed(2),

    currency: currency || "BDT",

    // Your Aamarpay signature/secret key from dashboard
    signature_key:
      process.env.AAMARPAY_SIGNATURE_KEY || "dbb74894e82415a2f7ff0ec3a97e4183",

    // Aamarpay uses "desc" not "description"
    desc: description || "Payment",

    // Aamarpay uses "cus_" prefix for customer fields
    cus_name: customerName,
    cus_email: customerEmail,
    cus_phone: customerPhone,

    // Redirect URLs after payment
    success_url: successUrl,
    fail_url: failUrl,
    cancel_url: cancelUrl,

    // Always "json" — tells Aamarpay to respond in JSON format
    type: "json",
  };
};

export const callAamarPayAPI = async (requestPayload) => {
  try {
    const response = await axios.post(AAMARPAY_URL, requestPayload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    const result = response.data;

    if (!result || !result.payment_url) {
      throw new Error(
        `Aamarpay did not return a payment_url. Response: ${JSON.stringify(result)}`,
      );
    }

    return {
      result,
      payment_url: result.payment_url,
    };
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      throw new Error(
        "Aamarpay API request timed out after 30 seconds. Please try again.",
      );
    }

    // No response received (DNS failure, network down, etc.)
    if (error.request && !error.response) {
      throw new Error(
        "Could not reach Aamarpay API. Check your internet connection or AAMARPAY_API_URL.",
      );
    }

    // Aamarpay responded with a non-2xx HTTP status
    if (error.response) {
      throw new Error(
        `Aamarpay API error ${error.response.status}: ${JSON.stringify(error.response.data)}`,
      );
    }

    // Re-throw our own descriptive errors (e.g. missing payment_url)
    throw error;
  }
};

export const validatePaymentResponse = (responseData) => {
  if (!responseData || typeof responseData !== "object") {
    console.error(
      "validatePaymentResponse: responseData is null or not an object",
    );
    return false;
  }

  const requireFields = ["status_code", "pg_txnid", "mer_txnid", "amount"];

  for (const field of requireFields) {
    if (!responseData[field]) {
      console.error(
        `validatePaymentResponse: Missing required field "${field}"`,
      );
      return false;
    }
  }

  const knownStatuses = Object.values(AAMARPAY_STATUS);
  const statusCode = String(responseData.status_code);

  if (!knownStatuses.includes(statusCode)) {
    console.error(
      `validatePaymentResponse: Unknown status_code "${statusCode}". Expected one of: ${knownStatuses.join(", ")}`,
    );
    return false;
  }

  return true;
};

export const mapAamarpayResponseToTransaction = (responseData) => {
  const statusMap = {
    [AAMARPAY_STATUS.SUCCESS]: "completed",
    [AAMARPAY_STATUS.FAILED]: "failed",
    [AAMARPAY_STATUS.EXPIRED]: "expired",
  };

  const statusCode = String(responseData.status_code);
  const status = statusMap[statusCode] || "failed";

  const now = new Date();

  return {
    status,
    // Aamarpay's own IDs for cross-referencing on their dashboard
    amarpayTranId: responseData.mer_txnid || null, // Your transaction ID echoed back
    amarpayPgTranId: responseData.pg_txnid || null, // Aamarpay's internal gateway ID

    // Raw payment status string from Aamarpay (e.g. "Successful", "Failed")
    amarpayPayStatus: responseData.pay_status || null,

    // Full response stored as JSON for auditing / debugging
    amarpayResponseData: responseData,

    // Payment method used (e.g. "bKash", "Visa", "MasterCard")
    paymentMethod: responseData.card_type || null,

    // Bank's own transaction reference number
    bankTxn: responseData.bank_txn || null,

    // Fee charged by Aamarpay for processing this transaction
    serviceCharge: responseData.pg_service_charge_bdt
      ? parseFloat(responseData.pg_service_charge_bdt)
      : null,

    // Amount that actually lands in your store account after fees
    storeAmount: responseData.store_amount
      ? parseFloat(responseData.store_amount)
      : null,

    // Only set completedAt when payment genuinely succeeded
    paymentCompletedAt: status === "completed" ? now : null,

    updatedAt: now,
  };
};
