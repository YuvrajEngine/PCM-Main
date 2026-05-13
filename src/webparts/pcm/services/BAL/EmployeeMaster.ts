import { IPcmProps } from "../../components/IPcmProps";
import SPCRUDOPS from "../DAL/spcrudops";

export interface IEmployeeMasterOps {
  getEmployeeMasterData(
    Filter: any,
    orderby: any,
    props: IPcmProps,
  ): Promise<any[]>;
}

export default function EmployeeMasterOps(): IEmployeeMasterOps {
  const spCrudOps = SPCRUDOPS();

  const getEmployeeMasterData = async (
    Filter: any,
    orderby: any,
    props: IPcmProps,
  ): Promise<any[]> => {
    if (!props) {
      throw new Error(
        "[EmployeeMasterOps] `props` is undefined. Make sure props are passed correctly.",
      );
    }

    if (!props.currentSPContext || !props.currentSPContext.pageContext) {
      throw new Error(
        "[EmployeeMasterOps] SharePoint context is not initialized.",
      );
    }

    try {
      const spCrudOpsInstance = await spCrudOps;

      const results = await spCrudOpsInstance.getData(
        "EmployeeMaster",

        `*,
        ManagerName/Id,
        ManagerName/Title,
        EmployeeUserName/Id,
        EmployeeUserName/Title,
        UserName/Id,
        UserName/Title,
        Position/Id,
        Position/PositionName,
        Designation/Id,
        Designation/Title,
        Department/Id,
        Department/DepartmentName,
        Section/Id,
        Section/Title,
        Author/Id,
        Author/Title,
        Editor/Id,
        Editor/Title`,

        `ManagerName,
        EmployeeUserName,
        UserName,
        Position,
        Designation,
        Department,
        Section,
        Author,
        Editor`,

        Filter,
        orderby,
        props,
      );

      const mapped = results.map((item: any) => ({
        ...item,

        Id: item.Id ?? null,

        Title: item.Title ?? "",

        EmployeeID: item.EmployeeID ?? "",

        PoornataID: item.PoornataID ?? "",

        EmployeeName: item.EmployeeName ?? "",

        EmailAddress: item.EmailAddress ?? "",

        ReportingManagerEmail: item.ReportingManagerEmail ?? "",

        UniqueID: item.UniqueID ?? "",

        uid: item.uid ?? "",

        PreviousUniqID: item.PreviousUniqID ?? "",

        UniqID: item.UniqID ?? "",

        TransferStatus: item.TransferStatus ?? "",

        EmployeeFlag: item.EmployeeFlag ?? "",

        KSAUpdate: item.KSAUpdate ?? 0,

        EmployeeStatus: item.EmployeeStatus ?? "",

        ManagerName: item.ManagerName?.Title ?? "",

        ManagerNameId: item.ManagerName?.Id ?? null,

        EmployeeUserName: item.EmployeeUserName?.Title ?? "",

        EmployeeUserNameId: item.EmployeeUserName?.Id ?? null,

        UserName: item.UserName?.Title ?? "",

        UserNameId: item.UserName?.Id ?? null,

        Position: item.Position?.PositionName ?? "",

        PositionId: item.Position?.Id ?? null,

        BusinessUnit: item.BusinessUnit?.Title ?? "",

        BusinessUnitId: item.BusinessUnit?.Id ?? null,

        Designation: item.Designation?.Title ?? "",

        DesignationId: item.Designation?.Id ?? null,

        Department: item.Department?.DepartmentName ?? "",

        DepartmentId: item.Department?.Id ?? null,

        Section: item.Section?.Title ?? "",

        SectionId: item.Section?.Id ?? null,

        Created: item.Created ?? null,

        Modified: item.Modified ?? null,

        CreatedBy: item.Author?.Title ?? "",

        CreatedById: item.Author?.Id ?? null,

        ModifiedBy: item.Editor?.Title ?? "",

        ModifiedById: item.Editor?.Id ?? null,
      }));

      return mapped;
    } catch (error) {
      console.error("Error in EmployeeMaster Data:", error);

      throw error;
    }
  };

  return {
    getEmployeeMasterData,
  };
}
