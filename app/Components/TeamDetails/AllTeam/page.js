"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Navbar from "../../Navbar/page";
import Footer from "../../Footer/page";
import { useRequireMemberDetails } from "@/app/hooks/useRequireMemberDetails";

const AllTeam = () => {
  const { ready, membCode } = useRequireMemberDetails();
  const { theme } = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const apiUrl = process.env.NEXT_PUBLIC_DREAM_DOLLAR_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("memb_code", membCode);
        formData.append("type", "allTeam");

        const res = await fetch(`${apiUrl}/Statistic/Reports`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Failed to fetch data");

        const result = await res.json();
        console.log(result);

        let parsedData = [];
        try {
          parsedData = result.Data ? (typeof result.Data === "string" ? JSON.parse(result.Data) : result.Data) : [];
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
  const filteredData = data.filter(
    (row) =>
      row.USERNAME?.toLowerCase().includes(search.toLowerCase()) ||
      row.LEVEL?.toString().includes(search) ||
      row.ACT_DATE?.toLowerCase().includes(search.toLowerCase())
  );

  // 🔹 Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  if (!ready) {
    return <div className="p-4 text-sm text-gray-500">Checking session…</div>;
  }

  return (
    <>
        <Navbar />
        <div className={`max-w-xl mx-auto mt-14 mb-20 p-4 transition-colors duration-300 ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"}`}>
          <h2 className="text-xl font-bold mb-4">All Team</h2>

          {/* Search */}
          <div className="flex justify-start mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by user, date, or level..."
              className={`w-full border rounded-full px-4 py-1 focus:outline-none focus:ring focus:ring-cyan-300 ${theme === "dark"
                ? "bg-gray-700 text-gray-200 border-gray-600 placeholder-gray-400"
                : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                }`}
            />
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
                      {/* Left: User info */}
                      <div className="flex items-center space-x-3">
                        {/* Serial Number Circle */}
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500 text-white font-bold">
                          {(currentPage - 1) * itemsPerPage + (idx + 1)}
                        </div>
                        <div>
                          <p className="font-medium">{item.USERNAME || "-"}</p>

                          <p className="text-xs">
                            {item.ACT_DATE}
                          </p>
                        </div>
                      </div>

                      {/* Right: Srno */}
                      <div className="text-right">
                        <p className="text-sm">
                          Level: {item.LEVEL || "-"}
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
    </>
  );
};

export default AllTeam;
