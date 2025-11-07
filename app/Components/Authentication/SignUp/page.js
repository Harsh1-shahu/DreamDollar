"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";

export default function SignUp() {
    const router = useRouter();
    const params = useParams(); // { refId?: string }
    const searchParams = useSearchParams();
    const usernameFromQSHandledRef = useRef(false);

    const apiUrl = process.env.NEXT_PUBLIC_DREAM_DOLLAR_URL;

    // Form state
    const [Id, setId] = useState("");
    const [response, setResponse] = useState("");
    const [errors, setErrors] = useState({}); // { Id?, address?, terms? }
    const [loading, setLoading] = useState(false);
    const [btnloading, setBtnLoading] = useState(false);
    const [verified, setVerified] = useState(null); // null = not checked, true/false

    // TronLink / wallet state
    const [address, setAddress] = useState("");
    const [connecting, setConnecting] = useState(false);

    // Terms & Conditions
    const [termsAccepted, setTermsAccepted] = useState(false);

    // --- Toast state ---
    // --- Toast state ---
    const [toast, setToast] = useState({
        message: "",
        type: "success", // "success" | "error"
        actionLabel: "", // e.g. "OK"
        onAction: null,  // () => void
        autoCloseMs: 3000,
    });

    const showToast = (message, type = "success", options = {}) => {
        const { actionLabel = "", onAction = null, autoCloseMs = 3000 } = options;
        setToast({ message, type, actionLabel, onAction, autoCloseMs });

        // only auto-close if no action button is shown
        if (!actionLabel && autoCloseMs > 0) {
            setTimeout(() => {
                setToast((t) => ({ ...t, message: "", actionLabel: "", onAction: null }));
            }, autoCloseMs);
        }
    };

    const closeToast = () => {
        setToast((t) => ({ ...t, message: "", actionLabel: "", onAction: null }));
    };


    // --- Helpers (no TS casts) ---
    const getTronAddress = () => {
        const base58 =
            typeof window !== "undefined" && window.tronWeb?.defaultAddress?.base58
                ? window.tronWeb.defaultAddress.base58
                : "";
        const hex =
            typeof window !== "undefined" && window.tronWeb?.defaultAddress?.hex
                ? window.tronWeb.defaultAddress.hex
                : "";

        if (base58) return base58;
        if (hex && typeof window !== "undefined" && window.tronWeb?.address) {
            try {
                return window.tronWeb.address.fromHex(hex);
            } catch {
                // ignore
            }
        }
        return "";
    };

    const connectTronLink = async () => {
        // showToast("Invalid Transaction.", "error");
        // showToast(dataTrx.ResponseMessage || "Registration successful.", "success", {
        //     actionLabel: "OK",
        //     onAction: () => router.push("/Components/Dashboard"),
        //     autoCloseMs: 0, // don’t auto-close when we want the user to click OK
        // });

        if (typeof window === "undefined" || !window.tronLink) {
            alert("TronLink Pro not detected. Please install/enable the extension.");
            return;
        }
        try {
            setConnecting(true);
            await window.tronLink.request({ method: "tron_requestAccounts" });
            const addr = getTronAddress();
            if (addr) {
                setAddress(addr);
                setErrors((p) => ({ ...p, address: "" }));
            } else {
                setErrors((p) => ({ ...p, address: "Failed to read wallet address." }));
            }
        } catch {
            // user denied / wallet locked — keep calm
        } finally {
            setConnecting(false);
        }
    };

    // --- Read refId from query (?refIdCheck=... or ?refId=...) once ---
    // --- Read refId from query (?refIdCheck=... or ?refId=...) once ---
    useEffect(() => {
        console.log("console: read refId from QS");

        if (usernameFromQSHandledRef.current) return; // run once
        console.log("console: first run");

        // Prefer App Router searchParams
        let qs = searchParams?.get("refIdCheck") || searchParams?.get("refId") || "";
        console.log("console: qs (App Router)", qs);

        // Fallback for hydration timing / Pages Router
        if (!qs && typeof window !== "undefined") {
            const sp = new URLSearchParams(window.location.search);
            qs = sp.get("refIdCheck") || sp.get("refId") || "";
        }
        console.log("console: qs (fallback)", qs);

        if (qs && qs.trim().length > 2) {
            usernameFromQSHandledRef.current = true;
            setId(qs.trim());
            console.log("console: set Id =", qs.trim());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);


    // --- Sponsor verification on Id change ---
    useEffect(() => {
        if (!Id.trim()) {
            setVerified(null);
            return;
        }

        let cancelled = false;

        const verify = async () => {
            try {
                setLoading(true);
                setVerified(null);

                const formData = new FormData();
                formData.append("userid", Id);

                const res = await fetch(`${apiUrl}/Statistic/GetSponsor`, {
                    method: "POST",
                    body: formData,
                });

                const result = await res.json();
                if (cancelled) return;

                if (res.ok && result.ResponseStatus === "success" && result.NoOfRecord > 0) {
                    setVerified(true);
                    setErrors((p) => ({ ...p, Id: "" }));
                } else {
                    setVerified(false);
                    setErrors((p) => ({ ...p, Id: "Invalid Referral ID" }));
                }
            } catch (err) {
                if (cancelled) return;
                setVerified(false);
                setErrors((p) => ({ ...p, Id: "Could not verify Referral ID" }));
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        verify();
        return () => {
            cancelled = true;
        };
    }, [Id, apiUrl]);

    // --- Validation ---
    const validateForm = () => {
        const next = {};
        let ok = true;

        if (!Id.trim()) {
            next.Id = "Referral ID cannot be empty";
            ok = false;
        } else if (verified === false) {
            next.Id = "Invalid Referral ID";
            ok = false;
        }

        if (!address || address.length < 20) {
            next.address = "Please connect TronLink Pro.";
            ok = false;
        }

        if (!termsAccepted) {
            next.terms = "Please accept Terms & Conditions.";
            ok = false;
        }

        setErrors(next);
        return ok;
    };

    // --- Submit ---
    const handleSubmit = (e) => {
        e.preventDefault();

        // Optional debug (no TS casts):
        const base58 =
            typeof window !== "undefined" && window.tronWeb?.defaultAddress?.base58
                ? window.tronWeb.defaultAddress.base58
                : "";
        const hex =
            typeof window !== "undefined" && window.tronWeb?.defaultAddress?.hex
                ? window.tronWeb.defaultAddress.hex
                : "";
        console.log("Wallet defaultAddress:", { base58, hex });

        if (!validateForm()) return;

        // TODO: call your Sign Up API here if needed
        // router.push("/Components/Dashboard");
        checkAddressRegister();
    };

    const isAddressReady = address.length >= 20;

    const checkAddressRegister = async () => {
        console.log('login conl');
        try {
            if (!validateForm()) return;
            setBtnLoading(true);
            setErrors((prev) => ({ ...prev, api: "" }));

            const formData = new FormData();
            formData.append("Sponsorid", Id || "");
            formData.append("address", address || "");
            formData.append("api", "Yes");

            debugger;
            console.log("Register formData:");
            formData.forEach((value, key) => {
                console.log(`${key}: ${value}`);
            });

            const response = await fetch(`${apiUrl}/Contract/checkdirectDetails`, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            console.log("login raw", data);
            debugger;

            if (response.ok && (data.ResponseStatus === "success" || data.ResponseCode === 101)) {
                console.log('register success');

                // debugger;
                const payload = data.Data || data; // your sample has Data:{...}
                const toAddr = payload.Address;
                const amt = payload.CoinAmt;      // 44.355
                const reqId = payload.ReqId;      // "OQA0ADQAMQA5ADcA"

                // ---- OPTION A: send **TRX** native ----
                const { txid } = await sendTRX({ to: toAddr, amountTRX: amt });
                console.log("txid", txid);
                debugger;
                // // 2) Wait for confirmation (SUCCESS) or timeout
                // const { confirmed, info } = await waitForTxConfirmation(txid, {
                //     timeoutMs: 180000, // 3 minutes (tweak as you like)
                //     pollMs: 3000,
                // });

                if (txid.length >= 50) {

                    const formDataTrx = new FormData();
                    formDataTrx.append("response", response || "");
                    formDataTrx.append("trxId", txid || "");
                    formDataTrx.append("addressFrom", address || "");
                    formDataTrx.append("ReqId", reqId || "");

                    console.log("Register formData:");
                    formDataTrx.forEach((value, key) => {
                        console.log(`${key}: ${value}`);
                    });

                    const responseTrx = await fetch(`${apiUrl}/Contract/trxIdAddSaveAPI`, {
                        method: "POST",
                        body: formDataTrx,
                    });

                    const dataTrx = await responseTrx.json();
                    console.log("login raw", data);

                    if (responseTrx.ok && (dataTrx.ResponseStatus === "success" || dataTrx.ResponseCode === 101)) {
                        // alert(dataTrx.ResponseMessage);
                        // router.push("/Components/Dashboard");
                        localStorage.clear();
                        showToast(dataTrx.ResponseMessage || "Registration successful.", "success", {
                            actionLabel: "OK",
                            onAction: () => router.push("/Components/Authentication/Login/"),
                            autoCloseMs: 0, // don’t auto-close when we want the user to click OK
                        });
                    } else {
                        setErrors((prev) => ({
                            ...prev,
                            api: data.ResponseMessage,
                        }));
                        showToast(data.ResponseMessage || "Sign up failed.", "error");
                        setBtnLoading(false);
                    }

                } else {
                    setErrors((prev) => ({
                        ...prev,
                        api: "Invalid Transaction.",
                    }));
                    showToast("Invalid Transaction.", "error");
                    setBtnLoading(false);
                }
            } else {
                setErrors((prev) => ({
                    ...prev,
                    api: data.ResponseMessage,
                }));
                showToast(data.ResponseMessage || "Sign up failed.", "error");
                setBtnLoading(false);
            }
        } catch (error) {
            console.log('register error', error);
            setBtnLoading(false);
            setErrors((prev) => ({
                ...prev,
                api: "Something went wrong. Please try again.",
            }));
            showToast("Something went wrong. Please try again.", "error");
        } finally {
            console.log('register finally');
            // setBtnLoading(false);
        }
    };

    // Make sure wallet is available/connected
    const ensureTronLink = async () => {
        if (typeof window === "undefined" || !window.tronLink || !window.tronWeb) {
            throw new Error("TronLink Pro not detected.");
        }
        try { await window.tronLink.request({ method: "tron_requestAccounts" }); } catch { }
        const from = window.tronWeb?.defaultAddress?.base58 || "";
        if (!from) throw new Error("Wallet not connected.");
        return from;
    };

    // Send native TRX (amount in TRX units, e.g. 44.355)
    const sendTRX = async ({ to, amountTRX }) => {
        await ensureTronLink();
        const tronWeb = window.tronWeb;
        const amountSun = tronWeb.toSun(Number(amountTRX));
        const res = await tronWeb.trx.sendTransaction(to, amountSun);
        // setResponse(res);
        const txid = res?.txid || res?.transaction?.txID || null;
        if (!txid) throw new Error("No txid returned from sendTransaction");

        const resStr = typeof res === "string" ? res : JSON.stringify(res);
        setResponse(resStr);
        return { txid, broadcastResult: !!res?.result };
    };

    // Poll until the tx is confirmed on-chain or timeout
    const waitForTxConfirmation = async (
        txid,
        { timeoutMs = 120000, pollMs = 3000 } = {}
    ) => {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            try {
                const info = await window.tronWeb.trx.getTransactionInfo(txid);
                // Not confirmed yet returns {} (no keys)
                if (info && Object.keys(info).length) {
                    const status = info?.receipt?.result || info?.result; // "SUCCESS" | "FAILED"
                    if (status === "SUCCESS") {
                        return { confirmed: true, info };
                    }
                    if (status === "FAILED") {
                        throw new Error("Transaction failed on-chain");
                    }
                }
            } catch {
                // ignore transient errors; keep polling
            }
            await new Promise((r) => setTimeout(r, pollMs));
        }
        return { confirmed: false, info: null }; // timed out
    };


    return (
        <div className="relative">
            {/* Toast Notification */}
            {toast.message && (
                <div
                    className={`fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-500 z-50 ${toast.type === "success" ? "bg-green-600" : "bg-red-600"
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <span>{toast.message}</span>
                        {toast.actionLabel ? (
                            <button
                                onClick={() => {
                                    const cb = toast.onAction;
                                    closeToast();
                                    if (typeof cb === "function") cb();
                                }}
                                className="ml-2 px-3 py-1 rounded-md bg-white/20 hover:bg-white/30"
                            >
                                {toast.actionLabel}
                            </button>
                        ) : (
                            <button
                                onClick={closeToast}
                                className="ml-2 px-2 py-1 rounded-md bg-white/20 hover:bg-white/30"
                                aria-label="Close"
                                title="Close"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
            )}


            <div className="flex items-center justify-center min-h-screen bg-gray-900 p-2">
                <div className="w-full max-w-md bg-gray-800 shadow-xl rounded-2xl p-8">
                    <div className="flex justify-center">
                        <img src="/logo.png" className="w-12 h-12 mb-2" alt="logo" />
                    </div>

                    <h1 className="text-2xl font-bold text-center text-white mb-6">
                        Sign Up Here
                    </h1>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Referral ID */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Enter your Referral ID"
                                value={Id}
                                onChange={(e) => {
                                    setId(e.target.value);
                                    setErrors((p) => ({ ...p, Id: "" }));
                                    setVerified(null);
                                }}
                                className={`w-full pr-12 px-4 py-2 rounded-lg border border-gray-700 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.Id ? "border-red-500" : ""
                                    }`}
                            />

                            {/* Tick / Cross / Loading */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6">
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent animate-spin rounded-sm" />
                                ) : verified !== null ? (
                                    <span
                                        className={`text-xl ${verified ? "text-green-500" : "text-red-500"
                                            }`}
                                    >
                                        {verified ? "✅" : "❌"}
                                    </span>
                                ) : null}
                            </div>
                        </div>
                        {errors.Id && (
                            <p className="text-red-500 text-xs mt-1">{errors.Id}</p>
                        )}

                        {/* Address (disabled input like Login) */}
                        <div>
                            <input
                                type="text"
                                disabled
                                placeholder="Connect to TronLink Pro"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className={`w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.address ? "border-red-500" : ""
                                    }`}
                            />
                            {errors.address && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.address}
                                </p>
                            )}
                        </div>

                        {/* Terms */}
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <input
                                type="checkbox"
                                className="w-4 h-4 cursor-pointer"
                                checked={termsAccepted}
                                onChange={(e) => {
                                    setTermsAccepted(e.target.checked);
                                    setErrors((p) => ({ ...p, terms: "" }));
                                }}
                                required
                            />
                            <span>
                                I agree to the{" "}
                                <span className="text-blue-400 cursor-pointer hover:underline">
                                    Terms & Conditions
                                </span>
                            </span>
                        </div>
                        {errors.terms && (
                            <p className="text-red-500 text-xs -mt-2">{errors.terms}</p>
                        )}

                        {/* Primary CTA */}
                        {isAddressReady ? (
                            <button
                                type="submit"
                                disabled={btnloading}
                                aria-disabled={btnloading}
                                aria-busy={btnloading ? "true" : "false"}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {btnloading && (
                                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                )}
                                {btnloading ? "Signing up..." : "Sign Up"}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={connectTronLink}
                                disabled={connecting}
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg transition cursor-pointer disabled:opacity-50"
                            >
                                {connecting ? "Connecting..." : "Connect TronLink Wallet"}
                            </button>
                        )}
                    </form>

                    <div className="flex items-center gap-2 my-6">
                        <hr className="flex-1 border-gray-600" />
                        <span className="text-sm text-gray-400">OR</span>
                        <hr className="flex-1 border-gray-600" />
                    </div>

                    <p className="mt-6 text-center text-gray-400 text-sm">
                        Already have an account?{" "}
                        <span
                            onClick={() => router.push("/Components/Authentication/Login")}
                            className="hover:underline text-blue-400 cursor-pointer ml-2"
                        >
                            Login
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );

}
