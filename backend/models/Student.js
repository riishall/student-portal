const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Student name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    rollNumber: {
        type: String,
        required: [true, 'Roll number is required'],
        unique: true,
        trim: true
    },
    course: {
        type: String,
        required: [true, 'Course is required'],
        trim: true
    },
    semester: {
        type: Number,
        required: [true, 'Semester is required'],
        min: 1,
        max: 8
    },
    attendance: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    marks: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    grade: {
        type: String,
        default: 'N/A'
    }
}, {
    timestamps: true
});

// Calculate grade based on marks
studentSchema.pre('save', function(next) {
    if (this.marks >= 90) this.grade = 'A+';
    else if (this.marks >= 80) this.grade = 'A';
    else if (this.marks >= 70) this.grade = 'B';
    else if (this.marks >= 60) this.grade = 'C';
    else if (this.marks >= 50) this.grade = 'D';
    else if (this.marks > 0) this.grade = 'F';
    else this.grade = 'N/A';
    
    next();
});

module.exports = mongoose.model('Student', studentSchema);