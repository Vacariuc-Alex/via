import React from 'react'
import {getTranslations} from 'next-intl/server';
import Agent from "@/components/Agent/Agent";
import {getCurrentUser} from "@/features/service/auth";
import {AgentMode} from "@/commons/enums";

const Page = async () => {
    const t = await getTranslations('interview');
    const user = await getCurrentUser();
    const userId = user?.id ?? "";
    const username = user?.username ?? t('fellowUser');

    return (
        <>
            <h3>{t('generation')}</h3>
            <Agent username={username} userId={userId} mode={AgentMode.GENERATE} />
        </>
    )
}

export default Page;
