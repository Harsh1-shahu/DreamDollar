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


  // Withdrawal Variables
  const [withdrawDirectIncome, setWithdrawDirectIncome] = useState(0);
  const [withdrawDirectRankIncome, setWithdrawDirectRankIncome] = useState(0);
  const [withdrawAutoLevelIncome, setWithdrawAutoLevelIncome] = useState(0);
  const [withdrawGoldLevelIncome, setWithdrawGoldLevelIncome] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [totalWithdrawalAmount, setTotalWalletAmount] = useState(0);

  // Deduction / Conversion
  const [deductionPercent, setDeductionPercent] = useState(5);
  const [openMenu, setOpenMenu] = useState(false);
  const deduction = 1 - deductionPercent / 100;
  const conversionRate = 2.935;
  const withdrawalNote = "*Multiple of $1.";
  const minimumAmountNote = "*Minimum Amount $10.";

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

  // Fetch Dashboard Incomes Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("memb_code", "101"); // Replace dynamically
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

  //Fetch Withdrawal Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("memb_code", "101"); // Replace dynamically with logged-in user
        formData.append("type", "WithdrawalDetails");

        const res = await fetch(`${apiUrl}/Statistic/WithdrawalTable`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await res.json();

        if (result.ResponseStatus === "success" && result.Data) {
          try {
            const parsedData = JSON.parse(result.Data) || [];

            // Map wallet amounts
            const directIncome =
              parsedData.find((item) => item.WALLET === "DIRECT INCOME")?.AMT || 0;
            const directRankIncome =
              parsedData.find((item) => item.WALLET === "DIRECT RANK INCOME")?.AMT || 0;
            const autoLevelIncome =
              parsedData.find((item) => item.WALLET === "AUTO LEVEL 1 INCOME")?.AMT || 0;
            const goldLevelIncome =
              parsedData.find((item) => item.WALLET === "GOLD LEVEL INCOME")?.AMT || 0;

            // Set states
            setWithdrawDirectIncome(Number(directIncome));
            setWithdrawDirectRankIncome(Number(directRankIncome));
            setWithdrawAutoLevelIncome(Number(autoLevelIncome));
            setWithdrawGoldLevelIncome(Number(goldLevelIncome));

            // Total withdrawal amount
            const total =
              Number(directIncome) +
              Number(directRankIncome) +
              Number(autoLevelIncome) +
              Number(goldLevelIncome);

            // Store total before deduction
            setTotalWalletAmount(total);

            // Store after deduction for Withdrawal input
            const afterFee = total * deduction;
            setWithdrawAmount(afterFee.toFixed(2));

            setData(parsedData);
          } catch (parseErr) {
            console.error("Error parsing Data:", parseErr);
            setData([]);
          }
        } else {
          setError(result.ResponseMessage || "No data found");
          setData([]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || "Something went wrong");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);


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
        withdrawDirectIncome, setWithdrawDirectIncome,
        withdrawDirectRankIncome, setWithdrawDirectRankIncome,
        withdrawAutoLevelIncome, setWithdrawAutoLevelIncome,
        withdrawGoldLevelIncome, setWithdrawGoldLevelIncome,
        withdrawAmount, setWithdrawAmount,
        totalWithdrawalAmount, setTotalWalletAmount,
        deduction,
        deductionPercent,
        setDeductionPercent,
        conversionRate,
        withdrawalNote,
        minimumAmountNote,
        // Only incomeDetails
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
