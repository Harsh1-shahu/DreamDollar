"use client";
import React, { useEffect, useState } from "react";

const Loader = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let interval;

        if (progress < 100) {
            interval = setInterval(() => {
                setProgress((prev) => (prev < 100 ? prev + 5 : 100));
            }, 100); // every 100ms add 5%
        }

        return () => clearInterval(interval);
    }, [progress]);

    return (
        <div className="max-w-xl mx-auto h-screen flex items-center justify-center bg-gray-500 text-white flex-col gap-6 px-4">
            <img src="/logo.png" alt="Logo" className="w-20 h-20 animate-pulse" />
            <h1 className="text-2xl font-bold animate-pulse">Dream Doller</h1>

            {/* Progress Bar */}
            <div className="w-1/2 bg-gray-700 rounded-full h-3 overflow-hidden mt-4">
                <div
                    className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-300 h-3 rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <p className="text-sm">{progress}%</p>
        </div>
    );
};

export default Loader;
