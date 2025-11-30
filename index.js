require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Authentication removed: middleware import omitted for public routes

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Swagger Documentation Setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Fitness Tracker API',
      version: '1.0.0',
      description: 'A simple API for tracking workouts and progress.',
      contact: {
        name: 'Your Name',
        email: 'youremail@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./index.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Middleware Setup
app.use(helmet()); // Adds security headers
app.use(cors()); // Enables CORS
app.use(express.json()); // Parses incoming JSON requests
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs)); // Swagger UI

// Database Connection (MongoDB using Mongoose)
const mongooseConnect = require('./config/db'); // In a separate file for better practice
mongooseConnect();

// Routes
const workoutRoutes = require('./routes/workoutRoutes');
const progressRoutes = require('./routes/progressRoutes');
const userRoutes = require('./routes/userRoutes');


// Use routes (authentication removed)
app.use('/api/v1/workout', workoutRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/user', userRoutes);

// Root Route for '/'
app.get('/', (req, res) => {
  res.send('Welcome to the Fitness Tracker API! Visit /api/v1 for available routes.');
});

// Root Route for /api/v1
app.get('/api/v1', (req, res) => {
  res.json({
    message: '💪 Fitness Tracker API v1 is running!',
    routes: {
      workout: '/api/v1/workout',
      progress: '/api/v1/progress',
      user: '/api/v1/user',
    },
  });
});

// ========================
// WORKOUT ROUTES
// ========================
/**
 * @swagger
 * /api/v1/workout:
 *   get:
 *     summary: Get all workouts
 *     description: Fetch a list of all workouts from the database
 *     responses:
 *       200:
 *         description: List of workouts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   type:
 *                     type: string
 *                   duration:
 *                     type: integer
 *                   caloriesBurned:
 *                     type: integer
 *                   date:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Error fetching workouts
 */
app.get('/api/v1/workout', async (req, res) => {
  try {
    const workouts = await Workout.find().sort({ createdAt: -1 });
    res.status(200).json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/workout:
 *   post:
 *     summary: Add a new workout
 *     description: Add a new workout to the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               duration:
 *                 type: integer
 *               caloriesBurned:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Workout added successfully
 *       400:
 *         description: Invalid input
 */
app.post('/api/v1/workout', async (req, res) => {
  try {
    const newWorkout = new Workout(req.body);
    await newWorkout.save();
    res.status(201).json({ message: 'Workout added successfully!', workout: newWorkout });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/workout/{id}:
 *   put:
 *     summary: Update an existing workout
 *     description: Update the details of an existing workout by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The workout ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               duration:
 *                 type: integer
 *               caloriesBurned:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Workout updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Workout not found
 */
app.put('/api/v1/workout/:id', async (req, res) => {
  try {
    const updated = await Workout.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Workout not found' });
    res.status(200).json({ message: 'Workout updated successfully!', workout: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/workout/{id}:
 *   patch:
 *     summary: Partially update a workout
 *     description: Partially update specific fields of an existing workout by its ID (e.g., update calories burned)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The workout ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               caloriesBurned:
 *                 type: integer
 *               duration:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Workout partially updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Workout not found
 */
app.patch('/api/v1/workout/:id', async (req, res) => {
  try {
    // Find the workout by ID and apply partial updates
    const updatedWorkout = await Workout.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedWorkout) return res.status(404).json({ message: 'Workout not found' });
    res.status(200).json({ message: 'Workout partially updated successfully!', workout: updatedWorkout });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


/**
 * @swagger
 * /api/v1/workout/{id}:
 *   delete:
 *     summary: Delete a workout
 *     description: Delete an existing workout by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The workout ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workout deleted successfully
 *       404:
 *         description: Workout not found
 *       400:
 *         description: Invalid workout ID
 */
app.delete('/api/v1/workout/:id', async (req, res) => {
  try {
    const deleted = await Workout.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Workout not found' });
    res.status(200).json({ message: 'Workout deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid workout ID' });
  }
});

// ========================
// PROGRESS ROUTES
// ========================
/**
 * @swagger
 * /api/v1/progress:
 *   get:
 *     summary: Get all progress records
 *     description: Fetch a list of all progress records from the database
 *     responses:
 *       200:
 *         description: List of progress records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                   weight:
 *                     type: number
 *                   bodyFat:
 *                     type: number
 *                   muscleMass:
 *                     type: number
 *                   recordedAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Error fetching progress records
 */
app.get('/api/v1/progress', async (req, res) => {
  try {
    const progress = await Progress.find().sort({ createdAt: -1 });
    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================
// USER ROUTES
// ========================
/**
 * @swagger
 * /api/v1/user:
 *   get:
 *     summary: Get all users
 *     description: Fetch a list of all users from the database
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   age:
 *                     type: integer
 *                   gender:
 *                     type: string
 *                   email:
 *                     type: string
 *       500:
 *         description: Error fetching users
 */
app.get('/api/v1/user', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Error Handling Middleware (for unhandled routes and errors)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Graceful Shutdown
process.on('SIGINT', () => {
  console.log('SIGINT received. Closing server...');
  mongoose.disconnect().then(() => {
    console.log('Disconnected from MongoDB');
    process.exit(0);
  });
});

// This is to start your server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
