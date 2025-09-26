const {
    User,
    Patient,
    Doctor,
    Appointment,
    Message
} = require("../models");
const {
    formatDate
} = require("../helpers/formatDate");
const {
    setFlash
} = require("../middlewares/flash");
const {
    Op
} = require("sequelize");
const bcrypt = require("bcryptjs");
const {
    sendEmail
} = require("../helpers/sendEmail");
const {
    getSuffix
} = require("../helpers/specialtySuffix");
const {
    calcAge
} = require("../helpers/calculateAge");
const dayjs = require("dayjs");

class Controller {
    static home(req, res) {
        if (req.session.user) {
            switch (req.session.user.role) {
                case "admin":
                    return res.redirect("/admin");
                case "doctor":
                    return res.redirect("/doctor/dashboard");
                case "patient":
                    return res.redirect("/patient/dashboard");
            }
        }
        res.render("index", {
            title: "Welcome"
        });
    }

    static showRegister(req, res) {
        res.render("auth/register", {
            title: "Register"
        });
    }

    static async register(req, res, next) {
        try {
            const {
                username,
                email,
                password
            } = req.body;
            const user = await User.create({
                username,
                email,
                password,
                role: "patient"
            });
            await Patient.create({
                name: username,
                userId: user.id
            });

            setFlash(req, "success", "Registration successful, please login.");
            res.redirect("/login");
        } catch (err) {
            if (err.name === "SequelizeUniqueConstraintError") {
                setFlash(req, "error", "Email or username already registered.");
                return res.redirect("/register");
            }
            next(err);
        }
    }

    static showLogin(req, res) {
        res.render("auth/login", {
            title: "Login"
        });
    }

    static async login(req, res, next) {
        try {
            const {
                email,
                password
            } = req.body;
            const user = await User.findOne({
                where: {
                    email
                }
            });
            if (!user || !(await bcrypt.compare(password, user.password))) {
                setFlash(req, "error", "Invalid email or password");
                return res.redirect("/login");
            }

            req.session.user = {
                id: user.id,
                username: user.username,
                role: user.role
            };

            if (user.role === "admin") return res.redirect("/admin");
            if (user.role === "doctor") return res.redirect("/doctor/dashboard");
            if (user.role === "patient") return res.redirect("/patient/dashboard");
        } catch (err) {
            next(err);
        }
    }

    static logout(req, res) {
        req.session.destroy(() => res.redirect("/login"));
    }

    static async patientDashboard(req, res, next) {
        try {
            const patient = await Patient.findOne({
                where: {
                    userId: req.session.user.id
                },
                include: [{
                    model: Appointment,
                    include: [Doctor]
                }]
            });
            res.render("patients/dashboard", {
                title: "Patient Dashboard",
                patient
            });
        } catch (err) {
            next(err);
        }
    }


    static adminDashboard(req, res) {
        res.render("admin/dashboard", {
            title: "Admin Dashboard"
        });
    }

    static async doctorDashboard(req, res, next) {
        try {
            const doctor = await Doctor.findOne({
                where: {
                    userId: req.session.user.id
                },
                include: [{
                    model: Appointment,
                    include: [Patient]
                }]
            });

            if (!doctor) {
                setFlash(req, "error", "Doctor profile not found");
                return res.redirect("/");
            }

            res.render("doctors/dashboard", {
                title: "Doctor Dashboard",
                doctor
            });
        } catch (err) {
            next(err);
        }
    }


    static async listPatients(req, res, next) {
        try {
            const page = req.query.page ? +req.query.page : 1;
            const search = req.query.search || "";
            const limit = 5;
            const offset = (page - 1) * limit;

            const where = search ? {
                name: {
                    [Op.iLike]: `%${search}%`
                }
            } : {};
            const result = await Patient.findAndCountAll({
                where,
                limit,
                offset,
                order: [
                    ["name", "ASC"]
                ]
            });

            const totalPages = Math.ceil(result.count / limit);
            res.render("patients/list", {
                patients: result.rows,
                currentPage: page,
                totalPages,
                search,
                title: "Patients list"
            });
        } catch (err) {
            next(err);
        }
    }

