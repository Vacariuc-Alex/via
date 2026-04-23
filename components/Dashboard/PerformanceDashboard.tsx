import dayjs from "dayjs";
import Link from "next/link";
import {DATE_TIME_FORMAT} from "@/commons/constants";
import PerformanceTrendChart from "@/components/Dashboard/PerformanceTrendChart";
import {PerformanceDashboardProps} from "@/commons/types";

const formatScore = (score: number | null) => score === null ? "---" : `${score}/100`;

const getTrendTone = (scoreChange: number | null) => {
    if (scoreChange === null) return "text-light-100";
    if (scoreChange > 0) return "text-emerald-400";
    if (scoreChange < 0) return "text-rose-400";
    return "text-yellow-300";
};

const getTrendLabel = (scoreChange: number | null) => {
    if (scoreChange === null) return "Add one more scored interview to unlock momentum.";
    if (scoreChange > 0) return `Up by ${scoreChange} points from your previous result.`;
    if (scoreChange < 0) return `Down by ${Math.abs(scoreChange)} points from your previous result.`;
    return "Holding steady compared with your previous result.";
};

const formatScoreChange = (scoreChange: number | null) => {
    if (scoreChange === null) return "N/A";
    if (scoreChange > 0) return `+${scoreChange}`;
    return `${scoreChange}`;
};

const PerformanceDashboard = ({stats, username}: PerformanceDashboardProps) => {
    const hasStats = stats.completedInterviews > 0;
    const formattedScoreChange = formatScoreChange(stats.recentScoreChange);
    const statCards = [
        {
            label: "Interview attempts with feedback",
            value: stats.completedInterviews,
            description: "Every interview attempt with generated feedback is counted.",
        },
        {
            label: "Best score",
            value: formatScore(stats.highestScore),
            description: "Your highest score across all passed interview attempts.",
        },
        {
            label: "Latest score",
            value: formatScore(stats.latestScore),
            description: stats.latestInterviewDate
                ? dayjs(stats.latestInterviewDate).format(DATE_TIME_FORMAT)
                : "No scored interview yet",
        },
        {
            label: "Last passed interview",
            value: stats.latestInterviewDate
                ? dayjs(stats.latestInterviewDate).format(DATE_TIME_FORMAT)
                : "N/A",
            description: "Date and time of your most recent interview attempt.",
        },
        {
            label: "Tracked days",
            value: `${stats.dailyAverageScores.length} day${stats.dailyAverageScores.length === 1 ? "" : "s"}`,
            description: "Number of calendar days included in your daily average score.",
        },
    ];

    return (
        <section className="mt-8 overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(19,20,43,0.95),rgba(8,9,18,0.98))] px-4 py-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] sm:px-8 sm:py-7">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/75">Performance Dashboard</p>
                    <h2 className="mt-3 text-3xl font-semibold text-white">
                        {username ? `${username}, here is your interview snapshot.` : "Your interview snapshot is ready."}
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-light-100/75 sm:text-base">
                        {hasStats
                            ? "These statistics count every interview attempt with feedback, and the chart tracks your average score on each day you took interviews."
                            : "Finish an interview and generate feedback to unlock your personal score trends here."
                        }
                    </p>
                </div>
                <Link href="/interview" className="inline-flex min-h-12 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/10 px-6 text-sm font-semibold text-cyan-200 transition duration-300 hover:scale-[1.02] hover:bg-cyan-400/20 hover:text-white">
                    Start practicing
                </Link>
            </div>
            {hasStats ? (
                <div className="mt-8 grid gap-4 justify-items-center xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)] xl:items-start xl:justify-items-stretch">
                    <div className="w-full max-w-90 rounded-3xl border border-cyan-400/20 bg-[radial-gradient(circle_at_top_left,rgba(77,238,234,0.14),transparent_42%),rgba(8,9,13,0.85)] p-4 sm:p-6 xl:max-w-none">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300/75">Average score</p>
                                <div className="mt-4 flex items-end gap-2">
                                    <span className="text-5xl font-bold leading-none text-white sm:text-6xl">{stats.averageScore}</span>
                                    <span className="pb-1 text-lg font-medium text-cyan-200 sm:text-xl">/100</span>
                                </div>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                                <p className="text-xs uppercase tracking-[0.25em] text-light-100/65">Momentum</p>
                                <p className={`mt-2 text-2xl font-semibold ${getTrendTone(stats.recentScoreChange)}`}>{formattedScoreChange}</p>
                                <p className="mt-1 text-xs leading-5 text-light-100/70">{getTrendLabel(stats.recentScoreChange)}</p>
                            </div>
                        </div>
                        <div className="mt-6">
                            <PerformanceTrendChart data={stats.dailyAverageScores} />
                        </div>
                    </div>
                    <div className="grid w-full max-w-90 gap-4 sm:grid-cols-1 xl:max-w-none xl:grid-cols-1">
                        {statCards.map((card) => (
                            <div key={card.label} className="rounded-3xl border border-white/10 bg-white/4 p-5 backdrop-blur-sm">
                                <p className="text-xs font-medium uppercase tracking-[0.22em] text-light-100/65">{card.label}</p>
                                <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
                                <p className="mt-2 text-sm leading-6 text-light-100/70">{card.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="mt-8 rounded-3xl border border-dashed border-cyan-400/25 bg-cyan-400/3 px-6 py-8">
                    <p className="text-lg font-semibold text-white">No scored interviews yet.</p>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-light-100/75">
                        Once you complete an interview and receive feedback, this dashboard will show your average score,
                        strongest result, latest performance, score momentum, and your day-by-day average trend.
                    </p>
                </div>
            )}
        </section>
    );
};

export default PerformanceDashboard;
