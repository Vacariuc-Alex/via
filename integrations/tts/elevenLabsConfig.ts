let isReady = false;
let currentAudio: HTMLAudioElement | null = null;
let currentAudioUrl: string | null = null;

export async function load(): Promise<void> {
    if (isReady) return;
    if (globalThis.window === undefined) return;
    isReady = true;
}

export async function speak(text: string): Promise<void> {
    if (!isReady) {
        throw new Error("Speech system not initialized");
    }

    stopSpeaking();

    const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({text}),
    });

    if (!response.ok) {
        throw new Error("Failed to generate TTS speech");
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    currentAudio = audio;
    currentAudioUrl = audioUrl;

    return new Promise((resolve, reject) => {
        const cleanup = () => {
            if (currentAudio === audio) {
                currentAudio = null;
            }

            if (currentAudioUrl === audioUrl) {
                URL.revokeObjectURL(audioUrl);
                currentAudioUrl = null;
            }
        };

        audio.onended = () => {
            cleanup();
            resolve();
        };

        audio.onerror = () => {
            cleanup();
            reject(new Error("Audio playback failed"));
        };

        audio.play().catch((error) => {
            cleanup();
            reject(error);
        });
    });
}

export function stopSpeaking(): void {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
        currentAudioUrl = null;
    }
}

