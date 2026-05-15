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
import SafetyViolationEventMasterOps from "../../services/BAL/SafetyViolationEventMaster";
import SeverityMatrixOps from "../../services/BAL/SeverityMatrixMaster";
import ContractorAgencyMasterOps from "../../services/BAL/ContractorAgencyMaster";
import TransporterAgencyMasterOps from "../../services/BAL/TransporterAgencyMaster";
import SPCRUDOPS from "../../services/DAL/spcrudops";
import { IPcmProps } from "../IPcmProps";

const SafetyViolationRequestEdit: React.FC<IPcmProps> = (props) => {
  const history = useHistory();
  const eventMasterOps = SafetyViolationEventMasterOps();
  const severityMatrixOps = SeverityMatrixOps();
  const contractorAgencyOps = ContractorAgencyMasterOps();
  const transporterAgencyOps = TransporterAgencyMasterOps();
  const [submitting, setSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<FileList | null>(null);
  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [severityList, setSeverityList] = useState<any[]>([]);
  const [contractorAgencies, setContractorAgencies] = useState<any[]>([]);
  const [transporterAgencies, setTransporterAgencies] = useState<any[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
  const [requestNo, setRequestNo] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [itemId, setItemId] = useState<number>(0);
  const [requestStatus, setRequestStatus] = useState<string>("Draft");
  const isEditable = requestStatus === "Draft";
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

  const loadExistingData = async () => {
    try {
      const hash = window.location.hash;
      const queryString = hash.split("?")[1];
      const queryParams = new URLSearchParams(queryString);
      const reqNo = queryParams.get("ReqID");
      const spCrud = await SPCRUDOPS();
      const data = await spCrud.getData(
        "SafetyViolationDetails",
        "*,EventType/Id,EventType/Title",
        "EventType",
        `(SafetyViolationCardNumber eq '${reqNo}' or Title eq '${reqNo}')`,
        {
          column: "Id",
          isAscending: false,
        },
        props,
      );

      if (data.length === 0) {
        await Swal.fire("Error", "Record not found", "error");
        return;
      }

      const item = data[0];

      // Existing Req No
      setRequestNo(item.SafetyViolationCardNumber || item.Title || "");

      // Existing Observation Date
      const observationDate = item.ObservationDate
        ? new Date(item.ObservationDate)
        : new Date();

      const formattedDate = `${observationDate.getDate()}/${observationDate.getMonth() + 1}/${observationDate.getFullYear()}`;

      setCurrentDate(formattedDate);

      setItemId(item.Id);

      setRequestStatus(item.Status || "Draft");

      // Load Existing Attachments
      const files = await spCrud.getAttachments(
        "SafetyViolationDetails",
        item.Id,
        props,
      );

      setExistingAttachments(files || []);
      setItemId(item.Id);
      setRequestStatus(item.Status || "Draft");

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

        agreed: false,
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

    if (!isEditable && id !== "agreed") return;

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
    if (!isEditable) return;

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

  const handleDeleteAttachment = async (fileName: string) => {
    try {
      const confirm = await Swal.fire({
        title: "Delete Attachment?",
        text: `Are you sure you want to delete ${fileName}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Delete",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#d33",
      });

      if (!confirm.isConfirmed) return;

      const spCrud = await SPCRUDOPS();

      await spCrud.deleteAttachment(
        "SafetyViolationDetails",
        itemId,
        fileName,
        props,
      );

      // Remove from UI
      setExistingAttachments((prev) =>
        prev.filter((file) => file.name !== fileName),
      );

      await Swal.fire("Deleted", "Attachment deleted successfully", "success");
    } catch (error) {
      console.log(error);

      await Swal.fire("Error", "Unable to delete attachment", "error");
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
        title: "Success",
        text: `Record ${status} Successfully`,
      });

      history.push("/bjfcl");
    } catch (error) {
      console.log(error);

      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error while updating record",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const commonProps = {
    disabled: !isEditable,
  };

  useEffect(() => {
    void loadEventTypes();
    void loadSeverityMatrix();
    void loadContractorAgencies();
    void loadTransporterAgencies();
    void loadExistingData();
  }, []);

  return (
    <div className="svc-container">
      {/* SECTION 1 */}
      <div className="svc-header">
        <div className="svc-header-left">
          <strong>Date:</strong> {currentDate}
        </div>

        <div className="svc-header-center">
          <h4 className="svc-title">Edit Safety Violation Card</h4>
        </div>

        <div className="svc-header-right">
          <strong>Sr No:</strong> {requestNo}
        </div>
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
              disabled={!isEditable}
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
              disabled={!isEditable}
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
              disabled={!isEditable}
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
              disabled={!isEditable}
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
              readOnly={!isEditable}
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
              readOnly={!isEditable}
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

            <input
              id="observerName"
              onChange={handleChange}
              value={formData.observerName}
              readOnly={!isEditable}
            />
          </div>

          <div className="svc-field">
            <label htmlFor="observerDepartment">Observer Department:</label>

            <input
              id="observerDepartment"
              onChange={handleChange}
              value={formData.observerDepartment}
              readOnly={!isEditable}
            />
          </div>

          <div className="svc-field">
            <label htmlFor="observerPosition">Observer Position:</label>

            <input
              id="observerPosition"
              onChange={handleChange}
              value={formData.observerPosition}
              readOnly={!isEditable}
            />
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
              readOnly={!isEditable}
            />
          </div>

          <div className="svc-field">
            <label>Attachments:</label>

            <div className="svc-file-wrapper">
              <label className="svc-file-btn" htmlFor="attachmentInput">
                Choose Files
              </label>

              <div className="svc-file-name">
                {/* Existing Files */}
                {existingAttachments.length > 0 && (
                  <div className="existing-files">
                    {existingAttachments.map((file: any, index: number) => (
                      <div key={index} className="attachment-row">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="attachment-link"
                        >
                          {file.name}
                        </a>

                        {/* Delete Option */}
                        {isEditable && (
                          <button
                            type="button"
                            className="attachment-delete-btn"
                            onClick={() => handleDeleteAttachment(file.name)}
                          >
                            ❌
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* New Files */}
                {attachments && attachments.length > 0 && (
                  <div className="new-files-text">
                    {attachments.length} new file(s) selected
                  </div>
                )}

                {/* Empty */}
                {existingAttachments.length === 0 &&
                  (!attachments || attachments.length === 0) &&
                  "No file chosen"}
              </div>

              <input
                id="attachmentInput"
                type="file"
                multiple
                onChange={handleFileChange}
                disabled={!isEditable}
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
              disabled={!isEditable}
            >
              <option value="">Select</option>

              <option value="Employee">Employee</option>

              <option value="Contractor">Contractor</option>

              <option value="Transporter">Transporter</option>
            </select>
          </div>
        </div>

        {/* Employee */}
        {formData.employmentType === "Employee" && (
          <>
            <div className="svc-row svc-cols-1">
              <div className="svc-field">
                <label htmlFor="violatorName">Name of Violator:</label>

                <PeoplePicker
                  webAbsoluteUrl={
                    props.currentSPContext.pageContext.web.absoluteUrl
                  }
                  context={props.currentSPContext as any}
                  personSelectionLimit={1}
                  showtooltip={true}
                  required={false}
                  disabled={!isEditable}
                  ensureUser={true}
                  principalTypes={[PrincipalType.User]}
                  defaultSelectedUsers={
                    formData.violatorName ? [formData.violatorName] : []
                  }
                  onChange={(items: any[]) => {
                    setFormData((prev: any) => ({
                      ...prev,
                      violatorName: items.length > 0 ? items[0].text : "",
                    }));
                  }}
                />
              </div>
            </div>

            <div className="svc-row svc-cols-3">
              <div className="svc-field">
                <label htmlFor="violatorDepartment">Department:</label>

                <input
                  id="violatorDepartment"
                  onChange={handleChange}
                  value={formData.violatorDepartment}
                  readOnly={!isEditable}
                />
              </div>

              <div className="svc-field">
                <label htmlFor="empNo">Emp No./Gate Pass No.:</label>

                <input
                  id="empNo"
                  onChange={handleChange}
                  value={formData.empNo}
                  readOnly={!isEditable}
                />
              </div>

              <div className="svc-field">
                <label htmlFor="violatorPosition">Position / Trade:</label>

                <input
                  id="violatorPosition"
                  onChange={handleChange}
                  value={formData.violatorPosition}
                  readOnly={!isEditable}
                />
              </div>
            </div>
          </>
        )}

        {/* Contractor */}
        {formData.employmentType === "Contractor" && (
          <>
            <div className="svc-row svc-cols-1">
              <div className="svc-field">
                <label htmlFor="violatorName">Name of Violator:</label>

                <input
                  id="violatorName"
                  onChange={handleChange}
                  value={formData.violatorName}
                  readOnly={!isEditable}
                />
              </div>
            </div>

            <div className="svc-row svc-cols-3">
              <div className="svc-field">
                <label htmlFor="violatorDepartment">Department:</label>

                <input
                  id="violatorDepartment"
                  onChange={handleChange}
                  value={formData.violatorDepartment}
                  readOnly={!isEditable}
                />
              </div>

              <div className="svc-field">
                <label htmlFor="empNo">Emp No./Gate Pass No.:</label>

                <input
                  id="empNo"
                  onChange={handleChange}
                  value={formData.empNo}
                  readOnly={!isEditable}
                />
              </div>

              <div className="svc-field">
                <label htmlFor="violatorPosition">Position / Trade:</label>

                <input
                  id="violatorPosition"
                  onChange={handleChange}
                  value={formData.violatorPosition}
                  readOnly={!isEditable}
                />
              </div>
            </div>
          </>
        )}

        {/* Contractor */}
        {formData.employmentType === "Contractor" && (
          <div className="svc-row svc-cols-3">
            <div className="svc-field">
              <label htmlFor="contractorAgency">Vendor Agency:</label>

              <select
                id="contractorAgency"
                value={formData.contractorAgency}
                onChange={handleChange}
                disabled={!isEditable}
              >
                <option value="">Select</option>

                {contractorAgencies.map((item: any) => (
                  <option key={item.Id} value={item.ContractorAgency}>
                    {item.ContractorAgency}
                  </option>
                ))}
              </select>
            </div>

            <div className="svc-field">
              <label>Vendor Code:</label>

              <input
                type="text"
                value={formData.contractorVendorCode}
                readOnly
              />
            </div>

            <div className="svc-field">
              <label>Vendor Email ID:</label>

              <input
                type="text"
                value={formData.contractorVendorEmail}
                readOnly
              />
            </div>
          </div>
        )}

        {/* Transporter */}
        {formData.employmentType === "Transporter" && (
          <>
            <div className="svc-row svc-cols-1">
              <div className="svc-field">
                <label htmlFor="violatorName">Name of Violator:</label>

                <input
                  id="violatorName"
                  onChange={handleChange}
                  value={formData.violatorName}
                  readOnly={!isEditable}
                />
              </div>
            </div>

            <div className="svc-row svc-cols-3">
              <div className="svc-field">
                <label htmlFor="transporterAgency">Vendor Agency:</label>

                <select
                  id="transporterAgency"
                  value={formData.transporterAgency}
                  onChange={handleChange}
                  disabled={!isEditable}
                >
                  <option value="">Select</option>

                  {transporterAgencies.map((item: any) => (
                    <option key={item.Id} value={item.TransporterName}>
                      {item.TransporterName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="svc-field">
                <label>Vendor Code:</label>

                <input
                  type="text"
                  value={formData.transporterVendorCode}
                  readOnly
                />
              </div>

              <div className="svc-field">
                <label>Vendor Email ID:</label>

                <input
                  type="text"
                  value={formData.transporterVendorEmail}
                  readOnly
                />
              </div>
            </div>
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
              readOnly={!isEditable}
            />

            <span className="svc-field-hint">in Rs.</span>
          </div>

          <div className="svc-field">
            <label htmlFor="remarks">Remarks for warning:</label>

            <textarea
              id="remarks"
              onChange={handleChange}
              value={formData.remarks}
              readOnly={!isEditable}
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
          disabled={submitting || !formData.agreed || !isEditable}
          onClick={() => updateData("Draft")}
        >
          {submitting ? "Saving..." : "Save Draft"}
        </button>

        <button
          className="btn-primary"
          type="button"
          disabled={submitting || !formData.agreed || !isEditable}
          onClick={() => updateData("Submitted")}
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default SafetyViolationRequestEdit;
