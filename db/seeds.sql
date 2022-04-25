INSERT INTO department (department_name)
VALUES
  ('Clerk'),
  ('Human Resources'),
  ('IT'),
  ('Marketing'),
  ('Sales');
  
INSERT INTO role (title, salary, department_id)
VALUES
  ('Receptionist', 35000,1)
  ('Recruiter', 20000, 2),
  ('Marketing lead', 30000, 4),
  ('Salesperson', 70000, 5),
  ('Accountant', 60000, 2);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
  ('Tom', 'Riddle', 1, 1),
  ('Harry', 'Potter', 2, 2),
  ('Slim', 'Jenkins', 4, 1),
  ('Suzy', 'Lewis', 5, 4);