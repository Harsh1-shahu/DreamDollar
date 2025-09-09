"use client";
import { useState, useEffect } from "react";

export const useUser = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (err) {
            console.error("Failed to parse user from localStorage:", err);
        }
    }, []);

    // update user (for profile updates, etc.)
    const updateUser = (newUserData) => {
        const updatedUser = { ...user, ...newUserData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    // clear user (logout)
    const clearUser = () => {
        localStorage.removeItem("user");
        setUser(null);
    };

    return { user, setUser: updateUser, clearUser };
};
