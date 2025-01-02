const port = 3000;

const express = require("express");
const cors = require("cors");

const { sequelize } = require("./lib/index");
const { Op } = require("@sequelize/core")

const app = express();
app.use(cors());

app.use(express.json());

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

// [-****--****--****- Added By Me -****--****--****-]
async function getEmployeeRoles(employeeId) {
  const employeeRoles = await employeeRole.findAll({where: {employeeId},});
  let roleData;
  for (let empRole of employeeRoles) {
    roleData = await role.findOne({where: {id: empRole.roleId}});
  }
  return roleData;
}
// [-****--****--****--****--****--****--****--****-]
  
// Helper function to get employee details with associated departments and roles
async function getEmployeeDetails(employeeData) {
  const department = await getEmployeeDepartments(employeeData.id);
  const role = await getEmployeeRoles(employeeData.id);
  
  return {
    ...employeeData.dataValues,   // The spread operator (...) extracts all key-value pairs from dataValues and includes them in the returned object. 
    department,
    role,
  };
  }

//  |-----||-----||-----||-----||-----||-----||-----||-----||-----||-----|

// Endpoint - 1 (Get All Employees)
async function fetchAllEmployees() {
  let response = await employee.findAll();
  let employeeWithDetails = [];
  for (let employeeData of response) {
    let detailedEmployee = await getEmployeeDetails(employeeData);
    employeeWithDetails.push(detailedEmployee)
  }
  return {employees: employeeWithDetails};
}

