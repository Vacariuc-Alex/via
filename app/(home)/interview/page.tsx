import React from 'react'
import Agent from "@/components/Agent/Agent";
import {getCurrentUser} from "@/features/service/auth";
import {AgentMode} from "@/commons/enums";

const Page = async () => {
    const user = await getCurrentUser();
    const userId = user?.id ?? "";
    const username = user?.username ?? "Fellow User";

    return (
        <>
            <h3>Interview Generation</h3>
            <Agent username={username} userId={userId} mode={AgentMode.GENERATE} />
        </>
    )
}

export default Page;
