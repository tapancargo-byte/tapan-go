export interface InvoiceFailureAlertParams {
  invoiceId: string;
  invoiceRef?: string | null;
  errorMessage: string;
  failureCount: number;
}

export async function sendInvoiceFailureAlert({
  invoiceId,
  invoiceRef,
  errorMessage,
  failureCount,
}: InvoiceFailureAlertParams) {
  const webhookUrl =
    process.env.INVOICE_ALERT_SLACK_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn(
      "Slack webhook URL not configured. Set INVOICE_ALERT_SLACK_WEBHOOK_URL or SLACK_WEBHOOK_URL to enable alerts."
    );
    return;
  }

  const textLines = [
    "Invoice PDF generation has repeatedly failed.",
    `Invoice ID: ${invoiceId}`,
    invoiceRef ? `Invoice Ref: ${invoiceRef}` : undefined,
    `Failure count (recent attempts): ${failureCount}`,
    `Last error: ${errorMessage}`,
  ].filter(Boolean) as string[];

  const payload = {
    text: textLines.join("\n"),
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("Failed to send Slack alert. Status:", res.status);
    }
  } catch (error) {
    console.error("Error while sending Slack alert", error);
  }
}
