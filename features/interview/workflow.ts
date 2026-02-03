import {QuestionType} from "@/commons/enums";
import {InterviewFields, State} from "@/commons/types";

export function workflow(username: string): State[] {
    return [
        { type: QuestionType.SAY, text: `Hello, ${username}! Let's prepare your interview. I'll ask you a few questions and generate a perfect interview just for you. Let's begin!`},
        { type: QuestionType.ASK, id: InterviewFields.ROLE, text: "What role would you like to train for?" },
        { type: QuestionType.ASK, id: InterviewFields.TYPE, text: "Are you aiming for a technical, behavioral or mixed interview?" },
        { type: QuestionType.ASK, id: InterviewFields.LEVEL, text: "Tell me your job experience level." },
        { type: QuestionType.ASK, id: InterviewFields.TECHSTACK, text: "What are the technologies you'd like to cover during the job interview?" },
        { type: QuestionType.ASK, id: InterviewFields.AMOUNT, text: "How many questions would you like me to prepare for you?" },
        { type: QuestionType.END }
    ];
}
