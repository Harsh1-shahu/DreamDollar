"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Footer from "../../Footer/page";
import Navbar from "../../Navbar/page";

const AutoLevelDetails = () => {
  const { theme } = useTheme();

  const [data, setData] = useState([]);
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

        // 🔹 Build form-data request
        const formData = new FormData();
        formData.append("memb_code", "101"); // Make Dynamic later
        formData.append("type", "autoPoolIncome");

        const res = await fetch(`${apiUrl}/Statistic/Reports`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Failed to fetch data");

        const result = await res.json();
        
        if (result.ResponseStatus === "success" && result.Data) {
          let parsedData = [];
          try {
            parsedData = JSON.parse(result.Data);

            parsedData.sort((a, b) => {
              const parseDate = (dateStr) => {
                if (!dateStr) return new Date(0); // fallback if empty
                const [day, month, year] = dateStr.split("-");
                return new Date(`${year}-${month}-${day}`); // convert to YYYY-MM-DD
              };

              return parseDate(b.TDATE) - parseDate(a.TDATE); // latest first
            });

            setData(parsedData || []);
          } catch (e) {
            console.error("Error parsing Data:", e);
            setData([]); // fallback to empty array
          }
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

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
    <>
      <Navbar />
      <div
        className={`mt-14 mb-20 p-4 transition-colors duration-300 ${theme === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-100 text-gray-900"
          }`}
      >
        <h2 className="text-xl font-bold mb-4">Auto Pool</h2>

        {/* Loading / Error */}
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
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500 text-white font-bold">
                        {item.username?.toString().slice(0, 2) || "NA"}
                      </div>
                      <div>
                        <p className="font-medium">{item.username}</p>
                        <p className="text-sm ">
                          {item.TDATE}
                        </p>

                      </div>
                    </div>

                    {/* Level */}
                    <p className="text-sm">
                      Level {item.LEVEL ?? "-"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No records found.</p>
              )}
            </div>

            {/* Pagination */}
            {data.length > itemsPerPage && (
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

export default AutoLevelDetails;
