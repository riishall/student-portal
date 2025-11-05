const API_BASE = '/api';
let students = [];
let editingStudentId = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadStudents();
    setupEventListeners();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
        window.location.href = '/login';
        return;
    }
    
    // Update welcome message
    const userWelcome = document.getElementById('userWelcome');
    if (userWelcome && user.full_name) {
        userWelcome.textContent = `Welcome, ${user.full_name}`;
    }
}

function setupEventListeners() {
    const studentForm = document.getElementById('studentForm');
    if (studentForm) {
        studentForm.addEventListener('submit', handleStudentSubmit);
    }
}

async function loadStudents() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/students`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.status === 401) {
            logout();
            return;
        }

        // Check if response is OK before parsing JSON
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            students = result.data;
            renderStudents();
            updateStats();
        } else {
            showNotification('Error loading students', 'error');
        }
    } catch (error) {
        console.error('Error loading students:', error);
        showNotification('Network error loading students: ' + error.message, 'error');
    }
}

function renderStudents() {
    const tbody = document.getElementById('studentsTableBody');
    
    if (students.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: #666;">
                    No students found. Click "Add New Student" to get started.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = students.map(student => `
        <tr>
            <td>${student.rollNumber}</td>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.course}</td>
            <td>${student.semester}</td>
            <td>
                <span class="attendance-${getAttendanceClass(student.attendance)}">
                    ${student.attendance}%
                </span>
            </td>
            <td>${student.marks}%</td>
            <td>
                <span class="grade-${student.grade}">
                    ${student.grade}
                </span>
            </td>
            <td class="actions">
                <button onclick="editStudent('${student._id}')" class="btn-action btn-edit">Edit</button>
                <button onclick="deleteStudent('${student._id}')" class="btn-action btn-delete">Delete</button>
            </td>
        </tr>
    `).join('');
}

function getAttendanceClass(attendance) {
    if (attendance >= 75) return 'high';
    if (attendance >= 50) return 'medium';
    return 'low';
}

function updateStats() {
    const totalStudents = students.length;
    const avgAttendance = totalStudents > 0 
        ? (students.reduce((sum, student) => sum + student.attendance, 0) / totalStudents).toFixed(1)
        : 0;
    const avgMarks = totalStudents > 0
        ? (students.reduce((sum, student) => sum + student.marks, 0) / totalStudents).toFixed(1)
        : 0;
    
    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('avgAttendance').textContent = `${avgAttendance}%`;
    document.getElementById('avgMarks').textContent = `${avgMarks}%`;
}

function openModal(studentId = null) {
    const modal = document.getElementById('studentModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('studentForm');
    
    if (studentId) {
        modalTitle.textContent = 'Edit Student';
        editingStudentId = studentId;
        fillFormWithStudentData(studentId);
    } else {
        modalTitle.textContent = 'Add Student';
        editingStudentId = null;
        form.reset();
    }
    
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('studentModal');
    modal.style.display = 'none';
    editingStudentId = null;
    document.getElementById('studentForm').reset();
}

function fillFormWithStudentData(studentId) {
    const student = students.find(s => s._id === studentId);
    if (student) {
        document.getElementById('studentId').value = student._id;
        document.getElementById('name').value = student.name;
        document.getElementById('email').value = student.email;
        document.getElementById('rollNumber').value = student.rollNumber;
        document.getElementById('course').value = student.course;
        document.getElementById('semester').value = student.semester;
        document.getElementById('attendance').value = student.attendance;
        document.getElementById('marks').value = student.marks;
    }
}

async function handleStudentSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const studentData = {
        name: formData.get('name'),
        email: formData.get('email'),
        rollNumber: formData.get('rollNumber'),
        course: formData.get('course'),
        semester: parseInt(formData.get('semester')),
        attendance: parseFloat(formData.get('attendance') || 0),
        marks: parseFloat(formData.get('marks') || 0)
    };
    
    try {
        const token = localStorage.getItem('token');
        const url = editingStudentId 
            ? `${API_BASE}/students/${editingStudentId}`
            : `${API_BASE}/students`;
        
        const method = editingStudentId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        });

        // Check if response is OK before parsing JSON
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(
                editingStudentId ? 'Student updated successfully' : 'Student added successfully',
                'success'
            );
            closeModal();
            loadStudents();
        } else {
            showNotification(result.message || 'Operation failed', 'error');
        }
    } catch (error) {
        console.error('Error saving student:', error);
        showNotification('Network error saving student: ' + error.message, 'error');
    }
}

function editStudent(studentId) {
    openModal(studentId);
}

async function deleteStudent(studentId) {
    if (!confirm('Are you sure you want to delete this student?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/students/${studentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // Check if response is OK before parsing JSON
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Student deleted successfully', 'success');
            loadStudents();
        } else {
            showNotification(result.message || 'Delete failed', 'error');
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        showNotification('Network error deleting student: ' + error.message, 'error');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
        notification.style.background = '#27ae60';
    } else if (type === 'error') {
        notification.style.background = '#e74c3c';
    } else {
        notification.style.background = '#3498db';
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS for notifications only if not already added
if (!document.querySelector('style[data-notifications]')) {
    const style = document.createElement('style');
    style.setAttribute('data-notifications', 'true');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('studentModal');
    if (event.target === modal) {
        closeModal();
    }
};