"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const Login12314 = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [username, setUsername] = useState("");
    const [address, setAddress] = useState("");
    const [errors, setErrors] = useState({ address: "", api: "" });
    const [loading, setLoading] = useState(false);       // login in-flight
    const [connecting, setConnecting] = useState(false); // tronlink connect in-flight
    const [clientIp, setClientIp] = useState("");
    const [isAddressReady, setIsAddressReady] = useState("");

    // Prevent double auto-login loops
    const autoLoginTriedRef = useRef(false);
    const wantAutoLoginRef = useRef(false);
    const usernameFromQSHandledRef = useRef(false);

    // --- Toast state ---
    const [toast, setToast] = useState({ message: "", type: "" });

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => {
            setToast({ message: "", type: "" });
        }, 3000);
    };

    // API URL
    const apiUrl = process.env.NEXT_PUBLIC_DREAM_DOLLAR_URL;

    // If ?username=... is in the URL, set it and try to auto-login once
    useEffect(() => {
        console.log('consloe bras username');
        if (usernameFromQSHandledRef.current) return;
        console.log('consloe bras username 1');
        // Prefer App Router's searchParams, but also fall back to window
        let qs = searchParams?.get("usernameCheck") || searchParams?.get("usernamettttttttt") || "";
        console.log('consloe bras username qs', qs);
        if (!qs && typeof window !== "undefined") {
            const sp = new URLSearchParams(window.location.search);
            qs = sp.get("usernameCheck") || sp.get("usernamettttttttt") || "";
        }
        console.log('consloe bras username qs 2', qs);

        if (qs && qs.trim().length > 2) {
            usernameFromQSHandledRef.current = true;
            setUsername(qs.trim());
            console.log('consloe bras username qs 3', qs);
            console.log('consloe bras username qs 4', qs.trim());
            console.log('consloe bras username qs Username', username);
            // Mark this as a "username-only" login and run doLogin directly (no TronLink)
            wantAutoLoginRef.current = true;
            // Call after state set; tiny timeout prevents any race
            // setTimeout(() => void doLogin(true), 100);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // If ?username=... is in the URL, set it and try to auto-login once
    useEffect(() => {
        const byUsernameOnly = username && username.length > 2;
        console.log('login useEffect username', username);
        console.log('login useEffect', byUsernameOnly);

        if (byUsernameOnly) {
            doLogin(true);
            console.log('validation useEffect', byUsernameOnly);
        }

    }, [username]);




    const validateForm = () => {
        let valid = true;
        const newErrors = { address: "", api: "" };

        if (!address) {
            newErrors.address = "Please connect TronLink Pro.";
            valid = false;
        } else if (address.length < 7) {
            newErrors.address = "Invalid address.";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    // Login
    const doLogin = async () => {
        console.log('login conl');
        try {
            const byUsernameOnly = username && username.length > 2;
            console.log('login byUsernameOnly username', username);
            console.log('login byUsernameOnly', byUsernameOnly);
            if (!byUsernameOnly) {
                if (!validateForm()) return;
            }
            setLoading(true);
            setErrors((prev) => ({ ...prev, api: "" }));

            const formData = new FormData();
            formData.append("userxt", username || "");
            formData.append("address", byUsernameOnly ? "" : address);
            formData.append("ipaddress", "");

            console.log("login formData:");
            formData.forEach((value, key) => {
                console.log(`${key}: ${value}`);
            });


            const response = await fetch(`${apiUrl}/Statistic/CheckLogin`, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            console.log("login raw", data);

            if (response.ok && (data.ResponseStatus === "success" || data.ResponseCode === 101)) {
                // Parse Data safely (handles when Data is already an array/object)
                let parsed = data.Data;
                if (typeof parsed === "string") {
                    try {
                        parsed = JSON.parse(parsed);
                    } catch (e) {
                        console.error("Failed to parse Data:", e, parsed);
                        setErrors((prev) => ({ ...prev, api: "Bad response format from server." }));
                        setLoading(false);
                        showToast("Bad response format from server.", "error");
                        return;
                    }
                }

                // Pick the first item
                const row = Array.isArray(parsed) ? parsed[0] : parsed;

                if (row && typeof row === "object") {
                    const byUsernameOnly = username && username.length > 2;

                    const userPayload = {
                        ...row,
                        ConnectedAddress: byUsernameOnly ? "" : address,
                        loginTime: new Date().toISOString(),
                        LoginMethod: byUsernameOnly ? "username" : "wallet",
                        DirectLogin: true,
                    };

                    localStorage.clear();
                    localStorage.setItem("user", JSON.stringify(userPayload));
                    console.log("JSON.stringify(userPayload)", JSON.stringify(userPayload));

                    showToast("Login Successful", "success");

                    router.push("/Components/Dashboard");
                } else {
                    setLoading(false);
                    setErrors((prev) => ({ ...prev, api: "No user data returned." }));
                    showToast("No user data returned.", "error");
                }
            } else {
                setLoading(false);
                setErrors((prev) => ({
                    ...prev,
                    api: data?.ResponseMessage || "Invalid login.",
                }));
                showToast(data?.ResponseMessage || "Invalid login.", "error");
            }
        } catch (error) {
            setLoading(false);
            setErrors((prev) => ({
                ...prev,
                api: "Something went wrong. Please try again.",
            }));
            showToast("Something went wrong. Please try again.", "error");
        } finally {
            // setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await doLogin();
    };


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 p-2 relative">

            {/* ✅ Toast Notification */}
            {toast.message && (
                <div
                    className={`fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-500 ${toast.type === "success" ? "bg-green-600" : "bg-red-600"
                        }`}
                >
                    {toast.message}
                </div>
            )}

            <div className="w-full max-w-md bg-gray-800 shadow-xl rounded-2xl p-8">
                {/* Logo */}
                <div className="flex justify-center">
                    <img src="/logo.png" className="w-12 h-12 mb-2" alt="logo" />
                </div>
                <h1 className="text-xl font-semibold text-center text-white mb-6">
                    Welcome Back
                </h1>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Address (disabled) */}
                    <div>
                        <input
                            type="text"
                            placeholder="Enter address/username"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.address ? "border-red-500" : ""
                                }`}
                        />
                        {errors.address && (
                            <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                        )}
                    </div>

                    {/* Submit / Connect Button */}
                    {address ? (
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition cursor-pointer disabled:opacity-50"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    ) : (
                        <button
                            type="button" disabled style={{ cursor: 'not-allowed' }}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg transition cursor-pointer disabled:opacity-50"
                        >
                            Please enter address/username
                        </button>
                    )}

                    {/* API Error
                    {errors.api && (
                        <p className="text-red-500 text-center text-sm mt-2">
                            {errors.api}
                        </p>
                    )} */}
                </form>

                {/* Divider */}
                <div className="flex items-center gap-2 my-6">
                    <hr className="flex-1 border-gray-600" />
                    <span className="text-sm text-gray-400">OR</span>
                    <hr className="flex-1 border-gray-600" />
                </div>

                {/* Sign Up */}
                <p className="text-center text-gray-400 text-sm">
                    Don’t have an account?{" "}
                    <span
                        onClick={() => router.push("/Components/Authentication/SignUp")}
                        className="hover:underline ml-2 text-blue-400 cursor-pointer"
                    >
                        Sign up
                    </span>
                </p>
            </div>
        </div>
    );
};


export default Login12314