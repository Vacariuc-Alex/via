import React from 'react'
import Link from "next/link";
import Image from "next/image";
import {getLocale, getTranslations} from 'next-intl/server';
import InterviewCard from "@/components/InterviewCard/InterviewCard";
import PerformanceDashboard from "@/components/Dashboard/PerformanceDashboard";
import {getCurrentUser} from "@/features/service/auth";
import {getInterviewsByUserId, getLatestInterviewsByOtherUsers} from "@/features/service/interview";
import {getInterviewPerformanceStatsByUserId} from "@/features/service/feedback";
import {getLocalizedPath} from "@/features/translation/routing";

const Page = async () => {
    const t = await getTranslations('home');
    const locale = await getLocale();
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
                        {t('bannerTitle')} <span className="text-cyan-400">{t('bannerHighlight')}</span> {t('bannerSubtitle')}
                    </h2>
                    <p className="text-lg text-light-100/70 font-medium">
                        {t('bannerDescription')}
                    </p>
                    <div className="relative w-fit group">
                        <Link href={getLocalizedPath("/interview", locale)} className="banner-btn">
                            <span className="relative z-10">{t('startInterview')}</span>
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
                <h2>{t('yourInterviews')}</h2>
                <div className="interview-section">
                    {
                        hasUserPassedInterviews ? (
                            usersInterviews?.map((e) => e.id ? (
                                <InterviewCard key={e.id} id={e.id} {...e} />
                            ) : null)
                        ) : (
                            <p>{t('noInterviewsTaken')}</p>
                        )
                    }
                </div>
            </section>
            <section className="flex flex-col gap-6 mt-8">
                <h2>{t('takeInterview')}</h2>
                <div className="interview-section">
                    {
                        hadOtherPassedInterviews ? (
                            othersInterviews?.map((e) => e.id ? (
                                <InterviewCard key={e.id} id={e.id} {...e} />
                            ) : null)
                        ) : (
                            <p>{t('noNewInterviews')}</p>
                        )
                    }
                </div>
            </section>
        </>
    )
}

export default Page;
