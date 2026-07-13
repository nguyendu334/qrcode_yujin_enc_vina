import api from "../helper/api";

// lấy danh sách máy
export const getInspectionHeader = async (filters) => {
  const res = await api.get("/inspection-headers", filters);
  return res.data;
};

export const getInspectionDetail = async (inspectionId) => {
  const res = await api.get(`/inspection-details/${inspectionId}`);
  return res.data;
};

export const updateApprove = async (currentInspectionId, data, headers) => {
  const res = await api.put(
    `/inspections/${currentInspectionId}/approval`,
    data,
    headers
  );
  return res.data;
};

