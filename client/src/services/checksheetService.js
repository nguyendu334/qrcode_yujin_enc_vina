import api from "../helper/api";

export const getChecksheet = async (id) => {
  const res = await api.get(`/checksheet/machine-info?machine_id=${id}`);
  return res.data;
};

export const sendInfoChecksheet = async (data) => {
  const res = await api.post("/checksheet/submit", data);
  return res.data;
};
