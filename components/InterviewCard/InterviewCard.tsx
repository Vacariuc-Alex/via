import dayjs from "dayjs"
import Image from "next/image";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import DisplayTechIcons from "@/components/InterviewCard/DisplayTechIcons";
import {DATE_TIME_FORMAT} from "@/commons/constants";
import {FeedbackDoc, InterviewCardProps} from "@/commons/types";
import {normalizeInterviewType} from "@/commons/utils";
import {getCurrentUser} from "@/features/service/auth";
import {getLatestFeedbackByUserIdAndInterviewId} from "@/features/service/feedback";

const InterviewCard = async ({id: interviewId, role, type, technologies, coverImage, createdAt}: InterviewCardProps) => {
    const user = await getCurrentUser();
    const userId = user?.id ?? "";

    const feedback = await getLatestFeedbackByUserIdAndInterviewId(userId, interviewId) as FeedbackDoc | null;
    const feedbackId = feedback?.id;

    const normalizedType = normalizeInterviewType(type);
    const formattedDate = dayjs(feedback?.createdAt || createdAt || Date.now() ).format(DATE_TIME_FORMAT);

    return (
        <div className="card-border w-[360px] max-sm:w-full min-h-96">
            <div className="card-interview">
                <div>
                    <div className="absolute top-0 right-0 w-fit px-4 py-2 ruounded-bl-md rounded-bl-lg bg-light-600">
                        <p className="badge-text">{normalizedType}</p>
                    </div>
                    <Image src={coverImage} alt="cover image" width={900} height={90} className="rounded-full object-fit size-[90px]"/>
                    <h3 className="mt-5 capitalize">
                        {role} Interview
                    </h3>
                    <div className="flex flex-row gap-5 mt-3">
                        <div className="flex flex-row gap-2">
                            <Image src="/calendar.svg" alt="calendar" width={22} height={22}/>
                            <p>{formattedDate}</p>
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            <Image src="/star.svg" alt="star" width={22} height={22}/>
                            <p>{feedback?.feedback.totalScore || '---'}/100</p>
                        </div>
                    </div>
                    <p className="line-clamp-2 mt-5">
                        {feedback?.feedback.finalAssessment || "You haven't taken this interview yet. Take it now to improve your skills."}
                    </p>
                </div>
                <div className="flex flex-row justify-between">
                    <DisplayTechIcons technologies={technologies}/>
                    <Button className="btn-primary">
                    {feedback
                        ? <Link href={`/interview/${interviewId}/feedback?feedbackId=${feedbackId}`}>Check Feedback</Link>
                        : <Link href={`/interview/${interviewId}`}>View Interview</Link>
                    }
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default InterviewCard;
