"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";

const SignUp = () => {
    const router = useRouter();
    
    // Form states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});

    // Validation function
    const validateForm = () => {
        let formErrors = {};
        let valid = true;

        if (!name.trim()) {
            formErrors.name = "Full name is required.";
            valid = false;
        }

        if (!email) {
            formErrors.email = "Email is required.";
            valid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            formErrors.email = "Enter a valid email.";
            valid = false;
        }

        if (!password) {
            formErrors.password = "Password is required.";
            valid = false;
        } else if (password.length < 6) {
            formErrors.password = "Password must be at least 6 characters.";
            valid = false;
        }

        if (!confirmPassword) {
            formErrors.confirmPassword = "Please confirm your password.";
            valid = false;
        } else if (password !== confirmPassword) {
            formErrors.confirmPassword = "Passwords do not match.";
            valid = false;
        }

        setErrors(formErrors);
        return valid;
    };

    // Submit handler
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            router.push("/Components/Dashboard");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-400 p-2">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
                {/* Title */}
                <div className="flex justify-center">
                    <img src="/logo.png"
                        className="w-12 h-12 mb-2" />
                </div>

                <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
                    Create Account
                </h1>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Name */}
                    <div>
                        <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">
                            Full Name
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-500" : ""
                                }`}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">
                            Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? "border-red-500" : ""
                                }`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? "border-red-500" : ""
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-300 cursor-pointer"
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword ? "border-red-500" : ""
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-300 cursor-pointer"
                            >
                                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.confirmPassword}
                            </p>
                        )}
                    </div>

                    {/* Terms */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <input type="checkbox" className="w-4 h-4 cursor-pointer" required />
                        <span>
                            I agree to the{" "}
                            <span
                                onClick={() => router.push("/Components/Authentication/PrivacyPolicy")}
                                className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                            >
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

                {/* Divider */}
                <div className="flex items-center gap-2 my-6">
                    <hr className="flex-1 border-gray-300 dark:border-gray-600" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">OR</span>
                    <hr className="flex-1 border-gray-300 dark:border-gray-600" />
                </div>

                {/* Login Redirect */}
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
