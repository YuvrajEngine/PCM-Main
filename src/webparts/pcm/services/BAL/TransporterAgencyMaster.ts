import { IPcmProps } from "../../components/IPcmProps";
import SPCRUDOPS from "../DAL/spcrudops";

export interface ITransporterAgencyMasterOps {
  getTransporterAgencyMasterData(
    Filter: any,
    orderby: any,
    props: IPcmProps,
  ): Promise<any[]>;
}

export default function TransporterAgencyMasterOps(): ITransporterAgencyMasterOps {
  const spCrudOps = SPCRUDOPS();

  const getTransporterAgencyMasterData = async (
    Filter: any,
    orderby: any,
    props: IPcmProps,
  ): Promise<any[]> => {
    if (!props) {
      throw new Error("[TransporterAgencyMasterOps] props is undefined.");
    }

    if (!props.currentSPContext || !props.currentSPContext.pageContext) {
      throw new Error(
        "[TransporterAgencyMasterOps] SharePoint context is not initialized.",
      );
    }

    try {
      const spCrudOpsInstance = await spCrudOps;

      const results = await spCrudOpsInstance.getData(
        "TransporterAgencyMaster",

        `*,
        Commodity/Id,
        Commodity/Title,
        Author/Id,
        Author/Title,
        Editor/Id,
        Editor/Title`,

        "Commodity,Author,Editor",

        Filter,
        orderby,
        props,
      );

      const mapped = results.map((item: any) => ({
        ...item,

        Id: item.Id ?? null,

        Title: item.Title ?? "",

        Address: item.Address ?? "",

        AgencyCode: item.AgencyCode ?? "",

        Commodity: item.Commodity?.Title ?? "",

        CommodityId: item.Commodity?.Id ?? null,

        CommodityType: item.CommodityType ?? "",

        ContactNo: item.ContactNo ?? "",

        EmailID: item.EmailID ?? "",

        ManagerName: item.ManagerName ?? "",

        Status: item.Status ?? "",

        TransporterName: item.TransporterName ?? "",

        AssessmentdonebyCro: item.AssessmentdonebyCro ?? "",

        AssessmentType: item.AssessmentType ?? "",

        Created: item.Created ?? null,

        Modified: item.Modified ?? null,

        CreatedBy: item.Author?.Title ?? "",

        CreatedById: item.Author?.Id ?? null,

        ModifiedBy: item.Editor?.Title ?? "",

        ModifiedById: item.Editor?.Id ?? null,
      }));

      return mapped;
    } catch (error) {
      console.error("Error in TransporterAgencyMaster Data:", error);

      throw error;
    }
  };

  return {
    getTransporterAgencyMasterData,
  };
}
