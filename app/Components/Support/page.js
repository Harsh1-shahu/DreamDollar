"use client"
import React, { useState, useEffect, useRef } from "react";
import { useProject } from "@/app/Context/ProjectContext";
import Navbar from "../Navbar/page";
import Footer from "../Footer/page";

const Support = () => {
    const [mailMessage, setMailMessage] = useState("");
    const [chatMessage, setChatMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [loading, setLoading] = useState(false);
    const { theme } = useProject();
    const maxWords = 300;

    const chatEndRef = useRef(null);

    // Auto scroll when chat or loading changes
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chat, loading]);

    // Word count for compose mail
    const wordsLeft =
        maxWords - mailMessage.split(/\s+/).filter(Boolean).length;

    const handleMailChange = (e) => {
        const words = e.target.value.split(/\s+/).filter(Boolean);
        if (words.length <= maxWords) {
            setMailMessage(e.target.value);
        }
    };

    const handleChatChange = (e) => {
        const words = e.target.value.split(/\s+/).filter(Boolean);
        if (words.length <= maxWords) {
            setChatMessage(e.target.value);
        }
    };

    const getBotReply = (userMessage) => {
        if (userMessage.toLowerCase().includes("hello")) {
            return "Hi there 👋! How can I help you today?";
        } else if (userMessage.toLowerCase().includes("problem")) {
            return "I’m sorry to hear that 😔. Can you give me more details about your problem?";
        } else if (userMessage.toLowerCase().includes("thanks")) {
            return "You're welcome 🙌!";
        } else {
            return "I didn’t quite understand 🤔. Can you rephrase?";
        }
    };

    const handleChatSubmit = () => {
        if (!chatMessage.trim()) return;

        const userMsg = { sender: "user", text: chatMessage };
        setChat((prev) => [...prev, userMsg]);
        setChatMessage("");
        setLoading(true);

        setTimeout(() => {
            const botMsg = { sender: "bot", text: getBotReply(userMsg.text) };
            setChat((prev) => [...prev, botMsg]);
            setLoading(false);
        }, 1000);
    };

    return (
        <div
            className={`max-w-xl mx-auto transition-colors duration-300 mt-12 mb-12 ${theme === "dark"
                ? "bg-gray-900 text-gray-100"
                : "bg-gray-100 text-gray-900"
                }`}
        >
            <Navbar/>

            <main className="flex-1 p-6">
                <h2 className="text-lg font-semibold mb-4">Support</h2>

                {/* Compose Mail */}
                <div
                    className={`p-5 rounded-2xl shadow-sm mb-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"
                        }`}
                >
                    <h3 className="font-semibold mb-3">Compose Mail</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Attachment */}
                        <div>
                            <label className="block font-medium mb-1">
                                Attachment
                            </label>
                            <input
                                type="file"
                                className={`w-full border rounded-full px-3 py-2 text-sm ${theme === "dark"
                                    ? "bg-gray-700 border-gray-600"
                                    : "bg-white border-gray-300"
                                    }`}
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block font-medium mb-1">
                                Message
                            </label>
                            <textarea
                                value={mailMessage}
                                onChange={handleMailChange}
                                placeholder="Message"
                                className={`w-full border rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 ${theme === "dark"
                                    ? "bg-gray-700 border-gray-600 placeholder-gray-400"
                                    : "bg-white border-gray-300"
                                    }`}
                                rows={3}
                            />
                            <p className="text-sm mt-1">
                                Message Length:{" "}
                                <span className="text-red-500 font-bold">
                                    {wordsLeft}
                                </span>{" "}
                                Words Left
                            </p>
                        </div>
                    </div>

                    <button className="mt-4 bg-cyan-400 text-white px-6 py-2 rounded-full hover:bg-cyan-500 transition cursor-pointer">
                        Submit
                    </button>
                </div>

                {/* Sent Mail */}
                <div
                    className={`p-5 rounded-2xl shadow-sm mb-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"
                        }`}
                >
                    <h3 className="font-semibold mb-3">Sent Mail</h3>
                    <p className="text-sm font-medium">19-02-2025</p>
                    <button className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm mt-2 cursor-pointer">
                        Attachment
                    </button>
                    <hr
                        className={`my-3 ${theme === "dark"
                            ? "border-gray-600"
                            : "border-gray-300"
                            }`}
                    />
                    <p className="font-semibold">mmmm</p>
                </div>

                {/* Inbox with Chatbot */}
                <div
                    className={`p-5 rounded-2xl shadow-sm ${theme === "dark" ? "bg-gray-800" : "bg-white"
                        }`}
                >
                    <h3 className="font-semibold mb-3">Inbox (Chatbot)</h3>

                    {/* Chat Messages */}
                    <div className="h-43 overflow-y-auto border rounded-xl p-3 mb-3 space-y-3 scrollbar-hide">
                        {chat.length === 0 && !loading && (
                            <p className="text-sm text-gray-500">
                                👋 Start chatting with the bot...
                            </p>
                        )}

                        {chat.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex items-end gap-2 ${msg.sender === "user"
                                    ? "justify-end"
                                    : "justify-start"
                                    }`}
                            >
                                {msg.sender === "bot" && (
                                    <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-sm">
                                        🤖
                                    </div>
                                )}
                                <div
                                    className={`p-2 rounded-lg max-w-[70%] ${msg.sender === "user"
                                        ? "bg-cyan-500 text-white"
                                        : "bg-gray-300 text-gray-900"
                                        }`}
                                >
                                    {msg.text}
                                </div>
                                {msg.sender === "user" && (
                                    <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-sm text-white">
                                        U
                                    </div>
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="flex items-end gap-2 justify-start">
                                <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-sm">
                                    🤖
                                </div>
                                <div className="bg-gray-300 text-gray-900 p-2 rounded-lg max-w-[70%] text-sm italic animate-pulse">
                                    Bot is typing...
                                </div>
                            </div>
                        )}

                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Box */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={chatMessage}
                            onChange={handleChatChange}
                            placeholder="Type your message..."
                            className={`flex-1 border rounded-full w-1/3 p-2 text-sm focus:outline-none ${theme === "dark"
                                ? "bg-gray-700 border-gray-600 placeholder-gray-400"
                                : "bg-white border-gray-300"
                                }`}
                        />
                        <button
                            onClick={handleChatSubmit}
                            disabled={loading}
                            className={`px-4 py-2 rounded-full transition cursor-pointer ${loading
                                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                : "bg-cyan-500 text-white hover:bg-cyan-600"
                                }`}
                        >
                            {loading ? "..." : "Send"}
                        </button>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );
};

export default Support;
