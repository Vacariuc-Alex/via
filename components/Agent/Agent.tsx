"use client"

import React, {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import {createInterviewController} from '@/features/agent/orchestrator';
import Image from 'next/image';
import {cn} from '@/commons/utils';
import {AgentMode, CallStatus, InterviewEvent, TranscriptMessage} from '@/commons/enums';
import {AgentProps, FeedbackReadyPayload, SavedTranscribedMessage} from "@/commons/types";

export default function Agent({username, userId, interview, mode}: AgentProps) {
    const router = useRouter();
    const controllerRef = useRef<ReturnType<typeof createInterviewController> | null>(null);

    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [isAgentSpeaking, setIsAgentSpeaking] = useState<boolean>(false);
    const [isUserSpeaking, setIsUserSpeaking] = useState<boolean>(false);
    const [messages, setMessages] = useState<SavedTranscribedMessage[]>([]);
    const [isForcedDisconnect, setIsDisconnect] = useState<boolean>(false);

    const lastMessage = messages.length ? messages[messages.length - 1] : null;

    useEffect(() => {
        if (callStatus !== CallStatus.FINISHED) return;
        if (mode !== AgentMode.INTERVIEW || isForcedDisconnect) {
            router.push('/');
        }
    }, [callStatus, isForcedDisconnect, mode, router]);

    function handleCall() {
        setIsDisconnect(false);
        setCallStatus(CallStatus.CONNECTING);
        setMessages([]);

        const controller = createInterviewController(username, userId);
        controllerRef.current = controller;

        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
        const onCallEnd = () => setCallStatus(CallStatus.FINISHED);
        const onSpeechStart = () => setIsAgentSpeaking(true);
        const onSpeechEnd = () => {setIsAgentSpeaking(false); setIsUserSpeaking(false);}
        const onUserListenStart = () => setIsUserSpeaking(true);
        const onUserListenEnd = () => setIsUserSpeaking(false);
        const onFeedbackReady = ({interviewId, feedbackId}: FeedbackReadyPayload) => {
            router.push(`/interview/${interviewId}/feedback?feedbackId=${feedbackId}`);
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
        setIsDisconnect(true);
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
                            <div className="relative z-20 rounded-full overflow-hidden size-[120px] border-2 border-green-500/30 bg-[#0b0e14]">
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
            <div className="w-full flex justify-center">
                {callStatus !== CallStatus.ACTIVE ? (
                    <button className="agent-btn-call group" onClick={handleCall}>
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
