/*import {VOICE_AGENT_PROPS} from '@/commons/constants';

let isPuterReady = false;
export async function load(): Promise<void> {
    if (isPuterReady) return;

    if (typeof window === 'undefined') return;

    return new Promise((resolve, reject) => {
        if ((window as any).puter) {
            isPuterReady = true;
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://js.puter.com/v2/';
        script.async = true;

        script.onload = () => {
            isPuterReady = true;
            resolve();
        };

        script.onerror = reject;

        document.body.appendChild(script);
    });
}

let currentAudio: HTMLAudioElement | null = null;
export async function speak(text: string): Promise<void> {
    if (!(window as any).puter?.ai?.txt2speech) {
        throw new Error("Puter not ready!");
    }

    const audio: HTMLAudioElement = await (window as any).puter.ai.txt2speech(
        text,
        VOICE_AGENT_PROPS
    );

    currentAudio = audio;
    return new Promise((resolve, reject) => {
        audio.play();

        audio.onended = () => {
            if (currentAudio === audio) {
                currentAudio = null;
            }
            resolve();
        };

        audio.onerror = () => {
            if (currentAudio === audio) {
                currentAudio = null;
            }
            reject();
        };
    });
}

export function stopSpeaking() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
}*/

let isReady = false;
let currentUtterance: SpeechSynthesisUtterance | null = null;

export async function load(): Promise<void> {
    if (isReady) return;

    if (typeof window === "undefined") return;

    if (!("speechSynthesis" in window)) {
        throw new Error("Speech synthesis not supported");
    }

    isReady = true;
}

export async function speak(text: string): Promise<void> {
    if (!isReady) {
        throw new Error("Speech system not initialized");
    }

    return new Promise((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(text);
        currentUtterance = utterance;

        utterance.onend = () => {
            if (currentUtterance === utterance) {
                currentUtterance = null;
            }
            resolve();
        };

        utterance.onerror = () => {
            if (currentUtterance === utterance) {
                currentUtterance = null;
            }
            reject();
        };

        window.speechSynthesis.speak(utterance);
    });
}

export function stopSpeaking(): void {
    if (typeof window === "undefined") return;

    window.speechSynthesis.cancel();
    currentUtterance = null;
}
