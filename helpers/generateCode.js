function generateCode(prefix, id) {
  return `${prefix}-${String(id).padStart(3, "0")}`;
}

module.exports = { generateCode };