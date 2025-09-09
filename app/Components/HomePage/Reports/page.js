"use client";
import React, { useState, useEffect } from "react";
import { useProject } from "@/app/Context/ProjectContext";

const Reports = () => {
  const { theme } = useProject();
  const apiUrl = process.env.NEXT_PUBLIC_DREAM_DOLLAR_URL;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedClone, setSelectedClone] = useState(null); // <-- for popup
  const [modalPage, setModalPage] = useState(1); //popup pagination

  const autoLevelData = {
    CLONE: "Auto Level 1 Team",
    levels: [
      { level: 1, team: 2, income: 2 },
      { level: 2, team: 4, income: 4 },
      { level: 3, team: 8, income: 8 },
      { level: 4, team: 16, income: 16 },
      { level: 5, team: 32, income: 32 },
      { level: 6, team: 64, income: 64 },
      { level: 7, team: 128, income: 128 },
      { level: 8, team: 256, income: 256 },
      { level: 9, team: 512, income: 512 },
      { level: 10, team: 1024, income: 1024 },
    ],
    totalIncome: 2046,
  };

  useEffect(() => {
    const fetchCloneDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("memb_code", "101"); // TODO: replace dynamically
        formData.append("type", "DashboardDetails");

        const res = await fetch(`${apiUrl}/Statistic/DashboardDetails`, {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Failed to fetch data");

        const result = await res.json();

        if (result.ResponseStatus === "success" && result.Data?.cloneDetails) {
          let cloneData = result.Data.cloneDetails;

          if (typeof cloneData === "string") {
            try {
              cloneData = JSON.parse(cloneData);
            } catch (e) {
              console.error("Error parsing cloneDetails:", e);
              cloneData = [];
            }
          }
          setData(Array.isArray(cloneData) ? cloneData : [cloneData]);
        } else {
          setError("cloneDetails not found in response");
        }
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchCloneDetails();
  }, [apiUrl]);

  const totalAmount = Array.isArray(data)
    ? data.reduce((acc, row) => acc + (Number(row.AMOUNT) || 0), 0)
    : 0;

  const maxAmount = Math.max(...data.map((row) => Number(row.AMOUNT) || 0));

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
      <h2 className="text-lg font-semibold mb-4">Clone Report</h2>

      {loading && <p className="text-blue-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && data.length > 0 && (
        <>
          {/* Total Amount */}
          <div className="flex justify-end">
            <div className="w-fit flex gap-2 font-semibold bg-green-600 rounded-md p-1">
              <span>Total:</span>
              <span>${totalAmount}</span>
            </div>
          </div>

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
                  const globalIndex = (currentPage - 1) * rowsPerPage + index + 1;
                  const name = row.CLONE || row.name || `Clone ${globalIndex}`;
                  const percentage = maxAmount
                    ? ((amount / maxAmount) * 100).toFixed(1)
                    : "0.0";

                  return (
                    <tr
                      key={index}
                      onClick={() => setSelectedClone(row)} // <-- click event
                      className={`cursor-pointer border-b transition-colors ${theme === "dark"
                        ? "border-gray-700 hover:bg-gray-700"
                        : "border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                      <td className="p-3 font-medium">{name}</td>
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
            className={`rounded-lg shadow-lg w-full max-w-2xl p-6 overflow-y-auto ${theme === "dark"
                ? "bg-gray-800 text-gray-100"
                : "bg-white text-gray-900"
              }`}
          >
            <h3 className="text-lg font-semibold mb-4">
              {autoLevelData.CLONE}
            </h3>

            {/* Pagination Logic */}
            {(() => {
              const rowsPerPage = 10; // show 5 levels per page
              const totalPages = Math.ceil(autoLevelData.levels.length / rowsPerPage);

              const startIndex = (modalPage - 1) * rowsPerPage;
              const currentRows = autoLevelData.levels.slice(
                startIndex,
                startIndex + rowsPerPage
              );

              return (
                <>
                  {/* Table inside Modal */}
                  <div className="overflow-x-auto">
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
                        {currentRows.map((row, idx) => (
                          <tr key={idx} className="text-center">
                            <td className="px-4 py-2 border">{row.level}</td>
                            <td className="px-4 py-2 border">{row.team}</td>
                            <td className="px-4 py-2 border">${row.income}</td>
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
                            className="px-4 py-2 border font-semibold text-right"
                          >
                            TOTAL
                          </td>
                          <td className="px-4 py-2 border font-semibold">
                            ${autoLevelData.totalIncome}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex justify-between items-center mt-4 text-sm">
                    <span>
                      Page {modalPage} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        className={`px-3 py-1 rounded ${theme === "dark"
                            ? "bg-gray-700 text-white hover:bg-gray-600"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                          }`}
                        onClick={() => setModalPage((p) => Math.max(p - 1, 1))}
                        disabled={modalPage === 1}
                      >
                        Prev
                      </button>
                      <button
                        className={`px-3 py-1 rounded ${theme === "dark"
                            ? "bg-gray-700 text-white hover:bg-gray-600"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                          }`}
                        onClick={() =>
                          setModalPage((p) => Math.min(p + 1, totalPages))
                        }
                        disabled={modalPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}

            {/* Close button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedClone(null)}
                className={`px-4 py-2 rounded ${theme === "dark"
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
