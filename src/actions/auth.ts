
'use server'

import { signIn } from "@/auth"

export async function loginWithGoogle() {
    try {
        console.log("Tentando login com Google...");
        await signIn("google");
    } catch (error) {
        // NextRedirect ("NEXT_REDIRECT") is thrown by signIn to redirect, we must rethrow it
        if ((error as Error).message === "NEXT_REDIRECT") {
            throw error;
        }
        console.error("Erro no login Google:", error);
        throw error;
    }
}

export async function loginWithGithub() {
    try {
        console.log("Tentando login com Github...");
        await signIn("github");
    } catch (error) {
        if ((error as Error).message === "NEXT_REDIRECT") {
            throw error;
        }
        console.error("Erro no login Github:", error);
        throw error;
    }
}
