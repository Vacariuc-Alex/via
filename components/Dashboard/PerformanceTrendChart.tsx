import dayjs from "dayjs";
import {PerformanceTrendChartProps} from "@/commons/types";

const WIDTH = 640;
const HEIGHT = 520;
const PADDING = { top: 24, right: 20, bottom: 42, left: 20 };
const INNER_WIDTH = WIDTH - PADDING.left - PADDING.right;
const INNER_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;
const Y_MIN = 0;
const Y_MAX = 100;
const GRID_VALUES = [0, 25, 50, 75, 100];

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const formatAxisDate = (date: string) => dayjs(date).format("MMM D");
const formatTooltipDate = (date: string) => dayjs(date).format("DD MMM YYYY");

const PerformanceTrendChart = ({data}: PerformanceTrendChartProps) => {
    if (!data.length) {
        return (
            <div className="rounded-3xl border border-dashed border-cyan-400/20 bg-white/3 px-5 py-8 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300/75">Daily average score</p>
                <p className="mt-3 text-sm leading-6 text-light-100/75">
                    Complete scored interviews on different days to see your average score trend line here.
                </p>
            </div>
        );
    }

    const points = data.map((point, index) => {
        const x = data.length === 1
            ? PADDING.left + INNER_WIDTH / 2
            : PADDING.left + (index / (data.length - 1)) * INNER_WIDTH;
        const normalizedScore = (clamp(point.averageScore, Y_MIN, Y_MAX) - Y_MIN) / (Y_MAX - Y_MIN);
        const y = PADDING.top + INNER_HEIGHT - normalizedScore * INNER_HEIGHT;

        return {
            ...point,
            x,
            y,
        };
    });

    const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
    const areaPoints = [
        `${points[0]?.x},${PADDING.top + INNER_HEIGHT}`,
        ...points.map((point) => `${point.x},${point.y}`),
        `${points.at(-1)?.x},${PADDING.top + INNER_HEIGHT}`,
    ].join(" ");
    const axisLabelStep = Math.max(1, Math.ceil(data.length / 4));

    return (
        <div className="rounded-3xl border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-4 sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300/75">Daily average score</p>
                    <p className="mt-1 text-sm leading-6 text-light-100/75">
                        Average interview score for each day.
                    </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-light-100/65">Tracked days</p>
                    <p className="mt-1 text-xl font-semibold text-white">{data.length}</p>
                </div>
            </div>

            <div className="mt-6">
                <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full" aria-labelledby="daily-average-score-chart-title">
                    <title id="daily-average-score-chart-title">Line chart showing average score by day</title>
                    <defs>
                        <linearGradient id="daily-score-line" x1="0" x2="1" y1="0" y2="0">
                            <stop offset="0%" stopColor="#4deeea" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                        <linearGradient id="daily-score-fill" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="rgba(77, 238, 234, 0.28)" />
                            <stop offset="100%" stopColor="rgba(77, 238, 234, 0)" />
                        </linearGradient>
                    </defs>

                    {GRID_VALUES.map((value) => {
                        const y = PADDING.top + INNER_HEIGHT - (value / 100) * INNER_HEIGHT;
                        return (
                            <g key={value}>
                                <line x1={PADDING.left} y1={y} x2={WIDTH - PADDING.right} y2={y} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 6"/>
                                <text x={WIDTH - PADDING.right} y={y - 6} textAnchor="end" fill="rgba(176,181,255,0.6)" fontSize="10">{value}</text>
                            </g>
                        );
                    })}

                    <polygon points={areaPoints} fill="url(#daily-score-fill)" />
                    <polyline fill="none" points={polylinePoints} stroke="url(#daily-score-line)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>

                    {points.map((point, index) => {
                        const showAxisLabel = index % axisLabelStep === 0 || index === points.length - 1;
                        return (
                            <g key={point.date}>
                                <circle cx={point.x} cy={point.y} r="5" fill="#08111d" stroke="#4deeea" strokeWidth="2" />
                                <circle cx={point.x} cy={point.y} r="10" fill="transparent">
                                    <title>{`${formatTooltipDate(point.date)}\n${point.averageScore}/100 across ${point.attempts} interview${point.attempts === 1 ? "" : "s"}`}</title>
                                </circle>
                                {showAxisLabel ? (
                                    <text x={point.x} y={HEIGHT - 12} textAnchor="middle" fill="rgba(176,181,255,0.72)" fontSize="10">{formatAxisDate(point.date)}</text>
                                ) : null}
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
};

export default PerformanceTrendChart;
