
'use client';

import { signIn } from "next-auth/react"

export function LoginButtons() {
    return (
        <div className="flex flex-col gap-3">
            <button
                onClick={() => signIn("google")}
                className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
            >
                <span className="text-xl">🇬</span>
                <span>Entrar com Google</span>
            </button>

            <button
                onClick={() => signIn("github")}
                className="flex w-full items-center justify-center gap-3 rounded-md bg-[#24292F] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#24292F]/90 focus:outline-offset-0"
            >
                <span className="text-xl">🐙</span>
                <span>Entrar com GitHub</span>
            </button>
        </div>
    )
}
