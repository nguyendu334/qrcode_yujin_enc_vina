import api from "../helper/api";

// lấy danh sách máy
export const getMachines = async () => {
  const res = await api.get("/machines");
  return res.data;
};

export const addMachine = async (data) => {
  const res = await api.post("/machines", data);
  return res.data;
};

export const updateMachine = async (id, data) => {
  const res = await api.put(`/machines/${id}`, data);
  return res.data;
};

export const deleteMachine = async (id) => {
  const res = await api.delete(`/machines/${id}`);
  return res.data;
};

export const getAreas = async () => {
  const res = await api.get("/areas");
  return res.data;
};

export const addArea = async (data) => {
  const res = await api.post("/areas", data);
  return res.data;
};

export const updateArea = async (id, payload) => {
  const response = await api.put(`/areas/${id}`, payload);
  return response.data;
};

export const deleteArea = async (id) => {
  const response = await api.delete(`/areas/${id}`);
  return response.data;
};

export const getMachineTypes = async () => {
  const res = await api.get("/machine-types");
  return res.data;
};

export const addMachineType = async (data) => {
  const res = await api.post("/machine-types", data);
  return res.data;
};

export const updateMachineType = async (id, payload) => {
  const response = await api.put(`/machine-types/${id}`, payload);
  return response.data;
};

export const deleteMachineType = async (id) => {
  const response = await api.delete(`/machine-types/${id}`);
  return response.data;
};
