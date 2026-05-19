import { createHash } from "node:crypto";

type CreateDuitkuInvoiceParams = {
  merchantOrderId: string;
  paymentAmount: number;
  productDetails: string;
  email: string;
  customerName: string;
  callbackUrl: string;
  returnUrl: string;
  expiryPeriod?: number;
  itemDetails: {
    name: string;
    price: number;
    quantity: number;
  }[];
};

type DuitkuCreateInvoiceResponse = {
  merchantCode: string;
  reference: string;
  paymentUrl: string;
  statusCode: string;
  statusMessage: string;
};

type DuitkuTransactionStatusResponse = {
  merchantOrderId: string;
  reference: string;
  amount: string;
  statusCode: string;
  statusMessage: string;
};

function getDuitkuConfig() {
  const env = process.env.DUITKU_ENV || "sandbox";
  const merchantCode = process.env.DUITKU_MERCHANT_CODE;
  const apiKey = process.env.DUITKU_API_KEY;

  if (!merchantCode) {
    throw new Error("DUITKU_MERCHANT_CODE belum diisi.");
  }

  if (!apiKey) {
    throw new Error("DUITKU_API_KEY belum diisi.");
  }

  const baseUrl =
    env === "production"
      ? process.env.DUITKU_PRODUCTION_BASE_URL || "https://api-prod.duitku.com"
      : process.env.DUITKU_SANDBOX_BASE_URL || "https://api-sandbox.duitku.com";

  return {
    env,
    merchantCode,
    apiKey,
    baseUrl,
  };
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function createDuitkuCallbackSignature({
  merchantCode,
  amount,
  merchantOrderId,
}: {
  merchantCode: string;
  amount: string | number;
  merchantOrderId: string;
}) {
  const { apiKey } = getDuitkuConfig();

  return createHash("md5")
    .update(`${merchantCode}${amount}${merchantOrderId}${apiKey}`)
    .digest("hex");
}

export async function createDuitkuInvoice({
  merchantOrderId,
  paymentAmount,
  productDetails,
  email,
  customerName,
  callbackUrl,
  returnUrl,
  expiryPeriod = 60,
  itemDetails,
}: CreateDuitkuInvoiceParams) {
  const { merchantCode, apiKey, baseUrl } = getDuitkuConfig();

  const timestamp = Date.now().toString();
  const signature = sha256(`${merchantCode}${timestamp}${apiKey}`);

  const requestBody = {
    paymentAmount,
    merchantOrderId,
    productDetails,
    additionalParam: "",
    merchantUserInfo: email,
    paymentMethod: "",
    customerVaName: customerName.slice(0, 20),
    email,
    itemDetails,
    callbackUrl,
    returnUrl,
    expiryPeriod,
  };

  const response = await fetch(`${baseUrl}/api/merchant/createInvoice`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-duitku-signature": signature,
      "x-duitku-timestamp": timestamp,
      "x-duitku-merchantcode": merchantCode,
    },
    body: JSON.stringify(requestBody),
  });

  const data =
    (await response.json()) as Partial<DuitkuCreateInvoiceResponse> & {
      message?: string;
      Message?: string;
    };

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.Message ||
        `Duitku create invoice gagal. HTTP ${response.status}`,
    );
  }

  if (data.statusCode !== "00" || !data.reference || !data.paymentUrl) {
    throw new Error(data.statusMessage || "Duitku gagal membuat invoice.");
  }

  return data as DuitkuCreateInvoiceResponse;
}

export async function checkDuitkuTransactionStatus(merchantOrderId: string) {
  const { env, merchantCode, apiKey } = getDuitkuConfig();

  const baseUrl =
    env === "production"
      ? "https://passport.duitku.com/webapi/api/merchant/transactionStatus"
      : "https://sandbox.duitku.com/webapi/api/merchant/transactionStatus";

  const signature = createHash("md5")
    .update(`${merchantCode}${merchantOrderId}${apiKey}`)
    .digest("hex");

  const formData = new URLSearchParams();
  formData.append("merchantCode", merchantCode);
  formData.append("merchantOrderId", merchantOrderId);
  formData.append("signature", signature);

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  const data = (await response.json()) as DuitkuTransactionStatusResponse;

  if (!response.ok) {
    throw new Error(
      `Gagal cek status transaksi Duitku. HTTP ${response.status}`,
    );
  }

  return data;
}
