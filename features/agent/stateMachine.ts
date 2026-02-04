import {AgentMode, QuestionType} from "@/commons/enums";
import {InterviewQaPair, State} from "@/commons/types";

export function createStateMachine(workflow: State[], mode: AgentMode) {
    let index = 0;
    const answers: Record<string, string> = {};
    const interviewQaPairs: InterviewQaPair[] = [];

    function current() {
        return workflow[index];
    }

    function next(transcribedMessage?: string) {
        const state = workflow[index];
        if (state?.type === QuestionType.ASK && transcribedMessage) {
            // Maps the user's answers to JSON when AgentMode is GENERATE
            if (mode === AgentMode.GENERATE && state.id) {
                answers[state.id] = transcribedMessage;
            }

            // Maps the user's dialog to JSON when AgentMode is INTERVIEW
            if (mode === AgentMode.INTERVIEW) {
                interviewQaPairs.push({
                    q: state.text,
                    a: transcribedMessage,
                } satisfies InterviewQaPair);
            }
        }
        index++;
        return current();
    }

    return {
        current,
        next,
        answers,
        interviewQaPairs,
    };
}
