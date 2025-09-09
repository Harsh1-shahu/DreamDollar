"use client";
import React, { useState } from "react";
import { FaHome } from "react-icons/fa";
import { BiSolidWallet } from "react-icons/bi";
import { useRouter } from "next/navigation";
import { BsFillMenuButtonWideFill } from "react-icons/bs";
import Withdrawal from "../HomePage/Withdrawal/page";
import { useProject } from "@/app/Context/ProjectContext";

const Footer = () => {
    const router = useRouter();
    const [showWithdrawal, setShowWithdrawal] = useState(false);
    const { setOpenMenu } = useProject();

    return (
        <>
            <footer className="fixed bottom-0 left-0 max-w-xl mx-auto right-0 bg-gray-800 shadow-inner py-2 z-40">
                <div className="max-w-2xl mx-auto flex items-center justify-around text-white">
                    {/* Home */}
                    <span
                        onClick={() => router.push("/Components/Dashboard")}
                        className="flex flex-col items-center hover:text-blue-600 transition duration-300 cursor-pointer"
                    >
                        <FaHome size={22} />
                        <span className="text-sm mt-1">Home</span>
                    </span>

                    {/* Menu Section */}
                    <span
                        onClick={() => { setOpenMenu(true) }}
                        className="flex flex-col items-center hover:text-blue-600 transition duration-300 cursor-pointer"
                    >
                        <BsFillMenuButtonWideFill size={22} />
                        <span className="text-sm mt-1">Menu</span>
                    </span>

                    {/* Withdrawal */}
                    <span
                        onClick={() => setShowWithdrawal(true)}
                        className="flex flex-col items-center hover:text-blue-600 transition duration-300 cursor-pointer -mr-4"
                    >
                        <BiSolidWallet size={22} />
                        <span className="text-sm mt-1">Withdrawal</span>
                    </span>
                </div>
            </footer>

            {/* Withdrawal Modal */}
            {showWithdrawal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="w-full relative">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowWithdrawal(false)}
                            className="absolute top-3 right-3 text-gray-700 hover:text-red-600 text-xl font-bold"
                        >
                            ✕
                        </button>

                        {/* Withdrawal Component */}
                        <Withdrawal onClose={() => setShowWithdrawal(false)} />
                    </div>
                </div>
            )}
        </>
    );
};

export default Footer;
