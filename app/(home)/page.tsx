import React from 'react'
import {Button} from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import InterviewCard from "@/components/InterviewCard/InterviewCard";
import {getCurrentUser} from "@/features/service/auth";
import {getInterviewsByUserId, getLatestInterviewsByOtherUsers} from "@/features/service/interviewGeneration";

const Page = async () => {
    const user = await getCurrentUser();
    const userId = user?.id || "";

    const [usersInterviews, othersInterviews] = await Promise.all([
        await getInterviewsByUserId(userId),
        await getLatestInterviewsByOtherUsers({userId, limit: 20})
    ]);

    const hasUserPassedInterviews = usersInterviews && usersInterviews.length > 0;
    const hadOtherPassedInterviews = othersInterviews && othersInterviews.length > 0;

    return (
        <>
            <section className="card-cta">
                <div className="flex flex-col gap-6 max-w-lg">
                    <h2>Get Interview-Ready with Al-Powered Practice & Feedback</h2>
                    <p className="text-lg">Practice on real interview questions & get instant feedback</p>
                    <Button asChild className="btn-primary max-sm:w-full">
                        <Link href="/interview">Start an Interview</Link>
                    </Button>
                </div>
                <Image src="/robot.png" alt="robo-dude" width={400} height={400} className="max-sm:hidden" />
            </section>
            <section className="flex flex-col gap-6 mt-8">
                <h2>Your Interviews</h2>
                <div className="interviews-section">
                    {
                        hasUserPassedInterviews ? (
                            usersInterviews?.map((e, i) => (
                                <InterviewCard key={i} {...e} />
                            ))
                        ) : (
                            <p>You haven&#39;t taken any interview yet</p>
                        )
                    }
                </div>
            </section>
            <section className="flex flex-col gap-6 mt-8">
                <h2>Take an Interview</h2>
                <div className="interviews-section">
                    {
                        hadOtherPassedInterviews ? (
                            othersInterviews?.map((e, i) => (
                                <InterviewCard key={i} {...e} />
                            ))
                        ) : (
                            <p>There are no new interviews available</p>
                        )
                    }
                </div>
            </section>
        </>
    )
}

export default Page;

