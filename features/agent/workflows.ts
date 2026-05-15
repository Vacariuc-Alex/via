import {InterviewDocFields, QuestionType} from "@/commons/enums";
import {State} from "@/commons/types";
import {backendTranslationKeys, getBackendTranslation} from "../translation/utils/clientTranslations";

export async function generateInterviewWorkflow(username: string, locale?: string): Promise<State[]> {
    const {workflow} = backendTranslationKeys.interview;
    const greeting = await getBackendTranslation(locale, workflow.generateGreeting, {username});
    const roleQuestion = await getBackendTranslation(locale, workflow.generateRoleQuestion);
    const typeQuestion = await getBackendTranslation(locale, workflow.generateTypeQuestion);
    const levelQuestion = await getBackendTranslation(locale, workflow.generateLevelQuestion);
    const techstackQuestion = await getBackendTranslation(locale, workflow.generateTechstackQuestion);
    const amountQuestion = await getBackendTranslation(locale, workflow.generateAmountQuestion);

    return [
        {type: QuestionType.SAY, text: greeting},
        {type: QuestionType.ASK, id: InterviewDocFields.ROLE, text: roleQuestion},
        {type: QuestionType.ASK, id: InterviewDocFields.TYPE, text: typeQuestion},
        {type: QuestionType.ASK, id: InterviewDocFields.LEVEL, text: levelQuestion},
        {type: QuestionType.ASK, id: InterviewDocFields.TECHSTACK, text: techstackQuestion},
        {type: QuestionType.ASK, id: InterviewDocFields.AMOUNT, text: amountQuestion},
        {type: QuestionType.END}
    ];
}

export async function ongoingInterviewWorkflow(username: string, questions: string[], locale?: string): Promise<State[]> {
    const greeting = await getBackendTranslation(locale, backendTranslationKeys.interview.workflow.interviewGreeting, {username});

    return [
        {
            type: QuestionType.SAY,
            text: greeting,
        } satisfies State,
        ...questions.map((e) => ({
            type: QuestionType.ASK,
            text: e,
        } satisfies State)),
        {type: QuestionType.END} satisfies State
    ];
}
