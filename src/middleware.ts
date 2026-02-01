
import NextAuth from "next-auth"
import authConfig from "@/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    // Middleware logic here
    const isLoggedIn = !!req.auth;
    const isOnDashboard = req.nextUrl.pathname.startsWith("/");

    // For now, we are entirely permissive.
    // Auth.js middleware is mainly kept here to keep the session alive via cookies processing.
    return;
})

export const config = {
    // Matcher excluding API routes and static files to avoid interfering with Auth flow
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
