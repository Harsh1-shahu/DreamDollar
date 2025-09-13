"use client";
import React, { useState, useEffect } from "react";
import { BsFillCreditCard2FrontFill } from "react-icons/bs";
import { FiCopy } from "react-icons/fi";
import { useProject } from "@/app/Context/ProjectContext";


const MyCards = () => {
  const referralLink = "https://www.dreamdollar.life/register/2377128";
  const [copied, setCopied] = useState(false);
  const { theme, } = useProject();

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

  const apiUrl = process.env.NEXT_PUBLIC_DREAM_DOLLAR_URL;

  const [rank, setRank] = useState("Loading...");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const formData = new FormData();
        formData.append("memb_code", "101"); // Make Dynamic later
        formData.append("type", "RankDetails");

        const res = await fetch(`${apiUrl}/Statistic/RankDetails`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Failed to fetch data");

        const result = await res.json();

        if (result.ResponseStatus === "success" && result.Data) {
          const myRank = JSON.parse(result.Data.myRank);
          const fetchedRank = myRank[0]?.RRANK || "Unknown";
          setRank(fetchedRank); // store rank in state
        }
      } catch (err) {
        console.error("Error fetching rank:", err);
        setRank("Error");
      }
    };

    fetchData();
  }, [apiUrl]);


  return (
    <div
      className={`p-4 rounded-md shadow transition-colors duration-300 ${theme === "dark"
        ? "bg-gradient-to-br from-gray-800 to-gray-900 border-1 border-gray-700"
        : "bg-gradient-to-br from-white to-gray-100 border-1 border-gray-300"
        }`}>
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
  className="relative rounded-2xl p-6 shadow-xl w-full max-w-md mx-auto text-white bg-gradient-to-r from-[#b17e2d] via-[#c49030] to-[#dbb85e]"
>
  {/* Top Row: Chip + Rank */}
  <div className="flex items-center justify-center">
    <div className="text-center">
      <p className="text-xs uppercase tracking-wide">Rank</p>
      <p className="text-lg font-bold">{rank}</p>
    </div>
  </div>

  {/* Card Number (TRX Address) */}
  <div className="mt-8">
    <p className="text-xs uppercase tracking-wide">TRX Address</p>
    <p className="mt-2 text-sm sm:text-lg font-mono sm:tracking-wider bg-black/30 px-3 py-2 rounded-lg">
      THcUZhaV485CkmUC8sb5zvXW1njtLoCQX9
    </p>
  </div>

  {/* Bottom Section */}
  <div className="mt-8 flex items-center justify-between">
    <div>
      <p className="text-xs uppercase tracking-wide">User ID</p>
      <p className="text-sm font-semibold">{2377128}</p>
    </div>
    <div className="text-right">
      <img src="/logo.png"
      className="w-10 h-10"/>
    </div>
  </div>
</div>


      {/* Referral Link Section */}
      <div className="mt-4">
        <p className="text-sm mb-1 ml-3">
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
