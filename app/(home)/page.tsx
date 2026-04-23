import React from 'react'
import Link from "next/link";
import Image from "next/image";
import InterviewCard from "@/components/InterviewCard/InterviewCard";
import PerformanceDashboard from "@/components/Dashboard/PerformanceDashboard";
import {getCurrentUser} from "@/features/service/auth";
import {getInterviewsByUserId, getLatestInterviewsByOtherUsers} from "@/features/service/interview";
import {getInterviewPerformanceStatsByUserId} from "@/features/service/feedback";

const Page = async () => {
    const user = await getCurrentUser();
    const userId = user?.id || "";

    const [usersInterviews, othersInterviews, performanceStats] = await Promise.all([
        getInterviewsByUserId(userId),
        getLatestInterviewsByOtherUsers({userId, limit: 20}),
        getInterviewPerformanceStatsByUserId(userId),
    ]);

    const hasUserPassedInterviews = usersInterviews && usersInterviews.length > 0;
    const hadOtherPassedInterviews = othersInterviews && othersInterviews.length > 0;

    return (
        <>
            <section className="banner group">
                <div className="banner-background" />
                <div className="banner-corner-accent" />
                <div className="flex flex-col gap-6 max-w-lg z-10">
                    <h2 className="text-white text-4xl font-bold tracking-tight leading-tight">
                        Get Interview-Ready with <span className="text-cyan-400">AI-Powered</span> Practice
                    </h2>
                    <p className="text-lg text-light-100/70 font-medium">
                        Practice on real interview questions & get instant feedback
                    </p>
                    <div className="relative w-fit group">
                        <Link href="/interview" className="banner-btn">
                            <span className="relative z-10">Start an Interview</span>
                        </Link>
                        <div className="absolute top-0 -left-4 w-2 h-2 bg-cyan-400 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:translate-x-4" />
                    </div>
                </div>
                <div className="relative z-10 max-sm:hidden mr-4">
                    <div className="absolute -inset-10 bg-indigo-500/10 blur-[80px] rounded-full" />
                    <div className="absolute inset-0 bg-cyan-500/5 blur-2xl rounded-full" />
                    <Image
                        src="/robot.png"
                        alt="robo-dude"
                        width={380}
                        height={380}
                        className="rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                </div>
            </section>
            <PerformanceDashboard stats={performanceStats} username={user?.username} />
            <section className="flex flex-col gap-6 mt-8">
                <h2>Your Interviews</h2>
                <div className="interview-section">
                    {
                        hasUserPassedInterviews ? (
                            usersInterviews?.map((e) => e.id ? (
                                <InterviewCard key={e.id} id={e.id} {...e} />
                            ) : null)
                        ) : (
                            <p>You haven&#39;t taken any interview yet</p>
                        )
                    }
                </div>
            </section>
            <section className="flex flex-col gap-6 mt-8">
                <h2>Take an Interview</h2>
                <div className="interview-section">
                    {
                        hadOtherPassedInterviews ? (
                            othersInterviews?.map((e) => e.id ? (
                                <InterviewCard key={e.id} id={e.id} {...e} />
                            ) : null)
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
