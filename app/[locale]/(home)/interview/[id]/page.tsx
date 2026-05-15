import React from "react";
import {RouteParams} from "@/commons/types";
import {getInterviewById} from "@/features/service/interview";
import {redirect} from "next/navigation";
import DisplayTechIcons from "@/components/InterviewCard/DisplayTechIcons";
import Image from "next/image";
import Agent from "@/components/Agent/Agent";
import {getCurrentUser} from "@/features/service/auth";
import {AgentMode} from "@/commons/enums";
import {getInterviewTypeDisplayLabel} from "@/commons/utils";
import {getLocale, getTranslations} from "next-intl/server";
import {getLocalizedPath} from "@/features/translation/routing";

const Page = async ({params}: RouteParams) => {
    const t = await getTranslations("interview");
    const locale = await getLocale();
    const resolvedParams = await params;

    const interviewId = resolvedParams?.id;
    const interview = interviewId && await getInterviewById(interviewId);
    const normalizedType = interview && await getInterviewTypeDisplayLabel(interview?.type, locale);

    const user = await getCurrentUser();
    const userId = user?.id ?? "";
    const username = user?.username ?? t("fellowUser");

    if (!interview || !user) redirect(getLocalizedPath("/", locale));

    return (
        <>
            <div className="flex flex-row gap-4 justify-between">
                <div className="flex flex-row gap-4 items-center max-sm:flex-col">
                    <div className="flex flex-row gap-4 items-center">
                        <div className="relative w-[70px] h-[70px] shrink-0">
                            <Image src={interview.coverImage} alt="cover-image" fill sizes="70px" className="rounded-full object-cover"/>
                        </div>
                        <h3 className="capitalize">{interview.role}</h3>
                    </div>
                    <div className="tech-pills-container max-sm:self-start">
                        <DisplayTechIcons technologies={interview.technologies}/>
                    </div>
                </div>
                <div className="flex items-end justify-center sm:items-center">
                    <div className="badge-label flex mb-5 sm:mb-0">
                        {normalizedType}
                    </div>
                </div>
            </div>
            <Agent username={username} userId={userId} interview={interview} mode={AgentMode.INTERVIEW}/>
        </>
    );
}

export default Page;
