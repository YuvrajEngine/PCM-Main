import { IPcmProps } from "../../components/IPcmProps";
import SPCRUDOPS from "../DAL/spcrudops";

export interface ISafetyViolationDetailsOps {
  getSafetyViolationDetailsData(
    Filter: any,
    orderby: any,
    props: IPcmProps,
  ): Promise<any[]>;
}

export default function SafetyViolationDetailsOps(): ISafetyViolationDetailsOps {
  const spCrudOps = SPCRUDOPS();

  const getSafetyViolationDetailsData = async (
    Filter: any,
    orderby: any,
    props: IPcmProps,
  ): Promise<any[]> => {
    if (!props) {
      throw new Error(
        "[SafetyViolationDetailsOps] `props` is undefined. Make sure you are passing `this.props` (or the props object) when calling getSafetyViolationDetailsData()."
      );
    }
    if (!props.currentSPContext || !props.currentSPContext.pageContext) {
      throw new Error(
        "[SafetyViolationDetailsOps] `props.currentSPContext` is not ready. Ensure the SharePoint context is initialized before calling this method."
      );
    }

    try {
      const spCrudOpsInstance = await spCrudOps;
      const results = await spCrudOpsInstance.getData(
        "SafetyViolationDetails",
        `*,ViolatorName/Id,ViolatorName/Title,EventType/Id,EventType/Title,Author/Id,Author/Title,Editor/Id,Editor/Title`,
        "ViolatorName,EventType,Author,Editor",
        Filter,
        orderby,
        props,
      );

      const mapped = results.map((item: any) => ({
        ...item,
        Id: item.Id ?? null,
        Title: item.Title ?? "",
        RequestDate: item.RequestDate ?? null,
        TypeOfViolation: item.TypeOfViolation ?? "",
        SeverityOfViolation: item.SeverityOfViolation ?? "",
        ViolationWithRespectedTo: item.ViolationWithRespectedTo ?? "",
        ViolationDetails: item.ViolationDetails ?? "",
        ObserverName: item.ObserverName ?? "",
        ObserverDepartment: item.ObserverDepartment ?? "",
        ObserverPosition: item.ObserverPosition ?? "",
        Evidence: item.Evidence ?? "",
        DateOfEvent: item.DateOfEvent ?? null,
        EmployementType: item.EmployementType ?? "",
        NameOfViolator: item.NameOfViolator ?? "",
        ViolatorName: item.ViolatorName?.Title ?? "",
        ViolatorNameId: item.ViolatorName?.Id ?? null,
        ContractorAgency: item.ContractorAgency ?? "",
        TransporterAgency: item.TransporterAgency ?? "",
        VendorCode: item.VendorCode ?? "",
        SafetyViolationCardNumber: item.SafetyViolationCardNumber ?? "",
        TypeOfConsequence: item.TypeOfConsequence ?? "",
        SuggestedConsequence: item.SuggestedConsequence ?? "",
        ActualConsequence: item.ActualConsequence ?? "",
        Status: item.Status ?? "",
        EmpNoOrGatePass: item.EmpNoOrGatePass ?? "",
        ViolatorDepartment: item.ViolatorDepartment ?? "",
        ViolatorPosition: item.ViolatorPosition ?? "",
        DocumentLink: item.DocumentLink ?? "",
        PenaltyAmount: item.PenaltyAmount ?? "",
        RemarksForWarning: item.RemarksForWarning ?? "",
        UnitName: item.UnitName ?? "",
        ObservationDate: item.ObservationDate ?? null,
        EventType: item.EventType?.Title ?? "",
        EventTypeId: item.EventType?.Id ?? null,
        "Penalty letter": item["Penalty letter"] ?? "",
        VendorEmail: item.VendorEmail ?? "",
        Created: item.Created ?? null,
        Modified: item.Modified ?? null,
        CreatedBy: item.Author?.Title ?? "",
        CreatedById: item.Author?.Id ?? null,
        ModifiedBy: item.Editor?.Title ?? "",
        ModifiedById: item.Editor?.Id ?? null,
      }));

      return mapped;
    } catch (error) {
      console.error("Error in SafetyViolationDetails Data:", error);
      throw error;
    }
  };

  return {
    getSafetyViolationDetailsData,
  };
}