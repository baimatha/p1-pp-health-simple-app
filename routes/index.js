const express = require("express");
const Controller = require("../controllers/controller");
const { isLoggedIn, isAdmin, isPatient, isDoctor } = require("../middlewares/auth");
const { Doctor } = require("../models");
const ensureProfileComplete = require("../middlewares/ensureProfileComplete");



const router = express.Router();

router.get("/", Controller.home);

router.get("/login", Controller.showLogin);
router.post("/login", Controller.login);
router.get("/logout", Controller.logout);

router.get("/register", Controller.showRegister);
router.post("/register", Controller.register);

router.get("/patient/dashboard", isLoggedIn, isPatient, Controller.patientDashboard);
router.get("/doctor/dashboard", isLoggedIn, isDoctor, Controller.doctorDashboard);
router.get("/admin", isLoggedIn, isAdmin, Controller.adminDashboard);

router.get("/admin/doctors", isLoggedIn, isAdmin, Controller.listDoctors);
router.get("/admin/doctors/add", isLoggedIn, isAdmin, Controller.showAddDoctor);
router.post("/admin/doctors/add", isLoggedIn, isAdmin, Controller.addDoctor);
router.get("/admin/doctors/:id", isLoggedIn, isAdmin, Controller.doctorDetail);
router.get("/admin/doctors/:id/edit", isLoggedIn, isAdmin, Controller.showEditDoctor);
router.post("/admin/doctors/:id/edit", isLoggedIn, isAdmin, Controller.editDoctor);
router.get("/admin/doctors/:id/delete", isLoggedIn, isAdmin, Controller.deleteDoctor);

router.get("/admin/patients", isLoggedIn, isAdmin, Controller.listPatients);
router.get("/admin/patients/add", isLoggedIn, isAdmin, Controller.showAddPatient);
router.post("/admin/patients/add", isLoggedIn, isAdmin, Controller.addPatient);
router.get("/admin/patients/:id/edit", isLoggedIn, isAdmin, Controller.showEditPatient);
router.post("/admin/patients/:id/edit", isLoggedIn, isAdmin, Controller.editPatient);
router.get("/admin/patients/:id/delete", isLoggedIn, isAdmin, Controller.deletePatient);

router.get("/appointments", isLoggedIn, Controller.listAppointments);
router.get("/appointments/add", isLoggedIn, isDoctor, Controller.showAddAppointment);
router.post("/appointments/add", isLoggedIn, isDoctor, Controller.addAppointment);
router.get("/appointments/:id", isLoggedIn, Controller.appointmentDetail);
router.get("/appointments/:id/edit", isLoggedIn, isDoctor, Controller.showEditAppointment);
router.post("/appointments/:id/edit", isLoggedIn, isDoctor, Controller.editAppointment);
router.get("/appointments/:id/delete", isLoggedIn, isDoctor, Controller.deleteAppointment);

router.get("/profile", isLoggedIn, Controller.showProfile);
router.post("/profile", isLoggedIn, Controller.updateProfile);

router.get("/inbox", isLoggedIn, Controller.inbox);
router.get("/inbox/:id", isLoggedIn, Controller.inboxDetail);
router.get("/inbox/:id/read", isLoggedIn, Controller.markMessageRead);

router.get("/patients/complete-profile", Controller.completeProfileForm);
router.post("/patients/complete-profile", Controller.completeProfile);

router.get("/consultation/start", isLoggedIn, isPatient, ensureProfileComplete, Controller.showConsultationForm);
router.post("/consultation/request", isLoggedIn, isPatient, ensureProfileComplete, Controller.requestConsultation);

router.get("/consultation/:id/schedule", isLoggedIn, isDoctor, Controller.showScheduleForm);
router.post("/consultation/:id/schedule", isLoggedIn, isDoctor, Controller.addSchedule);

router.get("/api/doctors", isLoggedIn, isPatient, async (req, res, next) => {
  try {
    const { specialty } = req.query;
    const doctors = await Doctor.findAll({
      where: { specialty },
      attributes: ["id", "name"]
    });
    res.json(doctors);
  } catch (err) {
    next(err);
  }
});


module.exports = router;