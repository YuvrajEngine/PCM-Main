

export const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return "-";
        return new Intl.DateTimeFormat("en-GB", {
            year: "numeric",
            month: "short",
            day: "2-digit",
        }).format(new Date(dateStr));
    };


 
export const checkDuplicateLocal = (modData: any[], newItem: any) => {
  return modData.some(
    (m) =>
      m.PosID === newItem.PosID &&
      m.TniDeptID === newItem.TniDeptID &&
      m.ModuleID === newItem.ModuleID &&
      m.LevelID === newItem.LevelID &&
      m.FinYearID === newItem.FinYearID
  );
};

export const chunkArray = (arr: any[], size: number) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

export const flattenData = (data: any): any[] => {
  if (!data) return [];

  if (!Array.isArray(data)) {
    return typeof data === "object" ? [data] : [];
  }

  return data.reduce((acc: any[], item: any) => {
    if (Array.isArray(item)) {
      return acc.concat(flattenData(item));
    }
    if (item && typeof item === "object") {
      return acc.concat(item);
    }
    return acc;
  }, []);
};


export const normalize = (val: string = ""): string => {
  return val
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFKD") // handles unicode
    .replace(/[^\w\s]/g, "") // remove special chars
    .replace(/\s+/g, " "); // normalize spaces
};