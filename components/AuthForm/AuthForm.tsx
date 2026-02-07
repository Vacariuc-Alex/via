"use client"

import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {Button} from "@/components/ui/button";
import {Form} from "@/components/ui/form";
import React from 'react';
import Image from "next/image";
import Link from "next/link";
import {toast} from "sonner";
import FormField from "@/components/AuthForm/FormField";
import {useRouter} from "next/navigation";
import {createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";
import {auth} from "@/integrations/firebase/client";
import {signIn, signUp} from "@/features/service/auth";
import {FormTypeParams} from "@/commons/types";
import {AuthStatus} from "@/commons/enums";

const authFormSchema = (type: AuthStatus) => {
    return z.object({
        name: (type === AuthStatus.SIGN_UP) ? z.string().min(3) : z.string().optional(),
        email: z.email(),
        password: z.string().min(3),
    });
}

const AuthForm = ({type}: FormTypeParams) => {
    const router = useRouter();
    const formSchema = authFormSchema(type);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: ""
        },
    });
    const isSignIn = type === AuthStatus.SIGN_IN;

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (isSignIn) {
                const {email, password} = values;
                const userCredentials = await signInWithEmailAndPassword(auth, email, password);
                const idToken = await userCredentials.user.getIdToken();
                if(!idToken) {
                    toast.error("Failed to sign in!");
                    return;
                }
                await signIn({email, idToken});
                toast.success("You have successfully logged in!");
                router.push("/");
            } else {
                const {name, email, password} = values;
                const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
                const result = await signUp({
                    userId: userCredentials.user.uid,
                    username: name!,
                    email,
                    password
                });
                if (!result?.success) {
                    toast.error(result?.message);
                    return;
                }
                toast.success("Account created successfully!");
                router.push("/sign-in");
            }
        } catch (error: any) {
            if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
                toast.error("Email or password is incorrect!");
            } else {
                toast.error("Unexpected error has occurred.");
            }
            console.error(error);
        }
    }

    return (
        <div className="auth-section lg:min-w-[566px]">
            <div className="flex flex-col gap-6 auth-card py-14 px-10">
                <div className="flex flex-row gap-2 justify-center">
                    <Image src="/logo.svg" alt="logo" height={32} width={38}/>
                    <h2 className="text-primary-100">Virtual Interview Assistant</h2>
                </div>
                <h3>Practice job interview with AI</h3>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 auth-form">
                        {!isSignIn && (<FormField control={form.control} name="name" label="Name" placeholder="Your name"/>)}
                        <FormField control={form.control} name="email" label="Email" placeholder="Your email address" type="email"/>
                        <FormField control={form.control} name="password" label="Password" placeholder="Your password" type="password"/>
                        <Button className="btn" type="submit">{isSignIn ? "Sign in" : "Create an account"}</Button>
                    </form>
                </Form>
                <p className="text-center">
                    {isSignIn ? "Create a new account? " : "Already have an account? "}
                    <Link href={isSignIn ? "/sign-up" : "/sign-in"} className="underline font-bold text-user-primary ml-l"> {isSignIn ? "Sign up" : "Sign in"}</Link>
                </p>
            </div>
        </div>
    );
}

export default AuthForm;
