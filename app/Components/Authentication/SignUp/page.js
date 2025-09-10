"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SignUp = () => {
    const router = useRouter();

    const apiUrl = process.env.NEXT_PUBLIC_DREAM_DOLLAR_URL;

    const [Id, setId] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [verified, setVerified] = useState(null); // null = not checked, true = valid, false = invalid

    // Auto-verify referral ID without timeout
    useEffect(() => {
        if (!Id.trim()) {
            setVerified(null);
            return;
        }

        const fetchVerification = async () => {
            try {
                setLoading(true);
                setVerified(null);

                const formData = new FormData();
                formData.append("userid", Id);

                const res = await fetch(`${apiUrl}/Statistic/GetSponsor`, {
                    method: "POST",
                    body: formData,
                });

                const result = await res.json();
                console.log("response", result);

                if (res.ok && result.ResponseStatus === "success" && result.NoOfRecord > 0) {
                    setVerified(true);
                } else {
                    setVerified(false);
                }
            } catch (err) {
                console.error(err);
                setVerified(false);
            } finally {
                setLoading(false);
            }
        };

        fetchVerification();
    }, [Id, apiUrl]);

    // Validation
    const validateForm = () => {
        let formErrors = {};
        let valid = true;

        if (!Id.trim()) {
            formErrors.Id = "Referral ID cannot be empty";
            valid = false;
        } else if (verified === false) {
            formErrors.Id = "Invalid Referral ID";
            valid = false;
        }

        setErrors(formErrors);
        return valid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            router.push("/Components/Dashboard");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 p-2">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
                <div className="flex justify-center">
                    <img src="/logo.png" className="w-12 h-12 mb-2" />
                </div>

                <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
                    Sign Up Here
                </h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Referral ID input */}
                    <div className="relative">
                        <h1 className="text-gray-300 mb-1">Referral ID</h1>
                        <input
                            type="text"
                            placeholder="Enter your Referral ID"
                            value={Id}
                            onChange={(e) => {
                                setId(e.target.value);
                                setErrors({});
                                setVerified(null);
                            }}
                            className={`w-full pr-12 px-4 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.Id ? "border-red-500" : ""
                                }`}
                        />

                        {/* Tick/Cross/Loading */}
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-6 h-6 mt-3">
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent animate-spin rounded-sm"></div>
                            ) : verified !== null ? (
                                <span className={`text-xl ${verified ? "text-green-500" : "text-red-500"}`}>
                                    {verified ? "✅" : "❌"}
                                </span>
                            ) : null}
                        </div>
                    </div>

                    {errors.Id && <p className="text-red-500 text-xs mt-1">{errors.Id}</p>}

                    <div className="bg-gray-900 rounded-lg text-gray-400 p-2">
                        <h1>Connect to TronLink Pro</h1>
                    </div>

                    {/* Terms */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <input type="checkbox" className="w-4 h-4 cursor-pointer" required />
                        <span>
                            I agree to the{" "}
                            <span className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                                Terms & Conditions
                            </span>
                        </span>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition cursor-pointer"
                    >
                        Sign Up
                    </button>
                </form>

                <div className="flex items-center gap-2 my-6">
                    <hr className="flex-1 border-gray-300 dark:border-gray-600" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">OR</span>
                    <hr className="flex-1 border-gray-300 dark:border-gray-600" />
                </div>

                <p className="mt-6 text-center text-gray-600 dark:text-gray-400 text-sm">
                    Already have an account?{" "}
                    <span
                        onClick={() => router.push("/Components/Authentication/Login")}
                        className="text-blue-600 hover:underline dark:text-blue-400 cursor-pointer ml-2"
                    >
                        Login
                    </span>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
