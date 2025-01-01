const { DataTypes, sequelize } = require("../lib/");
const { employee } = require("./employee.model");
const { department } = require("./department.model");

let employeeDepartment = sequelize.define("employeeDepartment", {
    employeeId: {
        type: DataTypes.INTEGER,
        reference: {
            model: employee,
            key: "id",
        },
    },
    departmentId: {
        type: DataTypes.INTEGER,
        reference: {
            model: department,
            key: "id"
        },
    },
});


employee.belongsToMany(department, {through: employeeDepartment});
department.belongsToMany(employee, {through: employeeDepartment});

module.exports = {employeeDepartment};
