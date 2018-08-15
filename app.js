const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const bodyParser = require("body-parser");

const indexRouter = require("./routes/index");
const signupRouter = require("./routes/signup");
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");

let app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    key: "session-key",
    resave: false,
    saveUninitialized:true,
    secret: "secret-key",
    cookie: {maxAge: 1000*60*10}
}));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

app.use("/", indexRouter);
app.use("/signup", signupRouter);
app.use("/auth", authRouter);
app.use("/admin", adminRouter);

app.use((req, res, next) => {
    next(createError(404));
});

app.use((err, req, res) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
