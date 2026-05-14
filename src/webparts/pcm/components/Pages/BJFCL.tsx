import * as React from "react";
import "../Pages/CSS/BJFCLHome.scss";
import { useHistory } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import "../Pages/CSS/Pcm.scss";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import { SPHttpClient } from "@microsoft/sp-http";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileExcel,
  faFilePdf,
  faPrint,
  faSearch,
  faPlus,
  faChevronDown,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import { IPcmProps } from "../../components/IPcmProps";
import SafetyViolationDetailsOps from "../../services/BAL/SafetyViolationDetailsMaster";

const Bjfcl: React.FC<IPcmProps> = (props: IPcmProps) => {
  const history = useHistory();

  const [violationData, setViolationData] = React.useState<any[]>([]);
  const [searchText, setSearchText] = React.useState<string>("");
  const [employmentFilter, setEmploymentFilter] = React.useState<string>("All");
  const [currentUser, setCurrentUser] = useState<any>(null);

  const getSafetyViolationData = async () => {
    try {
      const safetyOps = SafetyViolationDetailsOps();
      const data = await safetyOps.getSafetyViolationDetailsData(
        "",
        { column: "Id", isAscending: false },
        props,
      );
      console.log("Safety Violation Data:", data);
      setViolationData(data);
    } catch (error) {
      console.error("Error loading safety violation data:", error);
    }
  };

  // Search Filter
  const filteredData = violationData.filter((item: any) => {
    const search = searchText.toLowerCase();

    const matchesSearch =
      item.Title?.toLowerCase().includes(search) ||
      item.NameOfViolator?.toLowerCase().includes(search) ||
      item.ViolatorDepartment?.toLowerCase().includes(search) ||
      item.EmpNoOrGatePass?.toLowerCase().includes(search) ||
      item.ViolationDetails?.toLowerCase().includes(search);

    const matchesEmployment =
      employmentFilter === "All" || item.EmployementType === employmentFilter;

    return matchesSearch && matchesEmployment;
  });

  // ===============================
  // Export Excel
  // ===============================
  const handleExportExcel = async () => {
    try {
      // No Data Validation
      if (violationData.length === 0) {
        await Swal.fire({
          icon: "warning",
          title: "No Data",
          text: "No data available to export",
        });

        return;
      }

      const excelData = violationData.map((item: any) => ({
        "Request No": item.Title,

        "Request Date": item.RequestDate
          ? new Date(item.RequestDate).toLocaleDateString()
          : "",

        "Observation Date": item.ObservationDate
          ? new Date(item.ObservationDate).toLocaleDateString()
          : "",

        "Violation Details": item.ViolationDetails || "",

        "Employment Type": item.EmployementType || "",

        Severity: item.SeverityOfViolation || "",

        Violator: item.NameOfViolator || "",

        Agency: item.ContractorAgency || item.TransporterAgency || "",

        "Penalty Amount": item.PenaltyAmount || "",

        Status: item.Status || "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "SafetyViolation");

      XLSX.writeFile(workbook, "SafetyViolationDetails.xlsx");

      // Success Alert
      await Swal.fire({
        icon: "success",
        title: "Exported",
        text: "Excel exported successfully",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Excel Export Error:", error);

      // Error Alert
      await Swal.fire({
        icon: "error",
        title: "Export Failed",
        text: "Unable to export Excel",
      });
    }
  };

  // ===============================
  // Export PDF
  // ===============================
  const handleExportPDF = async () => {
    try {
      // No Data Validation
      if (violationData.length === 0) {
        void Swal.fire({
          icon: "warning",
          title: "No Data",
          text: "No data available to export",
        });

        return;
      }

      const doc = new jsPDF();

      doc.setFontSize(16);

      doc.text("Safety Violation Details", 14, 15);

      const tableColumn = [
        "Req No",
        "Request Date",
        "Severity",
        "Employment Type",
        "Violator",
        "Penalty",
        "Status",
      ];

      const tableRows: any[] = [];

      violationData.forEach((item: any) => {
        const row = [
          item.Title || "",

          item.RequestDate
            ? new Date(item.RequestDate).toLocaleDateString()
            : "",

          item.SeverityOfViolation || "",

          item.EmployementType || "",

          item.NameOfViolator || "",

          item.PenaltyAmount || "",

          item.Status || "",
        ];

        tableRows.push(row);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 25,
      });

      doc.save("SafetyViolationDetails.pdf");

      // Success Alert
      void Swal.fire({
        icon: "success",
        title: "Exported",
        text: "PDF exported successfully",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("PDF Export Error:", error);

      // Error Alert
      void Swal.fire({
        icon: "error",
        title: "Export Failed",
        text: "Unable to export PDF",
      });
    }
  };

  // ===============================
  // Print Table
  // ===============================
  const handlePrint = async () => {
    const printContents = document.getElementById("printTable")?.innerHTML;

    const printWindow = window.open("", "", "width=900,height=650");

    if (printWindow && printContents) {
      printWindow.document.write(`
      <html>
        <head>
          <title>Safety Violation Report</title>

          <style>
            body {
              font-family: Arial;
              padding: 20px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            table, th, td {
              border: 1px solid #000;
            }

            th, td {
              padding: 8px;
              text-align: left;
            }

            th {
              background-color: #f2f2f2;
            }
          </style>
        </head>

        <body>
          <h2>Safety Violation Report</h2>

          ${printContents}
        </body>
      </html>
    `);

      printWindow.document.close();

      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  React.useEffect(() => {
    void getSafetyViolationData();
  }, []);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await props.currentSPContext.spHttpClient
          .get(
            `${props.currentSPContext.pageContext.web.absoluteUrl}/_api/web/currentuser`,
            SPHttpClient.configurations.v1,
          )
          .then((res: Response) => res.json());

        setCurrentUser(user);
      } catch (error) {
        console.error("Error loading current user:", error);
      }
    };

    void loadCurrentUser();
  }, []);

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dash-header">
        {/* Left Logo */}
        <div className="dash-left">
          <img
            src={require("../../assets/ABGlogo.jpg")}
            alt="Logo"
            className="dash-logo"
          />

          <span className="dash-title">Safety Violation Details</span>
        </div>

        {/* Right User Info */}
        <div className="dash-right">
          <span className="dash-breadcrumb">Unit: BJFCL</span>

          <div className="dash-user">
            <i className="fas fa-user-circle"></i>
            <span>{currentUser?.Title}</span>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Action Section */}
        <div className="actions">
          {/* Left Buttons */}
          <div className="btn-group">
            <button className="btn" onClick={handleExportExcel}>
              <FontAwesomeIcon icon={faFileExcel} /> Excel
            </button>

            <button className="btn" onClick={handleExportPDF}>
              <FontAwesomeIcon icon={faFilePdf} /> PDF
            </button>

            <button className="btn" onClick={handlePrint}>
              <FontAwesomeIcon icon={faPrint} /> Print
            </button>
          </div>

          <div className="action-divider"></div>

          {/* Right Side */}
          <div className="right-actions">
            {/* Search */}
            <div className="search-wrapper">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Search violations..."
                className="search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            {/* Add Button */}
            <button
              className="btn add-btn"
              onClick={() => history.push("/SafetyViolationDetails")}
            >
              <FontAwesomeIcon icon={faPlus} className="btn-icon" />
              <span>Add Violation</span>
            </button>

            {/* Report */}
            <div className="report-dropdown">
              <div className="report-dropdown-wrapper">
                <button className="btn-outline report-btn">
                  <span>Report</span>

                  <FontAwesomeIcon icon={faChevronDown} className="btn-icon" />
                </button>

                <div className="report-dropdown-menu">
                  <button
                    className="report-dropdown-item"
                    onClick={() => history.push("/SeverityViolationReport")}
                  >
                    Severity Wise Violation Report
                  </button>

                  <button
                    className="report-dropdown-item"
                    onClick={() => history.push("/SeverityViolationReport")}
                  >
                    Detail Violation Report
                  </button>
                </div>
              </div>
            </div>

            {/* Filter */}
            {/* Filter */}
            <div className="report-dropdown">
              <div className="report-dropdown-wrapper">
                <button className="btn-outline report-btn">
                  <FontAwesomeIcon icon={faFilter} className="btn-icon" />

                  <span>
                    {employmentFilter === "All" ? "Filter" : employmentFilter}
                  </span>

                  <FontAwesomeIcon icon={faChevronDown} className="btn-icon" />
                </button>

                <div className="report-dropdown-menu">
                  <button
                    className="report-dropdown-item"
                    onClick={() => setEmploymentFilter("All")}
                  >
                    All
                  </button>

                  <button
                    className="report-dropdown-item"
                    onClick={() => setEmploymentFilter("Employee")}
                  >
                    Employee
                  </button>

                  <button
                    className="report-dropdown-item"
                    onClick={() => setEmploymentFilter("Contractor")}
                  >
                    Contractor
                  </button>

                  <button
                    className="report-dropdown-item"
                    onClick={() => setEmploymentFilter("Transporter")}
                  >
                    Transporter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="table-wrapper">
          <div id="printTable">
            <table className="table">
              <thead>
                <tr>
                  <th>Violation No</th>
                  <th>Date</th>
                  <th>Observation Date</th>
                  <th>EC No / Gate Pass No</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Employment Type</th>
                  <th>Severity Of Violation</th>
                  <th>Violation Details</th>
                  <th>Vendor / Contractor Details</th>
                  <th>Penalty Amount</th>
                  <th>Type Of Consequence</th>
                  <th>Suggested Consequence</th>
                  <th>Actual Consequence</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item: any, index: number) => (
                    <tr key={index}>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                          }}
                        >
                          {/* Existing Req No Link */}
                          <span
                            className="violation-link"
                            onClick={() => {
                              console.log("ROW ITEM:", item);
                              console.log("Clicked ID:", item.Id);

                              history.push(
                                `/SafetyViolationRequestEdit?ReqID=${item.Title}`,
                              );
                            }}
                          >
                            {item.Title}
                          </span>

                          {/* PDF Icon */}
                          {item.Status === "Submitted" && (
                            <FontAwesomeIcon
                              icon={faFilePdf}
                              title="View PDF"
                              style={{
                                color: "red",
                                cursor: "pointer",
                                fontSize: "18px",
                              }}
                              onClick={() => {
                                history.push(
                                  `/SafetyViolationPdf?ReqNo=${item.Title}`,
                                );
                              }}
                            />
                          )}
                        </div>
                      </td>
                      <td>
                        {item.RequestDate
                          ? new Date(item.RequestDate).toLocaleDateString()
                          : ""}
                      </td>
                      <td>
                        {item.ObservationDate
                          ? new Date(item.ObservationDate).toLocaleDateString()
                          : ""}
                      </td>
                      <td>{item.EmpNoOrGatePass}</td>
                      <td>{item.NameOfViolator}</td>
                      <td>{item.ViolatorDepartment}</td>
                      <td>{item.EmployementType}</td>
                      <td>{item.SeverityOfViolation}</td>
                      <td>{item.ViolationDetails}</td>
                      <td>
                        {item.ContractorAgency ||
                        item.TransporterAgency ||
                        item.VendorCode
                          ? `${item.ContractorAgency || ""} ${item.TransporterAgency || ""} ${item.VendorCode || ""}`
                          : ""}
                      </td>
                      <td>{item.PenaltyAmount}</td>
                      <td>{item.TypeOfConsequence}</td>
                      <td>{item.SuggestedConsequence}</td>
                      <td>{item.ActualConsequence}</td>
                      <td>{item.Status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={15} style={{ textAlign: "center" }}>
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bjfcl;
