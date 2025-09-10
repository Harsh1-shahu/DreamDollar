"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Footer from "../../Footer/page";
import Navbar from "../../Navbar/page";
import ProtectedRoute from "@/app/ProtectedRoute";

const DirectIncomeDetails = () => {
    const { theme } = useTheme();
    const [data, setData] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const apiUrl = process.env.NEXT_PUBLIC_DREAM_DOLLAR_URL;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");

                const formData = new FormData();
                formData.append("memb_code", "101"); // dynamic later
                formData.append("type", "directIncome");

                const res = await fetch(`${apiUrl}/Statistic/Reports`, {
                    method: "POST",
                    body: formData,
                });

                const result = await res.json();

                if (result.ResponseStatus === "success" && result.Data) {
                    const parsedData = JSON.parse(result.Data); // Data comes as JSON string
                    setData(parsedData);
                } else {
                    setError(result.ResponseMessage || "Failed to fetch data");
                }
            } catch (err) {
                setError("Something went wrong while fetching data.");
            } finally {
                setLoading(false);
            }
        };

        if (apiUrl) fetchData();
    }, [apiUrl]);

    // Filtered search
    const filteredData = data.filter(
        (item) =>
            item.username?.toString().toLowerCase().includes(search.toLowerCase()) ||
            item.TDATE?.toLowerCase().includes(search.toLowerCase()) ||
            item.CR?.toString().includes(search)
    );

    // Pagination
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <>
            <ProtectedRoute>
                <Navbar />
                <div
                    className={`mt-14 mb-20 p-4 transition-colors duration-300 ${theme === "dark"
                        ? "bg-gray-900 text-gray-100"
                        : "bg-gray-100 text-gray-900"
                        }`}
                >
                    <h2 className="text-xl font-bold mb-4">Direct Earning</h2>

                    {/* Search */}
                    <div className="flex items-center justify-between mb-4">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1); // Reset page on search
                            }}
                            placeholder="Search by user, date, or amount..."
                            className={`w-46 md:w-auto border rounded-full px-4 py-1 focus:outline-none focus:ring focus:ring-cyan-300 ${theme === "dark"
                                ? "bg-gray-700 text-gray-200 border-gray-600 placeholder-gray-400"
                                : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                                }`}
                        />
                        <span className="pr-2 font-semibold">
                            Total: ${data.reduce((sum, item) => sum + (Number(item.CR) || 0), 0)}
                        </span>
                    </div>


                    {/* Card-style Data */}
                    {loading && <p className="text-center">Loading...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}
                    {!loading && !error && (
                        <>
                            <div className="space-y-4 mt-4">
                                {currentItems.length > 0 ? (
                                    currentItems.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex items-center justify-between p-3 rounded-lg shadow-sm ${theme === "dark" ? "bg-gray-800" : "bg-white"
                                                }`}
                                        >
                                            {/* Left Avatar + Info */}
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-500 text-white font-bold">
                                                    {item.username?.slice(0, 2).toUpperCase() || "NA"}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{item.username}</p>
                                                    <p className="text-sm">{item.TDATE}</p>
                                                </div>
                                            </div>

                                            {/* Right info: Income */}
                                            <div className="text-right">
                                                <p className="text-md font-medium">
                                                    Income: ${item.CR || 0}
                                                </p>
                                            </div>
                                        </div>
                                    ))

                                ) : (
                                    <p className="text-center text-gray-500">No records found.</p>
                                )}
                            </div>

                            {/* Pagination */}
                            {filteredData.length > itemsPerPage && (
                                <div className="flex justify-between items-center mt-6">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                        className="px-3 py-1 rounded-md text-white bg-gray-700 disabled:opacity-50"
                                    >
                                        Prev
                                    </button>

                                    <p>
                                        Page {currentPage} of {totalPages}
                                    </p>

                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                        className="px-3 py-1 rounded-md text-white bg-gray-700 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
                <Footer />
            </ProtectedRoute>
        </>
    );
};

export default DirectIncomeDetails;
