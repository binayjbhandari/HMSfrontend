import React, { useState, useEffect } from 'react';
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  ArrowLeftIcon
} from './Icons';
import { admissionsAPI } from '../services/api';

const Admissions = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAdmission, setEditingAdmission] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Sample admissions data
  const [admissionsList, setAdmissionsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAdmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await admissionsAPI.getAll();
      let admissions = [];
      if (Array.isArray(result)) {
        admissions = result;
      } else if (result?.admissions) {
        admissions = result.admissions;
      } else if (result?.data?.admissions) {
        admissions = result.data.admissions;
      } else if (result?.data && Array.isArray(result.data)) {
        admissions = result.data;
      }
      setAdmissionsList(admissions);
    } catch (err) {
      setError(err.message || 'Failed to load admissions');
      setAdmissionsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'Male', // default to valid enum value
      address: '',
      nationality: '',
      emergencyContact: {
        name: '',
        relationship: 'Parent', // default to valid enum value
        phone: '' // required
      }
    },
    academicInfo: {
      previousSchool: '',
      graduationYear: '',
      gpa: '',
      subjects: []
    },
    courseInfo: {
      preferredCourse: '',
      courseCode: '', // required
      semester: 'Fall 2024',
      studyMode: 'Full-time'
    },
    financialInfo: {
      admissionFee: 500,
      tuitionFee: 15000,
      scholarshipApplied: false,
      paymentStatus: 'Not Paid'
    },
    notes: ''
  });

  // Available options
  const departments = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Business Administration'];
  const semesters = ['Fall 2024', 'Spring 2025', 'Summer 2025'];
  const studyModes = ['Full-time', 'Part-time'];
  const genders = ['Male', 'Female', 'Other', 'Prefer not to say'];
  const relationships = ['Parent', 'Guardian', 'Spouse', 'Sibling', 'Other'];
  const statusOptions = ['Under Review', 'Approved', 'Rejected', 'Waitlisted'];
  const paymentStatuses = ['Not Paid', 'Pending', 'Paid', 'Refunded'];

  // Filter admissions based on search term and status
  const filteredAdmissions = admissionsList.filter(admission => {
    const matchesSearch = admission.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${admission.personalInfo.firstName} ${admission.personalInfo.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admission.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admission.courseInfo.preferredCourse.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || admission.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Ensure required fields are present and valid
    const safeFormData = {
      ...formData,
      personalInfo: {
        ...formData.personalInfo,
        gender: formData.personalInfo.gender || 'Male',
        emergencyContact: {
          ...formData.personalInfo.emergencyContact,
          relationship: formData.personalInfo.emergencyContact.relationship || 'Parent',
          phone: formData.personalInfo.emergencyContact.phone || '',
        }
      },
      courseInfo: {
        ...formData.courseInfo,
        courseCode: formData.courseInfo.courseCode || '',
      },
      financialInfo: {
        admissionFee: formData.financialInfo?.admissionFee ?? 0,
        tuitionFee: formData.financialInfo?.tuitionFee ?? 0,
        scholarshipApplied: formData.financialInfo?.scholarshipApplied ?? false,
        paymentStatus: formData.financialInfo?.paymentStatus ?? 'Not Paid',
      }
    };
    try {
      if (editingAdmission) {
        await admissionsAPI.update(editingAdmission._id || editingAdmission.id, safeFormData);
      } else {
        await admissionsAPI.create(safeFormData);
      }
      await fetchAdmissions();
      setEditingAdmission(null);
      setShowAddForm(false);
      resetForm();
    } catch (err) {
      setError(err.message || 'Failed to save admission');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: 'Male', // default to valid enum value
        address: '',
        nationality: '',
        emergencyContact: {
          name: '',
          relationship: 'Parent', // default to valid enum value
          phone: '' // required
        }
      },
      academicInfo: {
        previousSchool: '',
        graduationYear: '',
        gpa: '',
        subjects: []
      },
      courseInfo: {
        preferredCourse: '',
        courseCode: '', // required
        semester: 'Fall 2024',
        studyMode: 'Full-time'
      },
      financialInfo: {
        admissionFee: 500,
        tuitionFee: 15000,
        scholarshipApplied: false,
        paymentStatus: 'Not Paid'
      },
      notes: ''
    });
  };

  const handleEdit = (admission) => {
    setFormData({
      personalInfo: { ...admission.personalInfo },
      academicInfo: { ...admission.academicInfo },
      courseInfo: { ...admission.courseInfo },
      financialInfo: { ...admission.financialInfo },
      notes: admission.notes || ''
    });
    setEditingAdmission(admission);
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this admission application?')) {
      setLoading(true);
      setError(null);
      admissionsAPI.delete(id)
        .then(() => fetchAdmissions())
        .catch((err) => setError(err.message || 'Failed to delete admission'))
        .finally(() => setLoading(false));
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingAdmission(null);
    resetForm();
  };

  const updateAdmissionStatus = (id, newStatus) => {
    setAdmissionsList(admissionsList.map(admission =>
      admission.id === id
        ? {
            ...admission,
            status: newStatus,
            reviewedBy: 'Current User',
            reviewDate: new Date().toISOString().split('T')[0]
          }
        : admission
    ));
  };

  const handleStatusChange = async (admission, newStatus) => {
    setLoading(true);
    setError(null);
    try {
      await admissionsAPI.updateStatus(admission._id || admission.id, { status: newStatus });
      await fetchAdmissions();
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  // Stats calculations
  const totalAdmissions = admissionsList.length;
  const approvedAdmissions = admissionsList.filter(a => a.status === 'Approved').length;
  const underReviewAdmissions = admissionsList.filter(a => a.status === 'Under Review').length;
  const totalRevenue = admissionsList
    .filter(a => a.financialInfo?.paymentStatus === 'Paid')
    .reduce((sum, a) => sum + (a.financialInfo?.admissionFee || 0), 0);

  // Show add/edit form page
  if (showAddForm) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={handleCancel}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Admissions
            </button>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {editingAdmission ? 'Edit Admission Application' : 'New Admission Application'}
          </h1>
          <p className="text-gray-600">
            {editingAdmission ? 'Update admission application details' : 'Fill out the admission application form'}
          </p>
        </div>

        {/* Admission Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.personalInfo.firstName}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, firstName: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.personalInfo.lastName}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, lastName: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.personalInfo.email}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, email: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.personalInfo.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, phone: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={formData.personalInfo.dateOfBirth ? formData.personalInfo.dateOfBirth.split('T')[0] : ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, dateOfBirth: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={formData.personalInfo.gender}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, gender: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Gender</option>
                  {genders.map(gender => (
                    <option key={gender} value={gender}>{gender}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <input
                  type="text"
                  value={formData.personalInfo.nationality}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, nationality: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                rows="3"
                value={formData.personalInfo.address}
                onChange={(e) => setFormData({
                  ...formData,
                  personalInfo: { ...formData.personalInfo, address: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Emergency Contact */}
            <h4 className="text-md font-medium text-gray-900 mt-6 mb-4">Emergency Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={formData.personalInfo.emergencyContact.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: {
                      ...formData.personalInfo,
                      emergencyContact: { ...formData.personalInfo.emergencyContact, name: e.target.value }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship *</label>
                <select
                  required
                  value={formData.personalInfo.emergencyContact.relationship}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: {
                      ...formData.personalInfo,
                      emergencyContact: { ...formData.personalInfo.emergencyContact, relationship: e.target.value }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Relationship</option>
                  {relationships.map(rel => (
                    <option key={rel} value={rel}>{rel}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.personalInfo.emergencyContact.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: {
                      ...formData.personalInfo,
                      emergencyContact: { ...formData.personalInfo.emergencyContact, phone: e.target.value }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Background</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Previous School *</label>
                <input
                  type="text"
                  required
                  value={formData.academicInfo.previousSchool}
                  onChange={(e) => setFormData({
                    ...formData,
                    academicInfo: { ...formData.academicInfo, previousSchool: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year *</label>
                <input
                  type="number"
                  required
                  min="2020"
                  max="2030"
                  value={formData.academicInfo.graduationYear}
                  onChange={(e) => setFormData({
                    ...formData,
                    academicInfo: { ...formData.academicInfo, graduationYear: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GPA *</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="4"
                  step="0.1"
                  value={formData.academicInfo.gpa}
                  onChange={(e) => setFormData({
                    ...formData,
                    academicInfo: { ...formData.academicInfo, gpa: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Course Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Course Selection</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Course *</label>
                <select
                  required
                  value={formData.courseInfo.preferredCourse}
                  onChange={(e) => setFormData({
                    ...formData,
                    courseInfo: { ...formData.courseInfo, preferredCourse: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Course</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
                <select
                  required
                  value={formData.courseInfo.semester}
                  onChange={(e) => setFormData({
                    ...formData,
                    courseInfo: { ...formData.courseInfo, semester: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {semesters.map(semester => (
                    <option key={semester} value={semester}>{semester}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Study Mode *</label>
                <select
                  required
                  value={formData.courseInfo.studyMode}
                  onChange={(e) => setFormData({
                    ...formData,
                    courseInfo: { ...formData.courseInfo, studyMode: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {studyModes.map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Code *</label>
                <input
                  type="text"
                  required
                  value={formData.courseInfo.courseCode}
                  onChange={(e) => setFormData({
                    ...formData,
                    courseInfo: { ...formData.courseInfo, courseCode: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., CS101"
                />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Fee ($)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.financialInfo.admissionFee}
                  onChange={(e) => setFormData({
                    ...formData,
                    financialInfo: { ...formData.financialInfo, admissionFee: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tuition Fee ($)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.financialInfo.tuitionFee}
                  onChange={(e) => setFormData({
                    ...formData,
                    financialInfo: { ...formData.financialInfo, tuitionFee: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                <select
                  value={formData.financialInfo.paymentStatus}
                  onChange={(e) => setFormData({
                    ...formData,
                    financialInfo: { ...formData.financialInfo, paymentStatus: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {paymentStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="scholarshipApplied"
                  checked={formData.financialInfo.scholarshipApplied}
                  onChange={(e) => setFormData({
                    ...formData,
                    financialInfo: { ...formData.financialInfo, scholarshipApplied: e.target.checked }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="scholarshipApplied" className="ml-2 text-sm font-medium text-gray-700">
                  Applied for Scholarship
                </label>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h3>
            <textarea
              rows="4"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional information or special requirements..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {editingAdmission ? 'Update Application' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Admissions Management</h1>
        <p className="text-gray-600">Manage student admission applications and registration process</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <ClipboardDocumentListIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-semibold text-gray-900">{totalAdmissions}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-semibold text-gray-900">{approvedAdmissions}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Under Review</p>
              <p className="text-2xl font-semibold text-gray-900">{underReviewAdmissions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-50 rounded-lg">
              <CurrencyRupeeIcon className="h-6 w-6 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Fee Collection</p>
              <p className="text-2xl font-semibold text-gray-900">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by application ID, name, email, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Status</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Add Application Button */}
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Application
          </button>
        </div>
      </div>

      {/* Admissions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Admission Applications ({filteredAdmissions.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Financial
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
              {filteredAdmissions.map((admission, idx) => (
                <tr key={admission._id || admission.id || idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{admission.applicationId}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {admission.applicationDate}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {admission.personalInfo.firstName[0]}{admission.personalInfo.lastName[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {admission.personalInfo.firstName} {admission.personalInfo.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{admission.personalInfo.email}</div>
                        <div className="text-sm text-gray-500">GPA: {admission.academicInfo.gpa}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{admission.courseInfo.preferredCourse}</div>
                      <div className="text-gray-500">{admission.courseInfo.semester}</div>
                      <div className="text-gray-500">{admission.courseInfo.studyMode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">${admission.financialInfo?.admissionFee || 0}</div>
                      <div className={`text-xs px-2 py-1 rounded-full inline-flex items-center ${
                        admission.financialInfo?.paymentStatus === 'Paid' 
                          ? 'bg-green-100 text-green-800'
                          : admission.financialInfo?.paymentStatus === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {admission.financialInfo?.paymentStatus || 'N/A'}
                      </div>
                      {admission.financialInfo?.scholarshipApplied && (
                        <div className="text-xs text-blue-600 mt-1">Scholarship Applied</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={admission.status}
                      onChange={(e) => handleStatusChange(admission, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${
                        admission.status === 'Approved' 
                          ? 'bg-green-100 text-green-800'
                          : admission.status === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : admission.status === 'Waitlisted'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(admission)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(admission.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAdmissions.length === 0 && (
          <div className="text-center py-12">
            <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'All' 
                ? 'Try adjusting your search criteria or filters.' 
                : 'Get started by creating a new admission application.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admissions;
