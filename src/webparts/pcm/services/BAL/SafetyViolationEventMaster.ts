import { IPcmProps } from "../../components/IPcmProps";
import SPCRUDOPS from "../DAL/spcrudops";

export interface ISafetyViolationEventMasterOps {
  getSafetyViolationEventMasterData(
    Filter: any,
    orderby: any,
    props: IPcmProps,
  ): Promise<any[]>;
}

export default function SafetyViolationEventMasterOps(): ISafetyViolationEventMasterOps {

  const spCrudOps = SPCRUDOPS();

  const getSafetyViolationEventMasterData = async (
    Filter: any,
    orderby: any,
    props: IPcmProps,
  ): Promise<any[]> => {

    if (!props) {
      throw new Error(
        "[SafetyViolationEventMasterOps] `props` is undefined. Make sure props are passed correctly."
      );
    }

    if (!props.currentSPContext || !props.currentSPContext.pageContext) {
      throw new Error(
        "[SafetyViolationEventMasterOps] SharePoint context is not initialized."
      );
    }

    try {

      const spCrudOpsInstance = await spCrudOps;

      const results = await spCrudOpsInstance.getData(
        "SafetyViolationEventMaster",
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

        EventDescription: item.EventDescription ?? "",

        Created: item.Created ?? null,

        Modified: item.Modified ?? null,

        CreatedBy: item.Author?.Title ?? "",
        CreatedById: item.Author?.Id ?? null,

        ModifiedBy: item.Editor?.Title ?? "",
        ModifiedById: item.Editor?.Id ?? null,
      }));

      return mapped;

    } catch (error) {

      console.error(
        "Error in SafetyViolationEventMaster Data:",
        error
      );

      throw error;
    }
  };

  return {
    getSafetyViolationEventMasterData,
  };
}