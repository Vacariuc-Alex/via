import React from 'react'
import Agent from "@/components/Agent/Agent";
import {getCurrentUser} from "@/integrations/auth/auth";

const Page = async () => {
    const user = await getCurrentUser();

    const userName = user?.name ?? "Fellow User";
    const userId = user?.id ?? "";

    return (
        <>
            <h3>Interview Generation</h3>
            <Agent userName={userName} userId={userId} type="generate" />
        </>
    )
}
export default Page;
