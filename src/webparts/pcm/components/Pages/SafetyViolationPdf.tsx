import * as React from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import Swal from "sweetalert2";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import { SPHttpClient } from "@microsoft/sp-http";

import { IPcmProps } from "../IPcmProps";

const SafetyViolationDocument: React.FC<IPcmProps> = (props) => {
  const location = useLocation();

  const reqNo = new URLSearchParams(location.search).get("ReqNo");

  // ============================================
  // Generate PDF
  // ============================================
  const generatePDF = async () => {
    try {
      if (!reqNo) {
        return;
      }

      const webUrl =
        props.currentSPContext.pageContext.web.absoluteUrl;

      const generatedFileName = `${reqNo}.pdf`;

      const serverRelativeUrl = `${props.currentSPContext.pageContext.web.serverRelativeUrl}/SafetyViolationRequest_Document/${generatedFileName}`;

      const existingPdfUrl =
        `${webUrl}/SafetyViolationRequest_Document/${generatedFileName}`;

      // ============================================
      // CHECK EXISTING PDF
      // ============================================
      const existingCheck =
        await props.currentSPContext.spHttpClient.get(
          `${webUrl}/_api/web/GetFileByServerRelativeUrl('${serverRelativeUrl}')`,
          SPHttpClient.configurations.v1
        );

      // ============================================
      // OPEN EXISTING PDF
      // ============================================
      if (existingCheck.ok) {
        window.open(existingPdfUrl, "_blank");

        return;
      }

      // ============================================
      // FETCH LIST ITEM
      // ============================================
      const response =
        await props.currentSPContext.spHttpClient.get(
          `${webUrl}/_api/web/lists/GetByTitle('SafetyViolationDetails')/items?$filter=Title eq '${reqNo}'`,
          SPHttpClient.configurations.v1
        );

      const json = await response.json();

      if (!json.value || json.value.length === 0) {
        await Swal.fire(
          "Error",
          "Request not found",
          "error"
        );

        return;
      }

      const item = json.value[0];

      // ============================================
      // ONLY SUBMITTED
      // ============================================
      if (item.Status !== "Submitted") {
        await Swal.fire(
          "Warning",
          "PDF can generate only for submitted requests",
          "warning"
        );

        return;
      }

      // ============================================
      // CREATE HIDDEN HTML
      // ============================================
      const element = document.createElement("div");

      element.style.width = "800px";

      element.style.padding = "30px";

      element.style.background = "white";

      element.style.fontFamily = "Arial";

      element.style.position = "absolute";

      element.style.left = "-9999px";

      element.innerHTML = `
        <div style="text-align:center;">
          <h2>CONTRACTOR SAFETY MANAGEMENT</h2>
          <h3>WARNING LETTER / PENALTY LETTER</h3>
        </div>

        <br/>

        <p>
          <b>Date:</b>
          ${
            item.RequestDate
              ? new Date(item.RequestDate).toLocaleDateString()
              : ""
          }
        </p>

        <p>
          <b>To:</b>
          ${
            item.ContractorAgency ||
            item.TransporterAgency ||
            "Concerned"
          }
        </p>

        <br/>

        <p>
          Subject: Warning Letter / Penalty Letter
          for safety non-compliance
        </p>

        <br/>

        <p>
          Dear Sir/Madam,
        </p>

        <p>
          Violator Name:
          <b>${item.NameOfViolator || ""}</b>
        </p>

        <br/>

        <p>
          <b>OBSERVATIONS:</b>
        </p>

        <p>
          ${item.ViolationDetails || ""}
        </p>

        <br/>

        <p>
          <b>FEEDBACK:</b>
        </p>

        <p>
          This is a highly unsafe activity and
          may have resulted in severe losses.
        </p>

        <br/>

        <table
          style="
            width:100%;
            border-collapse:collapse;
          "
          border="1"
        >
          <tr>
            <th style="padding:8px;">
              Observation Date
            </th>

            <th style="padding:8px;">
              Department
            </th>

            <th style="padding:8px;">
              Observer Name
            </th>

            <th style="padding:8px;">
              Penalty Amount
            </th>

            <th style="padding:8px;">
              Remarks
            </th>
          </tr>

          <tr>
            <td style="padding:8px;">
              ${
                item.ObservationDate
                  ? new Date(
                      item.ObservationDate
                    ).toLocaleDateString()
                  : ""
              }
            </td>

            <td style="padding:8px;">
              ${item.ViolatorDepartment || ""}
            </td>

            <td style="padding:8px;">
              ${item.ObserverName || ""}
            </td>

            <td style="padding:8px;">
              ${item.PenaltyAmount || ""}
            </td>

            <td style="padding:8px;">
              ${item.RemarksForWarning || ""}
            </td>
          </tr>
        </table>

        <br/><br/>

        <p>
          Please note that safety is non-negotiable.
        </p>

        <br/><br/>

        <p>
          For Grasim Industries Limited
        </p>

        <br/><br/>

        <p>
          Authorised Signatory
        </p>
      `;

      document.body.appendChild(element);

      // ============================================
      // CONVERT HTML TO CANVAS
      // ============================================
      const canvas = await html2canvas(element, {
        scale: 2,
      });

      const imageData = canvas.toDataURL("image/png");

      // ============================================
      // GENERATE PDF
      // ============================================
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();

      const pdfHeight =
        (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(
        imageData,
        "PNG",
        0,
        0,
        pdfWidth,
        pdfHeight
      );

      const pdfBlob = pdf.output("blob");

      // ============================================
      // REMOVE TEMP HTML
      // ============================================
      document.body.removeChild(element);

      // ============================================
      // UPLOAD PDF
      // ============================================
      const uploadUrl =
        `${webUrl}/_api/web/GetFolderByServerRelativeUrl('SafetyViolationRequest_Document')/Files/add(overwrite=true,url='${generatedFileName}')`;

      const uploadResponse =
        await props.currentSPContext.spHttpClient.post(
          uploadUrl,
          SPHttpClient.configurations.v1,
          {
            headers: {
              Accept:
                "application/json;odata=nometadata",

              "Content-Type": "application/pdf",
            },

            body: pdfBlob,
          }
        );

      if (!uploadResponse.ok) {
        throw new Error("PDF upload failed");
      }

      // ============================================
      // OPEN GENERATED PDF
      // ============================================
      window.open(existingPdfUrl, "_blank");
    } catch (error: any) {
      console.error("PDF Error:", error);

      await Swal.fire({
        icon: "error",

        title: "Error",

        text:
          error?.message ||
          "Unable to generate PDF",
      });
    }
  };

  // ============================================
  // LOAD
  // ============================================
  useEffect(() => {
    void generatePDF();
  }, []);

  return null;
};

export default SafetyViolationDocument;