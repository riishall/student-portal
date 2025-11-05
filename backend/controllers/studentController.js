const Student = require('../models/Student');

exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            data: students
        });
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching students'
        });
    }
};

exports.getStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        res.json({
            success: true,
            data: student
        });
    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student'
        });
    }
};

exports.createStudent = async (req, res) => {
    try {
        const { name, email, rollNumber, course, semester, attendance, marks } = req.body;

        // Check if student already exists
        const existingStudent = await Student.findOne({
            $or: [{ email }, { rollNumber }]
        });

        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message: 'Student with this email or roll number already exists'
            });
        }

        const student = new Student({
            name,
            email,
            rollNumber,
            course,
            semester,
            attendance: attendance || 0,
            marks: marks || 0
        });

        await student.save();

        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: student
        });
    } catch (error) {
        console.error('Create student error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating student'
        });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const { name, email, rollNumber, course, semester, attendance, marks } = req.body;

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            {
                name,
                email,
                rollNumber,
                course,
                semester,
                attendance,
                marks
            },
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            message: 'Student updated successfully',
            data: student
        });
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating student'
        });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            message: 'Student deleted successfully'
        });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting student'
        });
    }
};