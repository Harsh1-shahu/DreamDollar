"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const Login = () => {
    const router = useRouter();

    // State
    const [address, setAddress] = useState("");
    const [errors, setErrors] = useState({ address: "", api: "" });
    const [loading, setLoading] = useState(false);

    // API URL
    const apiUrl = process.env.NEXT_PUBLIC_DREAM_DOLLAR_URL;

    // Validation
    const validateForm = () => {
        let valid = true;
        let newErrors = { address: "", api: "" };

        if (!address) {
            newErrors.address = "Address / User ID is required.";
            valid = false;
        } else if (address.length < 3) {
            newErrors.address = "User ID must be at least 3 characters.";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setErrors((prev) => ({ ...prev, api: "" }));

        try {
            // ✅ Build form-data request (no IP now)
            const formData = new FormData();
            formData.append("address", address);

            const response = await fetch(`${apiUrl}/Statistic/CheckLogin`, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            console.log("login", data);

            if (response.ok && data.ResponseStatus === "success") {
                // ✅ User payload (just login data + login time)
                const userPayload = {
                    ...data.Data[0],
                    loginTime: new Date().toISOString(),
                };

                // ✅ Save to localStorage
                localStorage.setItem("user", JSON.stringify(userPayload));

                router.push("/Components/Dashboard");
            } else {
                setErrors((prev) => ({
                    ...prev,
                    api: data.ResponseMessage || "Invalid login.",
                }));
            }
        } catch (error) {
            setErrors((prev) => ({
                ...prev,
                api: "Something went wrong. Please try again.",
            }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-2">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
                {/* Logo */}
                <div className="flex justify-center">
                    <img src="/logo.png" className="w-12 h-12 mb-2" />
                </div>
                <h1 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-6">
                    Welcome Back
                </h1>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Address / User ID */}
                    <div>
                        <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">
                            Address / User ID
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your Address or UID"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.address ? "border-red-500" : ""
                                }`}
                        />
                        {errors.address && (
                            <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition cursor-pointer disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    {/* API Error */}
                    {errors.api && (
                        <p className="text-red-500 text-center text-sm mt-2">
                            {errors.api}
                        </p>
                    )}
                </form>

                {/* Divider */}
                <div className="flex items-center gap-2 my-6">
                    <hr className="flex-1 border-gray-300 dark:border-gray-600" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">OR</span>
                    <hr className="flex-1 border-gray-300 dark:border-gray-600" />
                </div>

                {/* Sign Up */}
                <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                    Don’t have an account?{" "}
                    <span
                        onClick={() => router.push("/Components/Authentication/SignUp")}
                        className="text-blue-600 hover:underline ml-2 dark:text-blue-400 cursor-pointer"
                    >
                        Sign up
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;
