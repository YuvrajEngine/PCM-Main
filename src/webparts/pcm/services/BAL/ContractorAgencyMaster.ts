import { IPcmProps } from "../../components/IPcmProps";
import SPCRUDOPS from "../DAL/spcrudops";

export interface IContractorAgencyMasterOps {
  getContractorAgencyMasterData(
    Filter: any,
    orderby: any,
    props: IPcmProps,
  ): Promise<any[]>;
}

export default function ContractorAgencyMasterOps(): IContractorAgencyMasterOps {
  const spCrudOps = SPCRUDOPS();

  const getContractorAgencyMasterData = async (
    Filter: any,
    orderby: any,
    props: IPcmProps,
  ): Promise<any[]> => {
    if (!props) {
      throw new Error(
        "[ContractorAgencyMasterOps] `props` is undefined. Make sure props are passed correctly.",
      );
    }

    if (!props.currentSPContext || !props.currentSPContext.pageContext) {
      throw new Error(
        "[ContractorAgencyMasterOps] SharePoint context is not initialized.",
      );
    }

    try {
      const spCrudOpsInstance = await spCrudOps;

      const results = await spCrudOpsInstance.getData(
        "ContractorAgencyMaster",

        `*,
        ContractorType/Id,
        ContractorType/Title,
        Author/Id,
        Author/Title,
        Editor/Id,
        Editor/Title`,

        `ContractorType,
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

        ContractorAgency: item.Title ?? "",

        SAPVendorCode: item.SAPVendorCode ?? "",

        ContractorSupervisor: item.ContractorSupervisor ?? "",

        EmailID: item.EmailID ?? "",

        ContactNumber: item.ContactNumber ?? "",

        Status: item.Status ?? "",

        RiskType: item.RiskType ?? "",

        ContractorType: item.ContractorType?.Title ?? "",

        ContractorTypeId: item.ContractorType?.Id ?? null,

        Created: item.Created ?? null,

        Modified: item.Modified ?? null,

        CreatedBy: item.Author?.Title ?? "",

        CreatedById: item.Author?.Id ?? null,

        ModifiedBy: item.Editor?.Title ?? "",

        ModifiedById: item.Editor?.Id ?? null,
      }));

      return mapped;
    } catch (error) {
      console.error("Error in ContractorAgencyMaster Data:", error);

      throw error;
    }
  };

  return {
    getContractorAgencyMasterData,
  };
}
