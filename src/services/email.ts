import { Resend } from "resend";
import { getSocialMediaConfig } from "@/lib/utils";
import { Order } from "@/types/order";

const resend = new Resend(process.env.RESEND_API_KEY);

export enum EmailType {
  OrderConfirmation = "order_confirmation",
  RefundNotification = "refund_notification",
  ContactForm = "contact_form",
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  from,
}: SendEmailParams) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log("RESEND_API_KEY not configured, skip sending email");
      return;
    }

    const fromEmail = from || process.env.RESEND_FROM_EMAIL || "noreply@astrocarto.org";
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: to,
      subject: subject,
      html: html,
    });

    if (error) {
      console.log("send email failed: ", error);
      throw error;
    }

    console.log("email sent successfully: ", data);
    return data;
  } catch (e) {
    console.log("send email error: ", e);
    throw e;
  }
}

export async function sendOrderConfirmationEmail({
  order,
  customerEmail,
}: {
  order: Order;
  customerEmail: string;
}) {
  try {
    const supportEmail = getSocialMediaConfig().support_email;
    const webUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://astrocarto.org";
    
    const amount = (order.amount / 100).toFixed(2);
    const currency = order.currency.toUpperCase();
    const productName = order.product_name || "Premium Access";
    
    let accessInfo = "";
    if (order.valid_months === 0) {
      // 2-week pass
      accessInfo = "Your 2-week access pass is now active. You have unlimited AI chat access for 14 days.";
    } else if (order.interval === "month") {
      accessInfo = `Your monthly subscription is now active. You have unlimited AI chat access for ${order.valid_months} month(s).`;
    } else {
      accessInfo = "Your premium access is now active.";
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h1 style="color: #4a5568; margin-top: 0;">Order Confirmation</h1>
    <p style="margin: 0;">Thank you for your purchase!</p>
  </div>
  
  <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="color: #2d3748; margin-top: 0;">Order Details</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Order Number:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">${order.order_no}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Product:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">${productName}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Amount:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">${currency} ${amount}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Payment Date:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">${new Date(order.paid_at || order.created_at || Date.now()).toLocaleDateString()}</td>
      </tr>
      ${order.expired_at ? `
      <tr>
        <td style="padding: 8px 0;"><strong>Access Expires:</strong></td>
        <td style="padding: 8px 0; text-align: right;">${new Date(order.expired_at).toLocaleDateString()}</td>
      </tr>
      ` : ''}
    </table>
  </div>

  <div style="background-color: #edf2f7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="color: #2d3748; margin-top: 0;">What's Next?</h2>
    <p>${accessInfo}</p>
    <p style="margin-top: 15px;">
      <a href="${webUrl}" style="background-color: #4a5568; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Start Using Premium Features</a>
    </p>
  </div>

  <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="color: #2d3748; margin-top: 0;">Need Help?</h2>
    <p>If you have any questions or need assistance, please contact us at <a href="mailto:${supportEmail}">${supportEmail}</a></p>
    <p>For refund requests, please visit our <a href="${webUrl}/refund-policy">Refund Policy</a> page.</p>
  </div>

  <div style="text-align: center; color: #718096; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
    <p>This is an automated email. Please do not reply to this message.</p>
    <p>&copy; ${new Date().getFullYear()} Astrocartography Calculator. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    await sendEmail({
      to: customerEmail,
      subject: `Order Confirmation - ${order.order_no}`,
      html: html,
    });
  } catch (e) {
    console.log("send order confirmation email failed: ", e);
    // Don't throw error, just log it to avoid breaking the order flow
  }
}

export async function sendContactFormEmail({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  try {
    const supportEmail = getSocialMediaConfig().support_email;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Form Submission</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h1 style="color: #4a5568; margin-top: 0;">New Contact Form Submission</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Name:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${name}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Email:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><a href="mailto:${email}">${email}</a></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Subject:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${subject}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0;"><strong>Message:</strong></td>
        <td style="padding: 8px 0;"></td>
      </tr>
    </table>
    <div style="background-color: #f7fafc; padding: 15px; border-radius: 6px; margin-top: 15px; white-space: pre-wrap;">${message}</div>
  </div>

  <div style="text-align: center; color: #718096; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
    <p>This is an automated email from the contact form on Astrocartography Calculator.</p>
  </div>
</body>
</html>
    `;

    await sendEmail({
      to: supportEmail,
      subject: `Contact Form: ${subject}`,
      html: html,
      from: `Contact Form <${process.env.RESEND_FROM_EMAIL || "noreply@astrocarto.org"}>`,
    });

    // Send auto-reply to user
    const autoReplyHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Contacting Us</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h1 style="color: #4a5568; margin-top: 0;">Thank You for Contacting Us</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
    <p>Dear ${name},</p>
    <p>We have received your message and will get back to you within 1-2 business days.</p>
    <p><strong>Your message:</strong></p>
    <div style="background-color: #f7fafc; padding: 15px; border-radius: 6px; margin: 15px 0; white-space: pre-wrap;">${message}</div>
    <p>If you have any urgent questions, please contact us directly at ${supportEmail}.</p>
  </div>

  <div style="text-align: center; color: #718096; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
    <p>This is an automated email. Please do not reply to this message.</p>
    <p>&copy; ${new Date().getFullYear()} Astrocartography Calculator. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    await sendEmail({
      to: email,
      subject: `Re: ${subject}`,
      html: autoReplyHtml,
    });
  } catch (e) {
    console.log("send contact form email failed: ", e);
    throw e;
  }
}

