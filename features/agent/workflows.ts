import {InterviewDocFields, QuestionType} from "@/commons/enums";
import {State} from "@/commons/types";

export function generateInterviewWorkflow(username: string): State[] {
    return [
        { type: QuestionType.SAY, text: `Hello, ${username}! Let's prepare your interview. I'll ask you a few questions and generate a perfect interview just for you. Let's begin!`},
        { type: QuestionType.ASK, id: InterviewDocFields.ROLE, text: "What role would you like to train for?" },
        { type: QuestionType.ASK, id: InterviewDocFields.TYPE, text: "Are you aiming for a technical, behavioral or mixed interview?" },
        { type: QuestionType.ASK, id: InterviewDocFields.LEVEL, text: "Tell me your job experience level." },
        { type: QuestionType.ASK, id: InterviewDocFields.TECHSTACK, text: "What are the technologies you'd like to cover during the job interview?" },
        { type: QuestionType.ASK, id: InterviewDocFields.AMOUNT, text: "How many questions would you like me to prepare for you?" },
        { type: QuestionType.END }
    ];
}

export function ongoingInterviewWorkflow(username: string, questions: string[]): State[] {
    return [
        {
            type: QuestionType.SAY,
            text: `Hello, ${username}! Thank you for taking the time to speak with me today. I'm excited to learn more about you and your experience.`,
        } satisfies State,
        ...questions.map((e) => ({
            type: QuestionType.ASK,
            text: e,
        } satisfies State)),
        {type: QuestionType.END} satisfies State
    ];
}
