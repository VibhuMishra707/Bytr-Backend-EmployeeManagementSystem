const { DataTypes, sequelize } = require("../lib/");
const { employees } = require("./employees.model");
const { departments } = require("./departments.model");

let employeeDepartment = sequelize.define("employeeDepartment", {
    employeeId: {
        type: DataTypes.INTEGER,
        reference: {
            model: employees,
            key: "id",
        },
    },
    departmentId: {
        type: DataTypes.INTEGER,
        reference: {
            model: departments,
            key: "id"
        },
    },
});


employees.belongsToMany(departments, {through: employeeDepartment});
departments.belongsToMany(employees, {through: employeeDepartment});

modules.exports = {employeeDepartment};
