const dayjs = require("dayjs");

function formatDate(date) {
  if (!date) return "";
  return dayjs(date).format("DD MMM YYYY, HH:mm");
}

module.exports = { formatDate };