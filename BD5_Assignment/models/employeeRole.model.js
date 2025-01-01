const { DataTypes, sequelize } = require("../lib/");
const { employee } = require("./employee.model");
const { role } = require("./role.model");

let employeeRole = sequelize.define("employeeRole", {
    employeeId: {
        type: DataTypes.INTEGER,
        reference: {
            model: employee,
            key: "id",
        },
    },
    roleId: {
        type: DataTypes.INTEGER,
        reference: {
            model: role,
            key: "id",
        },

    },
});

employee.belongsToMany(role, {through: employeeRole});
role.belongsToMany(employee, {through: employeeRole});

module.exports = {employeeRole};
