import {PUTER_CONFIG} from '@/utils/constants';

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
        PUTER_CONFIG
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
}
