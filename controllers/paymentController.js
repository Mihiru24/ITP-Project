const Payment = require('../models/Payment');

// Create a payment
exports.create = async (req, res) => {
  try {
    console.log('Payment creation request received:', req.body);
    const { student, teacher, classId, subject, courseName, amount, notes } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!student) missingFields.push('student');
    if (!teacher) missingFields.push('teacher');
    if (!classId) missingFields.push('classId');
    if (!subject) missingFields.push('subject');
    if (!courseName) missingFields.push('courseName');
    if (!amount) missingFields.push('amount');

    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields);
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        message: 'Amount must be greater than 0'
      });
    }

    // Create payment object
    const paymentData = {
      student,
      teacher,
      classId,
      subject,
      courseName,
      amount: Number(amount),
      notes,
      status: 'pending'
    };

    console.log('Creating payment with data:', paymentData);
    const payment = new Payment(paymentData);

    try {
      await payment.save();
      console.log('Payment saved successfully:', payment);
    } catch (saveError) {
      console.error('Error saving payment:', saveError);
      throw saveError;
    }
    res.status(201).json({ 
      success: true,
      message: 'Payment created successfully', 
      payment 
    });
  } catch (err) {
    console.error('Payment creation error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error creating payment', 
      error: err.message 
    });
  }
};

