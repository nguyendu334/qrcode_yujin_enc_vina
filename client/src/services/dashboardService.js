import api from "../helper/api";

// lấy danh sách máy
export const getDashboard = async () => {
  const res = await api.get("/dashboard/stats");
  return res.data;
};
