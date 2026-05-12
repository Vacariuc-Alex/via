import {VOICE_AGENT_PROPS} from "@/commons/constants";

type ElevenLabsError = {
    detail?: {
        message?: string;
    };
};

export async function POST(request: Request) {
    try {
        const {text} = (await request.json()) as { text?: string };
        if (!text?.trim()) {
            return Response.json({success: false, error: "Text is required"}, {status: 400});
        }

        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
            return Response.json({success: false, error: "ELEVENLABS_API_KEY is not configured"}, {status: 500});
        }

        const elevenLabsResponse = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_AGENT_PROPS.voice}`, {
                method: "POST",
                headers: {
                    Accept: "audio/mpeg",
                    "Content-Type": "application/json",
                    "xi-api-key": apiKey,
                },
                body: JSON.stringify({
                    text,
                    model_id: VOICE_AGENT_PROPS.model,
                }),
            }
        );

        if (!elevenLabsResponse.ok) {
            let errorMessage = "Failed to generate speech";
            try {
                const error = (await elevenLabsResponse.json()) as ElevenLabsError;
                errorMessage = error?.detail?.message ?? errorMessage;
            } catch {
            }

            console.error("[TTS] ElevenLabs error:", elevenLabsResponse.status, errorMessage);
            return Response.json(
                {success: false, error: errorMessage},
                {status: elevenLabsResponse.status}
            );
        }

        const audioBuffer = await elevenLabsResponse.arrayBuffer();
        if (audioBuffer.byteLength === 0) {
            return Response.json({success: false, error: "Empty audio from ElevenLabs"}, {status: 502});
        }

        return new Response(audioBuffer, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Content-Length": audioBuffer.byteLength.toString(),
                "Cache-Control": "no-store",
                "Accept-Ranges": "bytes",
            },
            status: 200,
        });
    } catch (err) {
        console.error("[TTS] Unexpected error:", err);
        return Response.json({success: false, error: "Internal server error"}, {status: 500});
    }
}
