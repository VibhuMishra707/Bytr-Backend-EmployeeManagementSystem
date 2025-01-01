let { DataTypes, sequelize } = require("../lib");

let employee = sequelize.define("employee", {
    name: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
    }
});

module.exports = {employee};