const request = require('supertest');
const {app,db} = require('../app');
const { createServer } = require('http');

// mock test
  describe('GET /ping', () => {
    it('should return pong', async () => {
      const res = await request(app).get('/ping');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'pong');
    });
  });



// Test case to get all students from the students table
// If you want to rerun the test change the email address as it has to be unique or delete the existing one from the students table before rerun.
describe('GET /api/students', () => {
  let server;
  let testStudentId;

  beforeAll((done) => {
    server = createServer(app);

    db.run(
        'INSERT INTO students(name, email, major, cgpa) VALUES (?, ?, ?, ?)',
        ['Test1', 'test1@university.edu', 'Computer Science', 3.5],
        function(err) {
          testStudentId = this.lastID;
          done();
        }
    );
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should return all student records', async () => {
    const res = await request(server).get('/api/students');

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();

    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('email');
      expect(res.body[0]).toHaveProperty('major');
      expect(res.body[0]).toHaveProperty('cgpa');
    }
  });
});

// Test case to get one student by id
// If you want to rerun the test change the email address as it has to be unique or delete the existing one from the students table before rerun.
describe('GET /api/students/:id', () => {
  let server;
  let testStudentId;

  beforeAll(async () => {
    server = createServer(app);

    // Use async/await for database operation
    const result = await new Promise((resolve) => {
      db.run(
          'INSERT INTO students(name, email, major, cgpa) VALUES (?, ?, ?, ?)',
          ['Test2', 'test2@university.edu', 'Computer Science', 3.5],
          function(err) {
            resolve({ lastID: this.lastID, changes: this.changes });
          }
      );
    });
    testStudentId = result.lastID;
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should return a single student', async () => {
    const res = await request(server).get(`/api/students/${testStudentId}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      id: testStudentId,
      name: 'Test2',
      email: 'test2@university.edu',
      major: 'Computer Science',
      cgpa: 3.5
    });
  });
});


// Test case to create new student
// If you want to rerun the test change the email address as it has to be unique or delete the existing one from the students table before rerun.
describe('POST /api/students', () => {
  let server;

  beforeAll((done) => {
    server = createServer(app);
    done();
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should create a new student', async () => {
    const newStudent = {
      name: 'New Student',
      email: 'testpost@university.edu',
      major: 'Physics',
      cgpa: 3.8
    };

    const res = await request(server)
        .post('/api/students')
        .send(newStudent);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('message', 'Student added successfully');
  });
});

// Test case to update all fields of a student (put method)
// If you want to rerun the test change the email address as it has to be unique or delete the existing one from the students table before rerun.
describe('PUT /api/students/:id', () => {
  let server;
  let testStudentId;

  beforeAll(async () => {
    server = createServer(app);

    const result = await new Promise((resolve) => {
      db.run(
          'INSERT INTO students(name, email, major, cgpa) VALUES (?, ?, ?, ?)',
          ['Test4', 'test4@university.edu', 'Math', 3.0],
          function(err) {
            resolve({ lastID: this.lastID });
          }
      );
    });
    testStudentId = result.lastID;
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should update a student', async () => {
    const updatedData = {
      name: 'Updated Test',
      email: 'updatedtest@university.edu',
      major: 'Computer Science',
      cgpa: 3.8
    };

    // First make the PUT request
    const putResponse = await request(server)
        .put(`/api/students/${testStudentId}`)
        .send(updatedData);

    expect(putResponse.statusCode).toEqual(200);

    // Then verify by fetching the updated record
    const getResponse = await request(server)
        .get(`/api/students/${testStudentId}`);

    expect(getResponse.statusCode).toEqual(200);
    expect(getResponse.body).toEqual({
      id: testStudentId,
      ...updatedData
    });
  });
});


// Test case to delete a student record by id
// If you want to rerun the test change the email address as it has to be unique or delete the existing one from the students table before rerun.
describe('DELETE /api/students/:id', () => {
  let server;
  let testStudentId;

  beforeAll(async () => {
    server = createServer(app);

    // Insert test record
    const result = await new Promise((resolve) => {
      db.run(
          'INSERT INTO students(name, email, major, cgpa) VALUES (?, ?, ?, ?)',
          ['Delete Test', 'delete@test.edu', 'Physics', 3.2],
          function(err) {
            resolve({ lastID: this.lastID });
          }
      );
    });
    testStudentId = result.lastID;
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should delete a student and verify deletion', async () => {
    // First delete the record
    const deleteResponse = await request(server)
        .delete(`/api/students/${testStudentId}`);

    expect(deleteResponse.statusCode).toEqual(200);
    expect(deleteResponse.body).toEqual({
      message: 'Student deleted successfully'
    });

    // Then verify it's gone
    const getResponse = await request(server)
        .get(`/api/students/${testStudentId}`);

    expect(getResponse.statusCode).toEqual(404);
    expect(getResponse.body).toEqual({
      message: 'Student not found'
    });
  });
});


// Test case to update a specific field for a student by id (patch method)
// If you want to rerun the test change the email address as it has to be unique or delete the existing one from the students table before rerun.
describe('PATCH /api/students/:id', () => {
  let server;
  let testStudentId;

  beforeAll(async () => {
    server = createServer(app);

    // Insert test record
    const result = await new Promise((resolve) => {
      db.run(
          'INSERT INTO students(name, email, major, cgpa) VALUES (?, ?, ?, ?)',
          ['Patch Test', 'patch@test.edu', 'Chemistry', 3.1],
          function(err) {
            resolve({ lastID: this.lastID });
          }
      );
    });
    testStudentId = result.lastID;
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should partially update a student', async () => {
    const updates = {
      name: 'Patched Name',
      cgpa: 3.5
    };

    // First make the PATCH request
    const patchResponse = await request(server)
        .patch(`/api/students/${testStudentId}`)
        .send(updates);

    expect(patchResponse.statusCode).toEqual(200);
    expect(patchResponse.body).toEqual({
      id: testStudentId,
      message: 'Student updated successfully',
      updatedFields: ['name', 'cgpa']
    });

    // Then verify the updates
    const getResponse = await request(server)
        .get(`/api/students/${testStudentId}`);

    expect(getResponse.statusCode).toEqual(200);
    expect(getResponse.body).toEqual({
      id: testStudentId,
      name: 'Patched Name',
      email: 'patch@test.edu',  // Should remain unchanged
      major: 'Chemistry',       // Should remain unchanged
      cgpa: 3.5                // Updated
    });
  });

  it('should reject invalid CGPA values', async () => {
    const res = await request(server)
        .patch(`/api/students/${testStudentId}`)
        .send({ cgpa: 5.0 });  // Invalid CGPA

    expect(res.statusCode).toEqual(400);
    expect(res.body.details).toContain('CGPA must be between 0.0 and 4.0');
  });
});


// Alternate syntax and writeup
// https://www.testim.io/blog/supertest-how-to-test-apis-like-a-pro/