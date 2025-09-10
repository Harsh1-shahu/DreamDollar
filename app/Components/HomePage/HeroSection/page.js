"use client";
import React, { useState } from "react";
import { LiaWalletSolid } from "react-icons/lia";
import { CgArrowTopRightO } from "react-icons/cg";
import IncomeStats from "../IncomeSection/page";
import Withdrawal from "../Withdrawal/page";
import { useProject } from "@/app/Context/ProjectContext";

const HeroSection = () => {
  const { data, totalWithdrawalAmount } = useProject();
  const [showWithdrawal, setShowWithdrawal] = useState(false);

  const marqueRank = data?.marqueRank || "";
  const ranks = marqueRank ? marqueRank.split("   ") : [];


  return (
    <div className="p-4 mt-16">
      {/* Marquee Section */}
      <div className="overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-lg p-2 mb-4">
        <div className="flex marquee-slide">
          {ranks.concat(ranks).map((rank, index) => (
            <span
              key={index}
              className="mx-4 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200 flex-shrink-0"
            >
              {rank}
            </span>
          ))}
        </div>
      </div>

      {/* Wallet Section */}
      <div className="w-full mt-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 dark:from-yellow-500 dark:via-amber-600 dark:to-yellow-700 p-4 rounded-xl shadow-lg transition-colors duration-300">
        {/* Header */}
        <section className="flex justify-between items-center text-white mb-6">
          <div className="flex items-center gap-2">
            <LiaWalletSolid className="text-2xl" />
            <h1 className="text-lg sm:text-xl font-semibold">Wallet</h1>
          </div>
          <div className="flex gap-2 items-center">
            <h1 className="text-lg sm:text-xl font-medium">Withdrawal</h1>
            <div>
              <CgArrowTopRightO
                onClick={() => setShowWithdrawal(true)}
                className="text-3xl cursor-pointer rounded-full transition-all duration-300 ease-in-out hover:bg-white hover:text-black hover:scale-110 hover:rotate-12 shadow-md"
              />
              {showWithdrawal && <Withdrawal onClose={() => setShowWithdrawal(false)} />}
            </div>
          </div>
        </section>

        {/* Available Withdrawal Balance */}
        <div className="flex flex-col items-start justify-center text-white">
          <p className="text-xl font-bold sm:text-2xl">
            ${totalWithdrawalAmount}
          </p>
          <h1 className="text-lg font-light">Available Wallet Balance</h1>
        </div>
      </div>

      {/* Income Section */}
      <div className="mt-4">
        <IncomeStats />
      </div>
    </div>
  );
};

export default HeroSection;
