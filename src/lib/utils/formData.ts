function hasId(obj: any): obj is { id: string | number } {
  return typeof obj === 'object' && obj !== null && 'id' in obj;
}

export function buildEmployeeFormData(formDataObj: any): FormData {
  const data = new FormData();

  const fieldMap: Record<string, string> = {
    Branch: 'Branch_id',
    Division: 'Division_id',
    Position: 'Position_id',
  };
  for (const [key, value] of Object.entries(formDataObj)) {
    if (value === null || value === undefined || value === "") continue;

    if (key === "Achievements" && Array.isArray(value)) {
      value.forEach((file: File, index: number) => {
        if (file && file.size > 0) {
          data.append(`Achievements[${index}][file]`, file);
        }
      });
      continue;
    }

    // Handle mapped foreign keys
    if (fieldMap[key] && hasId(value)) {
      data.append(fieldMap[key], String(value.id));
      continue;
    }
    // Handle object (e.g., branch, division, etc.)
    if (typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof File) && !(value instanceof Date)) {
      if ('id' in value) {
        data.append(key.toLowerCase() + "_id", String(value.id)); // ← FIXED
      }
      continue;
    }

    if (value instanceof Date) {
      data.append(key, value.toISOString().split("T")[0]);
    } else if (value instanceof File) {
      if (value.size > 0) {
        data.append(key, value);
      }
    } else if (typeof value === "number" || typeof value === "boolean") {
      data.append(key, String(value));
    } else {
      data.append(key, String(value));
    }
  }

  return data;
}