    static async showAddPatient(req, res) {
        res.render("patients/form", {
            title: "Add Patient",
            patient: null,
            action: "/admin/patients/add"
        });
    }

    static async addPatient(req, res, next) {
        try {
            const {
                username,
                email,
                password,
                name,
                phone,
                dateOfBirth,
                gender
            } = req.body;
            const user = await User.create({
                username,
                email,
                password,
                role: "patient"
            });
            await Patient.create({
                name,
                phone,
                dateOfBirth,
                gender,
                userId: user.id
            });
            res.redirect("/admin/patients");
        } catch (err) {
            next(err);
        }
    }

    static async showEditPatient(req, res, next) {
        try {
            const {
                id
            } = req.params;
            const patient = await Patient.findByPk(id, {
                include: User
            });
            res.render("patients/form", {
                title: "Edit Patient",
                patient,
                action: `/admin/patients/${id}/edit`
            });
        } catch (err) {
            next(err);
        }
    }

    static async editPatient(req, res, next) {
        try {
            const {
                id
            } = req.params;
            const {
                username,
                email,
                name,
                phone,
                dateOfBirth,
                gender
            } = req.body;
            const patient = await Patient.findByPk(id, {
                include: User
            });
            if (!patient) throw new Error("Patient not found");

            await patient.User.update({
                username,
                email
            });
            await patient.update({
                name,
                phone,
                dateOfBirth,
                gender
            });
            res.redirect("/admin/patients");
        } catch (err) {
            next(err);
        }
    }

    static async deletePatient(req, res, next) {
        try {
            const {
                id
            } = req.params;
            const patient = await Patient.findByPk(id, {
                include: User
            });
            if (!patient) throw new Error("Patient not found");

            await patient.User.destroy();
            res.redirect("/admin/patients");
        } catch (err) {
            next(err);
        }
    }

    static async listDoctors(req, res, next) {
        try {
            const doctors = await Doctor.findAll({
                include: User
            });

            const specialtySuffix = {
                Cardiology: "Sp.JP",
                Pediatrics: "Sp.A",
                InternalMedicine: "Sp.PD",
                Neurology: "Sp.S",
                Dermatology: "Sp.KK"
            };

            const doctorsWithDisplay = doctors.map(d => {
                const suffix = specialtySuffix[d.specialty] || "";
                return {
                    ...d.get({
                        plain: true
                    }),
                    displayName: `dr. ${d.name}${suffix ? ", " + suffix : ""}`
                };
            });

            res.render("doctors/list", {
                title: "Doctors",
                doctors: doctorsWithDisplay
            });
        } catch (err) {
            next(err);
        }
    }


    static async doctorDetail(req, res, next) {
        try {
            const {
                id
            } = req.params;
            const doctor = await Doctor.findByPk(id, {
                include: User
            });
            if (!doctor) throw new Error("Doctor not found");

            const specialtySuffix = {
                Cardiology: "Sp.JP",
                Pediatrics: "Sp.A",
                InternalMedicine: "Sp.PD",
                Neurology: "Sp.S",
                Dermatology: "Sp.KK"
            };

            const suffix = specialtySuffix[doctor.specialty] || "";
            const displayName = `Dr. ${doctor.name}${suffix ? ", " + suffix : ""}`;

            res.render("doctors/detail", {
                title: "Doctor Detail",
                doctor,
                displayName,
                suffix
            });
        } catch (err) {
            next(err);
        }
    }

    static showAddDoctor(req, res) {
        res.render("doctors/form", {
            title: "Add Doctor",
            doctor: null,
            action: "/admin/doctors/add"
        });
    }

    static async addDoctor(req, res, next) {
        try {
            const {
                username,
                email,
                password,
                name,
                specialty,
                phone,
                license_number
            } = req.body;
            const user = await User.create({
                username,
                email,
                password,
                role: "doctor"
            });
            await Doctor.create({
                name,
                specialty,
                phone,
                userId: user.id,
                license_number
            });
            res.redirect("/admin/doctors");
        } catch (err) {
            next(err);
        }
    }

