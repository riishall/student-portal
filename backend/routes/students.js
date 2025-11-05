const express = require('express');
const { body } = require('express-validator');
const {
    getAllStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent
} = require('../controllers/studentController');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation rules
const studentValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('rollNumber').notEmpty().withMessage('Roll number is required'),
    body('course').notEmpty().withMessage('Course is required'),
    body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
    body('attendance').optional().isFloat({ min: 0, max: 100 }).withMessage('Attendance must be between 0 and 100'),
    body('marks').optional().isFloat({ min: 0, max: 100 }).withMessage('Marks must be between 0 and 100')
];

// All routes are protected
router.use(auth);

router.get('/', getAllStudents);
router.get('/:id', getStudent);
router.post('/', studentValidation, createStudent);
router.put('/:id', studentValidation, updateStudent);
router.delete('/:id', deleteStudent);

module.exports = router;