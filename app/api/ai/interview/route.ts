import {InterviewDialogPayload, InterviewFeedbackPromptParams, FeedbackDoc} from "@/commons/types";
import {generateObject} from "ai";
import {groq} from "@ai-sdk/groq";
import {AI_MODEL, FEEDBACK_SCHEMA, INTERVIEW_FEEDBACK_PROMPT} from "@/commons/constants";
import {db} from "@/integrations/firebase/admin";
import {DbDoc} from "@/commons/enums";
import {formatInterviewQaPairs} from "@/commons/utils";

export async function POST(request: Request) {
    const {userId, interviewId, qa, role, level, type, technologies}: InterviewDialogPayload = await request.json();
    try {
        const transcript = formatInterviewQaPairs(qa);

        const {object: feedbackText} = await generateObject({
            model: groq(AI_MODEL),
            schema: FEEDBACK_SCHEMA,
            prompt: INTERVIEW_FEEDBACK_PROMPT({
                role,
                level,
                type,
                technologies,
                transcript
            } satisfies InterviewFeedbackPromptParams)
        });

        const feedbackDoc = {
            userId,
            interviewId,
            qa,
            role,
            level,
            type,
            technologies,
            feedback: feedbackText,
            createdAt: new Date().toISOString()
        } satisfies FeedbackDoc;

        const docRef = await db.collection(DbDoc.FEEDBACK).add(feedbackDoc);

        return Response.json({success: true, feedbackId: docRef.id}, {status: 200});
    } catch (error) {
        console.error(error);
        return Response.json({success: false, error: "Failed to generate feedback"}, {status: 500});
    }
}
