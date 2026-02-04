import React from "react";
import {RouteParams} from "@/commons/types";
import {getInterviewById} from "@/features/service/interview";
import {redirect} from "next/navigation";
import DisplayTechIcons from "@/components/InterviewCard/DisplayTechIcons";
import Image from "next/image";
import Agent from "@/components/Agent/Agent";
import {getCurrentUser} from "@/features/service/auth";
import {AgentMode} from "@/commons/enums";
import {normalizeInterviewType} from "@/commons/utils";

const Page = async ({params}: RouteParams) => {
    const {id} = await params;
    const interviewId = String(id ?? "").trim();
    if(!interviewId) redirect('/');

    const interview = await getInterviewById(interviewId);
    const normalizedType = normalizeInterviewType(interview?.type);

    const user = await getCurrentUser();
    const userId = user?.id ?? "";
    const username = user?.username ?? "Fellow User";

    if(!interview) redirect('/')

    return (
        <>
            <div className="flex flex-row gap-4 justify-between">
                <div className="flex flex-row gap-4 items-center max-sm:flex-col">
                    <div className="flex flex-row gap-4 items-center">
                        <Image src={interview.coverImage} alt="cover-image" width={40} height={40} className="rounded-full object-cover size-[40px]" />
                        <h3 className="capitalize">{interview.role}</h3>
                    </div>
                    <DisplayTechIcons technologies={interview.technologies} />
                </div>
                <p className="bg-dark-200 px-4 py-2 rounded-lg h-fit capitalize">{normalizedType}</p>
            </div>
            <Agent username={username} userId={userId} interview={interview} mode={AgentMode.INTERVIEW}/>
        </>
    );
}

export default Page;
