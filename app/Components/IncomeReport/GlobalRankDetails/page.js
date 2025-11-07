"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Footer from "../../Footer/page";
import Navbar from "../../Navbar/page";
import { useRequireMemberDetails } from "@/app/hooks/useRequireMemberDetails";


const GlobalRankDetails = () => {
  const { ready, membCode } = useRequireMemberDetails();
  const { theme } = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [teamData, setTeamData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRank, setSelectedRank] = useState(""); // ✅ for dynamic rank in title
  const itemsPerPage = 10;

  // Modal Pagination state
  const [modalPage, setModalPage] = useState(1);
  const modalItemsPerPage = 10;

  // ✅ Lock / unlock body scroll when modal is open or close
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // cleanup just in case
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);


  const apiUrl = process.env.NEXT_PUBLIC_DREAM_DOLLAR_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("memb_code", membCode);
        formData.append("type", "rankDetails");

        const res = await fetch(`${apiUrl}/Statistic/Reports`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Failed to fetch data");

        const result = await res.json();
        console.log(result);

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
  }, [apiUrl, membCode]);


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


  // ✅ Handle Team Details button
  const handleTeamDetails = async (rcode, rankName) => {
    try {

      const formData = new FormData();
      formData.append("memb_code", membCode); // ✅ required
      formData.append("type", "RankTeamDetails"); // ✅ API type
      formData.append("value", rcode); // ✅ pass RCODE here

      const res = await fetch(`${apiUrl}/Statistic/Reports`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to fetch team details");

      const result = await res.json();

      const parsedTeamData = result.Data ? JSON.parse(result.Data) : [];
      setTeamData(parsedTeamData);

      // ✅ Remove trailing "-1", "-2", etc. and keep only name
      const cleanRank = rankName?.split("-")[0] || rankName;
      setSelectedRank(cleanRank);

      setShowModal(true); // ✅ show popup modal
    } catch (err) {
      console.error("Error fetching team details:", err);
    }
  };

  if (!ready) {
    return <div className="p-4 text-sm text-gray-500">Checking session…</div>;
  }

  return (
    <>
      <Navbar />
      <div className={`max-w-3xl mx-auto mt-14 mb-20 p-4 transition-colors duration-300 ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"}`}>
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
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500 text-white font-bold">
                        {(currentPage - 1) * itemsPerPage + (idx + 1)}
                      </div>
                      <div>
                        <p className="font-medium">Rank: {item.RRANK || "-"}</p>
                        <p className="text-sm">{item.TTTIME}</p>
                      </div>
                    </div>

                    {/* Right: Amount + team */}
                    <div className="text-right flex flex-col">
                      <span> Amount: {item.AMOUNT ? parseFloat(item.AMOUNT).toLocaleString() : "0"}</span>
                      <button
                        onClick={() => handleTeamDetails(item.RCODE, item.RRANK)}
                        className="hover:text-blue-700"
                      >
                        Team Details: {item.TEAM || 0}
                      </button>
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

      {/* ✅ Team Details Modal with Pagination */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div
            className={`rounded-lg shadow-lg w-full max-w-lg py-3 px-4 overflow-hidden ${theme === "dark"
              ? "bg-gray-800 text-gray-100"
              : "bg-white text-gray-900"
              }`}
          >
            {/* Title with dynamic rank */}
            <div className="p-4 border-b border-gray-600">
              <h3 className="text-lg font-semibold">
                {selectedRank ? `${selectedRank} Rank Team Details` : "Rank Team Details"}
              </h3>
            </div>

            {/* Table */}
            {teamData && teamData.length > 0 ? (
              <>
                <div className="overflow-x-auto max-h-[60vh]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-700 text-gray-100">
                        <th className="px-4 py-2 border border-gray-600 text-center">
                          Date
                        </th>
                        <th className="px-4 py-2 border border-gray-600 text-center">
                          Username
                        </th>
                        <th className="px-4 py-2 border border-gray-600 text-center">
                          Level
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamData
                        .slice(
                          (modalPage - 1) * modalItemsPerPage,
                          modalPage * modalItemsPerPage
                        )
                        .map((team, idx) => (
                          <tr
                            key={idx}
                            className="text-center hover:bg-gray-700/40 transition"
                          >
                            <td className="px-4 py-2 border border-gray-600">
                              {team.TTTIME || "-"}
                            </td>
                            <td className="px-4 py-2 border border-gray-600">
                              {team.USERNAME || "-"}
                            </td>
                            <td className="px-4 py-2 border border-gray-600">
                              {team.LEVEL || "-"}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination inside modal */}
                <div className="flex justify-between items-center mt-4">
                  <button
                    disabled={modalPage === 1}
                    onClick={() => setModalPage((p) => p - 1)}
                    className="px-3 py-1 rounded-md text-white bg-gray-700 disabled:opacity-50"
                  >
                    Prev
                  </button>

                  <p>
                    Page {modalPage} of{" "}
                    {Math.ceil(teamData.length / modalItemsPerPage)}
                  </p>

                  <button
                    disabled={
                      modalPage ===
                      Math.ceil(teamData.length / modalItemsPerPage)
                    }
                    onClick={() => setModalPage((p) => p + 1)}
                    className="px-3 py-1 rounded-md text-white bg-gray-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <p className="p-4">No team details available.</p>
            )}

            {/* Footer */}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowModal(false)}
                className={`py-1 px-3 rounded transition ${theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300"
                  }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalRankDetails;
