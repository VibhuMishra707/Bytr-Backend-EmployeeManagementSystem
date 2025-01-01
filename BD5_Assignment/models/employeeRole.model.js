const { DataTypes, sequelize } = require("../lib/");
const { employees } = require("./employees.model");
const { roles } = require("./roles.model");

let employeeRole = sequelize.define("employeeRole", {
    employeeId: {
        type: DataTypes.INTEGER,
        reference: {
            model: employees,
            key: "id",
        },
    },
    roleId: {
        type: DataTypes.INTEGER,
        reference: {
            model: roles,
            key: "id",
        },

    },
});

employees.belongsToMany(roles, {through: employeeRole});
roles.belongsToMany(employees, {through: employeeRole});

modules.exports = {employeeRole};
