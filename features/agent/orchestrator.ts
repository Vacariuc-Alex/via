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
    AgentParams, InterviewDoc, InterviewDialogPayload, InterviewGenerationPayload,
    FeedbackReadyPayload, TranscriptMessageEmitter
} from "@/commons/types";

export function createInterviewController(
    username: string,
    userId: string
) {
    const eventEmitter = createEventEmitter();

    let speechRecognition: any;
    let stateMachine: any;
    let transcript: string = "";
    let isStateMachineStopped: boolean = false;
    let transcriptMessageTimeout: ReturnType<typeof setTimeout> | null = null;
    let hadPreviousAudioSpeechError: boolean = false;
    let countUnrecognizedSpeechRetries: number = 0;
    let countUndetectedAudioRetries: number = 0;
    let agentMode: AgentMode | null = null;
    let thisInterview: InterviewDoc | null = null;

    async function start({interview, mode}: AgentParams) {
        await load();

        thisInterview = thisInterview = interview ?? null;
        agentMode = mode satisfies AgentMode;
        speechRecognition = getSpeechRecognition();

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

        speechRecognition.onresult = (event: any) => {
            transcript = event.results[0][0].transcript;
        };

        speechRecognition.onend = async () => {
            if (isStateMachineStopped) return;

            if (!hadPreviousAudioSpeechError && transcriptMessageTimeout) {
                clearTimeout(transcriptMessageTimeout);
                transcriptMessageTimeout = null;
            }

            // CASE: speech was recognized
            if (transcript?.trim().length > 0) {
                const lastTranscript = transcript.trim();

                transcript = "";
                countUnrecognizedSpeechRetries = 0;
                countUndetectedAudioRetries = 0;

                eventEmitter.emit(InterviewEvent.MESSAGE, {
                    type: TranscriptMessage.TYPE,
                    transcriptType: TranscriptMessage.TRANSCRIPT_TYPE,
                    role: TranscriptMessage.ROLE_USER,
                    content: lastTranscript
                } satisfies TranscriptMessageEmitter);

                await handleNextState(lastTranscript);
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
            if (isStateMachineStopped) return;

            if (transcriptMessageTimeout) {
                clearTimeout(transcriptMessageTimeout);
                transcriptMessageTimeout = null;
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

        stopSpeaking();

        try {
            if (speechRecognition) {
                speechRecognition.onend = null;
                speechRecognition.onerror = null;
                speechRecognition.onresult = null;
                speechRecognition.abort();
            }
        } catch {}

        if (transcriptMessageTimeout) {
            clearTimeout(transcriptMessageTimeout);
            transcriptMessageTimeout = null;
        }

        eventEmitter.emit(InterviewEvent.CALL_END);
    }

    function emitTranscriptMessage(text: string) {
        if (transcriptMessageTimeout) {
            clearTimeout(transcriptMessageTimeout);
            transcriptMessageTimeout = null;
        }

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

    async function handleCurrentState(state: any, mode: AgentMode) {
        if (!state || isStateMachineStopped) return;

        if (state.type === QuestionType.SAY) {
            eventEmitter.emit(InterviewEvent.SPEECH_START);
            emitTranscriptMessage(state.text);
            await speak(state.text);
            eventEmitter.emit(InterviewEvent.SPEECH_END);
            await handleNextState();
        }

        if (state.type === QuestionType.ASK) {
            hadPreviousAudioSpeechError = false;
            countUnrecognizedSpeechRetries = 0;
            countUndetectedAudioRetries = 0;

            eventEmitter.emit(InterviewEvent.SPEECH_START);
            emitTranscriptMessage(state.text);
            await speak(state.text);
            eventEmitter.emit(InterviewEvent.SPEECH_END);
            speechRecognition.start();
        }

        if (state.type === QuestionType.END) {
            eventEmitter.emit(InterviewEvent.SPEECH_START);

            if(mode === AgentMode.GENERATE){
                emitTranscriptMessage(FINAL_GENERATE_WORKFLOW_MESSAGE);
                await speak(FINAL_GENERATE_WORKFLOW_MESSAGE);
                eventEmitter.emit(InterviewEvent.SPEECH_END);
                await submitGenerateAnswersToAi({
                    ...stateMachine.answers,
                    userId
                } satisfies InterviewGenerationPayload);
            } else if (mode === AgentMode.INTERVIEW) {
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
            }

            eventEmitter.emit(InterviewEvent.CALL_END);
        }
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
                speechRecognition.start();
            }
        }, AUDIO_ERROR_RETRY_DELAY);
    }
    
    async function handleAudioErrorEndUp() {
        if (isStateMachineStopped) return;
        isStateMachineStopped = true;
        eventEmitter.emit(InterviewEvent.SPEECH_START);
        emitTranscriptMessage(FINAL_ERROR_MESSAGE);
        await speak(FINAL_ERROR_MESSAGE);
        eventEmitter.emit(InterviewEvent.SPEECH_END);
        eventEmitter.emit(InterviewEvent.CALL_END);
    }

    return {
        start,
        stop,
        on: eventEmitter.on,
        off: eventEmitter.off,
    };
}
