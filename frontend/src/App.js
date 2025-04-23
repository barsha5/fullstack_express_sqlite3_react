import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://ec2-3-148-113-251.us-east-2.compute.amazonaws.com:4000/api/students';

function App() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    major: '',
    cgpa: ''
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch all students
  const fetchStudents = async () => {
    try {
      const response = await axios.get(API_URL);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cgpa' ? parseFloat(value) || 0 : value
    }));
  };

  // Create or Update student
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      setFormData({ name: '', email: '', major: '', cgpa: '' });
      setEditingId(null);
      fetchStudents();
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };

  // Edit student
  const handleEdit = (student) => {
    setFormData({
      name: student.name,
      email: student.email,
      major: student.major,
      cgpa: student.cgpa
    });
    setEditingId(student.id);
  };

  // Delete student
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  return (
      <div className="container">
        <h1>Student Management</h1>

        {/* Student Form */}
        <div className="form-container">
          <h2>{editingId ? 'Edit Student' : 'Add New Student'}</h2>
          <form onSubmit={handleSubmit}>
            <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
            />
            <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="major"
                placeholder="Major"
                value={formData.major}
                onChange={handleChange}
                required
            />
            <input
                type="number"
                name="cgpa"
                placeholder="CGPA"
                min="0"
                max="4"
                step="0.1"
                value={formData.cgpa}
                onChange={handleChange}
                required
            />
            <button type="submit">
              {editingId ? 'Update' : 'Add'} Student
            </button>
            {editingId && (
                <button type="button" onClick={() => {
                  setFormData({ name: '', email: '', major: '', cgpa: '' });
                  setEditingId(null);
                }}>
                  Cancel
                </button>
            )}
          </form>
        </div>

        {/* Students Table */}
        <div className="table-container">
          <h2>Student List</h2>
          <table>
            <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Major</th>
              <th>CGPA</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {students.map(student => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.major}</td>
                  <td>{student.cgpa}</td>
                  <td>
                    <button onClick={() => handleEdit(student)}>Edit</button>
                    <button onClick={() => handleDelete(student.id)}>Delete</button>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
  );
}

export default App;