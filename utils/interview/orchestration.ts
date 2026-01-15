import {workflow} from '@/utils/interview/workflow';
import {submitAnswersToAi} from '@/utils/interview/aiClient';
import {getSpeechRecognition} from "@/utils/stt/speechRecognition";
import {load, speak, stopSpeaking} from '@/utils/tts/puterConfig';
import {createEventEmitter} from './eventEmitter';
import {createStateMachine} from '@/utils/interview/stateMachine';
import {
    FINAL_ERROR_MESSAGE,
    MAX_ERROR_RETRIES,
    AUDIO_ERROR_RETRY_DELAY,
    TRANSCRIPT_MESSAGE_DELAY,
    UNDETECTED_AUDIO_ERROR_MESSAGES,
    UNRECOGNIZED_SPEECH_ERROR_MESSAGES,
    InterviewEvent,
    QuestionType,
    FINAL_WORKFLOW_MESSAGE
} from '@/utils/constants';

export function createInterviewController(
    username: string,
    userid: string
) {
    const eventEmitter = createEventEmitter();

    let speechRecognition: any;
    let stateMachine: any;
    let transcript = "";
    let isStateMachineStopped = false;
    let transcriptMessageTimeout: ReturnType<typeof setTimeout> | null = null;
    let hadPreviousAudioSpeechError = false;
    let countUnrecognizedSpeechRetries = 0;
    let countUndetectedAudioRetries = 0;

    async function start() {
        await load();

        speechRecognition = getSpeechRecognition();
        stateMachine = createStateMachine(workflow(username));

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
            if (transcript && transcript.trim().length > 0) {
                const lastTranscript = transcript.trim();

                transcript = "";
                countUnrecognizedSpeechRetries = 0;
                countUndetectedAudioRetries = 0;

                eventEmitter.emit(InterviewEvent.MESSAGE, {
                    type: "transcript",
                    transcriptType: "final",
                    role: "user",
                    content: lastTranscript,
                });

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

        await handleCurrentState(stateMachine.current());
    }

    function stop() {
        if (isStateMachineStopped) return;

        isStateMachineStopped = true;
        transcript = "";
        countUnrecognizedSpeechRetries = 0;
        countUndetectedAudioRetries = 0;

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
                type: "transcript",
                transcriptType: "final",
                role: "assistant",
                content: text,
            });

            transcriptMessageTimeout = null;
        }, TRANSCRIPT_MESSAGE_DELAY);
    }

    async function handleNextState(transcript?: string) {
        const nextState = stateMachine.next(transcript);
        await handleCurrentState(nextState);
    }

    async function handleCurrentState(state: any) {
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
            emitTranscriptMessage(FINAL_WORKFLOW_MESSAGE);
            await speak(FINAL_WORKFLOW_MESSAGE);
            eventEmitter.emit(InterviewEvent.SPEECH_END);
            await submitAnswersToAi({
                ...stateMachine.answers,
                userid
            });
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
