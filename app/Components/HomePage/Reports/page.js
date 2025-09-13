"use client";
import React, { useState, useEffect } from "react";
import { useProject } from "@/app/Context/ProjectContext";

const Reports = () => {
  const { theme, getMembCode } = useProject();
  const apiUrl = process.env.NEXT_PUBLIC_DREAM_DOLLAR_URL;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedClone, setSelectedClone] = useState(null);
  const [levelIndex, setLevelIndex] = useState(1);

  // AutoLevelSummary state
  const [autoLevelSummary, setAutoLevelSummary] = useState([]);
  const [autoLevelLoading, setAutoLevelLoading] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const memb_code = getMembCode;

        const formData = new FormData();
        formData.append("memb_code", "101");
        formData.append("type", "DashboardDetails");

        const res1 = await fetch(`${apiUrl}/Statistic/DashboardDetails`, {
          method: "POST",
          body: formData,
        });

        if (!res1.ok) throw new Error("Failed to fetch DashboardDetails");
        const result1 = await res1.json();

        // --- DashboardDetails ---
        if (result1.ResponseStatus === "success" && result1.Data?.cloneDetails) {
          let cloneData = result1.Data.cloneDetails;
          if (typeof cloneData === "string") {
            try {
              cloneData = JSON.parse(cloneData);
            } catch {
              cloneData = [];
            }
          }
          setData(Array.isArray(cloneData) ? cloneData : [cloneData]);
        }
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [apiUrl]);

  // Fetch AutoLevelSummary when a clone is selected
  useEffect(() => {
    const fetchAutoLevelSummary = async () => {
      if (!selectedClone) return;

      try {
        setAutoLevelLoading(true);
        setAutoLevelSummary([]);

        const formData2 = new FormData();
        formData2.append("memb_code", "101");
        formData2.append("type", "AutoLevelSummaryDetails");
        formData2.append("level", "0");
        formData2.append("club_code", selectedClone.CLUB_CODE); // 👈 dynamic club_code

        const res2 = await fetch(`${apiUrl}/Statistic/AutoLevelSummaryDetails`, {
          method: "POST",
          body: formData2,
        });

        if (!res2.ok) throw new Error("Failed to fetch AutoLevelSummaryDetails");

        const result2 = await res2.json();
        console.log("AutoLevelSummaryDetails:", result2);

        if (result2.ResponseStatus === "success" && result2.Data) {
          let summaryData = result2.Data;
          if (typeof summaryData === "string") {
            try {
              summaryData = JSON.parse(summaryData);
            } catch {
              summaryData = [];
            }
          }
          setAutoLevelSummary(
            Array.isArray(summaryData) ? summaryData : [summaryData]
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setAutoLevelLoading(false);
      }
    };

    fetchAutoLevelSummary();
  }, [selectedClone, apiUrl]);

  const totalAmount = Array.isArray(data)
    ? data.reduce((acc, row) => acc + (Number(row.AMOUNT) || 0), 0)
    : 0;

  const maxAmount = Math.max(...data.map((row) => Number(row.AMOUNT) || 0));

  // Modal-autoLevelTotal
  const autoLevelTotal = Array.isArray(autoLevelSummary)
    ? autoLevelSummary.reduce((acc, row) => acc + (Number(row.AMT) || 0), 0)
    : 0;

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil((data?.length || 0) / rowsPerPage);

  const currentRows = Array.isArray(data)
    ? data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    : [];

  return (
    <div
      className={`p-6 mb-16 shadow-md rounded-lg ${theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
        }`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold mb-4">Clone Report</h2>

        {/* Total Amount */}
        <div
          className={`w-fit flex gap-2 font-semibold rounded-md p-1 mb-4 ${theme === "dark" ? " bg-green-700" : " bg-green-500/80"
            }`}
        >
          <span>Total:</span>
          <span>${totalAmount}</span>
        </div>
      </div>

      {loading && <p className="text-blue-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && data.length > 0 && (
        <>
          <div>
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr
                  className={`border-b ${theme === "dark"
                    ? "text-gray-300 border-gray-700"
                    : "text-gray-600 border-gray-200"
                    }`}
                >
                  <th className="p-3">Clone</th>
                  <th className="p-3 w-2/3">Contribution</th>
                  <th className="p-3">Amount</th>
                </tr>
              </thead>

              <tbody>
                {currentRows.map((row, index) => {
                  const amount = Number(row.AMOUNT) || 0;
                  const globalIndex =
                    (currentPage - 1) * rowsPerPage + index + 1;
                  const name = row.CLONE || row.name || `Clone ${globalIndex}`;
                  const percentage = maxAmount
                    ? ((amount / maxAmount) * 100).toFixed(1)
                    : "0.0";

                  return (
                    <tr
                      key={index}
                      onClick={() => {
                        setSelectedClone(row);
                        setLevelIndex(globalIndex); // ✅ clone order decides "Auto Level N"
                      }}
                      className={`cursor-pointer border-b transition-colors ${theme === "dark"
                        ? "border-gray-700 hover:bg-gray-700"
                        : "border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                      <td className="p-3 font-medium whitespace-nowrap">
                        {name}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-full h-2 rounded ${theme === "dark" ? "bg-gray-600" : "bg-gray-200"
                              }`}
                          >
                            <div
                              className="h-2 rounded bg-blue-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span
                            className={`text-xs w-12 ${theme === "dark" ? "text-gray-300" : "text-gray-600"
                              }`}
                          >
                            {percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3">${amount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 text-sm">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                className={`px-3 py-1 rounded ${theme === "dark"
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <button
                className={`px-3 py-1 rounded ${theme === "dark"
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {selectedClone && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div
            className={`rounded-lg shadow-lg w-full max-w-lg p-6 overflow-y-auto ${theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
              }`}
          >
            {/* Title */}
            <h3 className="text-lg font-semibold mb-4">
              Auto Level {levelIndex} Team
            </h3>

            {/* Auto Level Summary Table */}
            {autoLevelLoading ? (
              <p className="text-blue-500">Loading Auto Level Summary...</p>
            ) : autoLevelSummary.length > 0 ? (
              <div className="overflow-x-auto mt-6">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead
                    className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                      }`}
                  >
                    <tr>
                      <th className="px-4 py-2 border">LEVEL</th>
                      <th className="px-4 py-2 border">TEAM</th>
                      <th className="px-4 py-2 border">INCOME</th>
                    </tr>
                  </thead>
                  <tbody>
                    {autoLevelSummary.map((row, idx) => (
                      <tr key={idx} className="text-center">
                        <td className="px-4 py-2 border">{row.LEVELX}</td>
                        <td className="px-4 py-2 border">{row.TEAM}</td>
                        <td className="px-4 py-2 border">${row.AMT}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr
                      className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                        }`}
                    >
                      <td
                        colSpan={2}
                        className="px-4 py-2 border font-semibold text-center"
                      >
                        TOTAL :
                      </td>
                      <td className="py-2 border font-semibold text-center">
                        ${autoLevelTotal}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No Auto Level Summary Found</p>
            )}

            {/* Close button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedClone(null)}
                className={`py-1 px-4 rounded transition ${theme === "dark"
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
    </div>
  );
};

export default Reports;
