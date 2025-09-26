const specialtySuffix = {
  Cardiology: "Sp.JP",
  Pediatrics: "Sp.A",
  InternalMedicine: "Sp.PD",
  Neurology: "Sp.S",
  Dermatology: "Sp.KK"
};

function getSuffix(specialty) {
  return specialtySuffix[specialty] || "";
}

module.exports = { getSuffix };