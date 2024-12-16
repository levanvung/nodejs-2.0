require("dotenv").config();
const express = require("express");

const app = express();
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const compression = require("compression");

//init middlewares
//morgan dùng để in ra log có 5 loại ( dev, compile, commin, short, tiny)
app.use(morgan("dev"));
// dùng để bảo vệ thông tin riêng tư chặn bên thứ 3 truy cập cookie
app.use(helmet());

// tối ưu đc băng thông của payload
app.use(compression());
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// init db
require("./dbs/init.mongdb");
// const { checkOverload } = require('./helpers/check.connect')
// checkOverload()
// const { countConnect } = require('./helpers/check.connect')
// countConnect()
// inint router
app.use("/", require("./routes"));

//handle error
app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

app.use((error ,req, res, next) => {
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
        status: "error",
        code: statusCode,
        message: error.message || "Internal Server Error",
    });
});
module.exports = app;
