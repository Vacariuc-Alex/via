import React from 'react'
import {RouteParams} from "@/commons/types";
import {getInterviewById} from "@/features/service/interview";
import {redirect} from "next/navigation";
import Image from "next/image";
import dayjs from "dayjs";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {DATE_TIME_FORMAT} from "@/commons/constants";
import {getFeedbackById} from "@/features/service/feedback";

const Page = async ({params, searchParams}: RouteParams) => {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;

    const interviewId = resolvedParams?.id;
    const interview = interviewId && await getInterviewById(interviewId);

    const feedbackId = resolvedSearchParams?.feedbackId;
    const feedback = feedbackId && await getFeedbackById(feedbackId);

    if(!interview || !feedback) redirect('/');

    return (
        <section className="feedback-section max-w-3xl mx-auto">
            <div className="flex flex-row justify-center">
                <h1 className="text-4xl font-semibold">
                    Feedback on the Interview -{" "}
                    <span className="capitalize">{interview.role}</span> Interview
                </h1>
            </div>

            <div className="flex flex-row">
                <div className="flex flex-row gap-[40px]">
                    <div className="flex flex-row gap-2 ml-[20px]">
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
                    <div key={i}>
                        <p className="text-breakdown-section font-bold">
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
                    {feedback.feedback.strengths.map((e: any, i: any) => (
                        <li key={i}>{e}</li>
                    ))}
                </ul>
            </div>

            <div className="flex flex-col gap-3">
                <h3>Areas for Improvement</h3>
                <ul>
                    {feedback.feedback.areasForImprovement.map((e: any, i: any) => (
                        <li key={i}>{e}</li>
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
        </section>
    );
}

export default Page;
