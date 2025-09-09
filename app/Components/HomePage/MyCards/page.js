"use client";
import React, { useState } from "react";
import { BsFillCreditCard2FrontFill } from "react-icons/bs";
import { FiCopy } from "react-icons/fi";
import { useProject } from "@/app/Context/ProjectContext";
import { IoDiamondSharp } from "react-icons/io5";

const MyCards = () => {
  const referralLink = "https://www.dreamdollar.life/register/2377128";
  const [copied, setCopied] = useState(false);
  const { theme, profile } = useProject();

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
      className={`max-w-xl mx-auto p-4 rounded-md shadow transition-colors duration-300 ${theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
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

      {/* Card Section */}
      <div className={`${theme === "dark" ? "bg-gray-900" : "bg-gray-100"} rounded-xl p-5 shadow-lg mb-4`}>
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">Rank:</span>
          <div className="flex items-center gap-2 bg-gray-600 p-2 rounded-xl">
            <IoDiamondSharp className="text-amber-400" />
            <p className="text-amber-400 font-bold">Diamond</p>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-lg mt-4">TRX ADDR :</span>
          <p className="break-all text-md sm:text-lg">
            THcUZhaV485CkmUC8sb5zvXW1njtLoCQX9
          </p>
        </div>


        <div className="mt-4">
          <p className="text-md font-bold">2377128</p>

        </div>
      </div>

      {/* Referral Link Section */}
      <div>
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
