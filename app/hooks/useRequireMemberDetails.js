"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

const LOGIN_PATH = "/Components/Authentication/Login";

const readUserFromStorage = () => {
    try {
        const raw = localStorage.getItem("user");
        if (!raw) return { membCode: 0, address: "", userid: "", DirectLogin: false };
        const u = JSON.parse(raw);
        return {
            membCode: Number(u?.MEMB_CODE ?? 0) || 0,
            address: u?.BTC_ADD || "",
            userid: u?.USERNAME || "",
            DirectLogin: u?.DirectLogin || false,
        };
    } catch {
        return { membCode: 0, address: "", userid: "", DirectLogin: false };
    }
};

export const useRequireMemberDetails = () => {
    const router = useRouter();
    const pathname = usePathname();
    const redirectingRef = useRef(false);

    const [user, setUser] = useState(() => readUserFromStorage());
    const { membCode, address, userid, DirectLogin } = user;

    // Force-refresh from localStorage (call this right after login)
    const refresh = useCallback(() => {
        const next = readUserFromStorage();
        setUser(next);
        return next;
    }, []);

    const logoutMember = useCallback(() => {
        localStorage.removeItem("user");
        setUser({ membCode: 0, address: "", userid: "", DirectLogin: false });
        router.replace(LOGIN_PATH); // redirect to login
    }, [router]);

    // Keep in sync with changes from other tabs, window focus, and visibility
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === "user") refresh();
        };
        const onFocus = () => refresh();
        const onVisibility = () => {
            if (!document.hidden) refresh();
        };

        window.addEventListener("storage", onStorage);
        window.addEventListener("focus", onFocus);
        document.addEventListener("visibilitychange", onVisibility);
        return () => {
            window.removeEventListener("storage", onStorage);
            window.removeEventListener("focus", onFocus);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [refresh]);

    // Allow unauthenticated access to Login & SignUp only
    useEffect(() => {
        const path = (pathname || "").toLowerCase();
        const isOpen = /\/components\/authentication\/(login|signup|Login12314)(\/|$)/i.test(path);

        if ((membCode ?? 0) === 0 && !isOpen && !redirectingRef.current) {
            redirectingRef.current = true;
            router.replace(LOGIN_PATH); // Next auto-handles basePath
        }
    }, [membCode, pathname, router]);

    const ready = (membCode ?? 0) !== 0;
    return { ready, membCode, address, userid, DirectLogin, refresh, setUser, logoutMember };
};
