"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Footer from "../../Footer/page";
import Navbar from "../../Navbar/page";

const GlobalRankDetails = () => {
  const { theme } = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
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
        formData.append("type", "rankDetails");

        const res = await fetch(`${apiUrl}/Statistic/Reports`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Failed to fetch data");

        const result = await res.json();
        let parsedData = [];
        try {
          parsedData = result.Data ? JSON.parse(result.Data) : [];
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

  // 🔹 Filter data based on search
  const filteredData = data.filter((row) => {
    const rank = row?.RRANK?.toString().toLowerCase() || "";
    const rdate = row?.RDATE?.toString() || "";
    const searchLower = search.toLowerCase();
    return rank.includes(searchLower) || srno.includes(searchLower) || rdate.includes(searchLower);
  });

  // 🔹 Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  

  // 🔢 Total of current filtered items
  const totalAmount = filteredData.reduce((sum, row) => sum + (parseFloat(row?.AMOUNT) || 0), 0);

  return (
    <>
      <Navbar />
      <div className={`max-w-3xl mx-auto mt-14 mb-20 p-4 transition-colors duration-300 ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"}`}>
        <h2 className="text-xl font-bold mb-4">Global Rank Details</h2>

        {/* Search */}
        <div className="flex justify-between mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by Date, or Rank..."
            className={`border rounded-full px-4 py-1 focus:outline-none focus:ring focus:ring-cyan-300 ${theme === "dark"
              ? "bg-gray-700 text-gray-200 border-gray-600 placeholder-gray-400"
              : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
              }`}
          />
          <p className="pr-2 font-semibold">
            Total: <span >${totalAmount.toFixed(2)}</span>
          </p>
        </div>

        {/* Cards */}
        {loading && <p className="text-center">Loading...</p>}
        {error && !loading && <p className="text-center text-red-500">{error}</p>}
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
                    {/* Left: Rank + date */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-500 text-white font-bold">
                        {item.RRANK?.toString().slice(0, 2) || "NA"}
                      </div>
                      <div>
                        <p className="font-medium">Rank: {item.RRANK || "-"}</p>
                        <p className="text-sm">{item.RDATE}</p>
                      </div>
                    </div>

                    {/* Right: Amount + team */}
                    <div className="text-right">
                      <span>
                        Amount: {item.AMOUNT ? parseFloat(item.AMOUNT).toLocaleString() : "-"} 
                      <p>Team Details: {item.TEAM || 0}</p> 
                      </span>
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
    </>
  );
};

export default GlobalRankDetails;
