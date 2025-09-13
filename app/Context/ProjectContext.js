"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useTheme } from "next-themes";

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const apiUrl = process.env.NEXT_PUBLIC_DREAM_DOLLAR_URL;


  // Incomes Variables
  const [activePackageIncome, setActivePackageIncome] = useState(0);
  const [directIncome, setDirectIncome] = useState(0);
  const [directRankIncome, setDirectRankIncome] = useState(0);
  const [autoLevelIncome, setAutoLevelIncome] = useState(0);
  const [rankIncome, setRankIncome] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);

  // Withdrawal (dynamic incomes)
  const [withdrawalIncomes, setWithdrawalIncomes] = useState([]); // ✅ dynamic array
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [totalWithdrawalAmount, setTotalWalletAmount] = useState(0);
  const [amount, setAmount] = useState(""); // user input

  const [openMenu, setOpenMenu] = useState(false);
  // Deduction / Conversion
  const [deductionPercent, setDeductionPercent] = useState(5);
  const deduction = 1 - deductionPercent / 100;
  const conversionRate = 2.935;
  const withdrawalNote = "*Multiple of $1.";
  const minimumAmountNote = "*Minimum Amount $10.";

  // Theme
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // API
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Helpers
  const getMembCode = () => {
    try {
      const raw = localStorage.getItem("user");
      const u = raw ? JSON.parse(raw) : null;
      return u?.MEMB_CODE || 0;
    } catch {
      return 0;
    }
  };

  const getAddress = () => {
    try {
      const raw = localStorage.getItem("user");
      const u = raw ? JSON.parse(raw) : null;
      return u?.BTC_ADD || "";
    } catch {
      return "";
    }
  };

  const getUserId = () => {
    try {
      const raw = localStorage.getItem("user");
      const u = raw ? JSON.parse(raw) : null;
      return u?.USERNAME || "";
    } catch {
      return "";
    }
  };

  // Ensure theme is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Fetch Dashboard Data (Dynamic)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const memb_code = getMembCode();
        const formData = new FormData();
        formData.append("memb_code", "101");
        formData.append("type", "DashboardDetails");

        const res = await fetch(`${apiUrl}/Statistic/DashboardDetails`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Failed to fetch data");

        const result = await res.json();

        if (result.ResponseStatus === "success" && result.Data) {
          try {
            // ✅ Parse incomeDetails
            const incomeDetails = result.Data.incomeDetails
              ? JSON.parse(result.Data.incomeDetails)[0]
              : {};

            // ✅ Extract marqueStringRank (it's plain string, no need to parse)
            const marqueRank = result.Data.marqueStringRank || "";

            // ✅ Now set incomes
            setActivePackageIncome(incomeDetails.PKG_AMT || 0);
            setDirectIncome(incomeDetails.DIRECT || 0);
            setDirectRankIncome(incomeDetails.DIRECT_RANK || 0);
            setAutoLevelIncome(incomeDetails.LEVEL_POOL || 0);
            setRankIncome(incomeDetails.RANK_INCOME || 0);
            setTotalIncome(incomeDetails.TOTAL_INCOME || 0);
            setWithdrawAmount();

            // save both for components
            setData({
              incomeDetails,
              marqueRank,
            });
          } catch (e) {
            console.error("Error parsing incomeDetails:", e);
            setData({});
          }
        } else {
          setError(result.ResponseMessage || "No data found");
        }


      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (apiUrl) fetchData();
  }, [apiUrl]);


  // ✅ Fetch Withdrawal Data (Dynamic)
  useEffect(() => {
    const fetchWithdrawalData = async () => {
      try {
        setLoading(true);
        setError("");

        const memb_code = getMembCode();
        const formData = new FormData();
        formData.append("memb_code", "101");
        formData.append("type", "WithdrawalDetails");

        const res = await fetch(`${apiUrl}/Statistic/WithdrawalTable`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Failed to fetch data");

        const result = await res.json();

        if (result.ResponseStatus === "success" && result.Data) {
          try {
            const parsedData = JSON.parse(result.Data) || [];

            const incomes = parsedData.map((item) => ({
              label: item.WALLET,
              balance: Number(item.AMT) || 0,
            }));

            setWithdrawalIncomes(incomes);

            const total = incomes.reduce((sum, i) => sum + i.balance, 0);
            setTotalWalletAmount(total);

            const afterFee = total - (total * deduction) / 100;
            setWithdrawAmount(afterFee.toFixed(2));
          } catch (parseErr) {
            console.error("Error parsing Data:", parseErr);
            setWithdrawalIncomes([]);
          }
        } else {
          setError(result.ResponseMessage || "No data found");
          setWithdrawalIncomes([]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || "Something went wrong");
        setWithdrawalIncomes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawalData();
  }, [apiUrl, deduction]);

  // ✅ Request Withdrawal
  const requestWithdrawal = async (amount) => {
    try {
      setLoading(true);
      setError("");

      const memb_code = getMembCode();
      const cleanAmount = amount ? amount.toString().replace(/,/g, "") : "0";

      const formData = new FormData();
      formData.append("memb_code", "101");
      formData.append("type", "WithdrawalMember");
      formData.append("txtrequestamt", cleanAmount);

      const res = await fetch(`${apiUrl}/Statistic/WithdrawalMember`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to request withdrawal");

      const result = await res.json();

      if (result.ResponseStatus === "success") {
        const parsedData = result.Data ? JSON.parse(result.Data) : [];
        return { success: true, data: parsedData };
      } else {
        return { success: false, message: result.Message || "Withdrawal failed" };
      }
    } catch (err) {
      console.error("Withdrawal Error:", err);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  if (!mounted) return null;

  return (
    <ProjectContext.Provider
      value={{
        theme,
        toggleTheme,
        openMenu, setOpenMenu,
        //incomes variables
        activePackageIncome, setActivePackageIncome,
        directIncome, setDirectIncome,
        directRankIncome, setDirectRankIncome,
        autoLevelIncome, setAutoLevelIncome,
        rankIncome, setRankIncome,
        totalIncome, setTotalIncome,
        // Withdrawal (dynamic)
        withdrawalIncomes,
        withdrawAmount,
        totalWithdrawalAmount,
        amount,
        setAmount,
        // General settings
        deduction,
        deductionPercent,
        setDeductionPercent,
        conversionRate,
        withdrawalNote,
        minimumAmountNote,
        requestWithdrawal,
        getMembCode,
        getAddress,
        getUserId,
        // API state
        data,
        loading,
        error,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);
