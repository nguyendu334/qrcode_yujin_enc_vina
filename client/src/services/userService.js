import api from "../helper/api";

// lấy danh sách máy
export const getUsers = async (user) => {
    const res = await api.get("/users", user);
    return res.data;
};

export const addUser = async (data, user) => {
    const res = await api.post("/users", data, user);
    return res.data;
};

export const updateUser = async (id, data, user) => {
    const res = await api.put(`/users/${id}`, data, user);
    return res.data;
};

export const deleteUser = async (id, user) => {
    const res = await api.delete(`/users/${id}`, user);
    return res.data;
};