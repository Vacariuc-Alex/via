"use server";

import {auth, db} from "@/integrations/firebase/admin";
import {cookies} from "next/dist/server/request/cookies";
import {DbTables} from "@/commons/enums";
import {SESSION_COOKIE_AGE, SESSION_COOKIE_EXP, SESSION_COOKIE_NAME} from "@/commons/constants";
import {SignInParams, SignUpParams, User, UserDbTable} from "@/commons/types";

export async function signUp(params: SignUpParams) {
    const { uid, name, email } = params;

    try {
        const userRecord = await db.collection(DbTables.USERS)
            .doc(uid)
            .get();

        if(userRecord.exists){
            return {
                success: false,
                message: "User already exists! Please sign in instead!",
            }
        }

        await db.collection(DbTables.USERS)
            .doc(uid)
            .set({name, email} as UserDbTable);

        return {
            success: true,
            message: "User created successfully!"
        }

    } catch (e: any) {
        console.error("Error creating a user", e);

        if(e.code === "auth/email-already-exists") {
            return {
                success: false,
                message: "This email is already in use!",
            }
        }

        return {
            success: false,
            message: "Failed to create an account!",
        }
    }
}

export async function signIn(params: SignInParams) {
    const { email, idToken } = params;

    try {
        const userRecord = await auth.getUserByEmail(email);
        if(!userRecord) {
            return {
                success: false,
                message: "User does not exist! Please sign up first!"
            }
        }
        await setSessionCookie(idToken);
    } catch (e) {
        console.log(e);
        return {
            success: false,
            message: "Failed to sign in!",
        }
    }
}

export async function setSessionCookie(idToken: string) {
    const cookieStore = await cookies();
    const sessionCookies = await auth.createSessionCookie(idToken, {expiresIn: SESSION_COOKIE_EXP});

    cookieStore.set(SESSION_COOKIE_NAME, sessionCookies, {
        httpOnly: true,
        maxAge: SESSION_COOKIE_AGE,
        secure: process.env.NODE_ENV === "production",
        path: '/',
        sameSite: "lax"
    });
}

export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
        return null;
    }

    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        const userRecord = await db.collection(DbTables.USERS)
            .doc(decodedClaims.uid)
            .get();

        if (!userRecord.exists) {
            return null;
        }

        return {
            ... userRecord.data(),
            id: userRecord.id
        } as User;
    } catch (e) {
        console.log(e);
        return null;
    }
}

export async function isAuthenticated() {
    const user =  await getCurrentUser();
    return !!user;
}
