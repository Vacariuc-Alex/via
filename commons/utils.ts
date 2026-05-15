import {INTERVIEW_COVERS, TECHSTACK_NORMALIZED_NAMES} from "@/commons/constants";
import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";
import {InterviewQaPair} from "@/commons/types";
import {InterviewType} from "@/commons/enums";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

export function normalizeTechnologies(input: unknown): string[] {
    const normalizeOne = (text: unknown): string => {
        const token = String(text ?? "").trim().toLowerCase();
        if (!token) return "";
        const compactKey = token.replace(/\s+/g, "");
        return (
            TECHSTACK_NORMALIZED_NAMES[token as keyof typeof TECHSTACK_NORMALIZED_NAMES] ??
            TECHSTACK_NORMALIZED_NAMES[compactKey as keyof typeof TECHSTACK_NORMALIZED_NAMES] ??
            token
        );
    };

    const list = Array.isArray(input)
        ? input
        : String(input ?? "").trim().split(/\s*,\s*|\s+/g);

    const normalized = list.map(normalizeOne).filter(Boolean);
    return Array.from(new Set(normalized));
}

export function normalizeInterviewType(input: unknown): string {
    const raw = String(input ?? "").trim();

    if (!raw) return raw;

    const token = raw.toLowerCase();

    if (token.includes("mix")) return InterviewType.MIXED;
    if (token.includes("tech")) return InterviewType.TECHNICAL;
    if (token.includes("behavioural") || token.includes("behavioral")) return InterviewType.BEHAVIORAL;

    return raw;
}

export async function getInterviewTypeDisplayLabel(type: string, locale?: string): Promise<string> {
    const {getTranslation} = await import("../features/translation/utils/serverTranslations");
    const normalized = normalizeInterviewType(type);

    const key = (() => {
        if (normalized === InterviewType.MIXED) return "interview.interviewTypes.mixed";
        if (normalized === InterviewType.TECHNICAL) return "interview.interviewTypes.technical";
        if (normalized === InterviewType.BEHAVIORAL) return "interview.interviewTypes.behavioral";
        return null;
    })();

    if (!key) return normalized;
    const label = await getTranslation(locale, key);
    return label || normalized;
}

export const formatInterviewQaPairs = (interviewQaPairs: Array<InterviewQaPair>) => interviewQaPairs.map((e, i) => {
    const q = (e?.q ?? "").toString().trim();
    const a = (e?.a ?? "").toString().trim();
    return `Q${i + 1}: ${q}\nA${i + 1}: ${a}`;
}).join("\n\n");

const checkIconExists = async (url: string) => {
    try {
        const response = await fetch(url, {method: "HEAD"});
        return response.ok;
    } catch {
        return false;
    }
};

export const getTechLogos = async (techArray: string[]) => {
    const normalizedTechArray = normalizeTechnologies(techArray);
    const logoURLs = normalizedTechArray.map((tech) => {
        return {
            tech,
            url: `${techIconBaseURL}/${tech}/${tech}-original.svg`,
        };
    });

    const results = await Promise.all(
        logoURLs.map(async ({tech, url}) => ({
            tech,
            url: (await checkIconExists(url)) ? url : "/tech.svg",
        }))
    );

    return results;
};

export const getRandomInterviewCover = () => {
    const randomIndex = Math.floor(Math.random() * INTERVIEW_COVERS.length);
    return `/covers${INTERVIEW_COVERS[randomIndex]}`;
};
