//User related types
import {AuthStatus, InterviewDocFields, QuestionType, TranscriptMessage} from "@/commons/enums";
import {Control, FieldValues, Path} from "react-hook-form";
import type {AgentMode} from "@/commons/enums";

//User related types
export interface UserDoc {
    id?: string;
    username: string;
    email: string;
};

//Interview related types
export interface InterviewDoc {
    id?: string;
    role: string;
    type: string;
    level: string;
    techstack: string;
    technologies: string[];
    questions: string[];
    finalized: boolean;
    coverImage: string;
    createdAt: string;
    userId: string;
};

//Feedback related types
export interface Feedback {
    totalScore: number;
    categoryScores: Array<{
        name: string;
        score: number;
        comment: string;
    }>;
    strengths: string[];
    areasForImprovement: string[];
    finalAssessment: string;
};

export interface FeedbackDoc {
    id?: string;
    userId: string,
    interviewId: string,
    qa: InterviewQaPair[],
    role: string,
    level: string,
    type: string,
    technologies: string[],
    feedback: Feedback,
    createdAt: string,
}

//Transcript message related types
export interface SavedTranscribedMessage {
    role: TranscriptMessage.ROLE_USER | TranscriptMessage.ROLE_ASSISTANT;
    content: string;
}

export interface TranscriptMessageEmitter extends SavedTranscribedMessage {
    type: TranscriptMessage.TYPE;
    transcriptType: TranscriptMessage.TRANSCRIPT_TYPE;
}

//Component props
export interface InterviewCardProps {
    id: string;
    role: string;
    type: string;
    technologies: string[];
    coverImage: string;
    createdAt: string;
};

export interface TechIconProps {
    technologies: string[];
};

export interface AgentProps{
    userId: string;
    username: string;
    interview?: InterviewDoc;
    mode?: AgentMode;
};

//Method params
export interface SignInParams {
    email: string;
    idToken: string;
};

export type SignUpParams = Pick<UserDoc, "email" | "username"> & {
    userId: string;
    password: string;
};

export interface FormTypeParams {
    type: AuthStatus;
};

export interface GetLatestInterviewsParams {
    userId: string;
    limit?: number;
};

export type InterviewGenerationPromptParams = Pick<InterviewDoc, "role" | "level" | "type" | "techstack"> & {
    amount: string;
};

export type InterviewFeedbackPromptParams = Pick<InterviewDoc, "role" | "level" | "type" | "technologies"> & {
    transcript: string;
};

export interface AgentParams {
    interview?: InterviewDoc;
    mode: AgentMode;
};

export interface RouteParams {
    params: Promise<Record<string, string>>;
    searchParams: Promise<Record<string, string>>;
}

//Payloads
export interface InterviewQaPair {
    q: string;
    a: string;
}

export type InterviewDialogPayload = Pick<InterviewDoc, "userId" | "role" | "level" | "type" | "technologies"> & {
    interviewId: string;
    qa: InterviewQaPair[];
};

export type InterviewGenerationPayload = {
    userId: string;
} & Record<string, string>;

export interface FeedbackReadyPayload {
    interviewId: string;
    feedbackId: string;
}

//Other types
export type State =
    { type: QuestionType.SAY; text: string }
    | { type: QuestionType.ASK; id?: InterviewDocFields; text: string }
    | { type: QuestionType.END; };

export interface FormFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    label: string;
    placeholder?: string;
    type?: "text" | "email" | "password";
}

export type AiAnswersResponse = {
    success: boolean;
    feedbackId: string;
    error?: string;
};
