"use server";

import {db} from "@/integrations/firebase/admin";
import {DbTables} from "@/commons/enums";
import {finalize} from "zod/v4/core";
import {GetLatestInterviewsParams, Interview, InterviewFields} from "@/commons/types";

export async function getInterviewsByUserId(userId: string): Promise<Interview[] | null> {
    const interviews = await db.collection(DbTables.INTERVIEWS)
        .where(InterviewFields.USER_ID, "==", userId)
        .orderBy(InterviewFields.CREATED_AT, "desc")
        .get();

    return interviews.docs.map((e) => ({
        id: e.id,
        ...e.data()
    })) as Interview[];
}

export async function getLatestInterviewsByOtherUsers(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
    const {userId, limit = 20} = params;

    const interviews = await db.collection(DbTables.INTERVIEWS)
        .where(InterviewFields.USER_ID, "!=", userId)
        .where(InterviewFields.FINALIZED, "==", true)
        .orderBy(InterviewFields.CREATED_AT, "desc")
        .limit(limit)
        .get();

    return interviews.docs.map((e) => ({
        id: e.id,
        ...e.data()
    })) as Interview[];
}
