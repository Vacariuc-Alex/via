import {defaultLocale, getTranslation, getTranslationValue} from "./serverTranslations";

export const backendTranslationKeys = {
    interview: {
        workflow: {
            generateGreeting: "interview.workflow.generateGreeting",
            generateRoleQuestion: "interview.workflow.generateRoleQuestion",
            generateTypeQuestion: "interview.workflow.generateTypeQuestion",
            generateLevelQuestion: "interview.workflow.generateLevelQuestion",
            generateTechstackQuestion: "interview.workflow.generateTechstackQuestion",
            generateAmountQuestion: "interview.workflow.generateAmountQuestion",
            interviewGreeting: "interview.workflow.interviewGreeting",
            finalGenerateMessage: "interview.workflow.finalGenerateMessage",
            finalInterviewMessage: "interview.workflow.finalInterviewMessage",
            finalErrorMessage: "interview.workflow.finalErrorMessage",
            unrecognizedSpeech: "interview.workflow.unrecognizedSpeech",
            undetectedAudio: "interview.workflow.undetectedAudio"
        },
        prompts: {
            generationTemplate: "interview.prompts.generation.template",
            generationLanguageInstruction: "interview.prompts.generation.languageInstruction",
            feedbackTemplate: "interview.prompts.feedback.template",
            feedbackLanguageInstruction: "interview.prompts.feedback.languageInstruction"
        }
    }
} as const;

export async function getBackendTranslation(
    locale: string | undefined,
    key: string,
    params?: Record<string, string | number>
): Promise<string> {
    return (await getTranslation(locale, key, params)) || (await getTranslation(defaultLocale, key, params));
}

export async function getBackendTranslationList(locale: string | undefined, key: string): Promise<string[]> {
    const value = await getTranslationValue(locale, key);
    if (Array.isArray(value)) {
        return value.filter((entry): entry is string => typeof entry === "string");
    }

    const fallbackValue = await getTranslationValue(defaultLocale, key);
    if (Array.isArray(fallbackValue)) {
        return fallbackValue.filter((entry): entry is string => typeof entry === "string");
    }

    return [];
}
