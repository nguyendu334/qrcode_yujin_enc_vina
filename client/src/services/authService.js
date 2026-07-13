import api from "../helper/api";

export const loginAPI = async (username, password) => {
  const res = await api.post("/auth/login", {
    username,
    password,
  });

  return res.data;
};
