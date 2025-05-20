import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/ProfitReports.css";
import Navbar from "../Navbar";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";

ChartJS.register(...registerables);

function ProfitReports() {
  const [reportData, setReportData] = useState(null);
  const [branchCapital, setBranchCapital] = useState({
    productCount: 0,
    totalQuantity: 0,
    totalAssets: 0,
    totalProfitMargin: 0
  });
  const [branchId, setBranchId] = useState("");
  const [branches, setBranches] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [capitalLoading, setCapitalLoading] = useState(false);
  const role = localStorage.getItem("role");
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4321";


  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/branches`);
        setBranches(response.data);

        const storedBranchId = localStorage.getItem("branchId");
        if (storedBranchId) {
          setBranchId(storedBranchId);
        } else if (response.data.length > 0) {
          setBranchId(response.data[0]._id);
        }
      } catch (err) {
        console.error("Error fetching branches:", err);
      }
    };

    fetchBranches();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL]);

  useEffect(() => {
    if (branchId) {
      fetchBranchCapital();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  useEffect(() => {
    if (branchId && startDate && endDate) {
      fetchProfitReport();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId, startDate, endDate]);

  const fetchBranchCapital = async () => {
    if (!branchId) return;

    setCapitalLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `${API_URL}/api/branch-capital`,
        { params: { branchId } }
      );

      setBranchCapital(response.data.branchCapital || {
        productCount: 0,
        totalQuantity: 0,
        totalAssets: 0,
        totalProfitMargin: 0
      });
    } catch (err) {
      setError("حدث خطأ أثناء حساب رأس مال الفرع");
      console.error("Error fetching branch capital:", err);
      setBranchCapital({
        productCount: 0,
        totalQuantity: 0,
        totalAssets: 0,
        totalProfitMargin: 0
      });
    } finally {
      setCapitalLoading(false);
    }
  };

  const fetchProfitReport = async () => {
    if (!startDate || !endDate || !branchId) return;

    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `${API_URL}/api/profit-report`,
        { params: { branchId, startDate, endDate } }
      );

      setReportData(response.data);
      prepareChartData(response.data);
    } catch (err) {
      setError("حدث خطأ أثناء جلب تقرير الأرباح");
      console.error("Error fetching profit report:", err);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (data) => {
    setChartData({
      labels: ["الأرباح", "المبيعات", "الكميات المباعة"],
      datasets: [
        {
          label: "أداء الفترة",
          data: [data.actualProfit, data.totalSales, data.totalItemsSold],
          backgroundColor: [
            data.actualProfit >= 0
              ? "rgba(75, 192, 192, 0.6)"
              : "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
          ],
          borderColor: [
            data.actualProfit >= 0
              ? "rgba(75, 192, 192, 1)"
              : "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
          ],
          borderWidth: 1,
        },
      ],
    });
  };

  const handleBranchChange = (e) => {
    setBranchId(e.target.value);
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    if (name === "startDate") {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
  };

  const formatNumber = (num) => {
    return num?.toLocaleString("en-US") || "0";
  };

  return (
    <>
      <Navbar isAdmin={role === "admin"} />
      <div className="profit-report-container" style={{ direction: "rtl" }}>
        <h1>تقارير الأرباح</h1>

        {branches.length === 0 ? (
          <div className="error-message">جاري تحميل بيانات الفروع...</div>
        ) : (
          <>
            <div className="branch-selector">
              <label htmlFor="branch">اختر الفرع:</label>
              <select id="branch" value={branchId} onChange={handleBranchChange}>
                <option value="all">جميع الفروع</option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            {branchId && (
              <div className="capital-section">
                <h2>{branchId === "all" ? "رأس مال جميع الفروع" : "رأس مال الفرع"}</h2>
                {capitalLoading ? (
                  <p>جاري حساب رأس المال...</p>
                ) : (
                  <>
                    <div className="capital-summary">
                      <p>
                        عدد المنتجات ={" "}
                        {formatNumber(branchCapital?.productCount)} ، كميات{" "}
                        {formatNumber(branchCapital?.totalQuantity)} تعادل{" "}
                        {formatNumber(branchCapital?.totalAssets)} جنية
                      </p>
                    </div>
                    <div className="profit-margin-section">
                      <h3>هامش الربح</h3>
                      <p>
                        إجمالي هامش الربح المحتمل:{" "}
                        {formatNumber(branchCapital?.totalProfitMargin)} جنية
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            <h2>اختر الفترة الزمنية للحصول على تقرير الأرباح:</h2>
            <div className="profit-filters">
              <label htmlFor="startDate">من:</label>
              <input
                type="date"
                name="startDate"
                value={startDate}
                onChange={handleDateRangeChange}
              />
              <label htmlFor="endDate">إلى:</label>
              <input
                type="date"
                name="endDate"
                value={endDate}
                onChange={handleDateRangeChange}
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {loading && <div className="loading-message">جاري تحميل التقرير...</div>}

            {reportData && (
              <div className="report-summary" style={{ textAlign: "right" }}>
                <h2>تقرير الأداء</h2>
                {branchId === "all" && <h3>إجمالي جميع الفروع</h3>}

                <div className="metrics-grid">
                  <div className={`metric-card ${reportData.actualProfit >= 0 ? "profit" : "loss"}`}>
                    <h3>الأرباح</h3>
                    <p className="value">
                      {formatNumber(Math.abs(reportData.actualProfit))} جنيه
                      {reportData.actualProfit < 0 && " (خسارة)"}
                    </p>
                    <p className="rate">
                      معدل الربح: {reportData.profitRate.toFixed(2)}%
                      {reportData.profitRate < 0 && " (خسارة)"}
                    </p>
                  </div>

                  <div className="metric-card sales">
                    <h3>المبيعات</h3>
                    <p className="value">
                      {formatNumber(reportData.totalSales)} جنيه
                    </p>
                    <p className="items">
                      الكمية المباعة: {formatNumber(reportData.totalItemsSold)}
                    </p>
                  </div>

                  <div className="metric-card inventory">
                    <h3>المخزون</h3>
                    <p className="value">
                      الكمية الأولية: {formatNumber(reportData.totalAvailableItems)}
                    </p>
                    <p className="rate">
                      معدل البيع: {reportData.sellThroughRate.toFixed(2)}%
                    </p>
                  </div>
                </div>

                {chartData && (
                  <div className="chart-section">
                    <h3>الرسم البياني للأداء</h3>
                    <div className="chart-container">
                      <Bar
                        data={chartData}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: "top",
                              rtl: true,
                              labels: {
                                font: {
                                  family: "Tahoma",
                                  size: 14,
                                },
                              },
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                font: {
                                  family: "Tahoma",
                                },
                              },
                            },
                            x: {
                              ticks: {
                                font: {
                                  family: "Tahoma",
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="report-period">
                  الفترة من {new Date(reportData.dateRange.start).toLocaleDateString("ar-EG")} إلى{" "}
                  {new Date(reportData.dateRange.end).toLocaleDateString("ar-EG")}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default ProfitReports;