let { DataTypes, sequelize } = require('../lib/');

let departments = sequelize.define("departments", {
    name: {
        type: DataTypes.STRING,
        unique: true,
    }
});

module.exports = {departments};