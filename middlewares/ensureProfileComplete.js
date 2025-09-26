const {
    Patient
} = require("../models");
const {
    setFlash
} = require("./flash"); // pastikan path sesuai

async function ensureProfileComplete(req, res, next) {
    try {
        const patient = await Patient.findOne({
            where: {
                userId: req.session.user.id
            }
        });

        if (!patient) {
            setFlash(req, "error", "Patient profile not found.");
            return res.redirect("/patients/complete-profile");
        }

        if (!patient.dateOfBirth || !patient.gender || !patient.bloodType || !patient.height) {
            setFlash(req, "error", "Please complete your profile before requesting a consultation.");
            return res.redirect("/patients/complete-profile");
        }

        next();
    } catch (err) {
        next(err);
    }
}

module.exports = ensureProfileComplete;