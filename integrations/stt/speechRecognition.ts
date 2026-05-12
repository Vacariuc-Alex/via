import {RecognitionResultEvent} from "@/commons/types";

class ElevenLabsSpeechRecognition {
    lang = "auto";

    onstart: (() => void) | null = null;
    onspeechstart: (() => void) | null = null;
    onspeechend: (() => void) | null = null;
    onresult: ((event: RecognitionResultEvent) => void) | null = null;
    onend: (() => void) | null = null;
    onerror: (() => void) | null = null;

    private mediaRecorder: MediaRecorder | null = null;
    private mediaStream: MediaStream | null = null;
    private audioChunks: BlobPart[] = [];
    private audioContext: AudioContext | null = null;
    private analyserNode: AnalyserNode | null = null;
    private silenceMonitorRaf: number | null = null;
    private hasDetectedSpeech = false;
    private silenceStartAt: number | null = null;

    async start() {
        if (globalThis.window === undefined) return;
        if (this.mediaRecorder?.state === "recording") return;

        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
            this.audioChunks = [];
            this.hasDetectedSpeech = false;
            this.silenceStartAt = null;

            let preferredMimeType = "";
            if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
                preferredMimeType = "audio/webm;codecs=opus";
            } else if (MediaRecorder.isTypeSupported("audio/webm")) {
                preferredMimeType = "audio/webm";
            }

            this.mediaRecorder = preferredMimeType
                ? new MediaRecorder(this.mediaStream, {mimeType: preferredMimeType})
                : new MediaRecorder(this.mediaStream);

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data?.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onerror = () => {
                this.cleanup();
                this.onerror?.();
                this.onend?.();
            };

            this.mediaRecorder.onstop = async () => {
                this.onspeechend?.();
                try {
                    const blob = new Blob(this.audioChunks, {
                        type: this.mediaRecorder?.mimeType || "audio/webm",
                    });
                    if (blob.size > 0) {
                        const transcript = await this.transcribe(blob);
                        if (transcript) {
                            this.onresult?.({
                                results: [[{transcript}]],
                            });
                        }
                    }
                } catch {
                    this.onerror?.();
                } finally {
                    this.cleanup();
                    this.onend?.();
                }
            };

            this.mediaRecorder.start();
            this.onstart?.();
            this.startSilenceMonitoring();
        } catch {
            this.cleanup();
            this.onerror?.();
            this.onend?.();
        }
    }

    // Called by the orchestrator via duck-typed recognition object.
    abort() {
        this.stopRecorder();
    }

    private stopRecorder() {
        if (!this.mediaRecorder || this.mediaRecorder.state === "inactive") {
            this.cleanup();
            this.onend?.();
            return;
        }
        this.mediaRecorder.stop();
    }

    private cleanup() {
        if (this.silenceMonitorRaf) {
            cancelAnimationFrame(this.silenceMonitorRaf);
            this.silenceMonitorRaf = null;
        }

        if (this.audioContext) {
            void this.audioContext.close();
            this.audioContext = null;
        }

        this.analyserNode = null;
        this.hasDetectedSpeech = false;
        this.silenceStartAt = null;

        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach((track) => track.stop());
            this.mediaStream = null;
        }

        this.mediaRecorder = null;
        this.audioChunks = [];
    }

    private startSilenceMonitoring() {
        if (!this.mediaStream) return;

        this.audioContext = new AudioContext();
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 2048;
        source.connect(this.analyserNode);

        const pcm = new Float32Array(this.analyserNode.fftSize);
        const speechThreshold = 0.015;
        const silenceDurationMs = 1200;

        const tick = () => {
            if (!this.analyserNode || !this.mediaRecorder || this.mediaRecorder.state !== "recording") {
                return;
            }

            this.analyserNode.getFloatTimeDomainData(pcm);

            let sumSquares = 0;
            for (let i = 0; i < pcm.length; i++) {
                sumSquares += pcm[i] * pcm[i];
            }

            const rms = Math.sqrt(sumSquares / pcm.length);
            const isSpeechFrame = rms > speechThreshold;
            const now = performance.now();

            if (isSpeechFrame) {
                if (!this.hasDetectedSpeech) {
                    this.hasDetectedSpeech = true;
                    this.onspeechstart?.();
                }
                this.silenceStartAt = null;
            } else if (this.hasDetectedSpeech) {
                if (this.silenceStartAt === null) {
                    this.silenceStartAt = now;
                }

                if (now - this.silenceStartAt >= silenceDurationMs) {
                    this.stopRecorder();
                    return;
                }
            }
            this.silenceMonitorRaf = requestAnimationFrame(tick);
        };
        this.silenceMonitorRaf = requestAnimationFrame(tick);
    }

    private async transcribe(audio: Blob): Promise<string> {
        const payload = new FormData();
        payload.append("audio", audio, "speech.webm");
        if (this.lang && this.lang !== "auto") {
            payload.append("language", this.lang);
        }

        const response = await fetch("/api/stt", {
            method: "POST",
            body: payload,
        });

        if (!response.ok) {
            throw new Error("Failed to transcribe audio");
        }

        const data = (await response.json()) as { text?: string };
        return data.text?.trim() ?? "";
    }
}

export function getSpeechRecognition() {
    if (globalThis.window === undefined) return null;

    if (!navigator?.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        throw new Error("Microphone recording is not supported in this browser");
    }

    return new ElevenLabsSpeechRecognition();
}
