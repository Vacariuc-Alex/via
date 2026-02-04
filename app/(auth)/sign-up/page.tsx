import React from 'react'
import AuthForm from "@/components/AuthForm/AuthForm";
import {AuthStatus} from "@/commons/enums";

const Page = () => {
    return <AuthForm type={AuthStatus.SIGN_UP}/>
}

export default Page;
