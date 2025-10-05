const Marks = require('../models/Marks');
const User = require('../models/User');

// Create marks
exports.create = async (req, res) => {
  try {
    // Verify both student and teacher exist and have correct roles
    const student = await User.findById(req.body.student);
    const teacher = await User.findById(req.body.teacher);

    if (!student || student.role !== 'student') {
      return res.status(400).json({ error: 'Invalid student ID' });
    }
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({ error: 'Invalid teacher ID' });
    }

    const marks = new Marks(req.body);
    await marks.save();
    res.status(201).json({ message: 'Marks added', marks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all marks
exports.getAll = async (req, res) => {
  try {
    const allMarks = await Marks.find()
      .populate('student', 'fullName userName dob')
      .populate('teacher', 'fullName subject');
    res.json(allMarks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get marks by ID
exports.getById = async (req, res) => {
  try {
    const marks = await Marks.findById(req.params.id)
      .populate('student', 'fullName userName dob')
      .populate('teacher', 'fullName subject');
    if (!marks) return res.status(404).json({ error: 'Marks not found' });
    res.json(marks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get marks by teacher ID
exports.getMarksByTeacher = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const teacher = await User.findById(teacherId);
    
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({ error: 'Invalid teacher ID' });
    }

    const marks = await Marks.find({ teacher: teacherId })
      .populate('student', 'fullName userName dob')
      .populate('teacher', 'fullName subject')
      .sort({ date: -1 });
    
    res.json(marks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get marks by student ID
exports.getMarksByStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const student = await User.findById(studentId);
    
    if (!student || student.role !== 'student') {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    const marks = await Marks.find({ student: studentId })
      .populate('student', 'fullName userName dob')
      .populate('teacher', 'fullName subject')
      .sort({ date: -1 });
    
    res.json(marks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get marks by teacher AND student ID
exports.getMarksByTeacherAndStudent = async (req, res) => {
  try {
    const { teacherId, studentId } = req.params;
    
    const teacher = await User.findById(teacherId);
    const student = await User.findById(studentId);
    
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({ error: 'Invalid teacher ID' });
    }
    if (!student || student.role !== 'student') {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    const marks = await Marks.find({ 
      teacher: teacherId,
      student: studentId
    })
      .populate('student', 'fullName userName dob')
      .populate('teacher', 'fullName subject')
      .sort({ date: -1 });
    
    res.json(marks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update marks
exports.update = async (req, res) => {
  try {
    if (req.body.student || req.body.teacher) {
      const student = req.body.student ? await User.findById(req.body.student) : null;
      const teacher = req.body.teacher ? await User.findById(req.body.teacher) : null;

      if (student && student.role !== 'student') {
        return res.status(400).json({ error: 'Invalid student ID' });
      }
      if (teacher && teacher.role !== 'teacher') {
        return res.status(400).json({ error: 'Invalid teacher ID' });
      }
    }

    const marks = await Marks.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('student', 'fullName userName dob')
      .populate('teacher', 'fullName subject');
    
    if (!marks) return res.status(404).json({ error: 'Marks not found' });
    res.json(marks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete marks
exports.delete = async (req, res) => {
  try {
    const marks = await Marks.findByIdAndDelete(req.params.id);
    if (!marks) return res.status(404).json({ error: 'Marks not found' });
    res.json({ message: 'Marks deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//

