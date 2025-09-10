"use client";
import React, { useState } from "react";
import { BsFillCreditCard2FrontFill } from "react-icons/bs";
import { FiCopy } from "react-icons/fi";
import { useProject } from "@/app/Context/ProjectContext";
import { IoDiamondSharp } from "react-icons/io5";

const MyCards = () => {
  const referralLink = "https://www.dreamdollar.life/register/2377128";
  const [copied, setCopied] = useState(false);
  const { theme } = useProject();

  const copyToClipboard = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(referralLink).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      // Fallback for unsupported environments
      const textarea = document.createElement("textarea");
      textarea.value = referralLink;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };


  return (
    <div
      className={`p-4 rounded-md shadow transition-colors duration-300 ${theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
        }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <BsFillCreditCard2FrontFill
              className={theme === "dark" ? "text-cyan-400" : "text-blue-500"}
            />
            User Details
          </h2>
        </div>
      </div>

      {/* user Card */}
      <div
        className={`${theme === "dark"
            ? "bg-gradient-to-br from-gray-800 to-gray-900 border-1 border-gray-700"
            : "bg-gradient-to-br from-white to-gray-100 border-1 border-gray-300"
          } rounded-2xl p-5 shadow-md
          `}
      >
        {/* Top Section: Rank + Logo */}
        <div className="flex items-center justify-center">        
            <div className="flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 py-1.5 px-3 rounded-full shadow-md">
              <IoDiamondSharp className="text-yellow-500" size={20} />
              <span className="text-yellow-500 font-bold text-xl tracking-widest">
                Diamond
              </span>
            </div>
        </div>

        {/* Address Section */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            TRX Address
          </h2>
          <p
            className={`mt-2 break-all text-sm sm:text-base font-medium px-3 py-2 rounded-lg shadow-sm border ${theme === "dark"
                ? "bg-gray-800 text-gray-200 border-gray-700"
                : "bg-gray-50 text-gray-800 border-gray-200"
              }`}
          >
            THcUZhaV485CkmUC8sb5zvXW1njtLoCQX9
          </p>
        </div>

        {/* User ID Section */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            User ID
          </h2>
          <p
            className={`mt-2 text-xl font-bold px-3 py-1.5 rounded-lg shadow-sm border text-center ${theme === "dark"
                ? "bg-gray-800 text-cyan-400 border-gray-700"
                : "bg-gray-50 text-cyan-600 border-gray-200"
              }`}
          >
            2377128
          </p>
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="mt-4">
        <p
          className={`text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
        >
          Referral Link:
        </p>
        <div
          className={`flex items-center border rounded-full overflow-hidden ${theme === "dark"
            ? "border-cyan-500"
            : "border-cyan-400"
            }`}
        >
          <input
            type="text"
            value={referralLink}
            readOnly
            className={`flex-1 px-3 py-2 text-sm outline-none ${theme === "dark" ? "bg-gray-700 text-gray-100" : "bg-gray-100"
              }`}
          />
          <button
            onClick={copyToClipboard}
            className={`px-3 py-2 flex items-center cursor-pointer transition ${theme === "dark"
              ? "bg-cyan-900 hover:bg-cyan-800 text-cyan-400"
              : "bg-cyan-50 hover:bg-cyan-100 text-cyan-600"
              }`}
          >
            <FiCopy className="text-lg" />
          </button>
        </div>
        {copied && (
          <p className="w-fit text-green-500 bg-gray-700 rounded-md mx-auto p-2 text-xs text-center mt-4">
            ✅
            Link copied!
          </p>
        )}
      </div>
    </div>
  );
};

export default MyCards;
