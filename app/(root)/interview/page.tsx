import React from 'react'
import Agent from "@/components/Agent";
import {getCurrentUser} from "@/utils/auth/auth";

const Page = async () => {
    const user = await getCurrentUser();
    return (
        <>
            <h3>Interview Generation</h3>
            <Agent userName={user?.name} userId={user?.id} type="generate" />
        </>
    )
}
export default Page;
