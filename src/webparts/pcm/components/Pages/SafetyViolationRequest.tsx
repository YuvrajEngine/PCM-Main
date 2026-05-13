import * as React from "react";
import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import "../Pages/CSS/SafetyViolationRequest.scss";
import "../Pages/CSS/Pcm.scss";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";

import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import SafetyViolationEventMasterOps from "../../services/BAL/SafetyViolationEventMaster";
import SeverityMatrixOps from "../../services/BAL/SeverityMatrixMaster";
import EmployeeMasterOps from "../../services/BAL/EmployeeMaster";
import ContractorAgencyMasterOps from "../../services/BAL/ContractorAgencyMaster";
import TransporterAgencyMasterOps from "../../services/BAL/TransporterAgencyMaster";

import SPCRUDOPS from "../../services/DAL/spcrudops";

import { IPcmProps } from "../IPcmProps";

const SafetyViolationDetails: React.FC<IPcmProps> = (props) => {
  const history = useHistory();

  const eventMasterOps = SafetyViolationEventMasterOps();
  const severityMatrixOps = SeverityMatrixOps();
  const employeeMasterOps = EmployeeMasterOps();
  const contractorAgencyOps = ContractorAgencyMasterOps();
  const transporterAgencyOps = TransporterAgencyMasterOps();

  const [submitting, setSubmitting] = useState(false);

  const [attachments, setAttachments] = useState<FileList | null>(null);

  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [severityList, setSeverityList] = useState<any[]>([]);
  const [employeeData, setEmployeeData] = useState<any>(null);

  const [contractorAgencies, setContractorAgencies] = useState<any[]>([]);
  const [transporterAgencies, setTransporterAgencies] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    typeOfViolation: "",
    severity: "",
    violationWithRespectTo: "",
    eventType: "",
    observationDate: "",
    violationDetails: "",
    observerName: "",
    observerDepartment: "",
    observerPosition: "",
    evidence: "",
    employmentType: "",
    violatorName: "",
    violatorDepartment: "",
    violatorPosition: "",
    empNo: "",
    contractorAgency: "",
    contractorVendorCode: "",
    contractorVendorEmail: "",
    transporterAgency: "",
    transporterVendorCode: "",
    transporterVendorEmail: "",
    penaltyAmount: "",
    remarks: "",
    agreed: false,
  });

  useEffect(() => {
    loadEventTypes();
    loadSeverityMatrix();
    loadLoggedInEmployee();
    loadContractorAgencies();
    loadTransporterAgencies();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value, type } = e.target;

    // Contractor
    if (id === "contractorAgency") {
      const selectedAgency = contractorAgencies.find(
        (x: any) => x.ContractorAgency === value
      );

      setFormData((prev) => ({
        ...prev,

        contractorAgency: value,

        contractorVendorCode: selectedAgency?.SAPVendorCode || "",

        contractorVendorEmail: selectedAgency?.EmailID || "",
      }));

      return;
    }

    // Transporter
    if (id === "transporterAgency") {
      const selectedTransporter = transporterAgencies.find(
        (x: any) => x.TransporterName === value
      );

      setFormData((prev) => ({
        ...prev,

        transporterAgency: value,

        transporterVendorCode: selectedTransporter?.AgencyCode || "",

        transporterVendorEmail: selectedTransporter?.EmailID || "",
      }));

      return;
    }

    // Normal
    setFormData((prev) => ({
      ...prev,

      [id]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachments(e.target.files);
  };

  // ===============================
  // Generate Req Number
  // ===============================
  const generateRequestNumber = async () => {
    try {
      const spCrud = await SPCRUDOPS();

      const data = await spCrud.getTopData(
        "SafetyViolationDetails",
        "Id,Title",
        "",
        "",
        {
          column: "Id",
          isAscending: false,
        },
        1,
        props
      );

      let nextNumber = 1;

      if (data.length > 0) {
        nextNumber = data[0].Id + 1;
      }

      return `ReqNo_${nextNumber}`;
    } catch (error) {
      console.error("Error generating request number:", error);

      return `ReqNo_${new Date().getTime()}`;
    }
  };

  // ===============================
  // Validation
  // ===============================
  const validateForm = () => {
    if (!formData.typeOfViolation) {
      Swal.fire(
        "Validation",
        "Please select Type Of Violation",
        "warning"
      );

      return false;
    }

    if (!formData.severity) {
      Swal.fire("Validation", "Please select Severity", "warning");

      return false;
    }

    if (!formData.eventType) {
      Swal.fire("Validation", "Please select Event Type", "warning");

      return false;
    }

    if (!formData.observationDate) {
      Swal.fire(
        "Validation",
        "Please select Observation Date",
        "warning"
      );

      return false;
    }

    if (!formData.violationDetails) {
      Swal.fire(
        "Validation",
        "Please enter Violation Details",
        "warning"
      );

      return false;
    }

    if (!formData.employmentType) {
      Swal.fire(
        "Validation",
        "Please select Employment Type",
        "warning"
      );

      return false;
    }

    if (!formData.agreed) {
      Swal.fire(
        "Validation",
        "Please accept declaration",
        "warning"
      );

      return false;
    }

    return true;
  };

  // ===============================
  // Save Data
  // ===============================
  const saveData = async (status: string) => {
    try {
      setSubmitting(true);

      const spCrud = await SPCRUDOPS();

      const requestNo = await generateRequestNumber();

      const selectedEvent = eventTypes.find(
        (x: any) => x.Title === formData.eventType
      );

      const payload: any = {
        Title: requestNo,
        SafetyViolationCardNumber: requestNo,
        RequestDate: new Date(),
        TypeOfViolation: formData.typeOfViolation,
        SeverityOfViolation: formData.severity,
        ViolationWithRespectedTo:formData.violationWithRespectTo,
        ViolationDetails: formData.violationDetails,
        ObserverName: formData.observerName,
        ObserverDepartment: formData.observerDepartment,
        ObserverPosition: formData.observerPosition,
        Evidence: formData.evidence,
        ObservationDate: formData.observationDate? new Date(formData.observationDate).toISOString() : null,
        EmployementType: formData.employmentType,
        NameOfViolator: formData.violatorName,
        EmpNoOrGatePass: formData.empNo,
        ViolatorDepartment: formData.violatorDepartment,
        ViolatorPosition: formData.violatorPosition,
        ContractorAgency: formData.contractorAgency,
        TransporterAgency: formData.transporterAgency,
        VendorCode: formData.contractorVendorCode || formData.transporterVendorCode,
        VendorEmail: formData.contractorVendorEmail || formData.transporterVendorEmail,
        PenaltyAmount: formData.penaltyAmount,
        RemarksForWarning: formData.remarks,
        Status: status,
        UnitName: props.currentSPContext.pageContext.web.title || "",
        EventTypeId: selectedEvent?.Id || null,
      };

      // ===============================
      // Insert List Item
      // ===============================
      const response = await spCrud.insertData(
        "SafetyViolationDetails",
        payload,
        props
      );

      const itemId = response?.data?.Id;

      // ===============================
      // Upload Attachments
      // ===============================
      if (attachments && attachments.length > 0) {
        for (let i = 0; i < attachments.length; i++) {
          await spCrud.uploadAttachment(
            "SafetyViolationDetails",
            itemId,
            attachments[i],
            props
          );
        }
      }

      // ===============================
      // Success Message
      // ===============================
      await Swal.fire({
        icon: "success",

        title:
          status === "Draft"
            ? "Draft Saved Successfully"
            : "Submitted Successfully",

        html:
          status === "Draft"
            ? `<b>${requestNo}</b> Draft Saved Successfully`
            : `<b>${requestNo}</b> Submitted Successfully`,

        confirmButtonColor: "#3085d6",
      });

      history.push("/bjfcl");
    } catch (error) {
      console.error("Error Saving Data:", error);

      Swal.fire({
        icon: "error",

        title: "Error",

        text: "Something went wrong while saving data.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ===============================
  // Submit
  // ===============================
  const handleSubmit = async () => {
    const confirm = await Swal.fire({
      title: "Submit Request?",

      text: "Are you sure you want to submit this request?",

      icon: "question",

      showCancelButton: true,

      confirmButtonText: "Yes, Submit",

      cancelButtonText: "Cancel",

      confirmButtonColor: "#28a745",
    });

    if (!confirm.isConfirmed) return;

    if (!validateForm()) return;

    await saveData("Submitted");
  };

  // ===============================
  // Save Draft
  // ===============================
  const handleSaveDraft = async () => {
    const confirm = await Swal.fire({
      title: "Save Draft?",

      text: "Do you want to save this form as draft?",

      icon: "question",

      showCancelButton: true,

      confirmButtonText: "Yes, Save",

      cancelButtonText: "Cancel",

      confirmButtonColor: "#f39c12",
    });

    //if (!confirm.isConfirmed) return;

    await saveData("Draft");
  };

  // ===============================
  // Load Event Types
  // ===============================
  const loadEventTypes = async () => {
    try {
      const data = await eventMasterOps.getSafetyViolationEventMasterData(
        "",
        "Title asc",
        props
      );

      setEventTypes(data);
    } catch (error) {
      console.error("Error loading event types:", error);
    }
  };

  // ===============================
  // Load Severity
  // ===============================
  const loadSeverityMatrix = async () => {
    try {
      const data = await severityMatrixOps.getSeverityMatrixData(
        "",
        "Title asc",
        props
      );

      const uniqueData = data.filter(
        (item: any, index: number, self: any[]) =>
          index === self.findIndex((t) => t.Title === item.Title)
      );

      setSeverityList(uniqueData);
    } catch (error) {
      console.error("Error loading severity matrix:", error);
    }
  };

  // ===============================
  // Load Logged User
  // ===============================
  const loadLoggedInEmployee = async () => {
    try {
      const userEmail =
        props.currentSPContext.pageContext.user.email;

      const filter = `EmailAddress eq '${userEmail}'`;

      const data = await employeeMasterOps.getEmployeeMasterData(
        filter,
        "",
        props
      );

      if (data.length > 0) {
        const emp = data[0];

        setEmployeeData(emp);

        setFormData((prev) => ({
          ...prev,

          observerName: emp.EmployeeName || "",

          observerDepartment: emp.Department || "",

          observerPosition: emp.Position || "",
        }));
      }
    } catch (error) {
      console.error("Error loading employee details:", error);
    }
  };

  // ===============================
  // Contractor Agencies
  // ===============================
  const loadContractorAgencies = async () => {
    try {
      const data =
        await contractorAgencyOps.getContractorAgencyMasterData(
          "Status eq 'Active'",
          "ContractorAgency asc",
          props
        );

      setContractorAgencies(data);
    } catch (error) {
      console.error("Error loading contractor agencies:", error);
    }
  };

  // ===============================
  // Transporter Agencies
  // ===============================
  const loadTransporterAgencies = async () => {
    try {
      const data =
        await transporterAgencyOps.getTransporterAgencyMasterData(
          "Status eq 'Active'",
          "TransporterName asc",
          props
        );

      setTransporterAgencies(data);
    } catch (error) {
      console.error("Error loading transporter agencies:", error);
    }
  };

  // ===============================
  // Agency Block
  // ===============================
  const renderAgencyBlock = (
    agencyId: string,
    agencyVal: string,
    codeVal: string,
    emailVal: string
  ) => (
    <div className="svc-row svc-cols-3">
      <div className="svc-field">
        <label htmlFor={agencyId}>Vendor Agency:</label>

        <select id={agencyId} onChange={handleChange} value={agencyVal}>
          <option value="">Select</option>

          {/* Contractor */}
          {agencyId === "contractorAgency" &&
            contractorAgencies.map((item: any) => (
              <option key={item.Id} value={item.ContractorAgency}>
                {item.ContractorAgency}
              </option>
            ))}

          {/* Transporter */}
          {agencyId === "transporterAgency" &&
            transporterAgencies.map((item: any) => (
              <option key={item.Id} value={item.TransporterName}>
                {item.TransporterName}
              </option>
            ))}
        </select>
      </div>

      <div className="svc-field">
        <label>Vendor Code:</label>

        <input type="text" value={codeVal} readOnly />
      </div>

      <div className="svc-field">
        <label>Vendor Email ID:</label>

        <input type="email" value={emailVal} readOnly />
      </div>
    </div>
  );

  return (
    <div className="svc-container">
      {/* Header */}
      <div className="svc-header">
        <h4 className="svc-title">Safety Violation Card</h4>
      </div>

      {/* SECTION 1 */}
      {/* SECTION 1 */}
      <div className="svc-section">
        <h5 className="svc-section-title">1. Violation Details:</h5>

        {/* Row 1 */}
        <div className="svc-row svc-cols-4">
          <div className="svc-field">
            <label htmlFor="typeOfViolation">Type of Violation based on:</label>

            <select
              id="typeOfViolation"
              onChange={handleChange}
              value={formData.typeOfViolation}
            >
              <option value="">Select</option>
              <option value="Observation">Observation</option>
              <option value="Incident">Incident</option>
            </select>
          </div>

          <div className="svc-field">
            <label htmlFor="severity">Severity of Violation:</label>

            <select
              id="severity"
              onChange={handleChange}
              value={formData.severity}
            >
              <option value="">Select</option>

              {severityList.map((item: any) => (
                <option key={item.Id} value={item.Title}>
                  {item.Title}
                </option>
              ))}
            </select>
          </div>

          <div className="svc-field">
            <label htmlFor="violationWithRespectTo">
              Violation with respect to:
            </label>

            <select
              id="violationWithRespectTo"
              onChange={handleChange}
              value={formData.violationWithRespectTo}
            >
              <option value="">Select</option>
              <option value="Life Saving Rule">Life Saving Rule</option>
              <option value="Site Safety Rule">Site Safety Rule</option>
              <option value="Safety Standard /Procedure /JSA">Safety Standard /Procedure /JSA</option>
              <option value="SAN compliance">SAN compliance</option>
              <option value="Incident Recommendations">Incident Recommendations</option>
              <option value="SOPs , Work Instruction, Established practice compliance">SOPs , Work Instruction, Established practice compliance</option>
              <option value="Legal compliance">Legal compliance</option>
            </select>
          </div>

          <div className="svc-field">
            <label htmlFor="eventType">Event Type:</label>

            <select
              id="eventType"
              onChange={handleChange}
              value={formData.eventType}
            >
              <option value="">Select</option>

              {eventTypes.map((item: any) => (
                <option key={item.Id} value={item.Title}>
                  {item.Title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2 */}
        <div className="svc-violation-bottom">
          <div className="svc-field svc-observation-date">
            <label htmlFor="observationDate">Observation Date:</label>

            <input
              type="date"
              id="observationDate"
              onChange={handleChange}
              value={formData.observationDate}
            />
          </div>

          <div className="svc-field svc-violation-text">
            <label htmlFor="violationDetails">Violation Details:</label>

            <textarea
              id="violationDetails"
              rows={2}
              placeholder="Describe the violation..."
              onChange={handleChange}
              value={formData.violationDetails}
            />
          </div>
        </div>
      </div>

      {/* SECTION 2 */}
      <div className="svc-section">
        <h5 className="svc-section-title">2. Observer Details:</h5>

        <div className="svc-row svc-cols-3">
          <div className="svc-field">
            <label htmlFor="observerName">Observer Name:</label>

            <input id="observerName" value={formData.observerName} />
          </div>

          <div className="svc-field">
            <label htmlFor="observerDepartment">Observer Department:</label>

            <input
              id="observerDepartment"
              value={formData.observerDepartment}
            />
          </div>

          <div className="svc-field">
            <label htmlFor="observerPosition">Observer Position:</label>

            <input id="observerPosition" value={formData.observerPosition} />
          </div>
        </div>

        <div className="svc-row svc-cols-2">
          <div className="svc-field">
            <label htmlFor="evidence">Evidence (If any):</label>

            <textarea
              id="evidence"
              rows={3}
              placeholder="Describe any evidence..."
              onChange={handleChange}
              value={formData.evidence}
            />
          </div>

          <div className="svc-field">
            <label>Attachments:</label>

            <div className="svc-file-wrapper">
              <label className="svc-file-btn" htmlFor="attachmentInput">
                Choose Files
              </label>

              <span className="svc-file-name">
                {attachments && attachments.length > 0
                  ? `${attachments.length} file(s) selected`
                  : "No file chosen"}
              </span>

              <input
                id="attachmentInput"
                type="file"
                multiple
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3 */}
      <div className="svc-section">
        <h5 className="svc-section-title">3. Violator Details:</h5>

        {/* Employment Type */}
        <div className="svc-row svc-cols-3">
          <div className="svc-field">
            <label htmlFor="employmentType">Employment Type:</label>

            <select
              id="employmentType"
              onChange={handleChange}
              value={formData.employmentType}
            >
              <option value="">Select</option>

              <option value="Employee">Employee</option>

              <option value="Contractor">Contractor</option>

              <option value="Transporter">Transporter</option>
            </select>
          </div>
        </div>

        {/* Employee / Contractor */}
        {(formData.employmentType === "Employee" ||
          formData.employmentType === "Contractor") && (
          <>
            {/* Violator Name */}
            <div className="svc-row svc-cols-1">
              <div className="svc-field">
                <label htmlFor="violatorName">Name of Violator:</label>

                <input
                  id="violatorName"
                  onChange={handleChange}
                  value={formData.violatorName}
                />
              </div>
            </div>

            {/* Department / Emp No / Position */}
            <div className="svc-row svc-cols-3">
              <div className="svc-field">
                <label htmlFor="violatorDepartment">Department:</label>

                <input
                  id="violatorDepartment"
                  onChange={handleChange}
                  value={formData.violatorDepartment}
                />
              </div>

              <div className="svc-field">
                <label htmlFor="empNo">Emp No./Gate Pass No.:</label>

                <input
                  id="empNo"
                  onChange={handleChange}
                  value={formData.empNo}
                />
              </div>

              <div className="svc-field">
                <label htmlFor="violatorPosition">Position / Trade:</label>

                <input
                  id="violatorPosition"
                  onChange={handleChange}
                  value={formData.violatorPosition}
                />
              </div>
            </div>
          </>
        )}

        {/* Contractor Agency */}
        {formData.employmentType === "Contractor" &&
          renderAgencyBlock(
            "contractorAgency",
            formData.contractorAgency,
            formData.contractorVendorCode,
            formData.contractorVendorEmail,
          )}

        {/* Transporter */}
        {formData.employmentType === "Transporter" && (
          <>
            {/* Violator Name */}
            <div className="svc-row svc-cols-1">
              <div className="svc-field">
                <label htmlFor="violatorName">Name of Violator:</label>

                <input
                  id="violatorName"
                  onChange={handleChange}
                  value={formData.violatorName}
                />
              </div>
            </div>

            {/* Agency Details */}
            {renderAgencyBlock(
              "transporterAgency",
              formData.transporterAgency,
              formData.transporterVendorCode,
              formData.transporterVendorEmail,
            )}
          </>
        )}
      </div>

      {/* SECTION 4 */}
      <div className="svc-section">
        <h5 className="svc-section-title">4. Penalty Details:</h5>

        <div className="svc-row svc-cols-2">
          <div className="svc-field">
            <label htmlFor="penaltyAmount">Penalty Amount:</label>

            <input
              type="number"
              id="penaltyAmount"
              onChange={handleChange}
              placeholder="0.0"
              value={formData.penaltyAmount}
            />

            <span className="svc-field-hint">in Rs.</span>
          </div>

          <div className="svc-field">
            <label htmlFor="remarks">Remarks for warning:</label>

            <textarea
              id="remarks"
              onChange={handleChange}
              value={formData.remarks}
            />
          </div>
        </div>
      </div>

      {/* Agreement */}
      <div className="svc-agreement">
        <input
          type="checkbox"
          id="agreed"
          onChange={handleChange}
          checked={formData.agreed}
        />

        <label htmlFor="agreed">
          I agree to above mention violation and confirm that similar violation
          will not be repeated again.
        </label>
      </div>

      {/* Actions */}
      <div className="svc-actions">
        <button
          className="btn-ghost"
          type="button"
          onClick={() => history.push("/bjfcl")}
        >
          Exit
        </button>

        <button
          className="btn-secondary"
          type="button"
          disabled={submitting}
          onClick={handleSaveDraft}
        >
          {submitting ? "Saving..." : "Save Draft"}
        </button>

        <button
          className="btn-primary"
          type="button"
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default SafetyViolationDetails;