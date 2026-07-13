import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";

import Login from "../pages/Login/Login";

import Dashboard from "../pages/Dashboard/Dashboard";
import Machine from "../pages/Machine/Machine";
import History from "../pages/History/History";
import Report from "../pages/Report/Report";
import Checksheet from "../pages/Checksheet/Checksheet";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import UserManagementPage from "../pages/User/UserPage";
import Setting from "../pages/Setting/SettingPage";


export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/checksheet" element={<Checksheet />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout/>
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/machine" element={<Machine />} />

          <Route path="/history" element={<History />} />

          <Route path="/report" element={<Report />} />
          <Route path="/setting" element={<Setting />} />
          <Route
            path="/user"
            element={
              <RoleRoute roles={["manager", "admin"]}>
                <UserManagementPage />
              </RoleRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
