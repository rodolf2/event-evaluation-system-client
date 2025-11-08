import { useState, useCallback } from "react";
import { FormSessionManager } from "../utils/formSessionManager";

export const useCSVData = () => {
  const [uploadedCSVData, setUploadedCSVData] = useState(() => {
    return FormSessionManager.loadCSVData() || [];
  });

  const parseCSV = useCallback((csvText) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const requiredHeaders = ['name', 'email'];

    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }

    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) {
        throw new Error(`Row ${i + 1} has ${values.length} columns, expected ${headers.length}`);
      }

      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      if (!row.name || !row.email) {
        throw new Error(`Row ${i + 1} is missing required name or email`);
      }

      data.push(row);
    }

    return data;
  }, []);

  const handleCSVUpload = useCallback(async (csvData) => {
    await FormSessionManager.saveCSVData(csvData);
    setUploadedCSVData(csvData);
  }, []);

  const clearCSVData = useCallback(async () => {
    await FormSessionManager.clearCSVData();
    setUploadedCSVData([]);
  }, []);

  return {
    uploadedCSVData,
    parseCSV,
    handleCSVUpload,
    clearCSVData,
  };
};