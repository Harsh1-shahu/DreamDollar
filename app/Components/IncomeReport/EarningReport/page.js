"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Footer from "../../Footer/page";
import Navbar from "../../Navbar/page";
import ProtectedRoute from "@/app/ProtectedRoute";

const EarningReport = () => {
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
        formData.append("memb_code", "101"); // replace with actual logged-in user code
        formData.append("type", "transaction");

        const res = await fetch(`${apiUrl}/Statistic/Reports`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Failed to fetch data");

        const result = await res.json();

        if (result.ResponseStatus === "success" && result.Data) {
          const parsedData =
            typeof result.Data === "string" ? JSON.parse(result.Data) : result.Data;

          setData(parsedData || []);
        } else {
          setError(result.ResponseMessage || "No data found");
        }
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  // 🔹 Filter data based on search
  const filteredData = data.filter(
    (row) =>
      (row.TDATE?.toLowerCase().includes(search.toLowerCase()) || false) ||
      (row.REMARK?.toLowerCase().includes(search.toLowerCase()) || false) ||
      (row.CR?.toString().includes(search) || false) ||
      (row.DR?.toString().includes(search) || false) ||
      (row.BALANCE?.toString().includes(search) || false)
  );

  // 🔹 Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  // 🔹 Calculate total amount
  const totalBalance = data.reduce((sum, item) => sum + (Number(item.BALANCE) || 0), 0);

  return (
    <>
      <ProtectedRoute>
        <Navbar />
        <div
          className={`p-4 transition-colors duration-300 mt-14 mb-14 ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
            }`}
        >
          <h2 className="text-xl font-bold mb-4">Transaction</h2>

          {/* Search */}
          <div className="flex items-center justify-between mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by date, CR, DR, or balance..."
              className={`w-44 md:w-auto border rounded-full px-4 py-1 focus:outline-none focus:ring focus:ring-cyan-300 ${theme === "dark"
                ? "bg-gray-700 text-gray-200 border-gray-600 placeholder-gray-400"
                : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                }`}
            />
            <p className="font-semibold">
              Total: <span >${totalBalance.toFixed(2)}</span>
            </p>
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
                      className={`flex flex-col md:flex-row items-start md:items-center justify-between p-3 rounded-lg shadow-sm ${theme === "dark" ? "bg-gray-800" : "bg-white"
                        }`}
                    >
                      {/* Left Avatar + Info */}
                      <div className="w-full flex justify-between">
                        <div className="flex items-center space-x-3 mb-2 md:mb-0">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500 text-white font-bold">
                            {item.REMARK?.toString().slice(0, 2) || "NA"}
                          </div>
                          <div>
                            <p className="font-medium">{item.REMARK || "-"}</p>
                            <p className="text-sm">{item.TDATE}</p>
                          </div>
                        </div>


                        {/* Right info: Srno + Date */}
                        <div className="text-right">

                          <p className="text-sm">
                            CR: {item.CR ?? "-"} | DR: {item.DR ?? "-"} | Balance: {item.BALANCE ?? "-"}
                          </p>
                        </div>
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

export default EarningReport;
