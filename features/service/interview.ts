"use server";

import {db} from "@/integrations/firebase/admin";
import {DbDoc, InterviewDocFields} from "@/commons/enums";
import {GetLatestInterviewsParams, InterviewDoc, FeedbackDoc} from "@/commons/types";

export async function getInterviewsByUserId(userId: string): Promise<InterviewDoc[] | null> {
    const interviews = await db.collection(DbDoc.INTERVIEWS)
        .where(InterviewDocFields.USER_ID, "==", userId)
        .orderBy(InterviewDocFields.CREATED_AT, "desc")
        .get();

    return interviews.docs.map((e) => ({
        id: e.id,
        ...e.data()
    })) as InterviewDoc[];
}

export async function getInterviewById(id: string): Promise<InterviewDoc | null> {
    const interview = await db.collection(DbDoc.INTERVIEWS)
        .doc(id)
        .get();

    return {
        id: interview.id,
        ...(interview.data()),
    } as InterviewDoc;
}

export async function getLatestInterviewsByOtherUsers(params: GetLatestInterviewsParams): Promise<InterviewDoc[] | null> {
    const {userId, limit = 20} = params;

    const interviews = await db.collection(DbDoc.INTERVIEWS)
        .where(InterviewDocFields.USER_ID, "!=", userId)
        .where(InterviewDocFields.FINALIZED, "==", true)
        .orderBy(InterviewDocFields.CREATED_AT, "desc")
        .limit(limit)
        .get();

    return interviews.docs.map((e) => ({
        id: e.id,
        ...e.data()
    })) as InterviewDoc[];
}

export async function getFeedbackById(id: string): Promise<FeedbackDoc | null> {
    const feedback = await db.collection(DbDoc.FEEDBACK)
        .doc(id)
        .get();

    return {
        id: feedback.id,
        ...(feedback.data()),
    } as FeedbackDoc;
}
