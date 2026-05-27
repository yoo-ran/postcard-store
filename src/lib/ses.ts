import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const client = new SESClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface OrderConfirmationPayload {
  orderId: string;
  customerEmail: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
}

export async function sendOrderConfirmationEmail(order: OrderConfirmationPayload) {
  const itemList = order.items
    .map((i) => `${i.name} x${i.quantity} — $${i.price}`)
    .join("\n");

  const command = new SendEmailCommand({
    Source: process.env.SES_FROM_EMAIL!,
    Destination: {
      ToAddresses: [order.customerEmail],
    },
    Message: {
      Subject: {
        Data: `Order Confirmation — #${order.orderId}`,
      },
      Body: {
        Text: {
          Data: `Thank you for your order!\n\nOrder ID: ${order.orderId}\n\nItems:\n${itemList}\n\nTotal: $${order.total}`,
        },
      },
    },
  });

  try {
    await client.send(command);
    console.log(`Confirmation email sent to ${order.customerEmail}`);
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
    // Do NOT re-throw — email failure should not break the order flow
  }
}