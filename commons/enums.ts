export const enum InterviewEvent {
    CALL_START = "call-start",
    CALL_END = "call-end",
    SPEECH_START = "speech-start",
    SPEECH_END = "speech-end",
    MESSAGE = "message",
    FEEDBACK_READY = "feedback-ready"
};

export const enum QuestionType {
    SAY = "say",
    ASK = "ask",
    END = "end"
};

export const enum DbDoc {
    INTERVIEWS = "interviews",
    USERS = "users",
    FEEDBACK = "feedback"
};

export const enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
}

export const enum AgentMode {
    GENERATE = "generate",
    INTERVIEW = "interview"
}

export const enum AuthStatus {
    SIGN_IN = "sign-in",
    SIGN_UP = "sign-up"
}

export const enum TranscriptMessage{
    TYPE = "transcript",
    TRANSCRIPT_TYPE = "final",
    ROLE_USER = "user",
    ROLE_ASSISTANT = "assistant",
};

export const enum InterviewDocFields {
    ROLE = "role",
    TYPE = "type",
    LEVEL = "level",
    TECHSTACK = "techstack",
    AMOUNT = "amount",
    FINALIZED = "finalized",
    CREATED_AT = "createdAt",
    USER_ID = "userId"
};

export const enum InterviewType {
    MIXED = "Mixed",
    TECHNICAL = "Technical",
    BEHAVIORAL = "Behavioral",
}
