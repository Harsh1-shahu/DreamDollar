"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { FiMenu, FiX, FiSun, FiMoon, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useProject } from "@/app/Context/ProjectContext";
import { useRouter } from "next/navigation";
import { useRequireMemberDetails } from "@/app/hooks/useRequireMemberDetails";

const Navbar = () => {
    const router = useRouter();
    const { userid, DirectLogin, address, logoutMember } = useRequireMemberDetails();
    const { openMenu, setOpenMenu, theme, toggleTheme } = useProject();
    const [openIncome, setOpenIncome] = useState(false);
    const [openTeam, setOpenTeam] = useState(false);

    // ✅ Lock / unlock body scroll when modal is open or close
    useEffect(() => {
        if (openMenu) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        // cleanup just in case
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [openMenu]);


    // ---- Tron helpers ----
    const connectingRef = useRef(false);


    const getTronAddress = () => {
        const base58 = window?.tronWeb?.defaultAddress?.base58;
        const hex = window?.tronWeb?.defaultAddress?.hex;
        if (base58) return base58;
        if (hex && window?.tronWeb?.address) {
            try {
                return window.tronWeb.address.fromHex(hex);
            } catch { }
        }
        return "";
    };


    const ensureConnectedAndMatch = async () => {
        // prevent overlapping calls
        if (connectingRef.current) return;
        connectingRef.current = true;

        try {
            // Require TronLink
            if (!window?.tronLink) {
                logoutMember();
                router.replace("/Components/Authentication/Login");
                return;
            }

            // Ask for accounts (will no-op if already connected/authorized)
            try {
                await window.tronLink.request({ method: "tron_requestAccounts" });
            } catch {
                logoutMember();
                router.replace("/Components/Authentication/Login");
                return;
            }

            // Get current wallet address
            const currentAddr = getTronAddress();
            const savedAddr = address;

            console.log('currentAddr', currentAddr);
            console.log('savedAddr', savedAddr);

            if (!currentAddr || !savedAddr || currentAddr !== savedAddr) {
                console.log('original');
                logoutMember();
                // router.replace("/Components/Authentication/Login");
                return;
            }
            // else OK — continue staying on the page
        } finally {
            connectingRef.current = false;
        }
    };

    // On mount: connect + check
    useEffect(() => {
        if (!DirectLogin) {
            let pollId;

            const init = async () => {
                if (!window?.tronLink) {
                    // TronLink may inject late — poll briefly
                    pollId = setInterval(() => {
                        if (window?.tronLink) {
                            clearInterval(pollId);
                            ensureConnectedAndMatch();
                        }
                    }, 700);
                    setTimeout(() => clearInterval(pollId), 7000);
                    return;
                }
                ensureConnectedAndMatch();
            };

            init();

            // react to account / chain changes too — re-validate
            const onAccounts = () => ensureConnectedAndMatch();
            const onChain = () => ensureConnectedAndMatch();

            try {
                window?.tronLink?.on?.("accountsChanged", onAccounts);
                window?.tronLink?.on?.("chainChanged", onChain);
            } catch { }

            return () => {
                clearInterval(pollId);
                try {
                    window?.tronLink?.removeListener?.("accountsChanged", onAccounts);
                    window?.tronLink?.removeListener?.("chainChanged", onChain);
                } catch { }
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }, []);

    // When side menu opens, re-check once more (as you requested)
    useEffect(() => {
        if (!DirectLogin) {
            if (openMenu) {
                ensureConnectedAndMatch();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openMenu]);

    const handleLogout = () => {
        logoutMember();
        setOpenMenu(false);
    };


    return (
        <div className="relative">
            <div
                className={`fixed top-0 left-0 max-w-xl mx-auto right-0 z-50 ${theme === "dark"
                    ? "dark bg-gray-900 text-gray-100"
                    : "bg-gray-900 text-gray-100"
                    }`}
            >
                {/* Navbar */}
                <nav className="flex justify-between items-center py-3 px-4.5 shadow-md bg-gray-800">
                    {/* Left side */}
                    <div>
                        <FiMenu
                            size={24}
                            className="cursor-pointer"
                            onClick={() => setOpenMenu(true)}
                        />
                    </div>

                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold">
                        <h1 className="font-serif text-lg tracking-widest shadow-md rounded-xl p-1">DDL</h1>
                    </div>

                    {/* Right side */}
                    <div className="flex gap-6 items-center">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-700 cursor-pointer"
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
                            className={`relative h-full w-64 shadow-lg p-5 z-50 ${theme === "dark" ? "bg-gray-700 text-gray-100" : "bg-gray-300 text-gray-100"
                                }`}
                            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6 relative">
                                {/* Gradient Box */}
                                <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl shadow-lg w-full">
                                    {/* Logo */}
                                    <img
                                        src="/logo.png"
                                        alt="Logo"
                                        className="w-14 h-14"
                                    />

                                    {/* User ID */}
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-white/90 mb-1 pl-2">User ID</p>
                                        <p className="text-md font-bold text-white px-2 bg-white/20 rounded-full shadow-sm backdrop-blur-md">
                                            {userid}
                                        </p>
                                    </div>
                                </div>

                                {/* Close Button */}
                                <button
                                    onClick={() => setOpenMenu(false)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-700 transition duration-200"
                                >
                                    <FiX
                                        size={22}
                                        className="text-white"
                                    />
                                </button>
                            </div>

                            {/* Menu List */}
                            <ul className={`flex flex-col gap-2 border-t  pt-5 ${theme === "dark" ? "border-gray-400" : "border-gray-900"
                                }`}>
                                {/* Dashboard */}
                                <li
                                    onClick={() => {
                                        router.push("/Components/Dashboard");
                                        setOpenMenu(false);
                                    }}
                                    className="cursor-pointer rounded-md px-3 py-2 bg-gray-800 hover:bg-slate-900 hover:text-blue-700"
                                >
                                    🏠 Dashboard
                                </li>

                                {/* Income Report with Dropdown */}
                                <li className="bg-gray-800 rounded-md">
                                    <div
                                        onClick={() => setOpenIncome(!openIncome)}
                                        className="flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-slate-900 hover:text-blue-700 rounded-md"
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
                                                className="cursor-pointer px-2 py-1 hover:text-blue-600 hover:bg-slate-900 rounded-xl"
                                            >
                                                → Direct Income Details
                                            </li>
                                            <li
                                                onClick={() => {
                                                    router.push("/Components/IncomeReport/AutoLevelDetails");
                                                    setOpenMenu(false);
                                                }}
                                                className="cursor-pointer px-2 py-1 hover:text-blue-600 hover:bg-slate-900 rounded-xl"
                                            >
                                                → Auto Level Details
                                            </li>
                                            <li
                                                onClick={() => {
                                                    router.push("/Components/IncomeReport/GlobalRankDetails");
                                                    setOpenMenu(false);
                                                }}
                                                className="cursor-pointer px-2 py-1 hover:text-blue-600 hover:bg-slate-900 rounded-xl"
                                            >
                                                → Global Rank Details
                                            </li>
                                            <li
                                                onClick={() => {
                                                    router.push("/Components/IncomeReport/EarningReport");
                                                    setOpenMenu(false);
                                                }}
                                                className="cursor-pointer px-2 py-1 hover:text-blue-600 hover:bg-slate-900 rounded-xl"
                                            >
                                                → Earning Report
                                            </li>
                                        </ul>
                                    )}
                                </li>

                                {/* Team Details with Dropdown */}
                                <li className="bg-gray-800 rounded-md">
                                    <div
                                        onClick={() => setOpenTeam(!openTeam)}
                                        className="flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-slate-900 hover:text-blue-700 rounded-md"
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
                                                className="cursor-pointer px-2 py-1 hover:text-blue-600 hover:bg-slate-900 rounded-xl"
                                            >
                                                → Direct Team
                                            </li>
                                            <li
                                                onClick={() => {
                                                    router.push("/Components/TeamDetails/AllTeam");
                                                    setOpenMenu(false);
                                                }}
                                                className="cursor-pointer px-2 py-1 hover:text-blue-600 hover:bg-slate-900 rounded-xl"
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
                                    className="cursor-pointer rounded-md px-3 py-2 bg-gray-800 hover:bg-slate-900 hover:text-blue-700"
                                >
                                    📈 Withdrawal Status
                                </li>

                                {/* Logout */}
                                <li
                                    onClick={handleLogout}
                                    className="cursor-pointer rounded-md px-3 py-2 bg-gray-800 hover:bg-slate-900 hover:text-red-600"
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
