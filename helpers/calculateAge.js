function calcAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  const now = new Date();

  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months };
}

module.exports = { calcAge };