    static async showEditDoctor(req, res, next) {
        try {
            const {
                id
            } = req.params;
            const doctor = await Doctor.findByPk(id, {
                include: User
            });
            res.render("doctors/form", {
                title: "Edit Doctor",
                doctor,
                action: `/admin/doctors/${id}/edit`
            });
        } catch (err) {
            next(err);
        }
    }

    static async editDoctor(req, res, next) {
        try {
            const {
                id
            } = req.params;
            const {
                username,
                email,
                name,
                specialty,
                phone
            } = req.body;
            const doctor = await Doctor.findByPk(id, {
                include: User
            });
            if (!doctor) throw new Error("Doctor not found");

            await doctor.User.update({
                username,
                email
            });
            await doctor.update({
                name,
                specialty,
                phone
            });
            res.redirect("/admin/doctors");
        } catch (err) {
            next(err);
        }
    }

    static async deleteDoctor(req, res, next) {
        try {
            const {
                id
            } = req.params;
            const doctor = await Doctor.findByPk(id, {
                include: User
            });
            if (!doctor) throw new Error("Doctor not found");

            await doctor.User.destroy();
            res.redirect("/admin/doctors");
        } catch (err) {
            next(err);
        }
    }

    static async listAppointments(req, res, next) {
        try {
            const appointments = await Appointment.findAll({
                include: [Patient, Doctor],
                order: [
                    ["appointmentDate", "ASC"]
                ]
            });
            res.render("appointments/list", {
                title: "Appointments",
                appointments,
                formatDate,
                user: req.session.user
            });
        } catch (err) {
            next(err);
        }
    }

    static async appointmentDetail(req, res, next) {
        try {
            const {
                id
            } = req.params;

            const appointment = await Appointment.findByPk(id, {
                include: [{
                        model: Patient,
                        include: [User]
                    },
                    {
                        model: Doctor,
                        include: [User]
                    }
                ]
            });

            if (!appointment) throw new Error("Appointment not found");

            const age = calcAge(appointment.Patient.dateOfBirth);

            res.render("appointments/detail", {
                appointment,
                patient: appointment.Patient,
                doctor: appointment.Doctor,
                age,
                formatDate: (date) => date ? dayjs(date).format("DD MMM YYYY") : "-"
            });
        } catch (err) {
            next(err);
        }
    }

    static async showAddAppointment(req, res, next) {
        try {

            const {
                patientId
            } = req.query;

            const patients = await Patient.findAll({
                include: User
            });
            const doctors = await Doctor.findAll({
                include: User
            });

            res.render("appointments/form", {
                title: "Add Appointment",
                appointment: null,
                doctors,
                patients,
                action: "/appointments/add",
                preselectedPatientId: patientId || null
            });
        } catch (err) {
            next(err);
        }
    }

    static async addAppointment(req, res, next) {
        try {
            const {
                patientId,
                doctorId,
                appointmentDate,
                reason
            } = req.body;
            const appointment = await Appointment.create({
                patientId,
                doctorId,
                appointmentDate,
                reason
            });

            const patient = await Patient.findByPk(patientId, {
                include: User
            });
            const doctor = await Doctor.findByPk(doctorId, {
                include: User
            });

            const messageText = `New appointment scheduled on ${formatDate(appointmentDate)} with Dr. ${doctor.name}. Reason: ${reason}`;

            await Message.create({
                userId: patient.User.id,
                title: "Appointment Confirmation",
                content: messageText,
                isRead: false
            });

            await Message.create({
                userId: doctor.User.id,
                title: "New Appointment",
                content: `You have a new appointment with patient ${patient.name} on ${formatDate(appointmentDate)}.`,
                isRead: false
            });

            // await sendEmail(patient.User.email, "Appointment Confirmation", messageText);
            // await sendEmail(doctor.User.email, "New Appointment", `You have a new appointment with ${patient.name}.`);

            setFlash(req, "success", "Appointment created successfully!");
            res.redirect("/appointments");
        } catch (err) {
            next(err);
        }
    }

