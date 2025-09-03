import React, { useState, useEffect } from 'react';
import {
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  AcademicCapIcon,
  EnvelopeIcon,
  PhoneIcon,
  ArrowLeftIcon
} from './Icons';
import { facultyAPI } from '../services/api';
import { usePaginatedAPI, useCRUD, useForm } from '../hooks/useAPI';
import { 
  LoadingSpinner, 
  ErrorMessage, 
  TableLoadingSkeleton,
  LoadingButton,
  SuccessMessage,
  EmptyState 
} from './UI/LoadingComponents';

const Faculty = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // API hooks
  const {
    data: facultyData,
    loading: facultyLoading,
    error: facultyError,
    pagination,
    search,
    changePage,
    changeLimit,
    refetch
  } = usePaginatedAPI(facultyAPI.getAll, { limit: 10 });

  const {
    create: createFaculty,
    update: updateFaculty,
    remove: deleteFaculty,
    loading: crudLoading,
    error: crudError
  } = useCRUD(facultyAPI);

  // Form handling
  const initialFormData = {
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    qualification: '',
    experience: '',
    subjects: [],
    joinDate: new Date().toISOString().split('T')[0],
    status: 'Active'
  };

  const {
    values: formData,
    errors: formErrors,
    loading: formLoading,
    handleChange,
    handleSubmit: handleFormSubmit,
    reset: resetForm,
    setValues: setFormData
  } = useForm(initialFormData, async (data) => {
    try {
      if (editingFaculty) {
        await updateFaculty(editingFaculty._id, data);
        setSuccessMessage('Faculty updated successfully!');
      } else {
        await createFaculty(data);
        setSuccessMessage('Faculty created successfully!');
      }
      
      resetForm();
      setShowAddForm(false);
      setEditingFaculty(null);
      refetch();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Form submission error:', error);
      // Display detailed error information
      if (error.response?.data?.message) {
        console.error('Server validation error:', error.response.data.message);
      }
    }
  });

  // Ensure formData is always defined to prevent controlled/uncontrolled input warnings
  const safeFormData = formData || initialFormData;

  // Handle search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        search(searchTerm);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Form validation rules
  const validationRules = {
    name: { required: true, minLength: 2 },
    email: { required: true, email: true },
    phone: { required: true, pattern: /^[\+]?[\d\s\-\(\)]+$/, message: 'Please enter a valid phone number' },
    department: { required: true },
    designation: { required: true }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleFormSubmit(validationRules);
  };

  const handleEdit = (faculty) => {
    setEditingFaculty(faculty);
    setFormData({
      name: faculty.name || `${faculty.firstName || ''} ${faculty.lastName || ''}`.trim(),
      email: faculty.email || '',
      phone: faculty.phone || '',
      department: faculty.department || '',
      designation: faculty.designation || '',
      qualification: faculty.qualification || '',
      experience: faculty.experience || '',
      subjects: faculty.subjects || [],
      joinDate: faculty.joinDate ? faculty.joinDate.split('T')[0] : new Date().toISOString().split('T')[0],
      status: faculty.status || 'Active'
    });
    setShowAddForm(true);
  };

  const handleDelete = async (facultyId) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        await deleteFaculty(facultyId);
        setSuccessMessage('Faculty deleted successfully!');
        refetch();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleCancel = () => {
    resetForm();
    setShowAddForm(false);
    setEditingFaculty(null);
  };

  // Get faculty's full name
  const getFullName = (faculty) => {
    if (faculty.name) {
      return faculty.name;
    }
    // Fallback for backward compatibility
    if (faculty.firstName && faculty.lastName) {
      return `${faculty.firstName} ${faculty.lastName}`;
    }
    return faculty.firstName || faculty.lastName || 'Unknown';
  };

  // Get faculty display ID
  const getFacultyId = (faculty) => {
    return faculty.employeeId || faculty.facultyId || faculty._id?.slice(-6) || 'N/A';
  };

  // Fallback data for demo purposes
  const fallbackFaculty = [
    {
      _id: '1',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@edumanage.com',
      phone: '+1 (555) 123-4567',
      department: 'Computer Science',
      designation: 'Professor',
      qualification: 'PhD in Computer Science',
      experience: '12',
      status: 'Active'
    },
    {
      _id: '2',
      name: 'Prof. Michael Brown',
      email: 'michael.brown@edumanage.com',
      phone: '+1 (555) 234-5678',
      department: 'Mathematics',
      designation: 'Associate Professor',
      qualification: 'PhD in Mathematics',
      experience: '8',
      status: 'Active'
    }
  ];

  // Extract faculty array from API response
  const facultyArray = facultyData?.faculty || facultyData || [];
  const displayFaculty = Array.isArray(facultyArray) ? facultyArray : fallbackFaculty;
  
  const filteredFaculty = displayFaculty.filter(faculty =>
    getFullName(faculty).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getFacultyId(faculty).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (faculty.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (faculty.department || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedFaculty) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Faculty Details View */}
        <div className="mb-6">
          <button
            onClick={() => setSelectedFaculty(null)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Faculty
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Faculty Details</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Faculty Info */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Employee ID</label>
                  <p className="text-gray-900">{getFacultyId(selectedFaculty)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                  <p className="text-gray-900">{getFullName(selectedFaculty)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                  <p className="text-gray-900">{selectedFaculty.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                  <p className="text-gray-900">{selectedFaculty.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Department</label>
                  <p className="text-gray-900">{selectedFaculty.department || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Designation</label>
                  <p className="text-gray-900">{selectedFaculty.designation || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Qualification</label>
                  <p className="text-gray-900">{selectedFaculty.qualification || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Experience</label>
                  <p className="text-gray-900">{selectedFaculty.experience ? `${selectedFaculty.experience} years` : 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedFaculty.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedFaculty.status || 'N/A'}
                  </span>
                </div>
              </div>

              {selectedFaculty.address && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                  <p className="text-gray-900">{selectedFaculty.address}</p>
                </div>
              )}

              {selectedFaculty.specialization && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Specialization</label>
                  <p className="text-gray-900">{selectedFaculty.specialization}</p>
                </div>
              )}
            </div>

            {/* Faculty Stats */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Professional Summary</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Years of Experience</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {selectedFaculty.experience || '0'}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Courses Taught</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {selectedFaculty.courses?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Faculty Management</h1>
          <p className="text-gray-600">Manage faculty members and their information</p>
        </div>
        <LoadingButton
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          loading={false}
        >
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Add Faculty
        </LoadingButton>
      </div>

      {/* Success Message */}
      {successMessage && (
        <SuccessMessage 
          message={successMessage} 
          onClose={() => setSuccessMessage('')}
          className="mb-6"
        />
      )}

      {/* Error Messages */}
      {facultyError && (
        <ErrorMessage 
          error={facultyError} 
          onRetry={refetch}
          className="mb-6"
        />
      )}

      {crudError && (
        <ErrorMessage 
          error={crudError} 
          className="mb-6"
        />
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={safeFormData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full p-2 border rounded-lg ${
                  formErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter full name"
              />
              {formErrors.name && (
                <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={safeFormData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full p-2 border rounded-lg ${
                  formErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="faculty@example.com"
              />
              {formErrors.email && (
                <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={safeFormData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={`w-full p-2 border rounded-lg ${
                  formErrors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+1 (555) 123-4567"
              />
              {formErrors.phone && (
                <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                value={safeFormData.department || ''}
                onChange={(e) => handleChange('department', e.target.value)}
                className={`w-full p-2 border rounded-lg ${
                  formErrors.department ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="English">English</option>
                <option value="History">History</option>
              </select>
              {formErrors.department && (
                <p className="text-red-500 text-xs mt-1">{formErrors.department}</p>
              )}
            </div>

            {/* Designation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation <span className="text-red-500">*</span>
              </label>
              <select
                value={safeFormData.designation || ''}
                onChange={(e) => handleChange('designation', e.target.value)}
                className={`w-full p-2 border rounded-lg ${
                  formErrors.designation ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Designation</option>
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Lecturer">Lecturer</option>
                <option value="Senior Lecturer">Senior Lecturer</option>
              </select>
              {formErrors.designation && (
                <p className="text-red-500 text-xs mt-1">{formErrors.designation}</p>
              )}
            </div>

            {/* Qualification */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => handleChange('qualification', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="e.g., PhD in Computer Science"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => handleChange('experience', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Years of experience"
                min="0"
              />
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => handleChange('specialization', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Area of specialization"
              />
            </div>

            {/* Joining Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
              <input
                type="date"
                value={formData.joiningDate}
                onChange={(e) => handleChange('joiningDate', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => handleChange('salary', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Monthly salary"
                min="0"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
                <option value="Retired">Retired</option>
              </select>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows="3"
                placeholder="Enter full address"
              />
            </div>

            {/* Form Actions */}
            <div className="md:col-span-2 flex gap-4 pt-4">
              <LoadingButton
                type="submit"
                loading={formLoading || crudLoading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                {editingFaculty ? 'Update Faculty' : 'Add Faculty'}
              </LoadingButton>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Faculty List */}
      <div className="bg-white rounded-lg shadow-md">
        {/* Search Bar */}
        <div className="p-6 border-b">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Faculty Table */}
        <div className="overflow-x-auto">
          {facultyLoading ? (
            <TableLoadingSkeleton rows={5} columns={6} />
          ) : filteredFaculty.length === 0 ? (
            <EmptyState 
              title="No faculty found"
              description="No faculty members match your search criteria or no faculty have been added yet."
              action={
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add First Faculty
                </button>
              }
            />
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Faculty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Designation
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
                {filteredFaculty.map((faculty) => (
                  <tr key={faculty._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {getFullName(faculty)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {faculty.qualification || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getFacultyId(faculty)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{faculty.email}</div>
                      <div className="text-sm text-gray-500">{faculty.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {faculty.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {faculty.designation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        faculty.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {faculty.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedFaculty(faculty)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <UserGroupIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(faculty)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(faculty._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                          disabled={crudLoading}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => changePage(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => changePage(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => changePage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => changePage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNum === pagination.page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => changePage(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Faculty;
