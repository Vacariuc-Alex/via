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
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
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
        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);
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
            <div className="call-view">
                <div className="card-interviewer">
                    <div className="avatar">
                        <Image src="/ai-avatar.png" alt="vapi" width={65} height={54} className="object-cover " />
                        {isSpeaking && <span className="animate-speak"/>}
                    </div>
                    <h3>AI Interviewer</h3>
                </div>
                <div className="card-border">
                    <div className="card-content">
                        <Image src="/user-avatar.png" alt="user avatar" width={540} height={540} className="rounded-full object-cover size-[120px]" />
                        <h3>{username}</h3>
                    </div>
                </div>
            </div>
            {lastMessage && (
                <div className="transcript-border">
                    <div className="transcript">
                        <p key={lastMessage.content} className={cn("transition-opacity duration-500 opacity-0", "animate-fadeIn opacity-100")}>
                            {lastMessage.content}
                        </p>
                    </div>
                </div>
            )}
            <div className="w-full flex justify-center">
                {callStatus !== CallStatus.ACTIVE ? (
                    <button className="relative btn-call" onClick={handleCall}>
                        <span className={cn("absolute animate-ping rounded-full opacity-75", callStatus !== CallStatus.CONNECTING && "hidden")} />
                        <span>
                            {callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED ? "Call" : "Loading..."}
                        </span>
                    </button>
                ) : (
                    <button className="btn-disconnect" onClick={handleDisconnect}>
                        <span>End</span>
                    </button>
                )}
            </div>
        </>
    );
}