    static async showEditAppointment(req, res, next) {
        try {
            const {
                id
            } = req.params;
            const appointment = await Appointment.findByPk(id);
            if (!appointment) throw new Error("Appointment not found");

            const doctors = await Doctor.findAll();
            const patients = await Patient.findAll();

            res.render("appointments/form", {
                title: "Edit Appointment",
                appointment,
                doctors,
                patients,
                action: `/appointments/${id}/edit`
            });
        } catch (err) {
            next(err);
        }
    }

    static async editAppointment(req, res, next) {
        try {
            const {
                id
            } = req.params;
            const {
                patientId,
                doctorId,
                appointmentDate,
                reason
            } = req.body;
            const appointment = await Appointment.findByPk(id);
            if (!appointment) throw new Error("Appointment not found");

            await appointment.update({
                patientId,
                doctorId,
                appointmentDate,
                reason
            });
            setFlash(req, "success", "Appointment updated successfully!");
            res.redirect("/appointments");
        } catch (err) {
            next(err);
        }
    }

    static async deleteAppointment(req, res, next) {
        try {
            const {
                id
            } = req.params;
            const appointment = await Appointment.findByPk(id);
            if (!appointment) throw new Error("Appointment not found");

            await appointment.destroy();
            setFlash(req, "success", "Appointment deleted successfully!");
            res.redirect("/appointments");
        } catch (err) {
            next(err);
        }
    }

    static async inbox(req, res, next) {
        try {
            const messages = await Message.findAll({
                where: {
                    userId: req.session.user.id
                },
                include: [{
                    model: User
                }, {
                    model: Patient
                }],
                order: [
                    ["createdAt", "DESC"]
                ]
            });

            if (req.session.user.role === "doctor") {
                res.render("inbox/doctor", {
                    title: "Doctor Inbox",
                    messages
                });
            } else {

                res.render("inbox/patients", {
                    title: "Patient Inbox",
                    messages
                });
            }
        } catch (err) {
            next(err);
        }
    }


    static async inboxDetail(req, res, next) {
        try {
            const {
                id
            } = req.params;
            const message = await Message.findByPk(id, {
                include: [{
                        model: User
                    },
                    {
                        model: Patient,
                        include: [User]
                    }
                ]
            });


            if (!message) throw new Error("Message not found");

            res.render("inbox/detail", {
                title: "Message Detail",
                message
            });
        } catch (err) {
            next(err);
        }
    }

    static async markMessageRead(req, res, next) {
        try {
            const {
                id
            } = req.params;
            const message = await Message.findByPk(id);
            if (!message) {
                setFlash(req, "error", "Message not found");
                return res.redirect("/inbox");
            }
            await message.update({
                isRead: true
            });
            setFlash(req, "success", "Message marked as read");
            res.redirect("/inbox");
        } catch (err) {
            next(err);
        }
    }

    static async showProfile(req, res, next) {
        try {
            const user = await User.findByPk(req.session.user.id, {
                include: [Patient, Doctor]
            });
            res.render("profile", {
                title: "My Profile",
                user,
                session: req.session
            });
        } catch (err) {
            next(err);
        }
    }

    static async updateProfile(req, res, next) {
        try {
            const {
                username,
                email,
                dateOfBirth,
                phone,
                gender,
                specialty
            } = req.body;
            const {
                id,
                role
            } = req.session.user;

            await User.update({
                username,
                email
            }, {
                where: {
                    id
                }
            });

            if (role === "patient") {
                await Patient.update({
                    dateOfBirth,
                    phone,
                    gender
                }, {
                    where: {
                        userId: id
                    }
                });
            }
            if (role === "doctor") {
                await Doctor.update({
                    specialty,
                    phone
                }, {
                    where: {
                        userId: id
                    }
                });
            }

            setFlash(req, "success", "Profile updated successfully!");
            res.redirect("/profile");
        } catch (err) {
            next(err);
        }
    }

