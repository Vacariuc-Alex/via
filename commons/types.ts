//User related types
import {QuestionType} from "@/commons/enums";
import {Control, FieldValues, Path} from "react-hook-form";

export const enum UserFields {
    ID = "id",
    NAME = "name",
    EMAIL = "email"
};

export interface User {
    id: string;
    name: string;
    email: string;
};

export type UserDbTable = Omit<User, UserFields.ID>;

//Interview related types
export const enum InterviewFields {
    ID = "id",
    ROLE = "role",
    TYPE = "type",
    LEVEL = "level",
    TECHSTACK = "techstack",
    AMOUNT = "amount",
    QUESTIONS = "questions",
    FINALIZED = "finalized",
    COVER_IMAGE = "coverImage",
    CREATED_AT = "createdAt",
    USER_ID = "userId"
};

export interface Interview {
    id: string;
    role: string;
    type: string;
    level: string;
    techstack: string[];
    questions: string[];
    finalized: boolean;
    coverImage: string;
    createdAt: string;
    userId: string;
};

export type InterviewDbTable = Omit<Interview, InterviewFields.ID>;

//Feedback related types
export interface Feedback {
    id: string;
    interviewId: string;
    totalScore: number;
    categoryScores: Array<{
        name: string;
        score: number;
        comment: string;
    }>;
    strengths: string[];
    areasForImprovement: string[];
    finalAssessment: string;
    createdAt: string;
};

//Auth related types
export const SIGN_IN = "sign-in";
export const SIGN_UP = "sign-up";

export type FormType = typeof SIGN_IN | typeof SIGN_UP;

export interface FormTypeParams {
    type: FormType;
};

//Transcript message related types and constants
export const MESSAGE_TYPE = "transcript";
export const MESSAGE_TRANSCRIPT_TYPE = "final";
export const MESSAGE_ROLE_USER = "user";
export const MESSAGE_ROLE_ASSISTANT = "assistant";

export interface MessageEmitter {
    type: typeof MESSAGE_TYPE;
    transcriptType: typeof MESSAGE_TRANSCRIPT_TYPE;
    role: typeof MESSAGE_ROLE_USER | typeof MESSAGE_ROLE_ASSISTANT;
    content: string;
};

export interface SavedMessage {
    role: typeof MESSAGE_ROLE_USER | typeof MESSAGE_ROLE_ASSISTANT;
    content: string;
};

//Props and Params
export interface InterviewCardProps {
    id: string;
    role: string;
    type: string;
    techstack: string[];
    coverImage: string;
    createdAt: string;
};

export interface InterviewGenerationPromptParams {
    role: string;
    level: string;
    techstack: string;
    type: string;
    amount: number;
};

export interface GetLatestInterviewsParams {
    userId: string;
    limit?: number;
};

export interface SignInParams {
    email: string;
    idToken: string;
};

export interface SignUpParams {
    uid: string;
    name: string;
    email: string;
    password: string;
};

export interface TechIconProps {
    techStack: string[];
};

export interface AgentProps {
    userName: string;
    userId: string;
    type: string;
};

export type State =
    { type: QuestionType.SAY; text: string }
    | { type: QuestionType.ASK; id: string; text: string }
    | { type: QuestionType.END; };

export interface FormFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    label: string;
    placeholder?: string;
    type?: "text" | "email" | "password";
}

/*
interface CreateFeedbackParams {
    interviewId: string;
    userId: string;
    transcript: { role: string; content: string }[];
    feedbackId?: string;
}

interface AgentProps {
    userName: string;
    userId?: string;
    interviewId?: string;
    feedbackId?: string;
    type: "generate" | "interview";
    questions?: string[];
}

interface RouteParams {
    params: Promise<Record<string, string>>;
    searchParams: Promise<Record<string, string>>;
}

interface GetFeedbackByInterviewIdParams {
    interviewId: string;
    userId: string;
}

interface InterviewFormProps {
    interviewId: string;
    role: string;
    level: string;
    type: string;
    techstack: string[];
    amount: number;
}
*/
