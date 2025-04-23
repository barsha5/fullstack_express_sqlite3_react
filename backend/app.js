const express = require('express');
const cors = require('cors');  // Add this line
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Enable CORS for all routes
app.use(cors({ origin: 'http://ec2-3-148-113-251.us-east-2.compute.amazonaws.com:3000' }));

let sql;

// Database setup
const db = new sqlite3.Database('./database.db',(err) => {
  if (err) {
    return console.log(err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Make db available in routes
app.use((req, res, next) => {
  req.db = db;
  next();
});


// sql= 'CREATE TABLE students(id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR, email VARCHAR UNIQUE, major VARCHAR, cgpa FLOAT)';
// db.run(sql);


// sql = 'INSERT INTO students(name,email,major,cgpa) VALUES (?,?,?,?)';
// db.run(sql, ["Mikey","mikey@albany.edu","Computer Science","3.8"],
// (err) => {
//   if (err) {
//     return console.log(err.message);
//   } else {
//     console.log('Inserted values to students');
//   }
// });

// CREATE - Add new student
app.post('/api/students', (req, res) => {
  const { name, email, major, cgpa } = req.body;

  if (!name || !email || !major || cgpa === undefined) {
    return res.status(400).json({
      error: 'Missing required fields. Please provide name, email, major, and cgpa'
    });
  }

  // Field length validation
  if (name && name.length > 30){
    return res.status(400).json({
      error: 'Name must be 30 characters or less.'
    });
  }

  if (email && email.length > 30){
    return res.status(400).json({
      error: 'email must be 30 characters or less.'
    });
  }
  if (major && major.length > 30){
    return res.status(400).json({
      error: 'major must be 30 characters or less.'
    });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Invalid email format (must be user@domain.com.)'
    });
  }

  // 3. Validate CGPA range
  if (cgpa < 0 || cgpa > 4.0) {
    return res.status(400).json({
      error: 'CGPA must be between 0 and 4.0'
    });
  }

  db.run(
      'INSERT INTO students(name, email, major, cgpa) VALUES (?, ?, ?, ?)',
      [name, email, major, cgpa],
      function(err) {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        res.status(201).json({
          id: this.lastID,
          message: 'Student added successfully'
        });
      }
  );
});


// READ - Get all students
app.get('/api/students', (req, res) => {
  db.all('SELECT * FROM students', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});


// READ - Get single student by ID
app.get('/api/students/:id', (req, res) => {
  db.get(
      'SELECT * FROM students WHERE id = ?',
      [req.params.id],
      (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (!row) {
          return res.status(404).json({ message: 'Student not found' });
        }
        res.json(row);
      }
  );
});

// UPDATE (PUT) - Replace entire student record
app.put('/api/students/:id', (req, res) => {
  const { name, email, major, cgpa } = req.body;
  const studentId = req.params.id;

  if (!name || !email || !major || cgpa === undefined) {
    return res.status(400).json({
      error: 'Missing required fields. Please provide name, email, major, and cgpa'
    });
  }

  // Field length validation
  if (name && name.length > 30){
    return res.status(400).json({
      error: 'Name must be 30 characters or less.'
    });
  }

  if (email && email.length > 30){
    return res.status(400).json({
      error: 'email must be 30 characters or less.'
    });
  }
  if (major && major.length > 30){
    return res.status(400).json({
      error: 'major must be 30 characters or less.'
    });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Invalid email format (must be user@domain.com.)'
    });
  }

  // 3. Validate CGPA range
  if (cgpa < 0 || cgpa > 4.0) {
    return res.status(400).json({
      error: 'CGPA must be between 0 and 4.0'
    });
  }

  db.run(
      'UPDATE students SET name = ?, email = ?, major = ?, cgpa = ? WHERE id = ?',
      [name, email, major, cgpa, studentId],
      function(err) {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        if (this.changes === 0) {
          return res.status(404).json({ message: 'Student not found' });
        }
        res.json({
          id: studentId,
          message: 'Student updated successfully'
        });
      }
  );
});




// UPDATE (PATCH) - Partially update student record with validation
app.patch('/api/students/:id', (req, res) => {
  const studentId = req.params.id;
  const updates = req.body;
  const validFields = ['name', 'email', 'major', 'cgpa'];

  // Field length limits
  const fieldLengths = {
    name: 30,
    email: 30,
    major: 30
  };

  // Validate student exists first
  db.get('SELECT * FROM students WHERE id = ?', [studentId], (err, student) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Filter and validate updates
    const setClauses = [];
    const values = [];
    const errors = [];

    Object.keys(updates).forEach(key => {
      if (!validFields.includes(key)) {
        return errors.push(`'${key}' is not a valid field`);
      }

      // Check for null/undefined values
      if (updates[key] === null || updates[key] === undefined) {
        return errors.push(`'${key}' cannot be null`);
      }

      // Special validation for CGPA
      if (key === 'cgpa') {
        if (updates[key] < 0 || updates[key] > 4.0) {
          errors.push('CGPA must be between 0.0 and 4.0');
        }
      }

      // Validate field length (for string fields)
      if (fieldLengths[key] && typeof updates[key] === 'string') {
        if (updates[key].length > fieldLengths[key]) {
          errors.push(`'${key}' must be ${fieldLengths[key]} characters or less`);
        }
      }


      // Special validation for email format
      if (key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates[key])) {
        errors.push('Invalid email format');
      }

      if (!errors.length) {
        setClauses.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (errors.length) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    if (setClauses.length === 0) {
      return res.status(400).json({
        error: 'No valid fields provided for update'
      });
    }

    values.push(studentId);
    const sql = `UPDATE students SET ${setClauses.join(', ')} WHERE id = ?`;

    db.run(sql, values, function(err) {
      if (err) {
        return res.status(400).json({
          error: 'Database error',
          details: err.message
        });
      }
      res.json({
        id: Number(studentId),
        message: 'Student updated successfully',
        updatedFields: Object.keys(updates)
      });
    });
  });
});


// DELETE - Remove student by ID
app.delete('/api/students/:id', (req, res) => {
  const studentId = req.params.id;

  db.run(
      'DELETE FROM students WHERE id = ?',
      [studentId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
          return res.status(404).json({ message: 'Student not found' });
        }
        res.json({
          message: 'Student deleted successfully'
        });
      }
  );
});


// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});


app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'pong' });
});


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
module.exports = {app,db};