    static async showConsultationForm(req, res, next) {
        try {
            const specialties = await Doctor.findAll({
                attributes: ["specialty"],
                group: ["specialty"],
                order: [
                    ["specialty", "ASC"]
                ]
            });

            res.render("consultations/form", {
                title: "Request Consultation",
                specialties
            });
        } catch (err) {
            next(err);
        }
    }

    static async requestConsultation(req, res, next) {
        try {
            const {
                specialty,
                doctorId,
                reason
            } = req.body;

            const patient = await Patient.findOne({
                where: {
                    userId: req.session.user.id
                },
                include: User
            });

            const doctor = await Doctor.findByPk(doctorId, {
                include: User
            });

            if (!doctor || !patient) throw new Error("Doctor or patient not found");

            await Message.create({
                userId: patient.User.id,
                PatientId: patient.id,
                title: "New Consultation Request",
                content: `${patient.name} requested a consultation. Reason: ${reason}`,
                isRead: false
            });
            await Message.create({
                userId: doctor.User.id,
                PatientId: patient.id,
                title: "Consultation Request",
                content: `${patient.name} requested a consultation. Reason: ${reason}`,
                isRead: false
            });

            await sendEmail(
                doctor.User.email,
                "New Consultation Request",
                `${patient.name} requested a consultation.\nReason: ${reason}`
            );

            setFlash(req, "success", "Consultation request sent to doctor.");
            res.redirect("/patient/dashboard");
        } catch (err) {
            next(err);
        }
    }



    static async showScheduleForm(req, res, next) {
        try {
            const {
                id
            } = req.params;
            const patient = await Patient.findByPk(id, {
                include: User
            });
            if (!patient) throw new Error("Patient not found");

            res.render("consultations/schedule", {
                title: "Schedule Consultation",
                patient
            });
        } catch (err) {
            next(err);
        }
    }

    static async addSchedule(req, res, next) {
        try {
            const {
                id
            } = req.params;
            const {
                appointmentDate,
                reason
            } = req.body;

            const doctor = await Doctor.findOne({
                where: {
                    userId: req.session.user.id
                },
                include: User
            });
            const patient = await Patient.findByPk(id, {
                include: User
            });

            if (!doctor || !patient) throw new Error("Doctor or patient not found");

            const appointment = await Appointment.create({
                patientId: patient.id,
                doctorId: doctor.id,
                appointmentDate,
                reason
            });

            await Message.create({
                userId: patient.User.id,
                AppointmentId: appointment.id,
                title: "Consultation Scheduled",
                content: `Your consultation with Dr. ${doctor.name} is scheduled on ${formatDate(appointmentDate)}.`,
                isRead: false
            });

            await sendEmail(
                patient.User.email,
                "Consultation Scheduled",
                `Your consultation with Dr. ${doctor.name} is scheduled on ${formatDate(appointmentDate)}.\nReason: ${reason}`
            );

            setFlash(req, "success", "Consultation scheduled and patient notified.");
            res.redirect("/appointments");
        } catch (err) {
            next(err);
        }
    }

    static async completeProfileForm(req, res, next) {
        try {
            const patient = await Patient.findOne({
                where: {
                    userId: req.session.user.id
                }
            });
            res.render("patients/completeProfile", {
                title: "Complete Profile",
                patient
            });
        } catch (err) {
            next(err);
        }
    }

    static async completeProfile(req, res, next) {
        try {
            const {
                dateOfBirth,
                gender,
                bloodType,
                height
            } = req.body;
            await Patient.update({
                dateOfBirth,
                gender,
                bloodType,
                height
            }, {
                where: {
                    userId: req.session.user.id
                }
            });
            setFlash(req, "success", "Profile updated successfully.");
            res.redirect("/patient/dashboard");
        } catch (err) {
            next(err);
        }
    }

}

module.exports = Controller;