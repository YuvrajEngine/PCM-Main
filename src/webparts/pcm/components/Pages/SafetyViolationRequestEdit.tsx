import * as React from "react";
import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import "../Pages/CSS/SafetyViolationRequest.scss";
import "../Pages/CSS/Pcm.scss";

import Swal from "sweetalert2";

import SafetyViolationEventMasterOps from "../../services/BAL/SafetyViolationEventMaster";
import SeverityMatrixOps from "../../services/BAL/SeverityMatrixMaster";
import EmployeeMasterOps from "../../services/BAL/EmployeeMaster";
import ContractorAgencyMasterOps from "../../services/BAL/ContractorAgencyMaster";
import TransporterAgencyMasterOps from "../../services/BAL/TransporterAgencyMaster";

import SPCRUDOPS from "../../services/DAL/spcrudops";

import { IPcmProps } from "../IPcmProps";

const SafetyViolationRequestEdit: React.FC<IPcmProps> = (props) => {
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

  const [contractorAgencies, setContractorAgencies] = useState<any[]>([]);
  const [transporterAgencies, setTransporterAgencies] = useState<any[]>([]);
  const [itemId, setItemId] = useState<number>(0);

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
    loadContractorAgencies();
    loadTransporterAgencies();

    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      const hash = window.location.hash;
      const queryString = hash.split("?")[1];

      const queryParams = new URLSearchParams(queryString);
      const reqNo = queryParams.get("ReqID");

      console.log("Req No:", reqNo);

      const spCrud = await SPCRUDOPS();

      const data = await spCrud.getData(
        "SafetyViolationDetails",
        "*,EventType/Id,EventType/Title",
        "EventType",
        `SafetyViolationCardNumber eq '${reqNo}'`,
        {
          column: "Id",
          isAscending: false,
        },
        props,
      );

      if (data.length === 0) {
        Swal.fire("Error", "Record not found", "error");
        return;
      }

      const item = data[0];

      setItemId(item.Id);

      console.log("Edit Item:", item);

      setFormData({
        typeOfViolation: item.TypeOfViolation || "",
        severity: item.SeverityOfViolation || "",
        violationWithRespectTo: item.ViolationWithRespectedTo || "",

        eventType:
          item.EventType && item.EventType.Title ? item.EventType.Title : "",

        observationDate: item.ObservationDate
          ? new Date(item.ObservationDate).toISOString().split("T")[0]
          : "",

        violationDetails: item.ViolationDetails || "",

        observerName: item.ObserverName || "",

        observerDepartment: item.ObserverDepartment || "",

        observerPosition: item.ObserverPosition || "",

        evidence: item.Evidence || "",

        employmentType: item.EmployementType || "",

        violatorName: item.NameOfViolator || "",

        violatorDepartment: item.ViolatorDepartment || "",

        violatorPosition: item.ViolatorPosition || "",

        empNo: item.EmpNoOrGatePass || "",

        contractorAgency: item.ContractorAgency || "",

        contractorVendorCode: item.VendorCode || "",

        contractorVendorEmail: item.VendorEmail || "",

        transporterAgency: item.TransporterAgency || "",

        transporterVendorCode: item.VendorCode || "",

        transporterVendorEmail: item.VendorEmail || "",

        penaltyAmount: item.PenaltyAmount || "",

        remarks: item.RemarksForWarning || "",

        agreed: true,
      });
    } catch (error) {
      console.log("Error loading edit data:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { id, value, type } = e.target;

    if (id === "contractorAgency") {
      const selectedAgency = contractorAgencies.find(
        (x: any) => x.ContractorAgency === value,
      );

      setFormData((prev) => ({
        ...prev,
        contractorAgency: value,
        contractorVendorCode: selectedAgency?.SAPVendorCode || "",
        contractorVendorEmail: selectedAgency?.EmailID || "",
      }));

      return;
    }

    if (id === "transporterAgency") {
      const selectedTransporter = transporterAgencies.find(
        (x: any) => x.TransporterName === value,
      );

      setFormData((prev) => ({
        ...prev,
        transporterAgency: value,
        transporterVendorCode: selectedTransporter?.AgencyCode || "",
        transporterVendorEmail: selectedTransporter?.EmailID || "",
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [id]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachments(e.target.files);
  };

  const loadEventTypes = async () => {
    try {
      const data = await eventMasterOps.getSafetyViolationEventMasterData(
        "",
        "Title asc",
        props,
      );

      setEventTypes(data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadSeverityMatrix = async () => {
    try {
      const data = await severityMatrixOps.getSeverityMatrixData(
        "",
        "Title asc",
        props,
      );

      const uniqueData = data.filter(
        (item: any, index: number, self: any[]) =>
          index === self.findIndex((t) => t.Title === item.Title),
      );

      setSeverityList(uniqueData);
    } catch (error) {
      console.log(error);
    }
  };

  const loadContractorAgencies = async () => {
    try {
      const data = await contractorAgencyOps.getContractorAgencyMasterData(
        "Status eq 'Active'",
        "ContractorAgency asc",
        props,
      );

      setContractorAgencies(data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadTransporterAgencies = async () => {
    try {
      const data = await transporterAgencyOps.getTransporterAgencyMasterData(
        "Status eq 'Active'",
        "TransporterName asc",
        props,
      );

      setTransporterAgencies(data);
    } catch (error) {
      console.log(error);
    }
  };

  const updateData = async (status: string) => {
    try {
      setSubmitting(true);

      const spCrud = await SPCRUDOPS();

      const selectedEvent = eventTypes.find(
        (x: any) => x.Title === formData.eventType,
      );

      const payload: any = {
        TypeOfViolation: formData.typeOfViolation,
        SeverityOfViolation: formData.severity,
        ViolationWithRespectedTo: formData.violationWithRespectTo,
        ViolationDetails: formData.violationDetails,
        ObserverName: formData.observerName,
        ObserverDepartment: formData.observerDepartment,
        ObserverPosition: formData.observerPosition,
        Evidence: formData.evidence,
        ObservationDate: formData.observationDate
          ? new Date(formData.observationDate).toISOString()
          : null,
        EmployementType: formData.employmentType,
        NameOfViolator: formData.violatorName,
        EmpNoOrGatePass: formData.empNo,
        ViolatorDepartment: formData.violatorDepartment,
        ViolatorPosition: formData.violatorPosition,
        ContractorAgency: formData.contractorAgency,
        TransporterAgency: formData.transporterAgency,
        VendorCode:
          formData.contractorVendorCode || formData.transporterVendorCode,
        VendorEmail:
          formData.contractorVendorEmail || formData.transporterVendorEmail,
        PenaltyAmount: formData.penaltyAmount,
        RemarksForWarning: formData.remarks,
        Status: status,
        EventTypeId: selectedEvent?.Id || null,
      };

      await spCrud.updateData("SafetyViolationDetails", itemId, payload, props);

      if (attachments && attachments.length > 0) {
        for (let i = 0; i < attachments.length; i++) {
          await spCrud.uploadAttachment(
            "SafetyViolationDetails",
            itemId,
            attachments[i],
            props,
          );
        }
      }

      await Swal.fire({
        icon: "success",
        title: "Updated Successfully",
        text: "Safety Violation updated successfully",
      });

      history.push("/bjfcl");
    } catch (error) {
      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error while updating record",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderAgencyBlock = (
    agencyId: string,
    agencyVal: string,
    codeVal: string,
    emailVal: string,
  ) => (
    <div className="svc-row svc-cols-3">
      <div className="svc-field">
        <label htmlFor={agencyId}>Vendor Agency:</label>

        <select id={agencyId} value={agencyVal} onChange={handleChange}>
          <option value="">Select</option>

          {agencyId === "contractorAgency" &&
            contractorAgencies.map((item: any) => (
              <option key={item.Id} value={item.ContractorAgency}>
                {item.ContractorAgency}
              </option>
            ))}

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

        <input type="text" value={emailVal} readOnly />
      </div>
    </div>
  );

  return (
    <div className="svc-container">
      <div className="svc-header">
        <h4 className="svc-title">Edit Safety Violation Card</h4>
      </div>

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
              <option value="Safety Standard /Procedure /JSA">
                Safety Standard /Procedure /JSA
              </option>
              <option value="SAN compliance">SAN compliance</option>
              <option value="Incident Recommendations">
                Incident Recommendations
              </option>
              <option value="SOPs , Work Instruction, Established practice compliance">
                SOPs , Work Instruction, Established practice compliance
              </option>
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

      <div className="svc-actions">
        <button
          className="btn-ghost"
          type="button"
          onClick={() => history.push("/bjfcl")}
        >
          Exit
        </button>

        <button
          className="btn-primary"
          type="button"
          disabled={submitting}
          onClick={() => updateData("Submitted")}
        >
          {submitting ? "Updating..." : "Update Record"}
        </button>
      </div>
    </div>
  );
};

export default SafetyViolationRequestEdit;
