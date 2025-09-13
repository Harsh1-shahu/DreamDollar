"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/useUser";

const ProtectedRoute = ({ children }) => {
    const { user } = useUser();
    const router = useRouter();

    // useEffect(() => {
    //     if (!user) {
    //         router.push("/Components/Authentication/Login");
    //     }
    // }, [user, router]);

    // if (!user) {
    //     return (
    //         <div className="flex justify-center items-center min-h-screen">
    //             <p>Redirecting to login...</p>
    //         </div>
    //     );
    // }

    return children;
};

export default ProtectedRoute;
