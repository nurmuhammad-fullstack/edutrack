// In-memory mock DB (localStorage replacement for backend)
const db = {
  students: [],
  nextId: 1,
};

function getAllStudents() {
  return db.students;
}

function getStudentsByStatus(status) {
  return db.students.filter((s) => s.status === status);
}

function getStudentByTelegramId(telegramId) {
  return db.students.find((s) => s.telegramId === String(telegramId));
}

function createStudent(data) {
  const student = {
    id: db.nextId++,
    ...data,
    telegramId: String(data.telegramId),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  db.students.push(student);
  return student;
}

function updateStudentStatus(id, status) {
  const student = db.students.find((s) => s.id === Number(id));
  if (!student) return null;
  student.status = status;
  student.updatedAt = new Date().toISOString();
  return student;
}

module.exports = { getAllStudents, getStudentsByStatus, getStudentByTelegramId, createStudent, updateStudentStatus };
