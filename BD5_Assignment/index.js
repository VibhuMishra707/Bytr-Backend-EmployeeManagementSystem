const port = 3000;

const express = require("express");
const cors = require("cors");

const { sequelize } = require("./lib/index");
const { Op } = require("@sequelize/core")

const app = express();
app.use(cors())

const { employee } = require("./models/employee.model");
const { department } = require("./models/department.model");
const { role }  = require("./models/role.model");
const { employeeDepartment } = require("./models/employeeDepartment.model");
const { employeeRole } = require("./models/employeeRole.model");

// ---------------------------------------------------------- //
//          Chapter 5: Employee Management System             //
// ---------------------------------------------------------- //

// -*****--*****--*****--*****- SEED DATA -*****--*****--*****--*****-
// Endpoint to seed database
app.get('/seed_db', async (req, res) => {
    await sequelize.sync({ force: true });
  
    const departments = await department.bulkCreate([
      { name: 'Engineering' },
      { name: 'Marketing' },
    ]);
  
    const roles = await role.bulkCreate([
      { title: 'Software Engineer' },
      { title: 'Marketing Specialist' },
      { title: 'Product Manager' },
    ]);
  
    const employees = await employee.bulkCreate([
      { name: 'Rahul Sharma', email: 'rahul.sharma@example.com' },
      { name: 'Priya Singh', email: 'priya.singh@example.com' },
      { name: 'Ankit Verma', email: 'ankit.verma@example.com' },
    ]);
  
// Associate employees with departments and roles using create method on junction models
    await employeeDepartment.create({
      employeeId: employees[0].id,
      departmentId: departments[0].id,
    });
    await employeeRole.create({
      employeeId: employees[0].id,
      roleId: roles[0].id,
    });
  
    await employeeDepartment.create({
      employeeId: employees[1].id,
      departmentId: departments[1].id,
    });
    await employeeRole.create({
      employeeId: employees[1].id,
      roleId: roles[1].id,
    });
  
    await employeeDepartment.create({
      employeeId: employees[2].id,
      departmentId: departments[0].id,
    });
    await employeeRole.create({
      employeeId: employees[2].id,
      roleId: roles[2].id,
    });
    
    return res.json({ message: 'Database seeded!' });
  });

// Helper function to get employee's associated departments
async function getEmployeeDepartments(employeeId) {
    const employeeDepartments = await employeeDepartment.findAll({
      where: { employeeId },
    });
  
    let departmentData;
    for (let empDep of employeeDepartments) {
      departmentData = await department.findOne({
        where: { id: empDep.departmentId },
      });
    }
  
    return departmentData;
  }
  
// Helper function to get employee details with associated departments and roles
  async function getEmployeeDetails(employeeData) {
    const department = await getEmployeeDepartments(employeeData.id);
    const role = await getEmployeeRoles(employeeData.id);
    
    return {
      ...employeeData.dataValues,
      department,
      role,
    };
  }

//  |-----||-----||-----||-----||-----||-----||-----||-----||-----||-----|


// Application Listening
app.listen(port, () => {
    console.log(`App is listening at http://localhost:${port}`);
});