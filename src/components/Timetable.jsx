import React, { useState, useEffect } from 'react';
import { CalendarIcon, PlusIcon, PencilIcon, TrashIcon, ArrowLeftIcon, ClockIcon, EyeIcon } from './Icons';
import { timetableAPI, coursesAPI } from '../services/api';

const Timetable = () => {
  const [timetables, setTimetables] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'view', 'edit'
  const [createForm, setCreateForm] = useState({
    course: '',
    academicYear: '',
    semester: '1'
  });

  // Time slots configuration
  const timeSlots = [
    { id: 1, start: '09:00', end: '10:00', period: 'Period 1' },
    { id: 2, start: '10:00', end: '11:00', period: 'Period 2' },
    { id: 3, start: '11:00', end: '11:15', period: 'Break', isBreak: true },
    { id: 4, start: '11:15', end: '12:15', period: 'Period 3' },
    { id: 5, start: '12:15', end: '13:15', period: 'Period 4' },
    { id: 6, start: '13:15', end: '14:00', period: 'Lunch', isBreak: true },
    { id: 7, start: '14:00', end: '15:00', period: 'Period 5' },
    { id: 8, start: '15:00', end: '16:00', period: 'Period 6' },
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const academicYears = ['2024-25', '2025-26', '2026-27', '2027-28'];

  // Fetch timetables from backend
  const fetchTimetables = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await timetableAPI.getAll();
      let entries = [];
      if (Array.isArray(result)) {
        entries = result;
      } else if (result?.data?.timetableEntries) {
        entries = result.data.timetableEntries;
      } else if (result?.timetableEntries) {
        entries = result.timetableEntries;
      } else if (result?.data && Array.isArray(result.data)) {
        entries = result.data;
      }
      setTimetables(entries);
    } catch (err) {
      setError(err.message || 'Failed to load timetables');
      setTimetables([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses from backend
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
    fetchTimetables();
    fetchCourses();
  }, []);

  // Filter timetables based on selected course and year
  const filteredTimetables = timetables.filter(timetable => {
    const matchesCourse = selectedCourse === '' || timetable.course === selectedCourse;
    const matchesYear = selectedYear === '' || timetable.academicYear === selectedYear;
    return matchesCourse && matchesYear;
  });

  // Handle create timetable form submission
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Construct payload for backend
      const payload = {
        courseName: createForm.course,
        academicYear: createForm.academicYear,
        semester: createForm.semester,
        // Add other required fields as needed
        // You may need to adjust this to match backend schema
      };
      await timetableAPI.create(payload);
      fetchTimetables();
      setCreateForm({ course: '', academicYear: '', semester: '1' });
      setShowCreateForm(false);
    } catch (err) {
      setError(err.message || 'Failed to create timetable');
    } finally {
      setLoading(false);
    }
  };

  // Handle schedule cell update
  const handleScheduleUpdate = (day, periodId, field, value) => {
    if (!selectedTimetable) return;

    const updatedTimetables = timetables.map(timetable => {
      if (timetable.id === selectedTimetable.id) {
        const updatedSchedule = { ...timetable.schedule };
        if (!updatedSchedule[day][periodId]) {
          updatedSchedule[day][periodId] = {};
        }
        updatedSchedule[day][periodId] = {
          ...updatedSchedule[day][periodId],
          [field]: value
        };
        return { ...timetable, schedule: updatedSchedule };
      }
      return timetable;
    });

    setTimetables(updatedTimetables);
    setSelectedTimetable(updatedTimetables.find(t => t.id === selectedTimetable.id));
  };

  // Handle view timetable
  const handleViewTimetable = (timetable) => {
    setSelectedTimetable(timetable);
    setViewMode('view');
  };

  // Handle edit timetable
  const handleEditTimetable = (timetable) => {
    setSelectedTimetable(timetable);
    setViewMode('edit');
  };

  // Handle back to list
  const handleBackToList = () => {
    setSelectedTimetable(null);
    setViewMode('list');
  };

  // Handle delete timetable
  const handleDeleteTimetable = async (timetableId) => {
    if (window.confirm('Are you sure you want to delete this timetable?')) {
      setLoading(true);
      setError(null);
      try {
        await timetableAPI.delete(timetableId);
        fetchTimetables();
        if (selectedTimetable && (selectedTimetable._id || selectedTimetable.id) === timetableId) {
          setSelectedTimetable(null);
        }
      } catch (err) {
        setError(err.message || 'Failed to delete timetable');
      } finally {
        setLoading(false);
      }
    }
  };

  // Get subjects for selected course
  const getCourseSubjects = (courseName) => {
    return subjects.filter(subject => subject.course === courseName);
  };

  if (showCreateForm) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setShowCreateForm(false)}
            className="mr-4 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create New Timetable</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleCreateSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course *
                </label>
                <select
                  value={createForm.course}
                  onChange={(e) => setCreateForm({...createForm, course: e.target.value})}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course._id || course.id} value={course.name}>{course.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Year *
                </label>
                <select
                  value={createForm.academicYear}
                  onChange={(e) => setCreateForm({...createForm, academicYear: e.target.value})}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester *
                </label>
                <select
                  value={createForm.semester}
                  onChange={(e) => setCreateForm({...createForm, semester: e.target.value})}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Timetable
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (selectedTimetable && (viewMode === 'view' || viewMode === 'edit')) {
    const courseSubjects = getCourseSubjects(selectedTimetable.course);
    const isEditMode = viewMode === 'edit';
    // Ensure schedule is always an object with day keys
    const safeSchedule = selectedTimetable.schedule || {};
    days.forEach(day => {
      if (!safeSchedule[day]) safeSchedule[day] = {};
    });
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={handleBackToList}
              className="mr-4 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedTimetable.course} - Timetable {isEditMode ? '(Edit Mode)' : '(View Mode)'}
              </h1>
              <p className="text-sm text-gray-600">
                {selectedTimetable.academicYear} • Semester {selectedTimetable.semester}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {!isEditMode ? (
              <button
                onClick={() => setViewMode('edit')}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Timetable
              </button>
            ) : (
              <button
                onClick={() => setViewMode('view')}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                View Mode
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Time Period
                  </th>
                  {days.map(day => (
                    <th key={day} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeSlots.map(slot => (
                  <tr key={slot.id} className={slot.isBreak ? 'bg-gray-50' : ''}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div>
                        <div className="font-semibold">{slot.period}</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {slot.start} - {slot.end}
                        </div>
                      </div>
                    </td>
                    {days.map(day => (
                      <td key={day} className="px-4 py-4 text-sm">
                        {slot.isBreak ? (
                          <div className="text-center text-gray-500 font-medium bg-gray-100 py-2 rounded">
                            {slot.period}
                          </div>
                        ) : isEditMode ? (
                          <div className="space-y-2">
                            <select
                              value={safeSchedule[day][slot.id]?.subject || ''}
                              onChange={(e) => handleScheduleUpdate(day, slot.id, 'subject', e.target.value)}
                              className="block w-full text-xs border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select Subject</option>
                              {courseSubjects.map(subject => (
                                <option key={subject._id || subject.id || subject.name} value={subject.name}>{subject.name}</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              placeholder="Faculty Name"
                              value={safeSchedule[day][slot.id]?.faculty || ''}
                              onChange={(e) => handleScheduleUpdate(day, slot.id, 'faculty', e.target.value)}
                              className="block w-full text-xs border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                            <input
                              type="text"
                              placeholder="Room Number"
                              value={safeSchedule[day][slot.id]?.room || ''}
                              onChange={(e) => handleScheduleUpdate(day, slot.id, 'room', e.target.value)}
                              className="block w-full text-xs border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        ) : (
                          <div className="min-h-[80px]">
                            {safeSchedule[day] && safeSchedule[day][slot.id] ? (
                              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <div className="font-semibold text-blue-900 text-sm">
                                  {safeSchedule[day][slot.id].subject}
                                </div>
                                {safeSchedule[day][slot.id].faculty && (
                                  <div className="text-xs text-blue-700 mt-1">
                                    👨‍🏫 {safeSchedule[day][slot.id].faculty}
                                  </div>
                                )}
                                {safeSchedule[day][slot.id].room && (
                                  <div className="text-xs text-blue-700 mt-1">
                                    🏫 {safeSchedule[day][slot.id].room}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center text-gray-400 py-4 border-2 border-dashed border-gray-200 rounded-lg">
                                <div className="text-xs">No class scheduled</div>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isEditMode && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <ClockIcon className="h-5 w-5 text-blue-500 mt-0.5" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-900">Edit Instructions</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Select subjects from the dropdown for each time slot</li>
                    <li>Enter faculty name and room number for each class</li>
                    <li>Changes are saved automatically as you type</li>
                    <li>Click "View Mode" to see the formatted timetable</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Timetable Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Timetable
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.name}>{course.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Academic Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Years</option>
              {academicYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Timetables List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Timetables ({filteredTimetables.length})
          </h2>
        </div>

        {filteredTimetables.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {selectedCourse || selectedYear ? 'No timetables match your filter criteria.' : 'No timetables created yet.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
              {filteredTimetables.map((timetable) => (
                <div key={timetable._id || timetable.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <CalendarIcon className="h-10 w-10 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{timetable.course}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Academic Year: {timetable.academicYear}</span>
                        <span>•</span>
                        <span>Semester {timetable.semester}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewTimetable(timetable)}
                      className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded"
                      title="View Timetable"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditTimetable(timetable)}
                      className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                      title="Edit Timetable"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTimetable(timetable._id || timetable.id)}
                      className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                      title="Delete Timetable"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>
      )}
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

export default Timetable;
