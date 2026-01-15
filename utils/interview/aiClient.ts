export async function submitAnswersToAi(answers: Record<string, string>) {
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
