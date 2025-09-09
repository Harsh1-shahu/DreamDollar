"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiMenu, FiX, FiSun, FiMoon, FiChevronDown, FiChevronUp, } from "react-icons/fi";
import { useProject } from "@/app/Context/ProjectContext";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/useUser";

const Navbar = () => {
    const router = useRouter();
    const { openMenu, setOpenMenu, theme, toggleTheme } = useProject();
    const [openIncome, setOpenIncome] = useState(false);
    const [openTeam, setOpenTeam] = useState(false);
    const { clearUser } = useUser();

    return (
        <div className="relative">
            <div
                className={`fixed top-0 left-0 max-w-xl mx-auto right-0 z-50 ${theme === "dark"
                    ? "dark bg-gray-900 text-gray-100"
                    : "bg-gray-100 text-gray-100"
                    }`}
            >
                {/* Navbar */}
                <nav className="flex justify-between items-center py-3 px-4.5 shadow-md dark:bg-gray-800">
                    {/* Left side */}
                    <div>
                        <FiMenu
                            size={24}
                            className="cursor-pointer"
                            onClick={() => setOpenMenu(true)}
                        />
                    </div>

                    {/* Right side */}
                    <div className="flex gap-6 items-center">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                        >
                            {theme === "light" ? <FiSun /> : <FiMoon />}
                        </button>

                        {/* Profile Section */}
                        <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
                    </div>
                </nav>

                {/* Sidebar Menu (Left) */}
                {openMenu && (
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-40 flex"
                        onClick={() => setOpenMenu(false)} // click anywhere outside closes
                    >

                        {/* Sidebar */}
                        <div
                            className={`relative h-full w-64 shadow-lg p-5 z-50 ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-white text-black"
                                }`}
                            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <img src="/logo.png" className="w-20 h-20" />
                                <FiX
                                    size={24}
                                    className={`cursor-pointer ${theme === "dark" ? "text-white" : "text-black"
                                        }`}
                                    onClick={() => setOpenMenu(false)} // close button
                                />
                            </div>

                            {/* Menu List */}
                            <ul className="flex flex-col gap-2 border-t border-gray-400 pt-5">
                                {/* Dashboard */}
                                <li
                                    onClick={() => {
                                        router.push("/Components/Dashboard");
                                        setOpenMenu(false);
                                    }}
                                    className="cursor-pointer rounded-md px-3 py-2 bg-gray-100 dark:bg-slate-500 hover:bg-blue-100 dark:hover:bg-slate-700 hover:text-blue-700"
                                >
                                    🏠 Dashboard
                                </li>

                                {/* Income Report with Dropdown */}
                                <li className="bg-gray-100 dark:bg-slate-500 rounded-md">
                                    <div
                                        onClick={() => setOpenIncome(!openIncome)}
                                        className="flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-slate-700 hover:text-blue-700 rounded-md"
                                    >
                                        <span>📊 Income Report</span>
                                        {openIncome ? <FiChevronUp /> : <FiChevronDown />}
                                    </div>

                                    {openIncome && (
                                        <ul className="ml-6 p-2 mt-1 flex flex-col gap-2 text-sm">
                                            <li
                                                onClick={() => {
                                                    router.push("/Components/IncomeReport/DirectIncomeDetails");
                                                    setOpenMenu(false);
                                                }}
                                                className="cursor-pointer px-2 py-1 hover:text-blue-600 hover:bg-slate-700 rounded-xl"
                                            >
                                                → Direct Income Details
                                            </li>
                                            <li
                                                onClick={() => {
                                                    router.push("/Components/IncomeReport/AutoLevelDetails");
                                                    setOpenMenu(false);
                                                }}
                                                className="cursor-pointer px-2 py-1 hover:text-blue-600 hover:bg-slate-700 rounded-xl"
                                            >
                                                → Auto Level Details
                                            </li>
                                            <li
                                                onClick={() => {
                                                    router.push("/Components/IncomeReport/GlobalRankDetails");
                                                    setOpenMenu(false);
                                                }}
                                                className="cursor-pointer px-2 py-1 hover:text-blue-600 hover:bg-slate-700 rounded-xl"
                                            >
                                                → Global Rank Details
                                            </li>
                                            <li
                                                onClick={() => {
                                                    router.push("/Components/IncomeReport/EarningReport");
                                                    setOpenMenu(false);
                                                }}
                                                className="cursor-pointer px-2 py-1 hover:text-blue-600 hover:bg-slate-700 rounded-xl"
                                            >
                                                → Earning Report
                                            </li>
                                        </ul>
                                    )}
                                </li>

                                {/* Team Details with Dropdown */}
                                <li className="bg-gray-100 dark:bg-slate-500 rounded-md">
                                    <div
                                        onClick={() => setOpenTeam(!openTeam)}
                                        className="flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-slate-700 hover:text-blue-700 rounded-md"
                                    >
                                        <span>💹 Team Details</span>
                                        {openTeam ? <FiChevronUp /> : <FiChevronDown />}
                                    </div>

                                    {openTeam && (
                                        <ul className="ml-6 p-2 mt-1 flex flex-col gap-2 text-sm">
                                            <li
                                                onClick={() => {
                                                    router.push("/Components/TeamDetails/DirectTeam");
                                                    setOpenMenu(false);
                                                }}
                                                className="cursor-pointer px-2 py-1 hover:text-blue-600 hover:bg-slate-700 rounded-xl"
                                            >
                                                → Direct Team
                                            </li>
                                            <li
                                                onClick={() => {
                                                    router.push("/Components/TeamDetails/AllTeam");
                                                    setOpenMenu(false);
                                                }}
                                                className="cursor-pointer px-2 py-1 hover:text-blue-600 hover:bg-slate-700 rounded-xl"
                                            >
                                                → All Team
                                            </li>
                                        </ul>
                                    )}
                                </li>

                                {/* Withdrawal Status */}
                                <li
                                    onClick={() => {
                                        router.push("/Components/WithdrawalStatus");
                                        setOpenMenu(false);
                                    }}
                                    className="cursor-pointer rounded-md px-3 py-2 bg-gray-100 dark:bg-slate-500 hover:bg-blue-100 dark:hover:bg-slate-700 hover:text-blue-700"
                                >
                                    📈 Withdrawal Status
                                </li>

                                {/* Logout */}
                                <li
                                    onClick={() => {
                                        clearUser();
                                        setOpenMenu(false);
                                        router.push("/Components/Authentication/Login");
                                    }}
                                    className="cursor-pointer rounded-md px-3 py-2 bg-gray-100 dark:bg-slate-500 hover:bg-red-100 dark:hover:bg-slate-700 hover:text-red-600"
                                >
                                    📤 Logout
                                </li>
                            </ul>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Navbar;
