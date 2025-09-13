"use client";
import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { useProject } from "@/app/Context/ProjectContext";

const Withdrawal = ({ onClose }) => {
  const {
    theme,
    withdrawalIncomes,
    deductionPercent,
    conversionRate,
    withdrawalNote,
    minimumAmountNote,
    requestWithdrawal,
  } = useProject();

  const [inputs, setInputs] = useState({});
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [trxAmount, setTrxAmount] = useState(0);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("info");

  const totalAvailable = withdrawalIncomes.reduce(
    (sum, item) => sum + (item.balance || 0),
    0
  );

  useEffect(() => {
    const totalInput = Object.values(inputs).reduce(
      (sum, val) => sum + Number(val || 0),
      0
    );
    const afterDeduction = totalInput - (totalInput * deductionPercent) / 100;
    setWithdrawAmount(afterDeduction);
    setTrxAmount((afterDeduction * conversionRate).toFixed(2));
  }, [inputs, deductionPercent, conversionRate]);

  const handleChange = (label, value, max) => {
    let val = Number(value);
    if (val < 0) val = 0;
    if (val > max) val = max;
    setInputs((prev) => ({
      ...prev,
      [label]: val,
    }));
  };

  const handleWithdraw = async () => {
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
    const res = await requestWithdrawal(withdrawAmount);
    if (res.success) {
      setPopupType("success");
      setPopupMessage("Withdrawal request submitted successfully!");
      setInputs({});
      setWithdrawAmount(0);
      setTrxAmount(0);
    } else {
      setPopupType("error");
      setPopupMessage(res.message || "Failed to submit withdrawal");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-2">
      <div
        className={`rounded-2xl shadow-lg w-full max-w-md flex flex-col transition-colors ${theme === "dark"
            ? "bg-gray-900 text-gray-100"
            : "bg-white text-gray-900"
          }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Withdrawal Money</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <IoClose size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {/* Total Balance */}
          <div
            className={`rounded-2xl py-2 text-center shadow-lg mb-6 border ${theme === "dark"
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

          {/* Dynamic Income Inputs */}
          <div className="grid grid-cols-1 gap-3">
            {withdrawalIncomes.map((item, idx) => (
              <IncomeBox
                key={`${item.label}-${idx}`}
                label={item.label}
                balance={item.balance}
                value={inputs[item.label] || ""}
                onChange={(val) => handleChange(item.label, val, item.balance)}
                theme={theme}
              />
            ))}
          </div>

          {/* Withdrawal Amount */}
          <div className="mt-4">
            <label className="block text-sm mb-1">
              Withdrawal Amount (After Deduction)
            </label>
            <input
              type="number"
              value={withdrawAmount || ""}
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
              type="number"
              value={trxAmount || ""}
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
            <p className="text-xs text-blue-500">{minimumAmountNote}</p>|
            <p className="text-xs text-blue-500">{withdrawalNote}</p>
          </div>
        </div>

        {/* Footer (Fixed Actions) */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-center">
          <button
            onClick={handleWithdraw}
            className="bg-green-800 text-white px-4 py-2 rounded-xl hover:bg-green-900 transition"
          >
            Withdraw Money
          </button>
        </div>
      </div>

      {/* Toast */}
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

// ✅ IncomeBox
const IncomeBox = ({ label, balance, value, onChange, theme }) => (
  <div
    className={`flex items-center justify-between px-3 py-2 rounded-xl shadow-md border ${theme === "dark"
        ? "bg-gray-800 border-gray-700"
        : "bg-gray-50 border-gray-200"
      }`}
  >
    <div className="flex flex-col">
      <span className="font-semibold text-sm">{label}</span>
      <span className="text-xs ">Balance [ {balance} ]</span>
    </div>
    <input
      type="number"
      value={value}
      min="0"
      max={balance}
      onChange={(e) => onChange(e.target.value)}
      className={`w-24 px-2 py-1 rounded-lg border text-sm text-right ${theme === "dark"
          ? "bg-gray-900 border-gray-700 text-white"
          : "bg-white border-gray-300 text-gray-900"
        }`}
    />
  </div>
);

// ✅ Toast
const Toast = ({ theme, popupType, popupMessage, onClose }) => {
  if (!popupMessage) return null;
  return (
    <div className="fixed top-2 right-0 md:right-1/3 z-50 animate-slide-in p-4">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border-l-4 transition
        ${theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-white text-gray-900"}
        ${popupType === "success" ? "border-green-500" : ""}
        ${popupType === "error" ? "border-red-500" : ""}
        ${popupType === "info" ? "border-blue-500" : ""}`}
      >
        {popupType === "success" && (
          <span className="text-green-500 text-xl">✅</span>
        )}
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
