import dayjs from "dayjs";
import {FeedbackDoc, InterviewPerformanceStats, ScoreTrendPoint} from "@/commons/types";
import {DbDoc, FeedbackDocFields} from "@/commons/enums";
import {db} from "@/integrations/firebase/admin";
import {DATE_FORMAT, EMPTY_INTERVIEW_PERFORMANCE_STATS} from "@/commons/constants";

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

export async function getFeedbackHistoryByUserIdAndInterviewId(userId: string, interviewId: string): Promise<FeedbackDoc[]> {
    if (!userId || !interviewId) return [];

    const feedbackSnapshot = await db.collection(DbDoc.FEEDBACK)
        .where(FeedbackDocFields.USER_ID, "==", userId)
        .where(FeedbackDocFields.INTERVIEW_ID, "==", interviewId)
        .orderBy(FeedbackDocFields.CREATED_AT, "asc")
        .get();

    return feedbackSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data()),
    })) as FeedbackDoc[];
}

export async function getInterviewPerformanceStatsByUserId(userId: string): Promise<InterviewPerformanceStats> {
    if (!userId) return EMPTY_INTERVIEW_PERFORMANCE_STATS;

    const feedbackSnapshot = await db.collection(DbDoc.FEEDBACK)
        .where(FeedbackDocFields.USER_ID, "==", userId)
        .orderBy(FeedbackDocFields.CREATED_AT, "desc")
        .get();

    if (feedbackSnapshot.empty) return EMPTY_INTERVIEW_PERFORMANCE_STATS;

    const scoredFeedbackEntries: FeedbackDoc[] = [];
    const dailyScores = new Map<string, { totalScore: number; attempts: number }>();

    feedbackSnapshot.docs.forEach((doc) => {
        const feedback = {
            id: doc.id,
            ...(doc.data()),
        } as FeedbackDoc;

        const totalScore = feedback.feedback?.totalScore;
        if (typeof totalScore !== "number") return;
        const scoreDate = dayjs(feedback.createdAt).format(DATE_FORMAT);
        const currentDayScore = dailyScores.get(scoreDate);

        dailyScores.set(scoreDate, {
            totalScore: (currentDayScore?.totalScore ?? 0) + totalScore,
            attempts: (currentDayScore?.attempts ?? 0) + 1,
        });

        scoredFeedbackEntries.push(feedback);
    });

    const dailyAverageScores = Array.from(dailyScores.entries())
        .sort(([leftDate], [rightDate]) => leftDate.localeCompare(rightDate))
        .map(([date, score]) => ({
            date,
            averageScore: Math.round(score.totalScore / score.attempts),
            attempts: score.attempts,
        }) satisfies ScoreTrendPoint);

    if (!scoredFeedbackEntries.length) return EMPTY_INTERVIEW_PERFORMANCE_STATS;

    const scores = scoredFeedbackEntries.map((feedback) => feedback.feedback.totalScore);
    const totalScore = scores.reduce((sum, score) => sum + score, 0);

    return {
        completedInterviews: scoredFeedbackEntries.length,
        averageScore: Math.round(totalScore / scoredFeedbackEntries.length),
        highestScore: Math.max(...scores),
        latestScore: scores[0] ?? null,
        latestInterviewDate: scoredFeedbackEntries[0]?.createdAt ?? null,
        recentScoreChange: scores.length > 1 ? scores[0] - scores[1] : null,
        dailyAverageScores,
    } satisfies InterviewPerformanceStats;
}

