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
  const [totalInput, setTotalInput] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [trxAmount, setTrxAmount] = useState(0);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("info");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const totalAvailable = withdrawalIncomes.reduce(
    (sum, item) => sum + (item.balance || 0),
    0
  );

  useEffect(() => {
    const total = Object.values(inputs).reduce(
      (sum, val) => sum + Number(val || 0),
      0
    );
    setTotalInput(total);

    const afterDeduction = total - (total * deductionPercent) / 100;
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

  const handleWithdraw = () => {
    if (withdrawAmount <= 0) {
      setPopupType("error");
      setPopupMessage("Request amount must be greater than zero");
      return;
    }
    if (totalInput < 10) {
      setPopupType("error");
      setPopupMessage("Minimum withdrawal amount is $10");
      return;
    }

    // Only show confirmation modal, no toast yet
    setShowConfirmModal(true);
  };

  // Called when user clicks "Yes" in modal
  const confirmWithdraw = async () => {
    setLoading(true); // show loader
    try {
      // Build CSV string from inputs
      const amounts = withdrawalIncomes.map(item => inputs[item.label] || 0);
      const requestString = amounts.join(",");

      // Call API
      const res = await requestWithdrawal(requestString);

      if (res.success) {
        setPopupType("success");

        // ✅ Use API message directly (strip HTML <br> if needed)
        const cleanMessage = res.data?.ResponseMessage?.replace(/<\/?br\s*\/?>/gi, " ")
          || "Withdrawal successful";

        setPopupMessage(cleanMessage);

        // Reset all inputs to 0
        const resetInputs = {};
        withdrawalIncomes.forEach(item => {
          resetInputs[item.label] = 0;
        });
        setInputs(resetInputs);

        setWithdrawAmount(0);
        setTrxAmount(0);
        onClose();
      } else {
        setPopupType("error");
        setPopupMessage(res.message || "Failed to submit withdrawal");
      }
    } catch (error) {
      setPopupType("error");
      setPopupMessage("Something went wrong!");
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
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
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
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
            {/* Note */}
            <p className="text-xs text-red-500 mt-2 mb-2 text-center">
              Note: {deductionPercent}% will be deducted on every withdrawal.
            </p>
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
        </div>

        {/* Footer (Fixed Actions) */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          {/* Notes */}
          <div className="flex flex-col items-start justify-start">
            <p className="text-xs text-blue-500">*Minimum Amount ${minimumAmountNote}.</p>
            <p className="text-xs text-blue-500">*Multiple of ${withdrawalNote}.</p>
          </div>
          <button
            onClick={handleWithdraw}
            className="bg-green-800 text-white px-4 py-2 rounded-xl hover:bg-green-900 transition"
          >
            Withdrawal Money: ${totalInput || "0"}
          </button>
        </div>
      </div>

      {/* ✅ Confirmation Popup */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-80 text-center shadow-xl">
            {!loading ? (
              <>
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                  Are you sure you want to withdraw{" "}
                  <span className="font-bold text-green-600">${totalInput}</span>?
                </h2>
                <div className="flex flex-col justify-center gap-2 mt-6">
                  <button
                    onClick={confirmWithdraw}
                    className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg font-medium"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg font-medium"
                  >
                    No
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                {/* Simple loader spinner */}
                <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-700 dark:text-gray-200 font-medium">
                  Processing withdrawal...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

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
  useEffect(() => {
    if (popupMessage) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000); // auto close after 2 sec
      return () => clearTimeout(timer); // cleanup
    }
  }, [popupMessage, onClose]);

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
      </div>
    </div>
  );
};

export default Withdrawal;
