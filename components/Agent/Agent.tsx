"use client"

import React, {FormEvent, KeyboardEvent, useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useLocale, useTranslations} from 'next-intl';
import {createInterviewController} from '@/features/agent/orchestrator';
import Image from 'next/image';
import {cn} from '@/commons/utils';
import {AgentMode, CallStatus, InterviewEvent, TranscriptMessage} from '@/commons/enums';
import {AgentProps, AnswerInputMode, AnswerInputReadyPayload, FeedbackReadyPayload, SavedTranscribedMessage} from "@/commons/types";
import {getLocalizedPath} from "@/features/translation/routing";

type EditorView = "hidden" | "write" | "review";

function getInputHelperText(callStatus: CallStatus, isVoiceInputAvailable: boolean, inputMode: AnswerInputMode, editorView: EditorView, t: any) {
    if (callStatus === CallStatus.ACTIVE) {
        if (editorView === "review") {
            return t('inputHelperReview');
        }
        if (inputMode === "write") {
            return t('inputHelperWritingMode');
        }
        if (isVoiceInputAvailable) {
            return t('inputHelperVoiceMode');
        }
        return t('inputHelperNoVoice');
    }
    return t('inputHelperInactive');
}

function getInputPlaceholder(callStatus: CallStatus, isAwaitingResponse: boolean, editorView: EditorView, t: any) {
    if (callStatus === CallStatus.ACTIVE) {
        if (editorView === "review") {
            return t('placeholderReview');
        }
        if (isAwaitingResponse) {
            return t('placeholderActive');
        }
        return t('placeholderWaiting');
    }
    return t('placeholderInactive');
}

function getInputStatus(callStatus: CallStatus, isAwaitingResponse: boolean, inputMode: AnswerInputMode, editorView: EditorView, t: any) {
    if (callStatus === CallStatus.ACTIVE) {
        if (editorView === "review") {
            return t('statusReview');
        }
        if (isAwaitingResponse) {
            return inputMode === "write" ? t('statusWriting') : t('statusListening');
        }
        return t('statusWaiting');
    }
    return t('statusInactive');
}

function getToggleButtonLabel(isToggleEnabled: boolean, inputMode: AnswerInputMode, t: any) {
    if (!isToggleEnabled) {
        return t('switchToWriting');
    }
    return inputMode === "voice" ? t('switchToWriting') : t('switchToVoice');
}

export default function Agent({username, userId, interview, mode}: Readonly<AgentProps>) {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('interview');
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
    const inputHelperText = getInputHelperText(callStatus, isVoiceInputAvailable, inputMode, editorView, t);
    const inputPlaceholder = getInputPlaceholder(callStatus, isAwaitingResponse, editorView, t);
    const inputStatus = getInputStatus(callStatus, isAwaitingResponse, inputMode, editorView, t);
    const isModeToggleDisabled = !isUserTurn || editorView === "review" || !isVoiceInputAvailable;
    const toggleButtonLabel = getToggleButtonLabel(!isModeToggleDisabled, inputMode, t);

    useEffect(() => {
        return () => {
            controllerRef.current?.stop();
            controllerRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (callStatus !== CallStatus.FINISHED) return;
        if (mode === AgentMode.GENERATE || isForcedDisconnect) {
            router.push(getLocalizedPath("/", locale));
        }
    }, [callStatus, isForcedDisconnect, mode, router, locale]);

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

        const controller = createInterviewController(username, userId, locale);
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
            const feedbackPath = getLocalizedPath(`/interview/${interviewId}/feedback`, locale);
            router.push(`${feedbackPath}?feedbackId=${feedbackId}`);
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
                    <h3>{t('aiInterviewer')}</h3>
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
                                <span className="agent-input-eyebrow">{editorView === "review" ? t('transcriptReview') : t('writingMode')}</span>
                                <h4 className="agent-input-title">
                                    {editorView === "review"
                                        ? t('reviewBeforeContinue')
                                        : t('typeWhileWaits')
                                    }
                                </h4>
                            </div>
                            <p className="agent-input-helper">
                                {inputHelperText}
                            </p>
                            {activePrompt && (
                                <div className="agent-active-prompt">
                                    <span>{t('currentPrompt')}</span>
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
                                    {isSubmittingText ? t('continuing') : editorView === "review" ? t('continueInterview') : t('sendAnswer')}
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
                            {callStatus === CallStatus.CONNECTING ? t('connecting') : t('startInterview')}
                        </span>
                    </button>
                ) : (
                    <button className="agent-btn-disconnect group" onClick={handleDisconnect}>
                        <span className="relative z-10">{t('endInterview')}</span>
                    </button>
                )}
            </div>
        </>
    );
}
