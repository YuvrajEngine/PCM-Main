import * as React from "react";
import "../Pages/CSS/SeverityViolationReport.scss";
import "../Pages/CSS/Pcm.scss";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFileExcel } from "@fortawesome/free-solid-svg-icons";

import * as XLSX from "xlsx";
import Swal from "sweetalert2";

import SafetyViolationDetailsOps from "../../services/BAL/SafetyViolationDetailsMaster";
import { IPcmProps } from "../IPcmProps";

const SeverityViolationReport: React.FC<IPcmProps> = (props) => {
  const [employmentType, setEmploymentType] = React.useState("");
  const [financialYear, setFinancialYear] = React.useState("");
  const [month, setMonth] = React.useState("");
  const [violator, setViolator] = React.useState("");

  const [reportData, setReportData] = React.useState<any[]>([]);
  const [financialYears, setFinancialYears] = React.useState<string[]>([]);
  const [allData, setAllData] = React.useState<any[]>([]);

  const months = [
    "All",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // =========================================
  // Load Initial Data
  // =========================================
  const loadFiltersData = async () => {
    try {
      const safetyOps = SafetyViolationDetailsOps();

      const data = await safetyOps.getSafetyViolationDetailsData(
        "",
        {
          column: "RequestDate",
          isAscending: false,
        },
        props,
      );

      setAllData(data);

      const yearsSet = new Set<string>();

      data.forEach((item: any) => {
        if (!item.RequestDate) return;

        const date = new Date(item.RequestDate);

        const year = date.getFullYear();
        const monthNo = date.getMonth() + 1;

        let fy = "";

        if (monthNo >= 4) {
          fy = `${year}-${year + 1}`;
        } else {
          fy = `${year - 1}-${year}`;
        }

        yearsSet.add(fy);
      });

      setFinancialYears(Array.from(yearsSet).sort().reverse());
    } catch (error) {
      console.error("Error loading filters:", error);
    }
  };

  // =========================================
  // Search Report
  // =========================================
  const loadReportData = async () => {
    try {
      // Validation
      if (!employmentType || !financialYear || !month) {
        await Swal.fire({
          icon: "warning",
          title: "Required",
          text: "Please Select All Fields !",
        });

        return;
      }

      let filteredData = [...allData];

      // Employment Type Filter
      filteredData = filteredData.filter(
        (item: any) => item.EmployementType?.trim() === employmentType,
      );

      // Financial Year Filter
      filteredData = filteredData.filter((item: any) => {
        if (!item.RequestDate) return false;

        const date = new Date(item.RequestDate);

        const year = date.getFullYear();
        const monthNo = date.getMonth() + 1;

        let fy = "";

        if (monthNo >= 4) {
          fy = `${year}-${year + 1}`;
        } else {
          fy = `${year - 1}-${year}`;
        }

        return fy === financialYear;
      });

      // Month Filter
      if (month !== "All") {
        filteredData = filteredData.filter((item: any) => {
          if (!item.RequestDate) return false;

          const date = new Date(item.RequestDate);

          const monthName = date.toLocaleString("default", {
            month: "long",
          });

          return monthName === month;
        });
      }

      // Violator Search
      if (violator.trim()) {
        filteredData = filteredData.filter((item: any) =>
          (item.NameOfViolator || "")
            .toLowerCase()
            .includes(violator.toLowerCase()),
        );
      }

      // =========================================
      // Group Data
      // =========================================
      const grouped: any = {};

      filteredData.forEach((item: any) => {
        const name = item.NameOfViolator || "Unknown";

        const severity = item.SeverityOfViolation || "";

        if (!grouped[name]) {
          grouped[name] = {
            violator: name,
            S1: 0,
            S2: 0,
            S3: 0,
            Total: 0,
          };
        }

        if (severity === "S1") {
          grouped[name].S1 += 1;
          grouped[name].Total += 1;
        }

        if (severity === "S2") {
          grouped[name].S2 += 1;
          grouped[name].Total += 1;
        }

        if (severity === "S3") {
          grouped[name].S3 += 1;
          grouped[name].Total += 1;
        }
      });

      const finalData = Object.keys(grouped).map((key) => grouped[key]);

      setReportData(finalData);

      if (finalData.length === 0) {
        await Swal.fire({
          icon: "info",
          title: "No Data",
          text: "No records found",
        });
      }
    } catch (error) {
      console.error("Error loading report data:", error);

      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while loading report",
      });
    }
  };

  // =========================================
  // Export Excel
  // =========================================
  const handleExportExcel = async () => {
    try {
      if (reportData.length === 0) {
        await Swal.fire({
          icon: "warning",
          title: "No Data",
          text: "No data available to export",
        });

        return;
      }

      const excelData = reportData.map((item: any) => ({
        "Name Of Violator": item.violator,
        S1: item.S1,
        S2: item.S2,
        S3: item.S3,
        Total: item.Total,
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Severity Report");

      XLSX.writeFile(workbook, "SeverityViolationReport.xlsx");

      await Swal.fire({
        icon: "success",
        title: "Exported",
        text: "Excel exported successfully",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Excel Export Error:", error);

      await Swal.fire({
        icon: "error",
        title: "Export Failed",
        text: "Unable to export excel",
      });
    }
  };

  const history = useHistory();

  React.useEffect(() => {
    void loadFiltersData();
  }, []);

  return (
    <div className="severity-report-page">
      {/* Header */}
      <div className="severity-title">
        <h2>Severity Violation Report</h2>
      </div>

      {/* Filter Section */}
      <div className="severity-filter-card">
        <div className="severity-filter-grid">
          {/* Employment Type */}
          <div className="severity-field">
            <label>Employment Type:</label>

            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
            >
              <option value="">--Select--</option>

              <option value="Employee">Employee</option>

              <option value="Contractor">Contractor</option>

              <option value="Transporter">Transporter</option>
            </select>
          </div>

          {/* Financial Year */}
          <div className="severity-field">
            <label>Financial Year:</label>

            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
            >
              <option value="">--Select--</option>

              {financialYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div className="severity-field">
            <label>Month:</label>

            <select value={month} onChange={(e) => setMonth(e.target.value)}>
              <option value="">--Select--</option>

              {months.map((monthName) => (
                <option key={monthName} value={monthName}>
                  {monthName}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="severity-btn-group">
            <button className="search-btn" onClick={loadReportData}>
              <FontAwesomeIcon icon={faSearch} />

              <span>Search</span>
            </button>

            <button className="severity-excel-btn" onClick={handleExportExcel}>
              <FontAwesomeIcon icon={faFileExcel} />

              <span>Export to Excel</span>
            </button>
            <button
              className="btn-ghost"
              onClick={() => history.push("/bjfcl")}
            >
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* Violator Search */}
        <div className="violator-search-row">
          <div className="severity-field violator-field">
            <label>Search Violator:</label>

            <input
              type="text"
              placeholder="Enter violator name"
              value={violator}
              onChange={(e) => setViolator(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="severity-table-wrapper">
        <table className="severity-table">
          <thead>
            <tr>
              <th>Name Of Violator</th>
              <th>S1</th>
              <th>S2</th>
              <th>S3</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {reportData.length > 0 ? (
              reportData.map((item: any, index: number) => (
                <tr key={index}>
                  <td>{item.violator}</td>
                  <td>{item.S1}</td>
                  <td>{item.S2}</td>
                  <td>{item.S3}</td>
                  <td>{item.Total}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: "center",
                    padding: "30px",
                  }}
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SeverityViolationReport;
