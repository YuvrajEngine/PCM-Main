import * as React from "react";
import "../Pages/CSS/SeverityViolationReport.scss";
import "../Pages/CSS/Pcm.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import SPCRUDOPS from "../../services/DAL/spcrudops";
import SafetyViolationDetailsOps from "../../services/BAL/SafetyViolationDetailsMaster";
import { IPcmProps } from "../IPcmProps";

const SeverityViolationReport: React.FC<IPcmProps> = (props) => {
  const [employmentType, setEmploymentType] = React.useState("");
  const [financialYear, setFinancialYear] = React.useState("");
  const [month, setMonth] = React.useState("");
  const [violator, setViolator] = React.useState("");

  const [reportData, setReportData] = React.useState<any[]>([]);
  const [financialYears, setFinancialYears] = React.useState<string[]>([]);
  const [months, setMonths] = React.useState<string[]>([]);

  React.useEffect(() => {
    loadFiltersData();
  }, []);

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

      const yearsSet = new Set<string>();
      const monthsSet = new Set<string>();

      const monthNames = [
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

      data.forEach((item: any) => {
        if (!item.RequestDate) return;

        const date = new Date(item.RequestDate);

        const year = date.getFullYear();
        const monthIndex = date.getMonth();

        // Financial Year
        let fy = "";

        if (monthIndex + 1 >= 4) {
          fy = `${year}-${year + 1}`;
        } else {
          fy = `${year - 1}-${year}`;
        }

        yearsSet.add(fy);

        // Month
        monthsSet.add(monthNames[monthIndex]);
      });

      setFinancialYears(Array.from(yearsSet).sort().reverse());

      setMonths(monthNames);

    } catch (error) {
      console.error("Error loading filters:", error);
    }
  };

  const loadReportData = async () => {
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

      let filteredData = [...data];

      // Employment Type
      if (employmentType) {
        filteredData = filteredData.filter(
          (item: any) => item.EmployementType === employmentType,
        );
      }

      // Month
      if (month) {
        filteredData = filteredData.filter((item: any) => {
          const date = new Date(item.RequestDate);

          const monthName = date.toLocaleString("default", {
            month: "long",
          });

          return monthName === month;
        });
      }

      // Financial Year
      if (financialYear) {
        filteredData = filteredData.filter((item: any) => {
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
      }

      // Violator Search
      if (violator) {
        filteredData = filteredData.filter((item: any) =>
          item.ViolatorName?.toLowerCase().includes(violator.toLowerCase()),
        );
      }

      // Grouping
      const grouped: any = {};

      filteredData.forEach((item: any) => {
        const name = item.ViolatorName || "Unknown";
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
        }

        if (severity === "S2") {
          grouped[name].S2 += 1;
        }

        if (severity === "S3") {
          grouped[name].S3 += 1;
        }

        grouped[name].Total += 1;
      });

      setReportData(Object.keys(grouped).map((key) => grouped[key]));
    } catch (error) {
      console.error("Error loading report data:", error);
    }
  };

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
            <label>Employement Type:</label>

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

            <button className="severity-excel-btn">
              <FontAwesomeIcon icon={faFileExcel} />
              <span>Export to Excel</span>
            </button>
          </div>
        </div>

        {/* Violator Search */}
        <div className="violator-search-row">
          <div className="severity-field violator-field">
            <label>Search Violator:</label>

            <input
              type="text"
              value={violator}
              onChange={(e) => setViolator(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
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
