let { DataTypes, sequelize } = require("../lib/");

let roles = sequelize.define("roles", {
    title: {
        type: DataTypes.STRING,
        unique: true,
    }
});

modules.export = {roles};