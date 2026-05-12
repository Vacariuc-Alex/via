import dayjs from "dayjs"
import Image from "next/image";
import Link from "next/link";
import {getLocale, getTranslations} from "next-intl/server";
import DisplayTechIcons from "@/components/InterviewCard/DisplayTechIcons";
import {DATE_TIME_FORMAT} from "@/commons/constants";
import {InterviewCardProps} from "@/commons/types";
import {getInterviewTypeDisplayLabel} from "@/commons/utils";
import {getCurrentUser} from "@/features/service/auth";
import {getLatestFeedbackByUserIdAndInterviewId} from "@/features/service/feedback";
import {getLocalizedPath} from "@/features/translation/routing";

const InterviewCard = async ({id: interviewId, role, type, technologies, coverImage, createdAt}: InterviewCardProps) => {
    const t = await getTranslations("interviewCard");
    const locale = await getLocale();
    const user = await getCurrentUser();
    const userId = user?.id ?? "";

    const feedback = await getLatestFeedbackByUserIdAndInterviewId(userId, interviewId);
    const feedbackId = feedback?.id;

    const normalizedType = await getInterviewTypeDisplayLabel(type, locale);
    const formattedDate = dayjs(feedback?.createdAt || createdAt || Date.now()).format(DATE_TIME_FORMAT);

    return (
        <div className="interview-card-container w-[360px] max-sm:w-full">
            <div className="interview-card-inner">
                <div className="interview-badge">
                    {normalizedType}
                </div>
                <div className="interview-card-pattern opacity-15 absolute inset-0 pointer-events-none"/>
                <div className="relative z-10">
                    <Image
                        src={coverImage}
                        alt="cover image"
                        className="rounded-full object-cover bg-dark-300 min-w-[90px] max-w-[90px] min-h-[90px] max-h-[90px] mb-5"
                    />
                    <h3 className="interview-text-title capitalize">
                        {role} {t("interviewSuffix")}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-light-100/80 mb-4">
                        <div className="flex items-center gap-2">
                            <Image src="/calendar.svg" alt="calendar" width={18} height={18} className="brightness-150"/>
                            <span className="font-mono">{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Image src="/star.svg" alt="star" width={18} height={18} className="animate-pulse"/>
                            <span className="text-yellow-400 font-bold">
                                {feedback?.feedback.totalScore || '---'}/100
                            </span>
                        </div>
                    </div>
                    <p className="text-sm leading-relaxed text-light-100/70 line-clamp-3 mb-6">
                        {feedback?.feedback.finalAssessment || t("defaultAssessment")}
                    </p>
                </div>
                <div className="mt-auto flex flex-row justify-between items-center z-10 gap-2">
                    <div className="tech-pills-container">
                        <DisplayTechIcons technologies={technologies}/>
                    </div>
                    <div className="relative group">
                        <Link
                            href={feedback
                                ? `${getLocalizedPath(`/interview/${interviewId}/feedback`, locale)}?feedbackId=${feedbackId}`
                                : getLocalizedPath(`/interview/${interviewId}`, locale)
                            }
                            className="interview-btn"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {feedback ? t("check") : t("start")}
                                <span className="text-[10px] opacity-50">▶</span>
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InterviewCard;
