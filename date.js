
// This gives you the Day and Date when called eg.Saturday, June 25 
exports.getDate = function () {
  const today = new Date();

  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };

  return (day = today.toLocaleDateString("en-US", options));
};

// This only gives you the Day
exports.getDay = function () {
  const today = new Date();

  const options = {
    weekday: "long",
  };

  return (day = today.toLocaleDateString("en-US", options));
};
