"use client";
import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { useProject } from "@/app/Context/ProjectContext";

const Withdrawal = ({ onClose }) => {
  const {
    theme,
    withdrawDirectIncome,
    withdrawDirectRankIncome,
    withdrawAutoLevelIncome,
    withdrawGoldLevelIncome,
    deductionPercent, // 5
    deduction,        // 0.95
    conversionRate,   // 2.935
    withdrawalNote,
    minimumAmountNote,
    requestWithdrawal,
  } = useProject();

  // Local states
  const [directInput, setDirectInput] = useState("");
  const [rankInput, setRankInput] = useState("");
  const [autoInput, setAutoInput] = useState("");
  const [goldInput, setGoldInput] = useState("");
  const [total, setTotal] = useState("0.00");
  const [withdrawAmount, setWithdrawAmount] = useState("0.00");
  const [trxAmount, setTrxAmount] = useState("0.00");
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("info");

  // ✅ Total Available Balance
  const totalAvailable =
    Number(withdrawDirectIncome || 0) +
    Number(withdrawDirectRankIncome || 0) +
    Number(withdrawAutoLevelIncome || 0) +
    Number(withdrawGoldLevelIncome || 0);

  // Calculate withdraw amount (after deduction) whenever inputs change
  useEffect(() => {
    const totalVal =
      Number(directInput || 0) +
      Number(rankInput || 0) +
      Number(autoInput || 0) +
      Number(goldInput || 0);

    setTotal(totalVal.toFixed(2));

    // ✅ Apply deduction
    const afterDeduction = totalVal * deduction;

    // ✅ Round withdrawal first
    const withdrawFormatted = afterDeduction.toFixed(2);
    setWithdrawAmount(withdrawFormatted);

    // ✅ Use rounded withdrawal for TRX calculation
    const trx = parseFloat(withdrawFormatted) * conversionRate;
    const trxFormatted = trx.toFixed(2);
    setTrxAmount(trxFormatted);
  }, [directInput, rankInput, autoInput, goldInput, deduction, conversionRate]);

  // Withdrawal Submit
  const handleWithdraw = async () => {
    const direct = Number(directInput) || 0;
    const rank = Number(rankInput) || 0;
    const auto = Number(autoInput) || 0;
    const gold = Number(goldInput) || 0;

    const totalAmount = direct + rank + auto + gold;

    const afterDeduction = totalAmount * deduction;

    // ✅ Round withdrawal first
    const withdrawAmount = afterDeduction.toFixed(2);

    // ✅ Use rounded withdrawal for TRX calculation
    const trxAmount = (parseFloat(withdrawAmount) * conversionRate).toFixed(2);

    if (totalAmount <= 0) {
      setPopupType("error");
      setPopupMessage("Withdrawal amount must be greater than zero");
      return;
    }

    if (totalAmount < 10) {
      setPopupType("error");
      setPopupMessage("Minimum withdrawal amount is $10");
      return;
    }

    if (direct > withdrawDirectIncome) {
      setPopupType("error");
      setPopupMessage(`Direct wallet has only $${withdrawDirectIncome}`);
      return;
    }

    if (rank > withdrawDirectRankIncome) {
      setPopupType("error");
      setPopupMessage(`Rank wallet has only $${withdrawDirectRankIncome}`);
      return;
    }

    if (auto > withdrawAutoLevelIncome) {
      setPopupType("error");
      setPopupMessage(`Auto-level wallet has only $${withdrawAutoLevelIncome}`);
      return;
    }

    if (gold > withdrawGoldLevelIncome) {
      setPopupType("error");
      setPopupMessage(`Gold wallet has only $${withdrawGoldLevelIncome}`);
      return;
    }

    try {
      const res = await requestWithdrawal(direct, rank, auto, gold);

      if (res.success) {
        setPopupType("success");
        setPopupMessage(
          `Withdrawal request submitted successfully! You will receive $${withdrawAmount} (≈ ${trxAmount} TRX) after deduction.`
        );

        setDirectInput("");
        setRankInput("");
        setAutoInput("");
        setGoldInput("");
        setWithdrawAmount("0.00");
        setTrxAmount("0.00");
        setTotal("0.00");
      } else {
        setPopupType("error");
        setPopupMessage(res.message || "Failed to submit withdrawal");
      }
    } catch (err) {
      setPopupType("error");
      setPopupMessage("Something went wrong. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-2">
      <div
        className={`rounded-2xl shadow-lg w-full max-w-md p-6 transition-colors ${theme === "dark"
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

        {/* ✅ Total Available Balance */}
        <div
          className={`rounded-2xl py-2 text-center shadow-lg mb-6 border
            ${theme === "dark"
              ? "bg-gray-800 border-gray-700 text-cyan-400"
              : "bg-white border-gray-200 text-cyan-700"
            }`}
        >
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Available Balance
          </p>
          <p className="text-2xl font-extrabold mt-1">${totalAvailable}</p>
          <p className="text-xs mt-1 text-green-500/70">
            Funds available for withdrawal
          </p>
        </div>

        {/* Income Inputs */}
        <div className="grid grid-cols-1 gap-3 mt-4">
          <IncomeBox
            label="DIRECT INCOME"
            balance={withdrawDirectIncome}
            value={directInput}
            setValue={setDirectInput}
            theme={theme}
          />
          <IncomeBox
            label="DIRECT RANK INCOME"
            balance={withdrawDirectRankIncome}
            value={rankInput}
            setValue={setRankInput}
            theme={theme}
          />
          <IncomeBox
            label="AUTO LEVEL 1 INCOME"
            balance={withdrawAutoLevelIncome}
            value={autoInput}
            setValue={setAutoInput}
            theme={theme}
          />
          <IncomeBox
            label="GOLD LEVEL INCOME"
            balance={withdrawGoldLevelIncome}
            value={goldInput}
            setValue={setGoldInput}
            theme={theme}
          />
        </div>

        {/* ✅ Show Total Entered */}
        <div className="mt-2 text-center">
          <h1 className="text-base font-semibold">Total Entered: ${total}</h1>
        </div>

        {/* Withdrawal Amount (after deduction) */}
        <div className="mt-4">
          <label className="block text-sm mb-1">Withdrawal Amount (After Deduction)</label>
          <input
            type="text"
            value={withdrawAmount}
            readOnly
            className={`w-full border rounded-full px-3 py-2 text-sm ${theme === "dark"
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-900"
              }`}
          />
        </div>

        {/* TRX Amount */}
        <div className="mt-3">
          <label className="block text-sm mb-1">TRX Amount</label>
          <input
            type="text"
            value={trxAmount}
            readOnly
            className={`w-full border rounded-full px-3 py-2 text-sm ${theme === "dark"
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-900"
              }`}
          />
        </div>

        {/* Notes */}
        <p className="text-xs text-red-500 mt-2">
          Note: {deductionPercent}% will be deducted on every withdrawal.
        </p>
        <div className="flex items-center gap-4 mt-1">
          <p className="text-xs text-blue-500">{minimumAmountNote}</p> |{" "}
          <p className="text-xs text-blue-500">{withdrawalNote}</p>
        </div>

        {/* Actions */}
        <div className="flex justify-center items-center mt-4">
          <button
            onClick={handleWithdraw}
            className="bg-green-800 text-white px-4 py-2 rounded-xl hover:bg-green-900 transition"
          >
            Withdraw Money
          </button>
        </div>
      </div>

      {/* Popup */}
      {popupMessage && (
        <Toast
          theme={theme}
          popupType={popupType}
          popupMessage={popupMessage}
          onClose={() => setPopupMessage("")}
        />
      )}
    </div>
  );
};

// ✅ IncomeBox (with validation)
const IncomeBox = ({ label, balance, value, setValue, theme }) => (
  <div
    className={`flex items-center justify-between px-3 py-2 rounded-xl shadow-md border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
      }`}
  >
    <div className="flex flex-col">
      <span className="font-semibold text-sm">{label}</span>
      <span className="text-xs">Balance [ {balance} ]</span>
    </div>
    <input
      type="number"
      value={value}
      min="0"
      max={balance}
      onChange={(e) => {
        let val = Number(e.target.value);
        if (val < 0) val = 0;
        if (val > balance) val = balance;
        setValue(val);
      }}
      className={`w-24 px-2 py-1 rounded-lg border text-sm text-right ${theme === "dark"
          ? "bg-gray-900 border-gray-700 text-white"
          : "bg-white border-gray-300 text-gray-900"
        }`}
    />
  </div>
);

// ✅ Toast Component
const Toast = ({ theme, popupType, popupMessage, onClose }) => {
  if (!popupMessage) return null;

  return (
    <div className="fixed top-2 right-0 md:right-1/3 z-50 animate-slide-in p-4">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border-l-3 border-r-3 transition
          ${theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-white text-gray-900"}
          ${popupType === "success" ? "border-green-500" : ""}
          ${popupType === "error" ? "border-red-500" : ""}
          ${popupType === "info" ? "border-blue-500" : ""}`}
      >
        {popupType === "success" && <span className="text-green-500 text-xl">✅</span>}
        {popupType === "error" && <span className="text-red-500 text-xl">❌</span>}
        {popupType === "info" && <span className="text-blue-500 text-xl">ℹ️</span>}

        <p className="text-sm font-medium">{popupMessage}</p>

        <button
          onClick={onClose}
          className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✖
        </button>
      </div>
    </div>
  );
};    

export default Withdrawal;
