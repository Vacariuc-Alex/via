import { INTERVIEW_COVERS, TECHSTACK_NORMALIZED_NAMES } from "@/commons/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return TECHSTACK_NORMALIZED_NAMES[key as keyof typeof TECHSTACK_NORMALIZED_NAMES];
};

const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
};

export const getTechLogos = async (techArray: string[]) => {
  const logoURLs = techArray.map((tech) => {
    const normalized = normalizeTechName(tech);
    return {
      tech,
      url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
    };
  });

  const results = await Promise.all(
      logoURLs.map(async ({ tech, url }) => ({
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
