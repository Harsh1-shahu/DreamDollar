"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Footer from "../../Footer/page";
import Navbar from "../../Navbar/page";
import ProtectedRoute from "@/app/ProtectedRoute";
import { useProject } from "@/app/Context/ProjectContext";

const GlobalRankDetails = () => {
  const { theme } = useTheme();
  const { getMembCode } = useProject();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState (null); // ........
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Team Details state
    const [teamSummary, setTeamSummary] = useState([]);   //........
    const [teamLoading, setTeamLoading] = useState(false); //.......

  const apiUrl = process.env.NEXT_PUBLIC_DREAM_DOLLAR_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const memb_code = getMembCode;

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

  // Fetch Team Details when a Team is selected   
  useEffect(() => {                            //...........
  const fetchTeamDetails = async () =>{
    if (!selectedTeam) return;

    try {
        setTeamLoading(true);
        setTeamSummary([]);

        const formData2 = new FormData();
        formData2.append("memb_code", "101");
        formData2.append("type", "AutoLevelSummaryDetails");
        formData2.append("level", "0");
        formData2.append("club_code", selectedTeam.CLUB_CODE);

        const res2 = await fetch(`${apiUrl}/Statistic/AutoLevelSummaryDetails`, {
          method: "POST",
          body: formData2,
        });

        if (!res2.ok) throw new Error("Failed to fetch AutoLevelSummaryDetails");

        const result2 = await res2.json();

        if (result2.ResponseStatus === "success" && result2.Data) {
          let summaryData = result2.Data;
          if (typeof summaryData === "string") {
            try {
              summaryData = JSON.parse(summaryData);
            } catch {
              summaryData = [];
            }
          }
          setTeamSummary(
            Array.isArray(summaryData) ? summaryData : [summaryData]
          );
    }
  } catch (err) {
        console.error(err);
      } finally {
        setTeamLoading(false);
      }
    };

    fetchTeamDetails();
  }, [selectedTeam, apiUrl]);
  

  // 🔹 Filter data based on search
  const filteredData = data.filter((row) => {
    const rank = row?.RRANK?.toString().toLowerCase() || "";
    const rdate = row?.TTTIME?.toString() || "";
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
      <ProtectedRoute>
        <Navbar />
        <div className={`mt-14 mb-20 p-4 transition-colors duration-300 ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"}`}>
          <h2 className="text-xl font-bold mb-4">Global Rank Details</h2>

          {/* Search */}
          <div className="flex items-center justify-between mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Date, or Rank..."
              className={`w-[55vw] md:w-[25vw] border rounded-full px-2 py-1 focus:outline-none focus:ring focus:ring-cyan-300 ${theme === "dark"
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
                        {/* Serial Number Circle */}
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500 text-white font-bold">
                          {(currentPage - 1) * itemsPerPage + (idx + 1)}
                        </div>
                        <div>
                          <p className="font-medium">Rank: {item.RRANK || "-"}</p>
                          <p className="text-sm">{item.TTTIME}</p>
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
      </ProtectedRoute>
    </>
  );
};

export default GlobalRankDetails;
