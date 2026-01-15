export function getSpeechRecognition() {
    if (typeof window === 'undefined') return null;

    const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
        throw new Error('SpeechRecognition API not supported');
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    return recognition;
}
