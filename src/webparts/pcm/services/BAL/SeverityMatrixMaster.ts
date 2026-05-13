import { IPcmProps } from "../../components/IPcmProps";
import SPCRUDOPS from "../DAL/spcrudops";

export interface ISeverityMatrixOps {
  getSeverityMatrixData(
    Filter: any,
    orderby: any,
    props: IPcmProps,
  ): Promise<any[]>;
}

export default function SeverityMatrixOps(): ISeverityMatrixOps {
  const spCrudOps = SPCRUDOPS();

  const getSeverityMatrixData = async (
    Filter: any,
    orderby: any,
    props: IPcmProps,
  ): Promise<any[]> => {
    if (!props) {
      throw new Error(
        "[SeverityMatrixOps] `props` is undefined. Make sure props are passed correctly.",
      );
    }

    if (!props.currentSPContext || !props.currentSPContext.pageContext) {
      throw new Error(
        "[SeverityMatrixOps] SharePoint context is not initialized.",
      );
    }

    try {
      const spCrudOpsInstance = await spCrudOps;

      const results = await spCrudOpsInstance.getData(
        "SeverityMatrix",
        `*,Author/Id,Author/Title,Editor/Id,Editor/Title`,
        "Author,Editor",
        Filter,
        orderby,
        props,
      );

      const mapped = results.map((item: any) => ({
        ...item,

        Id: item.Id ?? null,

        Title: item.Title ?? "",

        SeverityDescription: item.SeverityDescription ?? "",

        IntentionCode: item.IntentionCode ?? "",

        IntentionDescription: item.IntentionDescription ?? "",

        ConsequenceCode: item.ConsequenceCode ?? "",

        ConsequenceDescription: item.ConsequenceDescription ?? "",

        Created: item.Created ?? null,

        Modified: item.Modified ?? null,

        CreatedBy: item.Author?.Title ?? "",

        CreatedById: item.Author?.Id ?? null,

        ModifiedBy: item.Editor?.Title ?? "",

        ModifiedById: item.Editor?.Id ?? null,
      }));

      return mapped;
    } catch (error) {
      console.error("Error in SeverityMatrix Data:", error);

      throw error;
    }
  };

  return {
    getSeverityMatrixData,
  };
}
