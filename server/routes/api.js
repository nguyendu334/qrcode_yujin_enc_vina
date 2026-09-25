const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");

const {
  getAreas,
  addArea,
  updateArea,
  deleteArea,
} = require("../controllers/areaCtrl.js");
const {
  getCheckSheet,
  sendInfoCheckSheet,
  checkDuplicateChecksheet,
  getApproversByMachine,
} = require("../controllers/checksheetCtrl.js");
const {
  getInspectionHeader,
  getInspectionDetail,
  approveInspection,
  batchApprove,
} = require("../controllers/inspectionCtrl.js");
const {
  getMachines,
  addMachine,
  deleteMachine,
  updateMachine,
} = require("../controllers/machineCtrl.js");
const {
  getMachineType,
  addMachineType,
  updateMachineType,
  deleteMachineType,
} = require("../controllers/machineTypeCtrl.js");

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
const {
  getItemsByTemplate,
  createItem,
  updateItem,
  deleteItem,
  getChecklistTemplates,
} = require("../controllers/checklistItemCtrl.js");

router.get("/machines", verifyToken, getMachines);
router.post("/machines", verifyToken, addMachine);
router.delete("/machines/:id", verifyToken, deleteMachine);
router.put("/machines/:id", verifyToken, updateMachine);

router.get("/machine-types", verifyToken, getMachineType);
router.post("/machine-types", verifyToken, addMachineType);
router.put("/machine-types/:id", verifyToken, updateMachineType);
router.delete("/machine-types/:id", verifyToken, deleteMachineType);

router.get("/checklist-templates", getChecklistTemplates);
router.get("/checklist-items/template/:templateId", getItemsByTemplate);
router.post("/checklist-items", createItem);
router.put("/checklist-items/:itemId", updateItem);
router.delete("/checklist-items/:itemId", deleteItem);

router.get("/areas", verifyToken, getAreas);
router.post("/areas", verifyToken, addArea);
router.put("/areas/:area_id", verifyToken, updateArea);
router.delete("/areas/:area_id", verifyToken, deleteArea);

router.get("/checksheet/machine-info", getCheckSheet);
router.get("/inspections/check-duplicate", checkDuplicateChecksheet);
router.post("/checksheet/submit", sendInfoCheckSheet);
router.get("/approvers/by-machine/:machineId", getApproversByMachine);

router.get("/inspection-headers", verifyToken, getInspectionHeader);
router.get(
  "/inspection-details/:inspectionId",
  verifyToken,
  getInspectionDetail,
);

// user api
router.get(
  "/users",
  verifyToken,
  checkRole(["manager", "admin", "head"]),
  getUesrs,
);
router.post(
  "/users",
  verifyToken,
  checkRole(["manager", "admin", "head"]),
  addUser,
);
router.put(
  "/users/:user_id",
  verifyToken,
  checkRole(["manager", "admin", "head"]),
  updateUser,
);
router.delete(
  "/users/:user_id",
  verifyToken,
  checkRole(["manager", "admin", "head"]),
  deleteUser,
);

router.put("/inspections/:id/approval", verifyToken, approveInspection);
router.post("/inspections/batch-approve", verifyToken, batchApprove);

router.get("/reports/monthly", getMonthlyReport);

router.get("/dashboard/stats", verifyToken, getDashboardStats);

router.post("/tickets", createTicket);
router.get("/tickets", verifyToken, getTickets);
router.put("/tickets/:ticket_id", updateTicketStatus);

module.exports = router;
