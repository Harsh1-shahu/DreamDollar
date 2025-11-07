"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRequireMemberDetails } from "../hooks/useRequireMemberDetails";

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const { membCode } = useRequireMemberDetails();
  const apiUrl = process.env.NEXT_PUBLIC_DREAM_DOLLAR_URL;

  // Incomes Variables
  const [activePackageIncome, setActivePackageIncome] = useState(0);
  const [directIncome, setDirectIncome] = useState(0);
  const [directRankIncome, setDirectRankIncome] = useState(0);
  const [autoLevelIncome, setAutoLevelIncome] = useState(0);
  const [rankIncome, setRankIncome] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [conversionRate, setconversionRate] = useState(0);
  const [withdrawalNote, setWithdrawalNote] = useState(1);
  const [minimumAmountNote, setMinimumAmountNote] = useState(10);

  // Withdrawal Variables
  const [withdrawalIncomes, setWithdrawalIncomes] = useState([]); // ✅ dynamic array
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [totalWithdrawalAmount, setTotalWithdrawalAmount] = useState(0);
  //Withdrawal User Inputs Amount 
  const [amount, setAmount] = useState("");

  // Deduction / Conversion
  const [deductionPercent, setDeductionPercent] = useState(5);
  const [openMenu, setOpenMenu] = useState(false);
  const deduction = 1 - deductionPercent / 100;
  // const conversionRate = 2.935;
  // const withdrawalNote = "1";
  // const minimumAmountNote = "10";

  // Theme
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // API data
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Ensure theme is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch Dashboard Incomes Data....................
  useEffect(() => {
    if (membCode > 0) {
      fetchDashboardData();
      getCoinRate('TRX');
      fetchSetting("WITHDRAWL_MINAMT").then(setMinimumAmountNote);
      fetchSetting("WITHDRAWL_MULTIPLEAMT").then(setWithdrawalNote);
    }
  }, [apiUrl, membCode]);

  //Fetch Withdrawal Data......................
  useEffect(() => {
    if (membCode > 0) {
      fetchWithdrawalData();
    }
  }, [apiUrl, deduction, membCode]);


  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("memb_code", membCode); // Replace dynamically
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


  const fetchWithdrawalData = async () => {
    try {
      getCoinRate('TRX');
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("memb_code", membCode);

      console.log("WithdrawalTable formData:");
      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });
      const res = await fetch(`${apiUrl}/Statistic/WithdrawalTable`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to fetch data");

      const result = await res.json();
      console.log("Withdrawal Table Result:", result);

      if (result.ResponseStatus === "success" && result.Data) {
        try {
          const parsedData = JSON.parse(result.Data) || [];

          const incomes = parsedData.map((item) => ({
            label: item.WALLET,
            balance: Number(item.AMT) || 0,
          }));

          setWithdrawalIncomes(incomes);

          const total = incomes.reduce((sum, i) => sum + i.balance, 0);
          setTotalWithdrawalAmount(total);

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

  //Fetch Withdrawal User Data......................
  const requestWithdrawal = async (amount) => {
    try {
      setLoading(true);
      setError("");
      console.log("Requesting withdrawal for amount:", amount);

      const cleanAmount = amount;

      const formData = new FormData();
      formData.append("memb_code", membCode); // Replace dynamically
      formData.append("type", "WithdrawalMember");
      formData.append("txtrequestamt", cleanAmount);

      console.log("WithdrawalMember formData:");
      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });
      const res = await fetch(`${apiUrl}/Statistic/WithdrawalMember`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to request withdrawal");

      const result = await res.json();
      console.log("Withdrawal Result:", result);

      if (result.ResponseStatus === "success" || result.ResponseCode === 101) {
        // const parsedData = result.Data ? JSON.parse(result.Data) : [];
        // return { success: true, data: parsedData };
        fetchWithdrawalData(); // Refresh withdrawal data
        return { success: true, message: result.ResponseMessage || "Withdrawal Success" };
      } else {
        return { success: false, message: result.ResponseMessage || "Withdrawal failed" };
      }
    } catch (err) {
      console.error("Withdrawal Error:", err);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getCoinRate = async (coin) => {
    try {
      console.log("Coin Rate Coin:", coin);
      const formData = new FormData();
      formData.append("coin", coin);

      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });
      const res = await fetch(`${apiUrl}/Statistic/CoinRate`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to request withdrawal");

      const result = await res.json();
      console.log("coin rate:", result);

      if (result.ResponseStatus === "success" || result.ResponseCode === 101) {
        const rate = parseFloat(result.Data);
        setconversionRate(rate);
      } else {
        setconversionRate(0);
      }
    } catch (err) {
      console.error("Coin Rate Error:", err);
      setconversionRate(0);
    } finally {
    }
  };

  // useEffect(() => {
  //   fetchSetting("WITHDRAWL_MINAMT").then(setMinimumAmountNote);
  //   fetchSetting("WITHDRAWL_MULTIPLEAMT").then(setWithdrawalNote);
  // }, []);

  const fetchSetting = (type) => {
    const formData = new FormData();
    formData.append("type", type);

    return fetch(`${apiUrl}/Statistic/setting`, {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to request setting");
        return res.json();
      })
      .then((result) => {
        if (result.ResponseStatus === "success" || result.ResponseCode === 101) {
          console.log('my data from WITHDRAWL_MINAMT', result);
          console.log('my data from WITHDRAWL_MINAMT', result.Data.val);

          // If you need number: return parseFloat(result.Data) || 0;
          return result.Data.val ?? 0;
        }
        return 0;
      })
      .catch((err) => {
        console.error("Setting Error:", err);
        return 0;
      });
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
        //withdrawal virables
        withdrawalIncomes,
        withdrawAmount, totalWithdrawalAmount,
        amount, setAmount,
        deduction,
        deductionPercent, setDeductionPercent,
        conversionRate,
        withdrawalNote,
        minimumAmountNote,
        requestWithdrawal,
        // Only incomeDetails
        data,
        loading,
        error,
        getCoinRate,
      }}
    >
      {children}
    </ProjectContext.Provider>

  );
};

export const useProject = () => useContext(ProjectContext);
