"use client";
import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { useProject } from "@/app/Context/ProjectContext";

const Withdrawal = ({ onClose }) => {
  const {
    theme,
    withdrawDirectIncome,
    setWithdrawDirectIncome,
    withdrawDirectRankIncome,
    setWithdrawDirectRankIncome,
    withdrawAutoLevelIncome,
    setWithdrawAutoLevelIncome,
    withdrawGoldLevelIncome,
    setWithdrawGoldLevelIncome,
    withdrawAmount,              // after deduction
    totalWithdrawalAmount,       // before deduction
    deductionPercent,
    conversionRate,
    withdrawalNote,
    minimumAmountNote,
  } = useProject();

  const [trxAmount, setTrxAmount] = useState(0);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("info");

  // Convert withdrawal amount (after fee) to TRX
  useEffect(() => {
    setTrxAmount((withdrawAmount * conversionRate).toFixed(2));
  }, [withdrawAmount, conversionRate]);

  const handleWithdraw = () => {
    if (withdrawAmount <= 0) {
      setPopupType("error");
      setPopupMessage("Request amount must be greater than zero");
      return;
    }
    if (withdrawAmount < 10) {
      setPopupType("error");
      setPopupMessage("Minimum withdrawal amount is $10");
      return;
    }
    if (withdrawAmount > totalWithdrawalAmount) {
      setPopupType("error");
      setPopupMessage("Insufficient balance");
      return;
    }

    setPopupType("success");
    setPopupMessage("Withdrawal request submitted successfully!");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-2">
      <div
        className={`rounded-2xl shadow-lg w-full max-w-md p-6 transition-colors ${
          theme === "dark"
            ? "bg-gray-900 text-gray-100"
            : "bg-white text-gray-900"
        }`}
      >
        {/* Header */}
        <div className="relative flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Withdrawal Money</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <IoClose size={24} />
          </button>
        </div>

        {/* Income Inputs */}
        <div className="grid grid-cols-1 gap-3 mt-4">
          <IncomeBox
            label="DIRECT INCOME"
            value={withdrawDirectIncome}
            balance={withdrawDirectIncome}
            setValue={setWithdrawDirectIncome}
            theme={theme}
          />
          <IncomeBox
            label="DIRECT RANK INCOME"
            value={withdrawDirectRankIncome}
            balance={withdrawDirectRankIncome}
            setValue={setWithdrawDirectRankIncome}
            theme={theme}
          />
          <IncomeBox
            label="AUTO LEVEL 1 INCOME"
            value={withdrawAutoLevelIncome}
            balance={withdrawAutoLevelIncome}
            setValue={setWithdrawAutoLevelIncome}
            theme={theme}
          />
          <IncomeBox
            label="GOLD LEVEL INCOME"
            value={withdrawGoldLevelIncome}
            balance={withdrawGoldLevelIncome}
            setValue={setWithdrawGoldLevelIncome}
            theme={theme}
          />
        </div>

        {/* Total + Notes */}
        <div className="flex items-center justify-between mt-4 text-sm">
          <h1 className="font-semibold">TOTAL {totalWithdrawalAmount}</h1>
          <div className="text-xs text-blue-500 flex gap-3">
            <span>{minimumAmountNote}</span>
            <span>{withdrawalNote}</span>
          </div>
        </div>

        {/* Withdrawal Amount (after deduction) */}
        <div className="mt-4">
          <label className="block text-sm mb-1">Withdrawal Amount</label>
          <input
            type="number"
            value={withdrawAmount || ""}
            readOnly
            className={`w-full border rounded-full px-3 py-2 text-sm ${
              theme === "dark"
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-900"
            }`}
          />
        </div>

        {/* TRX Amount */}
        <div className="mt-3">
          <label className="block text-sm mb-1">TRX Amount</label>
          <input
            type="number"
            value={trxAmount || ""}
            readOnly
            className={`w-full border rounded-full px-3 py-2 text-sm ${
              theme === "dark"
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-900"
            }`}
          />
        </div>

        {/* Note */}
        <p className="text-xs text-red-500 mt-2">
          Note: {deductionPercent}% will be deducted on every withdrawal.
        </p>

        {/* Balance Info */}
        <div className="text-center mt-4">
          <p className="text-sm font-medium">Great! You are going to withdraw</p>
          <p className="text-3xl font-bold text-cyan-500">{totalWithdrawalAmount} USDT</p>
          <p className="text-xs text-gray-500">Withdrawal Balance</p>
        </div>

        {/* Actions */}
        <div className="flex justify-center items-center mt-6">
          <button
            onClick={handleWithdraw}
            className="bg-cyan-500 text-white px-5 py-2 rounded-full hover:bg-cyan-600 transition"
          >
            Withdrawal Money
          </button>
        </div>
      </div>

      {/* Popup */}
      {popupMessage && (
        <Popup
          theme={theme}
          popupType={popupType}
          popupMessage={popupMessage}
          onClose={() => setPopupMessage("")}
        />
      )}
    </div>
  );
};

// ✅ Editable IncomeBox
const IncomeBox = ({ label, value, setValue, theme }) => (
  <div
    className={`flex items-center justify-between px-3 py-2 rounded-xl shadow-md border ${
      theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
    }`}
  >
    <div className="flex gap-3">
      <span className="font-semibold text-sm">{label}</span>
      <span className="text-xs text-gray-500">Balance [ {value} ]</span>
    </div>
    <input
      type="number"
      value={value || ""}
      onChange={(e) => setValue(Number(e.target.value))}
      className={`w-24 px-2 py-1 rounded-lg border text-sm text-right ${
        theme === "dark"
          ? "bg-gray-900 border-gray-700 text-white"
          : "bg-white border-gray-300 text-gray-900"
      }`}
    />
  </div>
);

// Popup Component (unchanged)
const Popup = ({ theme, popupType, popupMessage, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div
      className={`relative rounded-2xl w-72 p-6 text-center shadow-2xl transition-colors
      ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"}
      ${popupType === "success" ? "border-2 border-green-500" : ""}
      ${popupType === "error" ? "border-2 border-red-500" : ""}
      ${popupType === "info" ? "border-2 border-blue-500" : ""}`}
    >
      {popupType === "success" && <p className="text-green-500 text-2xl mb-2">✅</p>}
      {popupType === "error" && <p className="text-red-500 text-2xl mb-2">❌</p>}
      {popupType === "info" && <p className="text-blue-500 text-2xl mb-2">ℹ️</p>}

      <p className="font-medium">{popupMessage}</p>
      <button
        onClick={onClose}
        className={`mt-3 px-4 py-2 rounded-lg text-white 
          ${popupType === "success" ? "bg-green-500 hover:bg-green-600" : ""}
          ${popupType === "error" ? "bg-red-500 hover:bg-red-600" : ""}
          ${popupType === "info" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
      >
        OK
      </button>
    </div>
  </div>
);

export default Withdrawal;
