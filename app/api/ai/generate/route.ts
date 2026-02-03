import {generateText} from "ai";
import {groq} from "@ai-sdk/groq";
import {getRandomInterviewCover} from "@/commons/utils";
import {db} from "@/integrations/firebase/admin";
import {AI_MODEL, BUILD_PROMPT} from "@/commons/constants";
import {DbTables} from "@/commons/enums";
import {InterviewDbTable} from "@/commons/types";

export async function POST(request: Request) {
    const {type, role, level, techstack, amount, userid} = await request.json();

    try{
        const {text: questions} = await generateText({
            model: groq(AI_MODEL),
            prompt: BUILD_PROMPT({
                role,
                level,
                techstack,
                type,
                amount,
            }),
        });

        const interview = {
            role,
            type,
            level,
            techstack: techstack.split(",")
                .map((t: string) => t.trim())
                .filter(Boolean),
            questions: JSON.parse(questions),
            finalized: true,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString(),
            userId: userid,
        } as InterviewDbTable;

        await db.collection(DbTables.INTERVIEWS).add(interview);

        return Response.json({success: true}, {status: 200});
    } catch (error) {
        console.error(error);
        return Response.json({success: false, error}, {status: 500});
    }
}
