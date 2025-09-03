import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, CalendarIcon, ClockIcon, BookOpenIcon, AcademicCapIcon } from './Icons';
import { examinationsAPI, coursesAPI } from '../services/api';

const Examinations = () => {
  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [courses, setCourses] = useState([]);
  // Fetch examinations from backend
  const fetchExaminations = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await examinationsAPI.getAll();
      let exams = [];
      if (Array.isArray(result)) {
        exams = result;
      } else if (result?.examinations) {
        exams = result.examinations;
      } else if (result?.data?.examinations) {
        exams = result.data.examinations;
      } else if (result?.data && Array.isArray(result.data)) {
        exams = result.data;
      }
      setExaminations(exams);
    } catch (err) {
      setError(err.message || 'Failed to load examinations');
      setExaminations([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses for dropdown
  const fetchCourses = async () => {
    try {
      const result = await coursesAPI.getAll();
      let courseList = [];
      if (Array.isArray(result)) {
        courseList = result;
      } else if (result?.courses) {
        courseList = result.courses;
      } else if (result?.data?.courses) {
        courseList = result.data.courses;
      } else if (result?.data && Array.isArray(result.data)) {
        courseList = result.data;
      }
      setCourses(courseList);
    } catch (err) {
      setCourses([]);
    }
  };

  useEffect(() => {
    fetchExaminations();
    fetchCourses();
  }, []);

  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    courseId: '',
    examDate: '',
    examTime: '',
    duration: '',
    totalMarks: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.courseId) newErrors.courseId = 'Course selection is required';
    if (!formData.examDate) newErrors.examDate = 'Exam date is required';
    if (!formData.examTime) newErrors.examTime = 'Exam time is required';
    if (!formData.duration.trim()) newErrors.duration = 'Duration is required';
    if (!formData.totalMarks || formData.totalMarks <= 0) newErrors.totalMarks = 'Valid total marks required';

    // Check if exam date is in the past (only for new exams)
    if (formData.examDate && !editingExam) {
      const examDate = new Date(formData.examDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (examDate < today) {
        newErrors.examDate = 'Exam date cannot be in the past';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    const selectedCourse = courses.find(course => course._id === formData.courseId || course.id === parseInt(formData.courseId));
    const payload = {
      subject: formData.subject,
      course: selectedCourse?.name || '',
      courseId: selectedCourse?._id || selectedCourse?.id || formData.courseId,
      examDate: formData.examDate,
      examTime: formData.examTime,
      duration: formData.duration,
      totalMarks: parseInt(formData.totalMarks)
    };
    setLoading(true);
    setError(null);
    try {
      if (editingExam) {
        await examinationsAPI.update(editingExam._id || editingExam.id, payload);
      } else {
        await examinationsAPI.create(payload);
      }
      fetchExaminations();
      resetForm();
    } catch (err) {
      setError(err.message || 'Failed to save examination');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      courseId: '',
      examDate: '',
      examTime: '',
      duration: '',
      totalMarks: ''
    });
    setErrors({});
    setShowForm(false);
    setEditingExam(null);
  };

  const handleEdit = (exam) => {
    setFormData({
      subject: exam.subject,
      courseId: exam.courseId?.toString() || exam.courseId || '',
      examDate: exam.examDate?.slice(0, 10) || '',
      examTime: exam.examTime || '',
      duration: exam.duration || '',
      totalMarks: exam.totalMarks?.toString() || ''
    });
    setEditingExam(exam);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (examId) => {
    if (window.confirm('Are you sure you want to delete this examination?')) {
      setLoading(true);
      setError(null);
      try {
        await examinationsAPI.delete(examId);
        fetchExaminations();
      } catch (err) {
        setError(err.message || 'Failed to delete examination');
      } finally {
        setLoading(false);
      }
    }
  };

  const getDaysLeft = (examDate) => {
    const today = new Date();
    const exam = new Date(examDate);
    const diffTime = exam - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Completed';
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return '1 day left';
    } else {
      return `${diffDays} days left`;
    }
  };

  const getStatusColor = (examDate) => {
    const today = new Date();
    const exam = new Date(examDate);
    const diffTime = exam - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'text-gray-500 bg-gray-100';
    } else if (diffDays <= 3) {
      return 'text-red-600 bg-red-100';
    } else if (diffDays <= 7) {
      return 'text-yellow-600 bg-yellow-100';
    } else {
      return 'text-green-600 bg-green-100';
    }
  };

  const filteredExaminations = examinations.filter(exam =>
    (exam.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (exam.course || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedExaminations = filteredExaminations.sort((a, b) => {
    // Sort by exam date, with upcoming exams first
    return new Date(a.examDate) - new Date(b.examDate);
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Examinations</h1>
          <p className="text-gray-600">Schedule and manage examinations</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) resetForm();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          {showForm ? 'Cancel' : 'Schedule Exam'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingExam ? 'Edit Examination' : 'Schedule New Examination'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.subject ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter subject name"
              />
              {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course *
              </label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.courseId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a course</option>
                {courses.map(course => (
                  <option key={course._id || course.id} value={course._id || course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
              {errors.courseId && <p className="text-red-500 text-xs mt-1">{errors.courseId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exam Date *
              </label>
              <input
                type="date"
                name="examDate"
                value={formData.examDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.examDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.examDate && <p className="text-red-500 text-xs mt-1">{errors.examDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exam Time *
              </label>
              <input
                type="time"
                name="examTime"
                value={formData.examTime}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.examTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.examTime && <p className="text-red-500 text-xs mt-1">{errors.examTime}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration *
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.duration ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 3 hours, 2.5 hours"
              />
              {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Marks *
              </label>
              <input
                type="number"
                name="totalMarks"
                value={formData.totalMarks}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.totalMarks ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter total marks"
                min="1"
              />
              {errors.totalMarks && <p className="text-red-500 text-xs mt-1">{errors.totalMarks}</p>}
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                {editingExam ? 'Update Examination' : 'Schedule Examination'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search examinations by subject or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Examinations List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Scheduled Examinations</h2>
          <p className="text-sm text-gray-600">{sortedExaminations.length} examination(s) found</p>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <AcademicCapIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Loading examinations...</p>
          </div>
        ) : sortedExaminations.length === 0 ? (
          <>
            {error && (
              <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>
            )}
            <div className="p-8 text-center">
              <AcademicCapIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'No examinations found matching your search.' : 'No examinations scheduled yet.'}
              </p>
            </div>
          </>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedExaminations.map(exam => (
              <div key={exam._id || exam.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <BookOpenIcon className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-semibold text-gray-900">{exam.subject}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(exam.examDate)}`}>
                            {getDaysLeft(exam.examDate)}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <AcademicCapIcon className="w-4 h-4" />
                            <span>{exam.course}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{new Date(exam.examDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4" />
                            <span>{exam.examTime} ({exam.duration})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Total Marks: {exam.totalMarks}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(exam)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                          title="Edit examination"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(exam._id || exam.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                          title="Delete examination"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Examinations;
