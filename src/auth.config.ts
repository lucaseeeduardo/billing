
import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"

export default {
    providers: [
        Google,
        GitHub
    ],
    pages: {
        signIn: '/login', // Optional: Custom login page if needed later
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            return session;
        }
    }
} satisfies NextAuthConfig