app.get('/employees', async (req, res) => {
  try {
    let result = await fetchAllEmployees();
    if (result.employees.length === 0) {
      return res.status(404).json({message: 'No Employee Found!'});
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({error: error.message});
  }
});

// Endpoint - 2 (Get Employee by ID)
async function fetchDetailedEmployeesByID(employeeID) {
  let response = await employee.findOne({where: {id: employeeID}});
  if (!response) {
    return null;
  }
  let detailedEmployee = await getEmployeeDetails(response);
  return {employee: detailedEmployee};
}

app.get('/employees/details/:id', async (req, res) => {
 try {
  let id = req.params.id;
  if (isNaN(id)) {
    return res.status(400).json({message: "Employee ID is not a Number!"});
  }
  if (id < 0) {
    return res.status(400).json({message: "Only, Employee ID which is greater than or equal to 0 is valid."});
  }
  let result = await fetchDetailedEmployeesByID(id);
  if (result === null) {
    return res.status(404).json({message: "Employee Not Found!"})
  }
  return res.status(200).json(result);
 } catch (error) {
  return res.status(500).json({error: error.message});
 }
});

// Endpoint  - 3 (Get Employees by Department)
async function fetchEmployeesByDepartment(departmentID) {
  let reqEmployeeIDs = await employeeDepartment.findAll({where: {departmentId: departmentID}, attributes: ['employeeId']});
  // console.log(reqEmployeeIDs);
/*    ---- Output ----
  [
  employeeDepartment {
    dataValues: { employeeId: 1 },
    _previousDataValues: { employeeId: 1 },
    uniqno: 1,
    _changed: Set(0) {},
    _options: {
      isNewRecord: false,
      _schema: null,
      _schemaDelimiter: '',
      raw: true,
      attributes: [Array]
    },
    isNewRecord: false
  },
  employeeDepartment {
    dataValues: { employeeId: 3 },
    _previousDataValues: { employeeId: 3 },
    uniqno: 1,
    _changed: Set(0) {},
    _options: {
      isNewRecord: false,
      _schema: null,
      _schemaDelimiter: '',
      raw: true,
      attributes: [Array]
    },
    isNewRecord: false
  }
]
*/

  if (reqEmployeeIDs.length === 0) {
    return null;
  }

  let employeeWithDetails = [];
  for (let reqEmpID of reqEmployeeIDs) {
    let detailedEmployee = await fetchDetailedEmployeeByID(reqEmpID.employeeId);
    employeeWithDetails.push(detailedEmployee);
  }
  return {employees: employeeWithDetails}

}

app.get('/employees/department/:id', async (req, res) => {
  try {
    let id = req.params.id;
    if (isNaN(id)) {
      return res.status(400).json({message: "Department ID is not a Number!"});
    }
    if (id < 0) {
      return res.status(400).json({message: "Only, Department ID which is greater than or equal to 0 is valid."});
    }
    let result = await fetchEmployeesByDepartment(id);
    if (result === null) {
      return res.status(404).json({message: "No Department Found!"});
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({error: error.message});
  }
});

// Endpoint - 4 (Get All Employees by Role)
async function fetchAllEmployeesByRole(roleID) {
  let reqEmployeeIDs = await employeeRole.findAll({where: {roleId: roleID}, attributes: ['employeeId']});
  if (reqEmployeeIDs.length === 0) {
    return null;
  }
  let employeeWithDetails = [];
  for (let reqEmpID of reqEmployeeIDs) {
    let detailedEmployee = await fetchDetailedEmployeeByID(reqEmpID.employeeId);
    employeeWithDetails.push(detailedEmployee); 
  }
  return {employees: employeeWithDetails};
}

app.get('/employees/role/:roleId', async (req, res) => {
  try {
    let roleId = req.params.roleId;
    if (isNaN(roleId)) {
      return res.status(400).json({message: "Role ID is not a number!"});
    }
    if (roleId < 0) {
      return res.status(400).json({message: "Only, Role ID which is greater than or equal to 0 is valid."});
    }
    let result = await fetchAllEmployeesByRole(roleId);
    if (result === null) {
      return res.status(404).json({message: "No Role Found!"});
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({error: error.message});
  }
});

// Endpoint - 5.1 (Get Employees Sorted by Name)
async function fetchAllEmployeesSorted(order) {
  let response = await employee.findAll({order: [['name', order]]});
  let employeeWithDetails = [];
  for (let employeeData of response) {
    let detailedEmployee = await getEmployeeDetails(employeeData);
    employeeWithDetails.push(detailedEmployee);
  }
  return {employees: employeeWithDetails};
}

app.get('/employees/sort-by-name', async (req, res) => {
  try {
    let order = req.query.order;
    if (!['ASC', 'DESC'].includes(order)) {
      return res.status(400).json({message: "Invalid 'order' parameter. Use 'ASC' or 'DESC'"})
    }
    let result = await fetchAllEmployeesSorted(order);
    if (result.employees.length === 0) {
      return res.status(404).json({message: "No Employee Found!"});
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({error: error.message});
  }
})

// Endpoint - 5.2  (Add a New Employee)
async function addNewEmployee(newEmployeeData) {
  let isDepartmentExist = await department.findOne({where: {id: updatedEmployeeData.departmentId}});
  let isRoleExist = await role.findOne({where: {id: updatedEmployeeData.roleId}});

  if (isDepartmentExist !== null || isRoleExist !== null) {
    let newEmployeeRecord = await employee.create({name: newEmployeeData.name, email: newEmployeeData.email});
    await employeeDepartment.create({employeeId: newEmployeeRecord.id, departmentId: newEmployeeData.departmentId});
    await employeeRole.create({employeeId: newEmployeeRecord.id, roleId: newEmployeeData.roleId});
    
    let getNewEmployeeDetails = await getEmployeeDetails(newEmployeeRecord);
    return {newEmployee: getNewEmployeeDetails};
  }
  return null;
}

app.post('/employees/new', async (req, res) => {
  try {
    let newEmployeeData = req.body;
    if (!newEmployeeData.name || !newEmployeeData.email || 
      !newEmployeeData.departmentId || !newEmployeeData.roleId ) {
        return res.status(400).json({message: "Invalid employee data, please provide all required fields."});
      }
      let result = await addNewEmployee(newEmployeeData);
      if (result === null) {
        return res.status(404).json({message: "Either Department or Role does not exist."})
      }
      return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({error: error.message});
  }
});

// Endpoint - 6 (Update Employee Details)
async function updateEmployeeDetail(id, updatedEmployeeData) {
  let isDepartmentExist = await department.findOne({where: {id: updatedEmployeeData.departmentId}});
  let isRoleExist = await role.findOne({where: {id: updatedEmployeeData.roleId}});

  if (isDepartmentExist !== null || isRoleExist !== null) {
    let updateEmployeeRecord = await employee.findOne({where: {id}});
    if (updateEmployeeRecord === null) {
      return -1;
    }
    updateEmployeeRecord.set({name: updatedEmployeeData.name, email: updatedEmployeeData.email});
    await updateEmployeeRecord.save();

    let updateEmployeeDepartmentRecord = await employeeDepartment.findOne({where: {employeeId: updateEmployeeRecord.id}});
    if (updateEmployeeDepartmentRecord.departmentId !== updatedEmployeeData.departmentId) {
      updateEmployeeDepartmentRecord.set({departmentId: updatedEmployeeData.departmentId});
      await updateEmployeeDepartmentRecord.save();
    }

    let updateEmployeeRoleRecord = await employeeRole.findOne({where: {employeeId: updateEmployeeRecord.id}});
    if (updateEmployeeRoleRecord.roleId !== updatedEmployeeData.roleId) {
      updateEmployeeRoleRecord.set({roleId: updatedEmployeeData.roleId});
      await updateEmployeeRoleRecord.save();
    }
  } else {
    return -2;
  }
  let response = await getEmployeeDetails(updateEmployeeRecord);
  return {updatedEmployee: response};
}

app.post('/employees/update/:id', async (req, res) => {
  try {
    let id = parseInt(req.params.id);
    let updatedEmployeeData = req.body;
    if (!updatedEmployeeData.name || !updatedEmployeeData.email ||
      !updatedEmployeeData.departmentId || !updatedEmployeeData.roleId) {
        return res.status(400).json({message: "Invalid employee data, please provide all required fields."});
      }
    let result = await updateEmployeeDetail(id, updatedEmployeeData);
    if (result === -1) {
      return res.status(404).json({message: "Employee not found!"});
    }
    if (result === -2) {
      return res.status(404).json({message: "Either Department or Role does not exist."});
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({error: error.message});
  }
});

// Endpoint - 7 (Delete an Employee)
async function deleteEmployeeByID(deleteEmployee) {
  let deletedEmployee = await employee.destroy({where: {id: deleteEmployee.id}});
  if (deletedEmployee) {
    return {message: `Employee with ID ${employeeID} has been deleted`};
  }
  return null;
}

app.post('/employees/delete', async(req, res) => {
  try {
     let deleteEmployee = req.body;
     parseInt(deleteEmployee.id);
     let result = await deleteEmployeeByID(deleteEmployee);
     if (result === null) {
      return res.status(404).json({message: "Employee not found!"});
     }
     return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({error: error.message});
  }
})

// Application Listening
app.listen(port, () => {
    console.log(`App is listening at http://localhost:${port}`);
});