// Get all payments
exports.getAll = async (req, res) => {
  try {
    const payments = await Payment.find().populate('student teacher');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get payment by ID
exports.getById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('student', 'fullName userName email')
      .populate('teacher', 'fullName userName email subject bankDetails');
    
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    
    console.log('Retrieved payment:', payment);
    res.json(payment);
  } catch (err) {
    console.error('Error fetching payment by ID:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update payment
exports.update = async (req, res) => {
  try {
    console.log('Updating payment with ID:', req.params.id);
    console.log('Update data:', req.body);
    
    const { classId, subject, courseName, amount, status, notes, paymentDate } = req.body;
    
    // Build update object with only provided fields
    const updateData = {};
    if (classId !== undefined) updateData.classId = classId;
    if (subject !== undefined) updateData.subject = subject;
    if (courseName !== undefined) updateData.courseName = courseName;
    if (amount !== undefined) updateData.amount = Number(amount);
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (paymentDate !== undefined) updateData.paymentDate = paymentDate;

    // If status is being changed to completed, calculate commission
    if (status === 'completed' && amount) {
      updateData.adminCommission = Number(amount) * 0.15;
      updateData.teacherPayment = Number(amount) * 0.85;
    }

    const payment = await Payment.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('student', 'fullName userName email')
     .populate('teacher', 'fullName userName email subject bankDetails');
    
    if (!payment) {
      console.log('Payment not found with ID:', req.params.id);
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    console.log('Payment updated successfully:', payment);
    res.json(payment);
  } catch (err) {
    console.error('Error updating payment:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all payments with teacher/student populated
exports.getAllWithPopulation = async (req, res) => {
  try {
    console.log('Fetching all payments...');
    
    const payments = await Payment.find()
      .populate('student', 'fullName userName')
      .populate('teacher', 'fullName subject bankName accountNumber branch beneficiaryName')
      .sort({ paymentDate: -1 }); // Sort by newest first
    
    console.log('Found total payments:', payments.length);
    res.json(payments);
  } catch (err) {
    console.error('Error fetching all payments:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get payments for specific month/year
exports.getPaymentsByMonth = async (req, res) => {
  try {
    console.log('Fetching payments by month...');
    
    // Get month and year from query parameters, default to current month/year
    const { month, year } = req.query;
    const now = new Date();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth(); // month is 0-indexed
    const targetYear = year ? parseInt(year) : now.getFullYear();
    
    console.log('Target month/year:', { month: targetMonth + 1, year: targetYear });
    
    // First try to get all payments to see if any exist
    const allPayments = await Payment.find();
    console.log('Total payments in database:', allPayments.length);
    
    if (allPayments.length === 0) {
      console.log('No payments found in database');
      return res.json([]);
    }

    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
    
    console.log('Date range:', { startOfMonth, endOfMonth });

    // Try without population first
    const paymentsWithoutPopulate = await Payment.find({
      paymentDate: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });
    
    console.log('Found payments without populate:', paymentsWithoutPopulate.length);
    
    if (paymentsWithoutPopulate.length === 0) {
      console.log('No payments found for specified month');
      return res.json([]);
    }

    // Now try with population
    const payments = await Payment.find({
      paymentDate: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    }).populate('student', 'fullName userName')
      .populate('teacher', 'fullName subject bankName accountNumber branch beneficiaryName');
    
    console.log('Found payments with populate:', payments.length);
    res.json(payments);
  } catch (err) {
    console.error('Error fetching payments by month:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update payment status with automatic commission calculation
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Calculate commission when status is changed to completed
    if (status === 'completed' && payment.status !== 'completed') {
      const adminCommission = Math.round(payment.amount * 0.15); // 15%
      const teacherPayment = payment.amount - adminCommission;
      
      payment.adminCommission = adminCommission;
      payment.teacherPayment = teacherPayment;
    } else if (status !== 'completed') {
      // Reset commission if status is not completed
      payment.adminCommission = 0;
      payment.teacherPayment = 0;
    }

    payment.status = status;
    await payment.save();

    const updatedPayment = await Payment.findById(req.params.id)
      .populate('student', 'fullName userName')
      .populate('teacher', 'fullName subject bankName accountNumber branch beneficiaryName');
    
    res.json(updatedPayment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get teacher's month-wise salary data
exports.getTeacherSalary = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const { month, year } = req.query;
    
    console.log('Getting teacher salary for:', { teacherId, month, year });
    console.log('Request user:', req.user);

    // Security check: Teachers can only view their own salary data
    // Admins can view any teacher's salary data
    if (req.user.role !== 'admin' && req.user.id !== teacherId) {
      return res.status(403).json({ 
        error: 'Access denied. You can only view your own salary data.' 
      });
    }

    // Build query filter
    let matchQuery = { teacher: teacherId };
    
    // Add date filtering if month and year are provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      matchQuery.createdAt = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      matchQuery.createdAt = { $gte: startDate, $lte: endDate };
    }

    // Get payments for the teacher
    const payments = await Payment.find(matchQuery)
      .populate('student', 'fullName userName email')
      .populate('teacher', 'fullName userName email')
      .sort({ createdAt: -1 });

    console.log(`Found ${payments.length} payments for teacher`);

    // Calculate monthly summary
    const monthlySummary = {};
    let totalEarnings = 0;
    let totalCommission = 0;
    let completedPayments = 0;
    let pendingPayments = 0;
    let failedPayments = 0;

    payments.forEach(payment => {
      const paymentDate = new Date(payment.createdAt);
      const monthKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlySummary[monthKey]) {
        monthlySummary[monthKey] = {
          month: monthKey,
          totalAmount: 0,
          teacherPayment: 0,
          adminCommission: 0,
          completedCount: 0,
          pendingCount: 0,
          failedCount: 0,
          payments: []
        };
      }

      monthlySummary[monthKey].totalAmount += payment.amount;
      monthlySummary[monthKey].teacherPayment += payment.teacherPayment || 0;
      monthlySummary[monthKey].adminCommission += payment.adminCommission || 0;
      monthlySummary[monthKey].payments.push(payment);

      // Status counts
      if (payment.status === 'completed') {
        monthlySummary[monthKey].completedCount++;
        completedPayments++;
      } else if (payment.status === 'pending') {
        monthlySummary[monthKey].pendingCount++;
        pendingPayments++;
      } else if (payment.status === 'failed') {
        monthlySummary[monthKey].failedCount++;
        failedPayments++;
      }

      // Overall totals
      totalEarnings += payment.teacherPayment || 0;
      totalCommission += payment.adminCommission || 0;
    });

    // Convert to array and sort by month
    const monthlyData = Object.values(monthlySummary).sort((a, b) => b.month.localeCompare(a.month));

    const response = {
      teacherId,
      totalPayments: payments.length,
      totalEarnings,
      totalCommission,
      statusCounts: {
        completed: completedPayments,
        pending: pendingPayments,
        failed: failedPayments
      },
      monthlyData,
      allPayments: payments
    };

    console.log('Teacher salary response:', {
      teacherId,
      totalPayments: response.totalPayments,
      totalEarnings: response.totalEarnings,
      monthlyDataCount: monthlyData.length
    });

    res.json(response);
  } catch (error) {
    console.error('Error getting teacher salary:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete payment
exports.delete = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
