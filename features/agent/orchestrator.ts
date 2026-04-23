import {generateInterviewWorkflow, ongoingInterviewWorkflow} from '@/features/agent/workflows';
import {submitGenerateAnswersToAi, submitInterviewAnswersToAi} from '@/integrations/gpt/client';
import {getSpeechRecognition} from "@/integrations/stt/speechRecognition";
import {load, speak, stopSpeaking} from '@/integrations/tts/puterConfig';
import {createEventEmitter} from './eventEmitter';
import {createStateMachine} from '@/features/agent/stateMachine';
import {
    FINAL_ERROR_MESSAGE,
    MAX_ERROR_RETRIES,
    AUDIO_ERROR_RETRY_DELAY,
    TRANSCRIPT_MESSAGE_DELAY,
    UNDETECTED_AUDIO_ERROR_MESSAGES,
    UNRECOGNIZED_SPEECH_ERROR_MESSAGES,
    FINAL_GENERATE_WORKFLOW_MESSAGE, FINAL_INTERVIEW_WORKFLOW_MESSAGE
} from '@/commons/constants';
import {AgentMode, InterviewEvent, QuestionType, TranscriptMessage} from "@/commons/enums";
import {
    AgentParams, AnswerInputMode, InterviewDoc, InterviewDialogPayload, InterviewGenerationPayload,
    AnswerInputReadyPayload, FeedbackReadyPayload, State, TranscriptMessageEmitter
} from "@/commons/types";

