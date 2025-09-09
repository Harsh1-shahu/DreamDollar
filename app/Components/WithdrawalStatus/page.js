"use client";

import React, { useState, useEffect } from "react";
import { useProject } from "@/app/Context/ProjectContext";
import Navbar from "../Navbar/page";
import Footer from "../Footer/page";

const WithdrawalStatus = () => {
  const { theme } = useProject();
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
        formData.append("memb_code", "101");
        formData.append("type", "withdrawalDetails");

        const res = await fetch(`${apiUrl}/Statistic/Reports`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Failed to fetch data");

        const result = await res.json();
        let parsedData = [];
        try {
          parsedData = result.Data
            ? typeof result.Data === "string"
              ? JSON.parse(result.Data)
              : result.Data
            : [];
        } catch (e) {
          console.error("Error parsing Data:", e);
        }

        setData(Array.isArray(parsedData) ? parsedData : []);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  // 🔹 Filter based on search
  const filteredData = data.filter(
    (row) =>
      row.RCODE?.toString().includes(search) ||
      row.TDATE?.toString().includes(search) ||
      row.AMOUNT?.toString().includes(search) ||
      row.DEDUCTAMT?.toString().includes(search) ||
      row.FINALAMT?.toString().includes(search)
  );

  // 🔹 Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // 🔹 Totals (based on filtered data, not pagination)
  const totalAmount = filteredData.reduce(
    (sum, row) => sum + parseFloat(row.AMOUNT || 0),
    0
  );
  const totalFinalAmount = filteredData.reduce(
    (sum, row) => sum + parseFloat(row.FINALAMT || 0),
    0
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${theme === "dark"
        ? "bg-gray-900 text-gray-100"
        : "bg-gray-100 text-gray-900"
        }`}
    >
      <Navbar />

      <div className="max-w-xl mx-auto mt-14 mb-20 p-4">
        <h2 className="text-xl font-bold mb-4">Withdrawal Status</h2>

        {/* Search */}
        <div className="flex justify-start mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search, date, or amount..."
            className={`px-3 py-2 rounded-full border focus:outline-none focus:ring focus:ring-cyan-300 ${theme === "dark"
              ? "bg-gray-800 text-gray-200 border-gray-600 placeholder-gray-400"
              : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
              }`}
          />
        </div>

        {/* Totals */}
        {filteredData.length > 0 && (
          <div
            className={`flex justify-between items-center mt-6 p-4 rounded-lg shadow-md font-semibold ${theme === "dark"
              ? "bg-gray-800 text-gray-100"
              : "bg-white text-gray-900"
              }`}
          >
            <p>Total Amount: {totalAmount.toFixed(2)}</p>
            <p className="text-cyan-500">Total Final Amount: {totalFinalAmount.toFixed(2)}</p>
          </div>
        )}

        {/* Cards */}
        {loading && <p className="text-center">Loading...</p>}
        {error && !loading && (
          <p className="text-center text-red-500">{error}</p>
        )}
        {!loading && !error && (
          <>
            <div className="space-y-4 mt-4">
              {currentItems.length > 0 ? (
                currentItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex justify-between items-center p-4 rounded-lg shadow-sm ${theme === "dark" ? "bg-gray-800" : "bg-white"
                      }`}
                  >
                    <div>
                      <p className="text-sm">
                        Date: {item.TDATE || "-"}
                      </p>

                      <p className="text-sm">
                        Deduction: {parseFloat(item.DEDUCTAMT || 0).toFixed(2)}
                      </p>

                      <p className="text-sm font-medium">
                        Amount: {parseFloat(item.AMOUNT || 0).toFixed(2)}
                      </p>

                    </div>
                    <p className="text-sm font-medium text-cyan-500">
                      Final Amount: {parseFloat(item.FINALAMT || 0).toFixed(2)}
                    </p>
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
    </div>
  );
};

export default WithdrawalStatus;
