"use client"

import React, {FormEvent, KeyboardEvent, useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import {createInterviewController} from '@/features/agent/orchestrator';
import Image from 'next/image';
import {cn} from '@/commons/utils';
import {AgentMode, CallStatus, InterviewEvent, TranscriptMessage} from '@/commons/enums';
import {AgentProps, AnswerInputMode, AnswerInputReadyPayload, FeedbackReadyPayload, SavedTranscribedMessage} from "@/commons/types";

type EditorView = "hidden" | "write" | "review";

function getInputHelperText(callStatus: CallStatus, isVoiceInputAvailable: boolean, inputMode: AnswerInputMode, editorView: EditorView) {
    if (callStatus === CallStatus.ACTIVE) {
        if (editorView === "review") {
            return "We captured your answer. Review or edit the transcript below, then continue when you're ready.";
        }
        if (inputMode === "write") {
            return "Writing mode is active. When it's your turn, the interviewer will wait for you to type instead of listening.";
        }
        if (isVoiceInputAvailable) {
            return "Voice mode is active. Speak your answer, then review the transcript before the agent continues.";
        }
        return "Voice input is not available here, so type your answers below to continue the interview.";
    }
    return "Start the interview to reply by voice or by typing below.";
}

function getInputPlaceholder(callStatus: CallStatus, isAwaitingResponse: boolean, editorView: EditorView) {
    if (callStatus === CallStatus.ACTIVE) {
        if (editorView === "review") {
            return "Adjust the transcript here before continuing the interview.";
        }
        if (isAwaitingResponse) {
            return "Type your answer here. Press Enter to send or Shift + Enter for a new line.";
        }
        return "Wait for the next question before sending your answer.";
    }
    return "Start the interview to unlock text answers.";
}

function getInputStatus(callStatus: CallStatus, isAwaitingResponse: boolean, inputMode: AnswerInputMode, editorView: EditorView) {
    if (callStatus === CallStatus.ACTIVE) {
        if (editorView === "review") {
            return "Review transcript";
        }
        if (isAwaitingResponse) {
            return inputMode === "write" ? "Writing mode" : "Listening for answer";
        }
        return "Waiting for next prompt";
    }
    return "Interview inactive";
}

function getToggleButtonLabel(isToggleEnabled: boolean, inputMode: AnswerInputMode) {
    if (!isToggleEnabled) {
        return "Switch to Writing";
    }
    return inputMode === "voice" ? "Switch to Writing" : "Switch to Voice";
}

export default function Agent({username, userId, interview, mode}: Readonly<AgentProps>) {
    const router = useRouter();
    const controllerRef = useRef<ReturnType<typeof createInterviewController> | null>(null);

    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [isAgentSpeaking, setIsAgentSpeaking] = useState<boolean>(false);
    const [isUserSpeaking, setIsUserSpeaking] = useState<boolean>(false);
    const [messages, setMessages] = useState<SavedTranscribedMessage[]>([]);
    const [isForcedDisconnect, setIsForcedDisconnect] = useState<boolean>(false);
    const [draftMessage, setDraftMessage] = useState<string>("");
    const [activePrompt, setActivePrompt] = useState<string>("");
    const [isAwaitingResponse, setIsAwaitingResponse] = useState<boolean>(false);
    const [isSubmittingText, setIsSubmittingText] = useState<boolean>(false);
    const [isVoiceInputAvailable, setIsVoiceInputAvailable] = useState<boolean>(true);
    const [inputMode, setInputMode] = useState<AnswerInputMode>("voice");
    const [editorView, setEditorView] = useState<EditorView>("hidden");

    const lastMessage = messages.at(-1) ?? null;
    const isResponseEditorVisible = editorView !== "hidden";
    const isUserTurn = isUserSpeaking || (isAwaitingResponse && editorView === "write");
    const canTypeResponse = callStatus === CallStatus.ACTIVE && isAwaitingResponse && isResponseEditorVisible && !isSubmittingText;
    const canSubmitResponse = canTypeResponse && draftMessage.trim().length > 0;
    const inputHelperText = getInputHelperText(callStatus, isVoiceInputAvailable, inputMode, editorView);
    const inputPlaceholder = getInputPlaceholder(callStatus, isAwaitingResponse, editorView);
    const inputStatus = getInputStatus(callStatus, isAwaitingResponse, inputMode, editorView);
    const isModeToggleDisabled = !isUserTurn || editorView === "review" || !isVoiceInputAvailable;
    const toggleButtonLabel = getToggleButtonLabel(!isModeToggleDisabled, inputMode);

    useEffect(() => {
        return () => {
            controllerRef.current?.stop();
            controllerRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (callStatus !== CallStatus.FINISHED) return;
        if (mode !== AgentMode.INTERVIEW || isForcedDisconnect) {
            router.push('/');
        }
    }, [callStatus, isForcedDisconnect, mode, router]);

    function handleCall() {
        if (callStatus === CallStatus.CONNECTING) return;
        setIsForcedDisconnect(false);
        setCallStatus(CallStatus.CONNECTING);
        setMessages([]);
        setDraftMessage("");
        setActivePrompt("");
        setIsAwaitingResponse(false);
        setIsSubmittingText(false);
        setIsVoiceInputAvailable(true);
        setIsAgentSpeaking(false);
        setIsUserSpeaking(false);
        setInputMode("voice");
        setEditorView("hidden");

        const controller = createInterviewController(username, userId);
        controllerRef.current = controller;

        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
        const onCallEnd = () => {
            controllerRef.current = null;
            setCallStatus(CallStatus.FINISHED);
            setIsAgentSpeaking(false);
            setIsUserSpeaking(false);
            setIsAwaitingResponse(false);
            setIsSubmittingText(false);
            setActivePrompt("");
            setDraftMessage("");
            setEditorView("hidden");
        };
        const onSpeechStart = () => setIsAgentSpeaking(true);
        const onSpeechEnd = () => {setIsAgentSpeaking(false); setIsUserSpeaking(false);}
        const onUserListenStart = () => setIsUserSpeaking(true);
        const onUserListenEnd = () => setIsUserSpeaking(false);
        const onFeedbackReady = ({interviewId, feedbackId}: FeedbackReadyPayload) => {
            router.push(`/interview/${interviewId}/feedback?feedbackId=${feedbackId}`);
        };
        const onAnswerInputReady = ({prompt, value, mode: nextMode, isReview}: AnswerInputReadyPayload) => {
            setIsAwaitingResponse(true);
            setActivePrompt(prompt);
            setDraftMessage(value ?? "");
            setInputMode(nextMode);
            setEditorView(isReview ? "review" : "write");
        };
        const onAnswerInputIdle = () => {
            setIsAwaitingResponse(false);
            setActivePrompt("");
            setDraftMessage("");
            setEditorView("hidden");
        };
        const onVoiceInputUnavailable = () => {
            setIsVoiceInputAvailable(false);
            setIsUserSpeaking(false);
            setInputMode("write");
        };
        const onMessage = (message: any) => {
            if (message.type !== TranscriptMessage.TYPE || message.transcriptType !== TranscriptMessage.TRANSCRIPT_TYPE) return;
            setMessages((prev) => [
                ...prev,
                {
                    role: message.role,
                    content: message.content,
                } satisfies SavedTranscribedMessage,
            ]);
        };

        controller.on(InterviewEvent.CALL_START, onCallStart);
        controller.on(InterviewEvent.CALL_END, onCallEnd);
        controller.on(InterviewEvent.SPEECH_START, onSpeechStart);
        controller.on(InterviewEvent.SPEECH_END, onSpeechEnd);
        controller.on(InterviewEvent.USER_LISTEN_START, onUserListenStart);
        controller.on(InterviewEvent.USER_LISTEN_END, onUserListenEnd);
        controller.on(InterviewEvent.MESSAGE, onMessage);
        controller.on(InterviewEvent.FEEDBACK_READY, onFeedbackReady);
        controller.on(InterviewEvent.ANSWER_INPUT_READY, onAnswerInputReady);
        controller.on(InterviewEvent.ANSWER_INPUT_IDLE, onAnswerInputIdle);
        controller.on(InterviewEvent.VOICE_INPUT_UNAVAILABLE, onVoiceInputUnavailable);

        if(mode === AgentMode.GENERATE) {
            controller.start({mode});
        } else if(mode === AgentMode.INTERVIEW  && interview) {
            controller.start({interview, mode});
        }
    }

    function handleDisconnect() {
        controllerRef.current?.stop();
        controllerRef.current = null;
        setCallStatus(CallStatus.FINISHED);
        setIsForcedDisconnect(true);
        setIsAwaitingResponse(false);
        setIsSubmittingText(false);
        setActivePrompt("");
        setDraftMessage("");
        setIsAgentSpeaking(false);
        setIsUserSpeaking(false);
        setInputMode("voice");
        setEditorView("hidden");
    }

    async function handleTextSubmit(event?: FormEvent<HTMLFormElement>) {
        event?.preventDefault();

        const nextDraft = draftMessage.trim();
        if (!controllerRef.current || !nextDraft || !canTypeResponse) return;

        setIsSubmittingText(true);

        try {
            const didSubmit = await controllerRef.current.submitText(nextDraft);
            if (didSubmit) {
                setDraftMessage("");
            }
        } finally {
            setIsSubmittingText(false);
        }
    }

    function handleDraftKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void handleTextSubmit();
        }
    }

    function handleInputModeToggle() {
        if (callStatus !== CallStatus.ACTIVE || !controllerRef.current) return;
        if (isModeToggleDisabled) return;

        const nextMode: AnswerInputMode = inputMode === "voice" ? "write" : "voice";
        setInputMode(nextMode);
        controllerRef.current.setAnswerMode(nextMode);
    }

    return (
        <>
            <div className="agent-call-view">
                <div className="agent-interview-card">
                    <div className="agent-avatar">
                        {isAgentSpeaking && <div className="agent-animate-speak" />}
                        <div className="relative z-20 bg-[#0b0e14] rounded-full p-4 border border-cyan-500/20">
                            <Image src="/ai-avatar.svg" alt="avatar" width={65} height={54} className="object-contain" />
                        </div>
                    </div>
                    <h3>AI Interviewer</h3>
                </div>
                <div className="agent-card-border">
                    <div className="agent-card-content">
                        <div className="agent-avatar">
                            {isUserSpeaking && <div className="agent-animate-speak user-mode" />}
                            <div className="relative z-20 rounded-full overflow-hidden size-30 border-2 border-green-500/30 bg-[#0b0e14]">
                                <Image src="/profile.svg" alt="user avatar" width={120} height={120} className="object-cover" />
                            </div>
                        </div>
                        <h3>{username}</h3>
                    </div>
                </div>
            </div>
            {lastMessage && (
                <div className="agent-transcript-border">
                    <div className="agent-transcript">
                        <p key={lastMessage.content} className={cn("transition-opacity duration-500 opacity-0", "animate-fadeIn opacity-100")}>
                            {lastMessage.content}
                        </p>
                    </div>
                </div>
            )}
            {isResponseEditorVisible && (
                <div className="agent-input-border">
                    <div className="agent-input-panel">
                        <div className="agent-input-copy">
                            <div>
                                <span className="agent-input-eyebrow">{editorView === "review" ? "Transcript review" : "Writing mode"}</span>
                                <h4 className="agent-input-title">
                                    {editorView === "review"
                                        ? "Review your answer before the interview continues"
                                        : "Type your answer while the interviewer waits"}
                                </h4>
                            </div>
                            <p className="agent-input-helper">
                                {inputHelperText}
                            </p>
                            {activePrompt && (
                                <div className="agent-active-prompt">
                                    <span>Current prompt</span>
                                    <p>{activePrompt}</p>
                                </div>
                            )}
                        </div>
                        <form className="agent-text-form" onSubmit={handleTextSubmit}>
                            <textarea
                                value={draftMessage}
                                onChange={(event) => setDraftMessage(event.target.value)}
                                onKeyDown={handleDraftKeyDown}
                                placeholder={inputPlaceholder}
                                className="agent-textarea"
                                disabled={!canTypeResponse}
                                rows={4}
                            />
                            <div className="agent-text-actions">
                                <span className="agent-text-status">{inputStatus}</span>
                                <button type="submit" className={cn('agent-btn-submit', !canSubmitResponse && 'is-disabled')} disabled={!canSubmitResponse}>
                                    {isSubmittingText ? 'Continuing...' : editorView === "review" ? 'Continue Interview' : 'Send Answer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <div className="agent-controls">
                {callStatus === CallStatus.ACTIVE && (
                    <button
                        type="button"
                        className={cn('agent-btn-mode', isModeToggleDisabled && 'is-disabled')}
                        onClick={handleInputModeToggle}
                        disabled={isModeToggleDisabled}
                    >
                        <span className="relative z-10">{toggleButtonLabel}</span>
                    </button>
                )}
                {callStatus !== CallStatus.ACTIVE ? (
                    <button className="agent-btn-call group" onClick={handleCall} disabled={callStatus === CallStatus.CONNECTING}>
                        <span className={cn(
                            "absolute inset-0 rounded-lg animate-ping bg-cyan-400/20",
                            callStatus !== CallStatus.CONNECTING && "hidden"
                        )} />
                        <span className="relative z-10">
                            {callStatus === CallStatus.CONNECTING ? "Connecting..." : "Start Interview"}
                        </span>
                    </button>
                ) : (
                    <button className="agent-btn-disconnect group" onClick={handleDisconnect}>
                        <span className="relative z-10">End Interview</span>
                    </button>
                )}
            </div>
        </>
    );
}
