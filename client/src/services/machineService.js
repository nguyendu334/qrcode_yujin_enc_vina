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

export const getMachineTypes = async () => {
    const res = await api.get("/machine-types");
    return res.data;
};