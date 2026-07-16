const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");

const { getAreas } = require("../controllers/areaCtrl.js");
const {
  getCheckSheet,
  sendInfoCheckSheet,
  checkDuplicateChecksheet,
} = require("../controllers/checksheetCtrl.js");
const {
  getInspectionHeader,
  getInspectionDetail,
  approveInspection,
} = require("../controllers/inspectionCtrl.js");
const {
  getMachines,
  addMachine,
  deleteMachine,
  updateMachine,
} = require("../controllers/machineCtrl.js");
const { getMachineType } = require("../controllers/machineTypeCtrl.js");

const { verifyToken, checkRole } = require("../middleware/auth");
const {
  getUesrs,
  addUser,
  updateUser,
  deleteUser,
} = require("../controllers/userCtrl.js");
const { getMonthlyReport } = require("../controllers/reportCtrl.js");
const { getDashboardStats } = require("../controllers/dashboardCtrl.js");
const {
  createTicket,
  getTickets,
  updateTicketStatus,
} = require("../controllers/ticketCtrl.js");

router.get("/machines", verifyToken, getMachines);
router.post("/machines", verifyToken, addMachine);
router.delete("/machines/:id", verifyToken, deleteMachine);
router.put("/machines/:id", verifyToken, updateMachine);

router.get("/machine-types", verifyToken, getMachineType);

router.get("/areas", verifyToken, getAreas);

router.get("/checksheet/machine-info", getCheckSheet);
router.get("/inspections/check-duplicate", checkDuplicateChecksheet);
router.post("/checksheet/submit", sendInfoCheckSheet);

router.get("/inspection-headers", verifyToken, getInspectionHeader);
router.get(
  "/inspection-details/:inspectionId",
  verifyToken,
  getInspectionDetail
);

// user api
router.get("/users", verifyToken, checkRole(["manager", "admin"]), getUesrs);
router.post("/users", verifyToken, checkRole(["manager", "admin"]), addUser);
router.put(
  "/users/:user_id",
  verifyToken,
  checkRole(["manager", "admin"]),
  updateUser
);
router.delete(
  "/users/:user_id",
  verifyToken,
  checkRole(["manager", "admin"]),
  deleteUser
);

router.put("/inspections/:id/approval", verifyToken, approveInspection);

router.get("/reports/monthly", getMonthlyReport);

router.get("/dashboard/stats", getDashboardStats);

router.post("/tickets", createTicket);
router.get("/tickets", verifyToken, getTickets);
router.put("/tickets/:ticket_id", updateTicketStatus);

module.exports = router;
