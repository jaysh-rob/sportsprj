const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

// MySQL Connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'nodeuser',
  password: 'Jay@4321',
  database: 'sports_db'
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);

});

// Middleware
app.use(bodyParser.json());

// Swagger Options
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Sports API',
      description: 'API to manage sports data',
      version: '1.0.0'
    },
  },
  apis: ['./index.js'], // Assuming this file is named index.js
};

// Initialize Swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * tags:
 *   name: Sports
 *   description: API endpoints for managing sports data
 */

/**
 * @swagger
 * /sports:
 *   get:
 *     summary: Get all sports data
 *     description: Retrieve all sports data from the database
 *     tags: [Sports]
 *     responses:
 *       200:
 *         description: Successful response
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /sports/{sport}:
 *   get:
 *     summary: Get data for a specific sport
 *     description: Retrieve data for a specific sport from the database
 *     tags: [Sports]
 *     parameters:
 *       - in: path
 *         name: sport
 *         required: true
 *         description: The name of the sport
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Sport not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update sport data
 *     description: Update data for a specific sport in the database
 *     tags: [Sports]
 *     parameters:
 *       - in: path
 *         name: sport
 *         required: true
 *         description: The name of the sport
 *         schema:
 *           type: string
 *       - in: body
 *         name: sportData
 *         description: The sport data to update
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             recommended_foods:
 *               type: array
 *               items:
 *                 type: string
 *             avoid_foods:
 *               type: array
 *               items:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Sport not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete sport data
 *     description: Delete data for a specific sport from the database
 *     tags: [Sports]
 *     parameters:
 *       - in: path
 *         name: sport
 *         required: true
 *         description: The name of the sport
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Sport not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /sports:
 *   post:
 *     summary: Create new sport data
 *     description: Create new sport data and add it to the database
 *     tags: [Sports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sport:
 *                 type: string
 *               recommended_foods:
 *                 type: array
 *                 items:
 *                   type: string
 *               avoid_foods:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Successful response
 *       500:
 *         description: Internal server error
 */


// Routes

// Get all sports data
app.get('/sports', (req, res) => {
  connection.query('SELECT * FROM sports', (error, results, fields) => {
    if (error) {
      console.error('Error retrieving sports data: ' + error.message);
      res.status(500).send('Error retrieving sports data');
      return;
    }
    // Parse JSON strings into proper JSON arrays
    results.forEach(result => {
      result.recommended_foods = JSON.parse(result.recommended_foods);
      result.avoid_foods = JSON.parse(result.avoid_foods);
    });

    res.json(results);
  });
});

// Get data for a specific sport
app.get('/sports/:sport', (req, res) => {
  const sport = req.params.sport;
  connection.query('SELECT * FROM sports WHERE sport = ?', [sport], (error, results, fields) => {
    if (error) {
      console.error('Error retrieving sport data: ' + error.message);
      res.status(500).send('Error retrieving sport data');
      return;
    }
    if (results.length === 0) {
      res.status(404).send({success:false,message:'Sport not found'});
    } else {
      // Parse JSON strings into proper JSON arrays
      results.forEach(result => {
        result.recommended_foods = JSON.parse(result.recommended_foods);
        result.avoid_foods = JSON.parse(result.avoid_foods);
      });
      res.json(results[0]);
    }
  });
});

// Create new sport data
app.post('/sports', (req, res) => {
  const { sport, recommended_foods, avoid_foods } = req.body;
  connection.query('INSERT INTO sports (sport, recommended_foods, avoid_foods) VALUES (?, ?, ?)', [sport, JSON.stringify(recommended_foods), JSON.stringify(avoid_foods)], (error, results, fields) => {
    if (error) {
      // console.error('Error creating sport data: ' + error?.sqlMessage);
      res.status(500).send({ success: false, message: error?.sqlMessage });
      return;
    }
    res.send({ success: true, message: 'Sport data created successfully' });
  });
});

// Update sport data
app.put('/sports/:sport', (req, res) => {
  const sport = req.params.sport;
  const { recommended_foods, avoid_foods } = req.body;
  connection.query('UPDATE sports SET recommended_foods = ?, avoid_foods = ? WHERE sport = ?', [JSON.stringify(recommended_foods), JSON.stringify(avoid_foods), sport], (error, results, fields) => {
    if (error) {
      console.error('Error updating sport data: ' + error.message);
      res.status(500).send('Error updating sport data');
      return;
    }
    if (results.affectedRows === 0) {
      res.status(404).send({success:false,message:'Sport not found'});
    } else {
      res.send({success:true,message:'Sport data updated successfully'});
    }
  });
});

// Delete sport data
app.delete('/sports/:sport', (req, res) => {
  const sport = req.params.sport;
  connection.query('DELETE FROM sports WHERE sport = ?', [sport], (error, results, fields) => {
    if (error) {
      console.error('Error deleting sport data: ' + error.message);
      res.status(500).send('Error deleting sport data');
      return;
    }
    if (results.affectedRows === 0) {
      res.status(404).send({success:false,message:'Sport not found'});
    } else {
      res.send({success:true,message:'Sport data deleted successfully'});
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
