import React from 'react'
import {RouteParams} from "@/commons/types";
import {getInterviewById} from "@/features/service/interview";
import {redirect} from "next/navigation";
import Image from "next/image";
import dayjs from "dayjs";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {DATE_TIME_FORMAT} from "@/commons/constants";
import {getFeedbackHistoryByUserIdAndInterviewId} from "@/features/service/feedback";
import {getCurrentUser} from "@/features/service/auth";

const Page = async ({params, searchParams}: RouteParams) => {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;

    const interviewId = resolvedParams?.id;
    const feedbackId = resolvedSearchParams?.feedbackId;

    const user = await getCurrentUser();
    const userId = user?.id ?? "";

    const [interview, feedbackHistory] = await Promise.all([
        interviewId ? getInterviewById(interviewId) : null,
        interviewId ? getFeedbackHistoryByUserIdAndInterviewId(userId, interviewId) : [],
    ]);

    const currentFeedbackIndex = feedbackId
        ? feedbackHistory.findIndex((entry) => entry.id === feedbackId)
        : feedbackHistory.length - 1;
    const feedback = currentFeedbackIndex >= 0 ? feedbackHistory[currentFeedbackIndex] : null;

    const previousFeedback = currentFeedbackIndex > 0 ? feedbackHistory[currentFeedbackIndex - 1] : null;
    const nextFeedback = currentFeedbackIndex >= 0 && currentFeedbackIndex < feedbackHistory.length - 1
        ? feedbackHistory[currentFeedbackIndex + 1]
        : null;

    if(!interview || feedback?.userId !== userId || feedback?.interviewId !== interviewId) redirect('/');

    return (
        <section className="feedback-section max-w-3xl mx-auto">
            <div className="flex flex-row justify-center">
                <h1 className="text-4xl font-semibold">
                    Feedback on the Interview -{" "}
                    <span className="capitalize">{interview.role}</span> Interview
                </h1>
            </div>

            <div className="flex flex-row">
                <div className="flex flex-row gap-10">
                    <div className="flex flex-row gap-2 ml-5">
                        <Image src="/star.svg" width={22} height={22} alt="star" />
                        <p className="text-justify">
                            Overall Impression:{" "}
                            <span className="text-score font-bold">{feedback.feedback.totalScore}</span>/100
                        </p>
                    </div>

                    <div className="flex flex-row gap-2 items-center">
                        <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
                        <p>
                            {feedback.createdAt ? dayjs(feedback.createdAt).format(DATE_TIME_FORMAT) : "N/A"}
                        </p>
                    </div>
                </div>
            </div>

            <hr/>

            <p>{feedback.feedback.finalAssessment}</p>

            <div className="flex flex-col gap-4">
                <h2>Breakdown of the Interview:</h2>
                {feedback.feedback.categoryScores.map((e: any, i: any) => (
                    <div key={`${e.name}-${e.score}-${i}`}>
                        <p className="text-highlight font-bold">
                            {i + 1}. {e.name} ({e.score}/100)
                        </p>
                        <p>
                            {e.comment}
                        </p>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-3">
                <h3>Strengths</h3>
                <ul>
                    {feedback.feedback.strengths.map((e: any) => (
                        <li key={e}>{e}</li>
                    ))}
                </ul>
            </div>

            <div className="flex flex-col gap-3">
                <h3>Areas for Improvement</h3>
                <ul>
                    {feedback.feedback.areasForImprovement.map((e: any) => (
                        <li key={e}>{e}</li>
                    ))}
                </ul>
            </div>

            <div className="feedback-buttons">
                <Button className="feedback-btn-secondary flex-1">
                    <Link href="/" className="flex w-full justify-center">
                        <p className="text-sm font-semibold text-primary-200 text-center">
                            Back to dashboard
                        </p>
                    </Link>
                </Button>
                <Button className="feedback-btn-primary">
                    <Link href={`/interview/${interviewId}`}>Retake Interview</Link>
                </Button>
            </div>

            <div id="feedback-history-controls" className="grid items-center gap-3 rounded-2xl py-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
                <div className="flex sm:justify-start">
                    {previousFeedback ? (
                        <Link href={`/interview/${interviewId}/feedback?feedbackId=${previousFeedback.id}#feedback-history-controls`} className="feedback-history-btn w-full sm:w-fit">
                            ◀ Back
                        </Link>
                    ) : (
                        <span className="feedback-history-btn is-disabled w-full sm:w-fit">
                            ◀ Back
                        </span>
                    )}
                </div>

                <div className="text-center sm:-translate-x-20">
                    <p className="text-primary-200 font-bold text-base">Attempt {currentFeedbackIndex + 1} of {feedbackHistory.length}</p>
                </div>

                <div className="flex sm:justify-end">
                    {nextFeedback ? (
                        <Link href={`/interview/${interviewId}/feedback?feedbackId=${nextFeedback.id}#feedback-history-controls`} className="feedback-history-btn w-full sm:w-fit">
                            Next ▶
                        </Link>
                    ) : (
                        <span className="feedback-history-btn is-disabled w-full sm:w-fit">
                            Next ▶
                        </span>
                    )}
                </div>
            </div>
        </section>
    );
}

export default Page;
