import {InterviewDialogPayload, InterviewGenerationPayload, AiAnswersResponse} from "@/commons/types";

export async function submitGenerateAnswersToAi(answers: InterviewGenerationPayload): Promise<AiAnswersResponse> {
    const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(answers)
    });

    if (!res.ok) {
        throw new Error('Failed to submit answers');
    }

    return res.json();
}

export async function submitInterviewAnswersToAi(answers: InterviewDialogPayload): Promise<AiAnswersResponse> {
    const res = await fetch('/api/ai/interview', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(answers)
    });

    if (!res.ok) {
        throw new Error('Failed to submit answers');
    }

    return res.json();
}
