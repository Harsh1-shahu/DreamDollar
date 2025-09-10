"use client";

import React from "react";
import { FiTrendingUp } from "react-icons/fi";
import { BsBank } from "react-icons/bs";
import { PiMedalLight } from "react-icons/pi";
import { ImStatsDots, ImStatsBars } from "react-icons/im";
import { TfiCup } from "react-icons/tfi";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { useProject } from "@/app/Context/ProjectContext";

const StatCard = ({ icon: Icon, amount, label, color, theme }) => (
  <div
    className={`p-3 rounded-xl shadow-md flex flex-col mt-1 transition-colors duration-300
      ${theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}
  >
    <div className="flex items-center gap-2">
      <div
        className="p-2 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}20`, color }}
      >
        <Icon size={22} />
      </div>
      <p
        className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
      >
        {label}
      </p>
    </div>

    <div className="flex justify-between items-center mt-3">
      <h3
        className={`text-sm font-semibold ${theme === "dark" ? "text-gray-100" : "text-gray-900"
          }`}
      >
        {amount}
      </h3>
      <p className="text-xs text-green-600 flex items-center gap-1">
        <FiTrendingUp size={14} /> 100%
      </p>
    </div>
  </div>
);

const IncomeStats = () => {
  const {
    theme,
    activePackageIncome,
    directIncome,
    directRankIncome,
    autoLevelIncome,
    rankIncome,
    totalIncome,
    loading,
    error,
  } = useProject();

  if (loading) return <p className="text-center">Loading incomes...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-2 gap-2">
      <StatCard
        icon={ImStatsBars}
        amount={`$${activePackageIncome}`}
        label="Active Package"
        color="#22c55e"
        theme={theme}
      />
      <StatCard
        icon={ImStatsDots}
        amount={`$${directIncome}`}
        label="Direct Income"
        color="#8b5cf6"
        theme={theme}
      />
      <StatCard
        icon={TfiCup}
        amount={`$${directRankIncome}`}
        label="Direct Rank Income"
        color="#ec4899"
        theme={theme}
      />
      <StatCard
        icon={BsBank}
        amount={`$${autoLevelIncome}`}
        label="Auto Level Income"
        color="#3b82f6"
        theme={theme}
      />
      <StatCard
        icon={PiMedalLight}
        amount={`$${rankIncome}`}
        label="Rank Income"
        color="#06b6d4"
        theme={theme}
      />
      <StatCard
        icon={RiMoneyDollarCircleLine}
        amount={`$${totalIncome}`}
        label="Total Income"
        color="#0ea5e9"
        theme={theme}
      />
    </div>
  );
};

export default IncomeStats;
