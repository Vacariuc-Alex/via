import {FeedbackDoc} from "@/commons/types";
import {DbDoc, FeedbackDocFields} from "@/commons/enums";
import {db} from "@/integrations/firebase/admin";

export async function getFeedbackById(id: string): Promise<FeedbackDoc | null> {
    const feedback = await db.collection(DbDoc.FEEDBACK)
        .doc(id)
        .get();

    if (!feedback.exists) return null;

    return {
        id: feedback.id,
        ...(feedback.data()),
    } as FeedbackDoc;
}

export async function getLatestFeedbackByUserIdAndInterviewId(userId: string, interviewId: string): Promise<FeedbackDoc | null> {
    if (!userId || !interviewId) return null;

    const feedback = await db.collection(DbDoc.FEEDBACK)
        .where(FeedbackDocFields.USER_ID, "==", userId)
        .where(FeedbackDocFields.INTERVIEW_ID, "==", interviewId)
        .orderBy(FeedbackDocFields.CREATED_AT, "desc")
        .limit(1)
        .get();

    const doc = feedback.docs[0];
    if (!doc) return null;

    return {
        id: doc.id,
        ...(doc.data()),
    } as FeedbackDoc;
}
