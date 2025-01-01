const port = 3000;

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors())

// ---------------------------------------------------------- //
//          Chapter 5: Employee Management System             //
// ---------------------------------------------------------- //


app.listen(port, () => {
    console.log(`App is listening at http://localhost:${port}`);
});