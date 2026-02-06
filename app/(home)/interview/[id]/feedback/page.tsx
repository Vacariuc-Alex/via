import React from 'react'
import {RouteParams} from "@/commons/types";
import {getFeedbackById} from "@/features/service/interview";
const Page = async ({searchParams}: RouteParams) => {
    const resolvedSearchParams = await searchParams;
    const feedbackId = String(resolvedSearchParams?.feedbackId);
    const feedback = await getFeedbackById(feedbackId);
    console.log(feedback);

    return (
        <div>Page</div>
    );
}

export default Page;
