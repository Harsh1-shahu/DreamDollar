"use client";
import React, { useState, useEffect } from "react";
import { BsFillCreditCard2FrontFill } from "react-icons/bs";
import { FiCopy } from "react-icons/fi";
import { useProject } from "@/app/Context/ProjectContext";
import { useRequireMemberDetails } from "@/app/hooks/useRequireMemberDetails";

import { SiEagle } from "react-icons/si";
import { MdStars } from "react-icons/md";
import { FaUnity } from "react-icons/fa6";
import { SiRuby } from "react-icons/si";
import { GiCutDiamond } from "react-icons/gi";
import { GiJusticeStar } from "react-icons/gi";
import { GiGoldBar } from "react-icons/gi";

const MyCards = () => {
  const { ready, userid, address, membCode } = useRequireMemberDetails();
  // const [userid, setUserid] = useState("");
  const base = (process.env.NEXT_PUBLIC_DREAM_DOLLAR_URL_MY_URL || "").replace(/\/+$/, "");
  const folder = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/+$/, ""); // remove trailing slash
  const referralLink = `${base}${folder}/Components/Authentication/SignUp?refId=${userid || ""}`;

  const [copied, setCopied] = useState(false);
  const { theme } = useProject();

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

  const [currentrank, setCurrentRank] = useState("Loading...");
  const [currentrcode, setCurrentRcode] = useState(0);

  const [Upgarderank, setUpgradeRank] = useState("Loading...");
  const [Upgardecode, setUpgardeRcode] = useState(0);
  const [rankUpgradeAmount, setRankUpgradeAmount] = useState(0);

  // Popup modal state
  const [showModal, setShowModal] = useState(false);

  // Toast message state
  const [toast, setToast] = useState({ message: "", type: "", visible: false });

  const showToast = (message, type = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast({ message: "", type: "", visible: false });
    }, 3000); // auto close after 3s
  };


  const Icons = [
    { code: 0, name: "Eagle", icon: <SiEagle /> },
    { code: 1, name: "Silver", icon: <MdStars /> },
    { code: 2, name: "Gold", icon: <GiGoldBar /> },
    { code: 3, name: "Platinum", icon: <GiJusticeStar /> },
    { code: 4, name: "Emerald", icon: <FaUnity /> },
    { code: 5, name: "Ruby", icon: <SiRuby /> },
    { code: 6, name: "Diamond", icon: <GiCutDiamond /> },
  ];

  // Normalize rcode coming from API into a zero-based numeric code that matches the Icons array.
  const normalizeRcode = (rcode) => {
    if (rcode === null || rcode === undefined) return null;
    const trimmed = String(rcode).trim();
    // Try numeric parse first
    const n = Number(trimmed);
    if (!Number.isNaN(n)) {
      // exact match e.g. API already gives 0..6
      if (Icons.some((i) => i.code === n)) return n;
      // handle 1-based codes from API (e.g. API returns 1..7)
      if (Icons.some((i) => i.code === n - 1)) return n - 1;
      // try as array index (safety)
      if (Icons[n]) return n;
      if (Icons[n - 1]) return n - 1;
    }
    // try name match (e.g. API returns "Eagle")
    const s = trimmed.toLowerCase();
    const found = Icons.find((i) => i.name.toLowerCase() === s);
    if (found) return found.code;
    return null;
  };

  useEffect(() => {
    fetchRankData();
  }, [apiUrl, membCode]);


  const fetchRankData = async () => {
    try {
      const formData = new FormData();
      formData.append("memb_code", membCode);
      formData.append("type", "RankDetails");

      const res = await fetch(`${apiUrl}/Statistic/RankDetails`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to fetch data");

      const result = await res.json();
      console.log("RankDetails result:", result);

      if (result.ResponseStatus === "success" && result.Data) {
        const myRank = JSON.parse(result.Data.myRank || "[]");
        const upRank = JSON.parse(result.Data.rank || "[]");

        // current rank
        const fetchedMyRank = myRank[0]?.RRANK || "No Rank";
        const fetchedMyRcode = myRank[0]?.RCODE ?? 0;

        setCurrentRank(fetchedMyRank);
        setCurrentRcode(fetchedMyRcode !== null ? Number(fetchedMyRcode) - 1 : null);

        // upgrade rank from API (not manual +1)
        const fetchedUpRank = upRank[0]?.RRANK || "Max Rank Reached";
        const fetchedUpRcode = upRank[0]?.RCODE ?? 0;
        const upgradeRankAmt = upRank[0]?.AMOUNT ?? 0;

        setRankUpgradeAmount(upgradeRankAmt);
        setUpgradeRank(fetchedUpRank);
        setUpgardeRcode(fetchedUpRcode !== null ? Number(fetchedUpRcode) - 1 : null);
      }
    } catch (err) {
      console.error("Error fetching rank:", err);
      setCurrentRank("Error");
      setUpgradeRank("Error");
    }
  };


  const currentIcon =
    currentrcode !== null ? Icons[currentrcode]?.icon || null : null;

  const upgradeIcon =
    Upgardecode !== null ? Icons[Upgardecode]?.icon || null : null;

  const handleUpgradeClick = () => {
    setShowModal(true);
  };

  // const confirmUpgrade = () => {
  //   setShowModal(false);
  //   alert(`✅ You confirmed upgrade to ${Upgarderank}`);
  //   // TODO: Call your upgrade API here
  // };

  ///////////////////////////////////////////////////////////////////////////////
  // ---- state you already have ----
  // const [showaModal, setShowModal] = useState(false);
  const [myaddress, setMyAddress] = useState("");
  const [errors, setErrors] = useState({ address: "" });
  const [isProcessing, setIsProcessing] = useState(false);


  const ensureTronConnected = async () => {
    if (typeof window === "undefined") return "";

    // Prefer tronLink.request when possible
    if (window.tronLink && !window.tronWeb?.defaultAddress?.base58) {
      try {
        await window.tronLink.request({ method: "tron_requestAccounts" });
      } catch {
        showToast("Wallet connection was denied or locked.");
        return "";
      }
    }

    // read address
    const base58 = window.tronWeb?.defaultAddress?.base58 || "";
    const hex = window.tronWeb?.defaultAddress?.hex || "";

    if (base58) return base58;
    if (hex && window.tronWeb?.address) {
      try {
        return window.tronWeb.address.fromHex(hex);
      } catch { }
    }
    return "";
  };

  const connectTronLink = async () => {
    if (typeof window === "undefined" || !window.tronLink) {
      showToast("TronLink Pro not detected. Please install/enable the extension.");
      return;
    }
    try {
      await window.tronLink.request({ method: "tron_requestAccounts" });
      const addr = await ensureTronConnected();
      if (addr) {
        setMyAddress(addr);
        setErrors((p) => ({ ...p, address: "" }));
      } else {
        setErrors((p) => ({ ...p, address: "Failed to read wallet address." }));
      }
    } catch {
      // user canceled / locked
    }
  };

  const confirmUpgrade = async () => {
    setIsProcessing(true);
    setShowModal(false);

    if (typeof window === "undefined" || !window.tronLink) {
      showToast("TronLink Pro not detected. Please install/enable the extension.");
      setIsProcessing(false);
      return;
    }

    let addr = myaddress;
    if (!addr) {
      await connectTronLink();
      addr = window.tronWeb?.defaultAddress?.base58 || "";
    }
    if (!addr) {
      showToast("Unable to connect wallet.");
      setIsProcessing(false);
      return;
    }

    // Make sure the connected wallet matches the expected address
    // if (addr !== address) {
    //   alert("Please connect valid address.");
    // setIsProcessing(false);
    //   return;
    // }

    if (!rankUpgradeAmount || Number(rankUpgradeAmount) <= 0) {
      showToast("Enter a valid upgrade amount.");
      setIsProcessing(false);
      return;
    }
    console.log("Upgrading to:", { membCode, addr, rankUpgradeAmount });

    try {
      const formData = new FormData();
      formData.append("USD", rankUpgradeAmount);
      formData.append("memb_code", membCode);
      formData.append("address", addr || "");
      formData.append("api", "Yes");
      formData.append("type", "Rank");

      debugger;
      console.log("Register formData:");
      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });

      const response = await fetch(`${apiUrl}/Contract/checkDetailsAPI`, {
        method: "POST",
        body: formData,
      });


      const data = await response.json();
      console.log("Check response:", data);

      if (response.ok && (data.ResponseStatus === "success" || data.ResponseCode === 101)) {
        // EXPECTED: data.Data => { CoinAmt, Address, ReqId, ... }
        const coinAmt = data?.Data?.CoinAmt;     // amount to pay
        const toAddr = data?.Data?.Address;     // recipient
        const reqId = data?.Data?.ReqId;       // request id to save with tx
        if (!coinAmt || !toAddr) {
          showToast("Server did not return payment details.");
          setIsProcessing(false);
          return;
        }

        if (!window.tronWeb) {
          showToast("tronWeb not available from wallet.");
          setIsProcessing(false);
          return;
        }
        debugger;
        // 2) Make TRX transaction
        // NOTE: Assuming CoinAmt is in TRX (NOT Sun). If your backend already sends Sun, skip the toSun().
        const amountSun = window.tronWeb.toSun(coinAmt);
        const sendRes = await window.tronWeb.trx.sendTransaction(toAddr, amountSun);
        console.log("sendTransaction result:", sendRes);
        const sendResStr = JSON.stringify(sendRes);
        debugger;

        if (!sendRes?.txid) {
          showToast("Failed to broadcast TRX transaction.");
          setIsProcessing(false);
          return;
        }
        const txid = sendRes.txid;

        if (txid.length >= 50) {
          const formDataTrx = new FormData();
          formDataTrx.append("response", sendResStr || "");
          formDataTrx.append("trxId", txid || "");
          formDataTrx.append("addressFrom", addr || "");
          formDataTrx.append("ReqId", reqId || "");

          console.log("Register formData:");
          formDataTrx.forEach((value, key) => {
            console.log(`${key}: ${value}`);
          });
          debugger;

          const responseTrx = await fetch(`${apiUrl}/Contract/trxIdAddSaveAPI`, {
            method: "POST",
            body: formDataTrx,
          });

          const dataTrx = await responseTrx.json();
          console.log("login raw", dataTrx); // ⚠️ this still logs old `data`, not `dataTrx`
          debugger;
          if (responseTrx.ok && (dataTrx.ResponseStatus === "success" || dataTrx.ResponseCode === 101)) {
            const memNew = "🎉 Your " + Upgarderank + " Rank upgrade of $" + rankUpgradeAmount + " has been processed successfully! Please allow a few minutes for the changes to reflect in your account.";

            showToast(memNew); // ⚠️ here too, should be dataTrx
            setIsProcessing(false);
            setShowModal(false);
            fetchRankData();
          } else {
            showToast(dataTrx.ResponseMessage); // ⚠️ here too, should be dataTrx
            setIsProcessing(false);
          }

        } else {
          showToast("Upgrade check failed."); // ⚠️ same issue
          setIsProcessing(false);
          return;
        }

      } else {
        showToast(data?.message || "Upgrade check failed.");
        setIsProcessing(false);
        return;
      }

    } catch (err) {
      console.error(err);
      showToast("Something went wrong while processing the upgrade.");
      setIsProcessing(false);
    }
  };


  const cancelUpgrade = () => {
    setShowModal(false);
  };

  if (!ready) {
    return <div className="p-4 text-sm text-gray-500">Checking session…</div>;
  }

  return (
    <div
      className={`p-4 rounded-xl shadow transition-colors duration-300 ${theme === "dark"
        ? "bg-gray-800"
        : "bg-white"
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
        {/* Top Row: Rank + Icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start gap-2">
            {currentIcon && <div className="text-2xl md:text-3xl">{currentIcon}</div>}
            <p className="text-lg Md:text-2xl font-bold tracking-widest">
              {currentrank}
            </p>
          </div>

          {/* ✅ Show Upgrade Button only if a valid upgrade rank exists */}
          {Upgarderank &&
            Upgarderank !== "Max Rank Reached" &&
            Upgarderank !== "Error" && (
              <button
                onClick={handleUpgradeClick}
                className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 
                   hover:from-yellow-600 hover:via-yellow-700 hover:to-yellow-800 
                   text-white font-semibold rounded-xl p-2 transition flex items-center gap-2">
                Upgrade to {Upgarderank}
              </button>
            )}
        </div>

        {/* Card Number (TRX Address) */}
        <div className="mt-8">
          <p className="text-xs uppercase tracking-wide">TRX Address</p>
          <p className="mt-2 text-[3vw] sm:text-sm md:text-lg font-mono md:tracking-wider bg-black/30 px-3 py-2 rounded-lg">
            {address}
          </p>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide">User ID</p>
            <p className="text-md font-bold">{userid}</p>
          </div>
          <div className="text-right">
            <img src="/logo.png"
              className="w-10 h-10" />
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

      {/* Popup Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-80 text-center shadow-xl">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
              Are you sure you want to upgrade to{" "}
              <span className="font-bold text-yellow-600">{Upgarderank}</span> of $
              {rankUpgradeAmount}?
            </h2>

            {/* Buttons hidden while processing */}
            {!isProcessing ? (
              <div className="flex flex-col justify-center gap-2 mt-6">
                <button
                  onClick={confirmUpgrade}
                  className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg font-medium"
                >
                  Yes
                </button>
                <button
                  onClick={cancelUpgrade}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg font-medium"
                >
                  No
                </button>
              </div>
            ) : (
              <div className="mt-6 flex flex-col items-center gap-3">
                {/* Simple loader (Tailwind) */}
                <div className="w-8 h-8 rounded-full border-4 border-gray-300 border-t-gray-600 animate-spin" />
                <p className="text-sm text-gray-600 dark:text-gray-300">Processing…</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ✅ Toast Notification goes here */}
      {toast.visible && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 px-4 py-3 text-center rounded-lg shadow-lg text-white text-sm z-[9999]
          ${toast.type === "success"
              ? "bg-green-600"
              : toast.type === "error"
                ? "bg-red-600"
                : "bg-gray-600"
            }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default MyCards;