export function createInterviewController(
    username: string,
    userId: string
) {
    const eventEmitter = createEventEmitter();

    let speechRecognition: any = null;
    let stateMachine: any;
    let transcript: string = "";
    let isStateMachineStopped: boolean = false;
    let transcriptMessageTimeout: ReturnType<typeof setTimeout> | null = null;
    let hadPreviousAudioSpeechError: boolean = false;
    let countUnrecognizedSpeechRetries: number = 0;
    let countUndetectedAudioRetries: number = 0;
    let agentMode: AgentMode | null = null;
    let thisInterview: InterviewDoc | null = null;
    let isAwaitingUserResponse: boolean = false;
    let shouldIgnoreRecognitionCallbacks: boolean = false;
    let preferredAnswerInputMode: AnswerInputMode = "voice";
    let isReviewingCapturedAnswer: boolean = false;
    let isAnswerTurnActive: boolean = false;

    async function start({interview, mode}: AgentParams) {
        await load();

        thisInterview = thisInterview = interview ?? null;
        agentMode = mode satisfies AgentMode;
        preferredAnswerInputMode = "voice";
        isReviewingCapturedAnswer = false;
        isAnswerTurnActive = false;

        try {
            speechRecognition = getSpeechRecognition();
        } catch {
            speechRecognition = null;
            preferredAnswerInputMode = "write";
            eventEmitter.emit(InterviewEvent.VOICE_INPUT_UNAVAILABLE);
        }

        let workflow;
        if(mode === AgentMode.GENERATE){
            workflow = generateInterviewWorkflow(username);
            stateMachine = createStateMachine(workflow, mode);
        } else if (mode === AgentMode.INTERVIEW && interview?.questions?.length) {
            workflow = ongoingInterviewWorkflow(username, interview.questions);
            stateMachine = createStateMachine(workflow, mode);
        } else {
            stop();
            return;
        }

        if (speechRecognition) {
            speechRecognition.onstart = () => {
                if (isStateMachineStopped || shouldIgnoreRecognitionCallbacks) return;
                eventEmitter.emit(InterviewEvent.USER_LISTEN_START);
            };

            speechRecognition.onspeechstart = () => {
                if (isStateMachineStopped || shouldIgnoreRecognitionCallbacks) return;
                eventEmitter.emit(InterviewEvent.USER_LISTEN_START);
            };

            speechRecognition.onspeechend = () => {
                if (isStateMachineStopped || shouldIgnoreRecognitionCallbacks) return;
                eventEmitter.emit(InterviewEvent.USER_LISTEN_END);
            };

            speechRecognition.onresult = (event: any) => {
                if (shouldIgnoreRecognitionCallbacks) return;
                transcript = event.results[0][0].transcript;
            };

            speechRecognition.onend = async () => {
                if (isStateMachineStopped || shouldIgnoreRecognitionCallbacks) return;

                eventEmitter.emit(InterviewEvent.USER_LISTEN_END);

                if (!hadPreviousAudioSpeechError && transcriptMessageTimeout) {
                    clearTranscriptMessageTimeout();
                }

                // CASE: speech was recognized
                if (transcript?.trim().length > 0) {
                    const lastTranscript = transcript.trim();

                    transcript = "";
                    countUnrecognizedSpeechRetries = 0;
                    countUndetectedAudioRetries = 0;
                    openAnswerEditor({
                        prompt: stateMachine.current()?.text ?? "",
                        value: lastTranscript,
                        mode: "voice",
                        isReview: true,
                    });
                    return;
                }

                // CASE: speech was not recognized, but audio detected
                if (hadPreviousAudioSpeechError) {
                    hadPreviousAudioSpeechError = false;
                    return;
                }

                countUnrecognizedSpeechRetries++;
                if (countUnrecognizedSpeechRetries <= MAX_ERROR_RETRIES) {
                    const retryText = UNRECOGNIZED_SPEECH_ERROR_MESSAGES[countUnrecognizedSpeechRetries - 1];
                    const previousQuestionText = stateMachine.current()?.text ?? "";
                    await handleAudioErrorRetry(previousQuestionText, retryText);
                    return;
                }

                await handleAudioErrorEndUp();
            };

            speechRecognition.onerror = async () => {
                if (isStateMachineStopped || shouldIgnoreRecognitionCallbacks) return;

                eventEmitter.emit(InterviewEvent.USER_LISTEN_END);

                if (transcriptMessageTimeout) {
                    clearTranscriptMessageTimeout();
                }

                hadPreviousAudioSpeechError = true;
                countUndetectedAudioRetries++;

                if (countUndetectedAudioRetries <= MAX_ERROR_RETRIES) {
                    const retryText = UNDETECTED_AUDIO_ERROR_MESSAGES[countUndetectedAudioRetries - 1];
                    const previousQuestionText = stateMachine.current()?.text ?? "";
                    await handleAudioErrorRetry(previousQuestionText, retryText);
                    return;
                }

                await handleAudioErrorEndUp();
            };
        }

        queueMicrotask(() => {
            if (!isStateMachineStopped) eventEmitter.emit(InterviewEvent.CALL_START);
        });

        await handleCurrentState(stateMachine.current(), agentMode!);
    }

    function stop() {
        if (isStateMachineStopped) return;

        isStateMachineStopped = true;
        transcript = "";
        countUnrecognizedSpeechRetries = 0;
        countUndetectedAudioRetries = 0;
        agentMode = null;
        shouldIgnoreRecognitionCallbacks = true;
        isReviewingCapturedAnswer = false;
        isAnswerTurnActive = false;
        setAwaitingUserResponse();

        stopSpeaking();

        try {
            if (speechRecognition) {
                speechRecognition.onstart = null;
                speechRecognition.onspeechstart = null;
                speechRecognition.onspeechend = null;
                speechRecognition.onend = null;
                speechRecognition.onerror = null;
                speechRecognition.onresult = null;
                speechRecognition.abort();
            }
        } catch {}

        eventEmitter.emit(InterviewEvent.USER_LISTEN_END);

        clearTranscriptMessageTimeout();

        eventEmitter.emit(InterviewEvent.CALL_END);
    }

    function clearTranscriptMessageTimeout() {
        if (!transcriptMessageTimeout) return;
        clearTimeout(transcriptMessageTimeout);
        transcriptMessageTimeout = null;
    }

    function setAwaitingUserResponse(payload?: AnswerInputReadyPayload) {
        if (!payload) {
            if (!isAwaitingUserResponse) return;

            isAwaitingUserResponse = false;
            isReviewingCapturedAnswer = false;
            eventEmitter.emit(InterviewEvent.ANSWER_INPUT_IDLE);
            return;
        }

        isAwaitingUserResponse = true;
        isAnswerTurnActive = true;
        isReviewingCapturedAnswer = payload.isReview;
        eventEmitter.emit(InterviewEvent.ANSWER_INPUT_READY, payload);
    }

    function openAnswerEditor(payload: AnswerInputReadyPayload) {
        setAwaitingUserResponse(payload);
    }

    function startListeningForAnswer() {
        if (!speechRecognition) {
            preferredAnswerInputMode = "write";
            eventEmitter.emit(InterviewEvent.VOICE_INPUT_UNAVAILABLE);
            openAnswerEditor({
                prompt: stateMachine.current()?.text ?? "",
                value: "",
                mode: "write",
                isReview: false,
            });
            return;
        }

        isAnswerTurnActive = true;
        isReviewingCapturedAnswer = false;
        shouldIgnoreRecognitionCallbacks = false;
        speechRecognition.start();
    }

    function emitTranscriptMessage(text: string) {
        clearTranscriptMessageTimeout();

        transcriptMessageTimeout = setTimeout(() => {
            eventEmitter.emit(InterviewEvent.MESSAGE, {
                type: TranscriptMessage.TYPE,
                transcriptType: TranscriptMessage.TRANSCRIPT_TYPE,
                role: TranscriptMessage.ROLE_ASSISTANT,
                content: text
            } satisfies TranscriptMessageEmitter);

            transcriptMessageTimeout = null;
        }, TRANSCRIPT_MESSAGE_DELAY);
    }

    async function handleNextState(transcript?: string) {
        const nextState = stateMachine.next(transcript);
        if(!agentMode) {
            stop();
            return;
        }
        await handleCurrentState(nextState, agentMode);
    }

    async function handleCurrentState(state: State | undefined, mode: AgentMode) {
        if (!state || isStateMachineStopped) return;

        if (state.type === QuestionType.SAY) {
            await handleSayState(state.text);
            return;
        }

        if (state.type === QuestionType.ASK) {
            await handleAskState(state.text);
            return;
        }

        if (state.type === QuestionType.END) {
            await handleEndState(mode);
        }
    }

    async function handleSayState(text: string) {
        isAnswerTurnActive = false;
        setAwaitingUserResponse();
        eventEmitter.emit(InterviewEvent.SPEECH_START);
        emitTranscriptMessage(text);
        await speak(text);
        eventEmitter.emit(InterviewEvent.SPEECH_END);
        await handleNextState();
    }

    async function handleAskState(text: string) {
        transcript = "";
        isAnswerTurnActive = false;
        setAwaitingUserResponse();
        hadPreviousAudioSpeechError = false;
        countUnrecognizedSpeechRetries = 0;
        countUndetectedAudioRetries = 0;

        eventEmitter.emit(InterviewEvent.SPEECH_START);
        emitTranscriptMessage(text);
        await speak(text);
        eventEmitter.emit(InterviewEvent.SPEECH_END);

        if (preferredAnswerInputMode === "write") {
            openAnswerEditor({
                prompt: text,
                value: "",
                mode: "write",
                isReview: false,
            });
            return;
        }

        startListeningForAnswer();
    }

    async function handleEndState(mode: AgentMode) {
        isAnswerTurnActive = false;
        setAwaitingUserResponse();
        eventEmitter.emit(InterviewEvent.SPEECH_START);

        if(mode === AgentMode.GENERATE){
            emitTranscriptMessage(FINAL_GENERATE_WORKFLOW_MESSAGE);
            await speak(FINAL_GENERATE_WORKFLOW_MESSAGE);
            eventEmitter.emit(InterviewEvent.SPEECH_END);
            await submitGenerateAnswersToAi({
                ...stateMachine.answers,
                userId
            } satisfies InterviewGenerationPayload);
            eventEmitter.emit(InterviewEvent.CALL_END);
            return;
        }

        emitTranscriptMessage(FINAL_INTERVIEW_WORKFLOW_MESSAGE);
        await speak(FINAL_INTERVIEW_WORKFLOW_MESSAGE);
        eventEmitter.emit(InterviewEvent.SPEECH_END);

        if(!thisInterview?.id) {
            stop();
            return;
        }

        const aiAnswersResponse = await submitInterviewAnswersToAi({
            userId,
            interviewId: thisInterview.id ?? "",
            qa: stateMachine.interviewQaPairs,
            role: thisInterview.role,
            level: thisInterview.level,
            type: thisInterview.type,
            technologies: thisInterview.technologies,
        } satisfies InterviewDialogPayload);

        if (aiAnswersResponse?.success && aiAnswersResponse?.feedbackId) {
            eventEmitter.emit(InterviewEvent.FEEDBACK_READY, {
                interviewId: thisInterview.id,
                feedbackId: aiAnswersResponse.feedbackId,
            } satisfies FeedbackReadyPayload);
        }

        eventEmitter.emit(InterviewEvent.CALL_END);
    }

    async function handleAudioErrorRetry(previousQuestionText: string, retryText: string) {
        eventEmitter.emit(InterviewEvent.SPEECH_START);
        emitTranscriptMessage(retryText);
        await speak(retryText);
        if (isStateMachineStopped || !speechRecognition) return;
        eventEmitter.emit(InterviewEvent.SPEECH_END);

        setTimeout(async () => {
            if (!isStateMachineStopped && speechRecognition) {
                eventEmitter.emit(InterviewEvent.SPEECH_START);
                emitTranscriptMessage(previousQuestionText);
                await speak(previousQuestionText);
                eventEmitter.emit(InterviewEvent.SPEECH_END);

                if (preferredAnswerInputMode === "write") {
                    openAnswerEditor({
                        prompt: previousQuestionText,
                        value: "",
                        mode: "write",
                        isReview: false,
                    });
                    return;
                }

                startListeningForAnswer();
            }
        }, AUDIO_ERROR_RETRY_DELAY);
    }
    
    async function handleAudioErrorEndUp() {
        if (isStateMachineStopped) return;
        isStateMachineStopped = true;
        isAnswerTurnActive = false;
        setAwaitingUserResponse();
        eventEmitter.emit(InterviewEvent.SPEECH_START);
        emitTranscriptMessage(FINAL_ERROR_MESSAGE);
        await speak(FINAL_ERROR_MESSAGE);
        eventEmitter.emit(InterviewEvent.SPEECH_END);
        eventEmitter.emit(InterviewEvent.CALL_END);
    }

    async function submitText(text: string) {
        const normalizedText = text.trim();
        if (!normalizedText || isStateMachineStopped || !isAwaitingUserResponse) {
            return false;
        }

        transcript = "";
        hadPreviousAudioSpeechError = false;
        countUnrecognizedSpeechRetries = 0;
        countUndetectedAudioRetries = 0;
        clearTranscriptMessageTimeout();
        isAnswerTurnActive = false;
        isReviewingCapturedAnswer = false;
        setAwaitingUserResponse();

        if (speechRecognition) {
            shouldIgnoreRecognitionCallbacks = true;
            try {
                speechRecognition.abort();
            } catch {}
        }

        eventEmitter.emit(InterviewEvent.USER_LISTEN_END);
        eventEmitter.emit(InterviewEvent.MESSAGE, {
            type: TranscriptMessage.TYPE,
            transcriptType: TranscriptMessage.TRANSCRIPT_TYPE,
            role: TranscriptMessage.ROLE_USER,
            content: normalizedText,
        } satisfies TranscriptMessageEmitter);

        await handleNextState(normalizedText);
        return true;
    }

    function setAnswerMode(mode: AnswerInputMode) {
        preferredAnswerInputMode = mode;

        if (isStateMachineStopped || !isAnswerTurnActive) return;

        const currentState = stateMachine.current() as State | undefined;
        if (currentState?.type !== QuestionType.ASK || isReviewingCapturedAnswer) return;

        if (mode === "write") {
            transcript = "";

            if (speechRecognition) {
                shouldIgnoreRecognitionCallbacks = true;

                try {
                    speechRecognition.abort();
                } catch {}
            }

            eventEmitter.emit(InterviewEvent.USER_LISTEN_END);
            openAnswerEditor({
                prompt: currentState.text,
                value: "",
                mode,
                isReview: false,
            });
            return;
        }

        if (!speechRecognition) {
            preferredAnswerInputMode = "write";
            eventEmitter.emit(InterviewEvent.VOICE_INPUT_UNAVAILABLE);
            return;
        }

        transcript = "";
        setAwaitingUserResponse();
        startListeningForAnswer();
    }

    return {
        start,
        stop,
        submitText,
        setAnswerMode,
        on: eventEmitter.on,
        off: eventEmitter.off,
    };
}
