// const moment = require('moment');
const uuidv4 = require('uuid/v4');
const db = require('../db/index');
const helper = require('./helper');

const Employee = {
  async create(req, res) {
    if (!req.body.email || !req.body.password) {
      return res.status(400).send({
        status: "error",
        error: 'Some values are missing',
      });
    }
    if (!helper.isValidEmail(req.body.email)) {
      return res.status(400).send({
        status: "error",
        error: 'Please enter a valid email address',
      });
    }
    const hashPassword = helper.hashPassword(req.body.password);

    const createQuery = `INSERT INTO 
            "public"."tw_employees"(
                id, first_name, last_name, email, password, gender, job_role, department, address
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning *`;
    // const userId = uuidv4();
    // req.body.id = userId;
    const values = [
      uuidv4(),
      req.body.first_name,
      req.body.last_name,
      req.body.email,
      hashPassword,
      req.body.gender,
      req.body.job_role,
      req.body.department,
      req.body.address,
    ];

    try {
      const { rows } = await db.query(createQuery, values);
      const token = helper.generateToken(rows[0].id);
      return res.status(201).send({
        status: 'success',
        data: {
          message: 'User account created successfully',
          token,
          userId: rows[0].id,
        },
      });
    } catch (error) {
      if (error.routine === '_bt_check_unique') {
        return res.status(400).send({
          status: 'error',
          error: 'Email already exists',
        });
      }
      return res.status(400).send({
        status: 'error',
        error,
      });
    }
  },

  async login(req, res) {
    if (!req.body.email || !req.body.password) {
      return res.status(400).send({
        status: "error",
        error: 'Some values are missing',
      });
    }
    if (!helper.isValidEmail(req.body.email)) {
      return res.status(400).send({
        status: "error",
        error: 'Please enter a valid email address',
      });
    }
    const loginQuery = 'SELECT * FROM "public"."tw_employees" WHERE email = $1';
    try {
      const { rows } = await db.query(loginQuery, [req.body.email]);
      if (!rows[0]) {
        return res.status(400).send({
          status: "error",
          error: 'Username does not exist',
        });
      }
      if (!helper.comparePassword(rows[0].password, req.body.password)) {
        return res.status(400).send({
          status: "error",
          error: 'Incorrect password',
        });
      }
      const token = helper.generateToken(rows[0].id);
      return res.status(200).send({
        status: 'success',
        data: {
          token,
          userId: rows[0].id,
        },
      });
    } catch (error) {
      return res.status(400).send({
        status: "error",
        error
      });
    }
  },

  async deleteAll(req, res) {
    // const deleteQuery = 'DELETE FROM "public"."tw_employees" WHERE id=$1 returning *';
    const deleteAllQuery = 'DELETE FROM "public"."tw_employees" returning *';
    try {
      const { rows } = await db.query(deleteAllQuery);
      if (!rows[0]) {
        return res.status(404).send({
          message: 'user not found',
        });
      }
      return res.status(204).send({ message: 'user deleted' });
    } catch (error) {
      return error;
    }
  },
};

module.exports = Employee;
