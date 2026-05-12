import {generateText} from "ai";
import {groq} from "@ai-sdk/groq";
import {getRandomInterviewCover} from "@/commons/utils";
import {db} from "@/integrations/firebase/admin";
import {AI_MODEL, INTERVIEW_GENERATION_PROMPT} from "@/commons/constants";
import {DbDoc} from "@/commons/enums";
import {InterviewDoc, InterviewGenerationPayload, InterviewGenerationPromptParams} from "@/commons/types";

export async function POST(request: Request) {
    const payload = await request.json() as Partial<InterviewGenerationPayload>;
    const {
        type = "",
        role = "",
        level = "",
        techstack = "",
        amount = "",
        userId = "",
        locale
    } = payload;

    try {
        const prompt = await INTERVIEW_GENERATION_PROMPT({
            role,
            level,
            techstack,
            type,
            amount
        } satisfies InterviewGenerationPromptParams, locale);

        const {text} = await generateText({
            model: groq(AI_MODEL),
            prompt
        });

        const parsed = JSON.parse(text) as { questions: string[]; technologies: string[] };
        const parsedQuestions = Array.isArray(parsed?.questions) ? parsed.questions : [];
        const parsedTechnologies = Array.isArray(parsed?.technologies) ? parsed.technologies : [];

        const interviewDoc = {
            role,
            type,
            level,
            techstack,
            technologies: parsedTechnologies,
            questions: parsedQuestions,
            finalized: true,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString(),
            userId
        } satisfies InterviewDoc;

        await db.collection(DbDoc.INTERVIEWS).add(interviewDoc);

        return Response.json({success: true}, {status: 200});
    } catch (error) {
        console.error(error);
        return Response.json({success: false, error: "Failed to generate the interview"}, {status: 500});
    }
}
