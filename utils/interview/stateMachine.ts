import {State} from '@/utils/interview/workflow';
import {QuestionType} from "@/utils/constants";

export function createStateMachine(workflow: State[]) {
    let index = 0;
    const answers: Record<string, string> = {};

    function current() {
        return workflow[index];
    }

    function next(text?: string) {
        const state = workflow[index];
        if (state?.type === QuestionType.ASK && text) {
            answers[state.id] = text;
        }
        index++;
        return current();
    }

    return {
        current,
        next,
        answers
    };
}
