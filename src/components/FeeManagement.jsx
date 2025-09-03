import React, { useState, useEffect } from 'react';
import { SearchIcon, FilterIcon, EyeIcon, PlusIcon, ArrowLeftIcon, CurrencyRupeeIcon, CalendarIcon } from './Icons';

const FeeManagement = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [feeDeposits, setFeeDeposits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showFeeHistory, setShowFeeHistory] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [depositForm, setDepositForm] = useState({
    studentId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Initialize with sample data
  useEffect(() => {
    const sampleStudents = [
      { id: 1, name: 'John Doe', studentId: 'ST001', course: 'Computer Science', email: 'john@example.com', phone: '123-456-7890' },
      { id: 2, name: 'Jane Smith', studentId: 'ST002', course: 'Mathematics', email: 'jane@example.com', phone: '123-456-7891' },
      { id: 3, name: 'Mike Johnson', studentId: 'ST003', course: 'Physics', email: 'mike@example.com', phone: '123-456-7892' },
      { id: 4, name: 'Sarah Wilson', studentId: 'ST004', course: 'Computer Science', email: 'sarah@example.com', phone: '123-456-7893' },
      { id: 5, name: 'David Brown', studentId: 'ST005', course: 'Chemistry', email: 'david@example.com', phone: '123-456-7894' },
      { id: 6, name: 'Emily Davis', studentId: 'ST006', course: 'Mathematics', email: 'emily@example.com', phone: '123-456-7895' },
    ];

    const sampleCourses = [
      { id: 1, name: 'Computer Science', code: 'CS', fee: 50000 },
      { id: 2, name: 'Mathematics', code: 'MATH', fee: 45000 },
      { id: 3, name: 'Physics', code: 'PHY', fee: 48000 },
      { id: 4, name: 'Chemistry', code: 'CHEM', fee: 47000 },
    ];

    const sampleFeeDeposits = [
      { id: 1, studentId: 'ST001', amount: 25000, description: 'First Semester Fee', date: '2024-01-15', studentName: 'John Doe' },
      { id: 2, studentId: 'ST001', amount: 25000, description: 'Second Semester Fee', date: '2024-07-15', studentName: 'John Doe' },
      { id: 3, studentId: 'ST002', amount: 22500, description: 'First Semester Fee', date: '2024-01-20', studentName: 'Jane Smith' },
      { id: 4, studentId: 'ST003', amount: 24000, description: 'First Semester Fee', date: '2024-02-01', studentName: 'Mike Johnson' },
      { id: 5, studentId: 'ST004', amount: 25000, description: 'First Semester Fee', date: '2024-01-25', studentName: 'Sarah Wilson' },
    ];

    setStudents(sampleStudents);
    setCourses(sampleCourses);
    setFeeDeposits(sampleFeeDeposits);
  }, []);

  // Filter students based on search and course filter
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.course.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === '' || student.course === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  // Calculate total fees paid by student
  const getStudentTotalPaid = (studentId) => {
    return feeDeposits
      .filter(deposit => deposit.studentId === studentId)
      .reduce((total, deposit) => total + deposit.amount, 0);
  };

  // Get course fee for student
  const getCourseFee = (courseName) => {
    const course = courses.find(c => c.name === courseName);
    return course ? course.fee : 0;
  };

  // Handle deposit form submission
  const handleDepositSubmit = (e) => {
    e.preventDefault();
    
    const student = students.find(s => s.id === parseInt(depositForm.studentId));
    if (!student) return;

    const newDeposit = {
      id: feeDeposits.length + 1,
      studentId: student.studentId,
      studentName: student.name,
      amount: parseFloat(depositForm.amount),
      description: depositForm.description,
      date: depositForm.date
    };

    setFeeDeposits([...feeDeposits, newDeposit]);
    setDepositForm({
      studentId: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowDepositForm(false);
  };

  // Handle view details
  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowFeeHistory(true);
  };

  // Get fee history for selected student
  const getStudentFeeHistory = () => {
    if (!selectedStudent) return [];
    return feeDeposits
      .filter(deposit => deposit.studentId === selectedStudent.studentId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Handle make deposit
  const handleMakeDeposit = (student) => {
    setDepositForm({
      ...depositForm,
      studentId: student.id.toString()
    });
    setShowDepositForm(true);
  };

  if (showFeeHistory && selectedStudent) {
    const feeHistory = getStudentFeeHistory();
    const totalPaid = getStudentTotalPaid(selectedStudent.studentId);
    const courseFee = getCourseFee(selectedStudent.course);
    const remainingFee = courseFee - totalPaid;

    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setShowFeeHistory(false)}
            className="mr-4 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Fee History - {selectedStudent.name}</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{selectedStudent.studentId}</div>
              <div className="text-sm text-gray-500">Student ID</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Total Paid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">₹{courseFee.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Course Fee</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${remainingFee > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ₹{remainingFee.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">
                {remainingFee > 0 ? 'Remaining' : 'Overpaid'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
          </div>
          
          {feeHistory.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No payment history found for this student.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {feeHistory.map((deposit) => (
                    <tr key={deposit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(deposit.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {deposit.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ₹{deposit.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showDepositForm) {
    const student = students.find(s => s.id === parseInt(depositForm.studentId));
    
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setShowDepositForm(false)}
            className="mr-4 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Make Fee Deposit</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {student && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-900">{student.name}</h3>
              <p className="text-sm text-gray-600">ID: {student.studentId} | Course: {student.course}</p>
              <p className="text-sm text-gray-600">
                Total Paid: ₹{getStudentTotalPaid(student.studentId).toLocaleString()} / 
                Course Fee: ₹{getCourseFee(student.course).toLocaleString()}
              </p>
            </div>
          )}

          <form onSubmit={handleDepositSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CurrencyRupeeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  value={depositForm.amount}
                  onChange={(e) => setDepositForm({...depositForm, amount: e.target.value})}
                  className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amount"
                  required
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <input
                type="text"
                value={depositForm.description}
                onChange={(e) => setDepositForm({...depositForm, description: e.target.value})}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., First Semester Fee, Late Fee, etc."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Date *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={depositForm.date}
                  onChange={(e) => setDepositForm({...depositForm, date: e.target.value})}
                  className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDepositForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Record Deposit
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by student name, ID, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="sm:w-64">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FilterIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.name}>{course.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Student Fee Records ({filteredStudents.length})
          </h2>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm || selectedCourse ? 'No students match your search criteria.' : 'No students found.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => {
                  const totalPaid = getStudentTotalPaid(student.studentId);
                  const courseFee = getCourseFee(student.course);
                  const remainingFee = courseFee - totalPaid;
                  const paymentStatus = remainingFee > 0 ? 'Pending' : 'Paid';

                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.studentId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.course}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{courseFee.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ₹{totalPaid.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          paymentStatus === 'Paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {paymentStatus}
                          {remainingFee > 0 && ` (₹${remainingFee.toLocaleString()} due)`}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleMakeDeposit(student)}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                            title="Make Deposit"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleViewDetails(student)}
                            className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeManagement;
