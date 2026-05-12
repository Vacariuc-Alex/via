import {ElevenLabsTranscribeResponse} from "@/commons/types";

async function transcribeWithElevenLabs(apiKey: string, audio: Blob, languageCode?: string): Promise<ElevenLabsTranscribeResponse> {
    const payload = new FormData();
    payload.append("file", audio, "speech.webm");
    payload.append("model_id", "scribe_v1");

    if (languageCode) {
        payload.append("language_code", languageCode);
    }

    const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
        method: "POST",
        headers: {
            "xi-api-key": apiKey,
        },
        body: payload,
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`ElevenLabs STT error ${response.status}: ${errorText}`);
    }

    return response.json() as Promise<ElevenLabsTranscribeResponse>;
}

export async function POST(request: Request) {
    try {
        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
            return Response.json({success: false, error: "ELEVENLABS_API_KEY is not configured"}, {status: 500});
        }

        const incoming = await request.formData();
        const audio = incoming.get("audio");
        const languageValue = incoming.get("language");
        const language = typeof languageValue === "string" && languageValue.trim()
            ? languageValue
            : "";

        if (!(audio instanceof Blob) || audio.size === 0) {
            return Response.json({success: false, error: "Audio file is required"}, {status: 400});
        }

        const data = await transcribeWithElevenLabs(apiKey, audio, language || undefined);
        const text = data.text?.trim() ?? "";

        return Response.json({success: true, text}, {status: 200});
    } catch (error) {
        console.error("[STT] Unexpected error:", error);
        return Response.json({success: false, error: "Failed to transcribe audio"}, {status: 500});
    }
}

