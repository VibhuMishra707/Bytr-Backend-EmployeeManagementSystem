let { DataTypes, sequelize } = require("../lib/");

let employees = sequelize.define("employees", {
    name: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
    }
});

module.exports = {employees};