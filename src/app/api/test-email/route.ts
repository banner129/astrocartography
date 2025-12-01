import { respData, respErr } from "@/lib/resp";
import { sendEmail } from "@/services/email";

export async function POST(req: Request) {
  try {
    let { to, type } = await req.json();
    
    if (!to) {
      return respErr("invalid params: to is required");
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return respErr("invalid email format");
    }

    let subject = "";
    let html = "";

    if (type === "test" || !type) {
      // Simple test email
      subject = "Test Email from Astrocartography Calculator";
      html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h1 style="color: #4a5568; margin-top: 0;">✅ Email Test Successful!</h1>
    <p style="margin: 0;">This is a test email from Astrocartography Calculator.</p>
  </div>
  
  <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
    <p>If you received this email, it means your Resend configuration is working correctly!</p>
    <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Recipient:</strong> ${to}</p>
  </div>

  <div style="text-align: center; color: #718096; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
    <p>This is a test email. Please do not reply.</p>
    <p>&copy; ${new Date().getFullYear()} Astrocartography Calculator. All rights reserved.</p>
  </div>
</body>
</html>
      `;
    } else {
      return respErr("invalid type, use 'test' or leave empty");
    }

    await sendEmail({
      to: to,
      subject: subject,
      html: html,
    });

    return respData({ 
      message: "Test email sent successfully",
      to: to,
      type: type || "test"
    });
  } catch (e) {
    console.log("test email failed", e);
    return respErr(`test email failed: ${e instanceof Error ? e.message : String(e)}`);
  }
}

