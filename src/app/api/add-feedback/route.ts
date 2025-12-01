import { respData, respErr } from "@/lib/resp";

import { getUserUuid, getUserInfo, getUserEmail } from "@/services/user";
import { insertFeedback } from "@/models/feedback";
import { sendContactFormEmail } from "@/services/email";

export async function POST(req: Request) {
  try {
    let { content, rating, name, email } = await req.json();
    if (!content) {
      return respErr("invalid params");
    }

    const user_uuid = await getUserUuid();
    const user_email = await getUserEmail();
    const user_info = await getUserInfo();

    // Use provided email/name if user is not logged in, otherwise use user info
    const feedbackEmail = user_email || email || "";
    const feedbackName = user_info?.nickname || name || user_email?.split("@")[0] || email?.split("@")[0] || "User";

    const feedback = {
      user_uuid: user_uuid || "",
      content: content,
      rating: rating,
      created_at: new Date(),
      status: "created",
    };

    const dbFeedback = await insertFeedback(feedback);

    // send email notification if we have email
    if (feedbackEmail) {
      try {
        const ratingEmoji = rating === 1 ? "😞" : rating === 5 ? "😐" : "😊";
        const ratingText = rating === 1 ? "Negative" : rating === 5 ? "Neutral" : "Positive";
        
        await sendContactFormEmail({
          name: feedbackName,
          email: feedbackEmail,
          subject: `Feedback from User - ${ratingText} (${ratingEmoji})`,
          message: `Rating: ${rating}/10 ${ratingEmoji}\n\nFeedback:\n${content}`,
        });
      } catch (e) {
        console.log("send feedback email failed: ", e);
        // Don't throw error, just log it to avoid breaking the feedback flow
      }
    }

    return respData(dbFeedback);
  } catch (e) {
    console.log("add feedback failed", e);
    return respErr("add feedback failed");
  }
}
