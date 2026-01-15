"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createInterviewController } from '@/utils/interview/orchestration';
import Image from 'next/image';
import { cn } from '@/utils/utils';
import { InterviewEvent } from '@/utils/constants';

enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
}

interface SavedMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

interface AgentProps {
    userName: string;
    userId: string;
    type: string;
}

export default function Agent({ userName, userId }: AgentProps) {
    const router = useRouter();
    const controllerRef = useRef<ReturnType<typeof createInterviewController> | null>(null);

    const [callStatus, setCallStatus] = useState(CallStatus.INACTIVE);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [message, setMessage] = useState<SavedMessage | null>(null);

    useEffect(() => {
        if (callStatus === CallStatus.FINISHED) {
            router.push('/');
        }
    }, [callStatus]);

    function handleCall() {
        setCallStatus(CallStatus.CONNECTING);

        const controller = createInterviewController(userName, userId);
        controllerRef.current = controller;

        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
        const onCallEnd = () => setCallStatus(CallStatus.FINISHED);
        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);
        const onMessage = (message: any) => {
            if (message.type !== "transcript" || message.transcriptType !== "final") return;
            setMessage({
                role: message.role,
                content: message.content,
            });
        };

        controller.on(InterviewEvent.CALL_START, onCallStart);
        controller.on(InterviewEvent.CALL_END, onCallEnd);
        controller.on(InterviewEvent.SPEECH_START, onSpeechStart);
        controller.on(InterviewEvent.SPEECH_END, onSpeechEnd);
        controller.on(InterviewEvent.MESSAGE, onMessage);
        controller.start();
    }

    function handleDisconnect() {
        controllerRef.current?.stop();
        controllerRef.current = null;
        setCallStatus(CallStatus.FINISHED);
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
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>
            {message && (
                <div className="transcript-border">
                    <div className="transcript">
                        <p key={message.content} className={cn("transition-opacity duration-500 opacity-0", "animate-fadeIn opacity-100")}>
                            {message.content}
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
