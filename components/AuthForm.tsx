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
import FormField from "@/components/FormField";
import {useRouter} from "next/navigation";

const authFormSchema = (type: FormType) => {
    return z.object({
        name: (type === "sign-up") ? z.string().min(3) : z.string().optional(),
        email: z.email(),
        password: z.string().min(3),
    });
}

const AuthForm = ({type}: { type: FormType }) => {
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

    function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (type === "sign-in") {
                toast.success("You have successfully logged in!");
                router.push("/");
            } else {
                toast.success("Account created successfully!");
                router.push("/sign-in");
            }
        } catch (error) {
            console.error(error);
            toast(`Unexpected error has occured: ${error}`);
        }
    }

    const isSignIn = type === "sign-in";
    return (
        <div className="card-border lg:min-w-[566px]">
            <div className="flex flex-col gap-6 card py-14 px-10">
                <div className="flex flex-row gap-2 justify-center">
                    <Image src="/logo.svg" alt="logo" height={32} width={38}/>
                    <h2 className="text-primary-100">Virtual Interview Assistant</h2>
                </div>
                <h3>Practice job interview with AI</h3>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
                        {!isSignIn && (<FormField control={form.control} name="name" label="Name" placeholder="Your name"/>)}
                        <FormField control={form.control} name="email" label="Email" placeholder="Your email address" type="email"/>
                        <FormField control={form.control} name="password" label="Password" placeholder="Your password" type="password"/>
                        <Button className="btn" type="submit">{isSignIn ? "Sign in" : "Create an account"}</Button>
                    </form>
                </Form>
                <p className="text-center">
                    {isSignIn ? "Create a new account?" : "Already have an account?"}
                    <Link href={isSignIn ? "/sign-up" : "/sign-in"} className="font-bold text-user-primary ml-l"> {isSignIn ? "Sign up" : "Sign in"}</Link>
                </p>
            </div>
        </div>
    );
}
export default AuthForm
