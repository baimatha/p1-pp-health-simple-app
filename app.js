const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const path = require("path");
const routes = require("./routes");
const {
  flashMiddleware
} = require("./middlewares/flash");
const {
  errorHandler
} = require("./middlewares/errorHandler");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layouts/main");

app.use(express.urlencoded({
  extended: true
}));
app.use(express.static(path.join(__dirname, "public")));
app.use(expressLayouts);

app.use(
  session({
    secret: "secretKeyMedicalSystem",
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req, res, next) => {
  res.locals.title = res.locals.title || "Medical System";
  res.locals.session = req.session;
  next();
});


app.use(flashMiddleware);
app.use(routes);
app.use(errorHandler);

app.listen(port, () =>
  console.log(`http://localhost:${port}`)
);