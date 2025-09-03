import React, { useState, useEffect } from 'react';
import { 
  SearchIcon, 
  FilterIcon, 
  EyeIcon, 
  ArrowDownTrayIcon, 
  ArrowLeftIcon,
  DocumentTextIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  ChartBarIcon
} from './Icons';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showReportView, setShowReportView] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState('students');
  const [generatedReports, setGeneratedReports] = useState([]);

  const categories = [
    { id: 'student', name: 'Student Reports', icon: UserGroupIcon, color: 'blue' },
    { id: 'faculty', name: 'Faculty Reports', icon: AcademicCapIcon, color: 'green' },
    { id: 'fee', name: 'Fee Reports', icon: CurrencyRupeeIcon, color: 'yellow' },
    { id: 'academic', name: 'Academic Reports', icon: CalendarIcon, color: 'purple' },
    { id: 'performance', name: 'Performance Reports', icon: ChartBarIcon, color: 'red' }
  ];

  const reportOptions = [
    { value: 'students', label: 'Student Report' },
    { value: 'faculty', label: 'Faculty Report' },
    { value: 'courses', label: 'Course Report' },
    { value: 'admissions', label: 'Admission Report' },
    { value: 'examinations', label: 'Examination Report' },
    { value: 'fees', label: 'Fee Report' }
  ];

  // Filter reports based on search and category
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle view report
  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowReportView(true);
  };

  // Handle download report
  const handleDownloadReport = (report) => {
    // Simulate PDF download
    const blob = new Blob(['Sample PDF content for ' + report.title], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Render report content based on category
  const renderReportContent = (report) => {
    switch (report.category) {
      case 'student':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{report.data.totalStudents}</div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{report.data.breakdown?.freshmen || 'N/A'}</div>
                <div className="text-sm text-gray-600">Freshmen</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{report.data.breakdown?.seniors || 'N/A'}</div>
                <div className="text-sm text-gray-600">Seniors</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{report.data.averageAttendance || 'N/A'}%</div>
                <div className="text-sm text-gray-600">Avg Attendance</div>
              </div>
            </div>

            {report.data.courses && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Course Enrollment</h3>
                <div className="bg-white rounded-lg border">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Course</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Enrolled</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Capacity</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Utilization</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {report.data.courses.map((course, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">{course.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{course.enrolled}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{course.capacity}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{width: `${(course.enrolled / course.capacity) * 100}%`}}
                                ></div>
                              </div>
                              <span className="text-gray-600 text-xs">
                                {Math.round((course.enrolled / course.capacity) * 100)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      case 'faculty':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{report.data.totalFaculty}</div>
                <div className="text-sm text-gray-600">Total Faculty</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{report.data.averageRating}</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{report.data.excellentRating}</div>
                <div className="text-sm text-gray-600">Excellent Rating</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{report.data.needsImprovement}</div>
                <div className="text-sm text-gray-600">Needs Improvement</div>
              </div>
            </div>

            {report.data.topPerformers && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Top Performers</h3>
                <div className="bg-white rounded-lg border">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Subject</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {report.data.topPerformers.map((performer, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{performer.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{performer.subject}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              {performer.rating}/5.0
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      case 'fee':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">₹{(report.data.totalCollected / 1000000).toFixed(1)}M</div>
                <div className="text-sm text-gray-600">Total Collected</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">₹{(report.data.totalOutstanding / 1000000).toFixed(1)}M</div>
                <div className="text-sm text-gray-600">Outstanding</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{report.data.collectionRate}%</div>
                <div className="text-sm text-gray-600">Collection Rate</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{report.data.pendingStudents || report.data.studentsCount}</div>
                <div className="text-sm text-gray-600">Pending Students</div>
              </div>
            </div>

            {(report.data.courseWiseFees || report.data.categoryBreakdown) && (
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  {report.data.courseWiseFees ? 'Course-wise Collection' : 'Category Breakdown'}
                </h3>
                <div className="bg-white rounded-lg border">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          {report.data.courseWiseFees ? 'Course' : 'Category'}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          {report.data.courseWiseFees ? 'Collected' : 'Amount'}
                        </th>
                        {report.data.courseWiseFees && (
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Outstanding</th>
                        )}
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          {report.data.courseWiseFees ? 'Status' : 'Students'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(report.data.courseWiseFees || report.data.categoryBreakdown || []).map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.course || item.category || item.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-green-600 font-medium">
                            ₹{((item.collected || item.amount) / 1000).toFixed(0)}K
                          </td>
                          {report.data.courseWiseFees && (
                            <td className="px-4 py-3 text-sm text-red-600 font-medium">
                              ₹{(item.outstanding / 1000).toFixed(0)}K
                            </td>
                          )}
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.students || Math.round((item.collected / (item.collected + item.outstanding)) * 100) + '%'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      case 'academic':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{report.data.totalExams}</div>
                <div className="text-sm text-gray-600">Total Exams</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{report.data.passRate}%</div>
                <div className="text-sm text-gray-600">Pass Rate</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{report.data.averageScore}</div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{report.data.studentsAppeared}</div>
                <div className="text-sm text-gray-600">Students Appeared</div>
              </div>
            </div>

            {report.data.gradeDistribution && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Grade Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {Object.entries(report.data.gradeDistribution).map(([grade, count]) => (
                    <div key={grade} className="text-center p-3 bg-white rounded-lg border">
                      <div className="text-xl font-bold text-gray-900">{count}</div>
                      <div className="text-sm text-gray-500">Grade {grade}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{report.data.coursesAnalyzed}</div>
                <div className="text-sm text-gray-600">Courses Analyzed</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{report.data.averageGPA}</div>
                <div className="text-sm text-gray-600">Average GPA</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-lg font-bold text-yellow-600">{report.data.highestPerforming}</div>
                <div className="text-sm text-gray-600">Highest Performing</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-lg font-bold text-red-600">{report.data.lowestPerforming}</div>
                <div className="text-sm text-gray-600">Needs Attention</div>
              </div>
            </div>

            {report.data.performanceMetrics && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Course Performance Metrics</h3>
                <div className="bg-white rounded-lg border">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Course</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Average GPA</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Pass Rate</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Performance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {report.data.performanceMetrics.map((metric, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">{metric.course}</td>
                          <td className="px-4 py-3 text-sm font-medium text-blue-600">{metric.avgGPA}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{metric.passRate}%</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              metric.passRate >= 95 ? 'bg-green-100 text-green-800' :
                              metric.passRate >= 90 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {metric.passRate >= 95 ? 'Excellent' : metric.passRate >= 90 ? 'Good' : 'Needs Improvement'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            Report content not available for preview.
          </div>
        );
    }
  };

  // Fetch available report types and initial reports
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        // For demo, fetch summary reports for each type
        const reportTypes = [
          { id: 'students', category: 'student', endpoint: reportsAPI.getStudents },
          { id: 'faculty', category: 'faculty', endpoint: reportsAPI.getFaculty },
          { id: 'financial', category: 'fee', endpoint: reportsAPI.getFinancial },
          { id: 'examinations', category: 'academic', endpoint: reportsAPI.getExaminations },
          { id: 'admissions', category: 'student', endpoint: reportsAPI.getAdmissions }
        ];
        const fetchedReports = await Promise.all(reportTypes.map(async (type) => {
          try {
            const result = await type.endpoint();
            const reportData = result?.data?.report || result?.report || result?.data || result;
            return {
              id: type.id,
              title: reportData.title || type.category + ' Report',
              category: type.category,
              description: reportData.title || type.category + ' Report',
              generatedDate: reportData.generatedAt || new Date().toISOString(),
              size: 'N/A',
              pages: 1,
              data: reportData
            };
          } catch (err) {
            return null;
          }
        }));
        setReports(fetchedReports.filter(Boolean));
      } catch (err) {
        setError('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Fetch generated reports from backend
  useEffect(() => {
    const fetchGeneratedReports = async () => {
      try {
        const res = await fetch('/api/generated-reports');
        const json = await res.json();
        setGeneratedReports(json.data || []);
      } catch (err) {
        setGeneratedReports([]);
      }
    };
    fetchGeneratedReports();
  }, []);

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generated-reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: reportType })
      });
      const json = await res.json();
      if (json.status === 'success') {
        setGeneratedReports(prev => [json.data, ...prev]);
      } else {
        setError(json.message || 'Failed to generate report');
      }
    } catch (err) {
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  if (showReportView && selectedReport) {
    // Helper to render JSON as table
    const renderJsonTable = (data) => {
      if (!data || typeof data !== 'object') return <div className="text-center py-8 text-gray-500">No data available.</div>;
      // If array, show as table
      if (Array.isArray(data)) {
        if (data.length === 0) return <div className="text-center py-8 text-gray-500">No rows.</div>;
        const columns = Object.keys(data[0]);
        return (
          <table className="min-w-full border rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                {columns.map(col => (
                  <th key={col} className="px-4 py-2 text-left text-sm font-medium text-gray-500">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((row, idx) => (
                <tr key={idx}>
                  {columns.map(col => (
                    <td key={col} className="px-4 py-2 text-sm text-gray-900">{row[col]?.toString()}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
      // If object, show key-value pairs
      return (
        <table className="min-w-full border rounded-lg">
          <tbody>
            {Object.entries(data).map(([key, value]) => (
              <tr key={key}>
                <td className="px-4 py-2 font-medium text-gray-700 bg-gray-50 w-1/3">{key}</td>
                <td className="px-4 py-2 text-gray-900">{typeof value === 'object' ? JSON.stringify(value) : value?.toString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    };

    // Try to get a valid date
    let generatedDate = selectedReport.generatedDate || selectedReport.generatedAt;
    let dateString = '';
    try {
      dateString = generatedDate ? new Date(generatedDate).toLocaleDateString() : 'N/A';
    } catch {
      dateString = 'N/A';
    }

    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => setShowReportView(false)}
              className="mr-4 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedReport.title || selectedReport.type || 'Report'}</h1>
              <p className="text-sm text-gray-500 mt-1">{selectedReport.description || ''}</p>
            </div>
          </div>
          <button
            onClick={() => handleDownloadReport(selectedReport)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Download PDF
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-500">Generated Date</div>
              <div className="font-medium text-gray-900">{dateString}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">File Size</div>
              <div className="font-medium text-gray-900">{selectedReport.size || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Pages</div>
              <div className="font-medium text-gray-900">{selectedReport.pages || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Category</div>
              <div className="font-medium text-gray-900 capitalize">{selectedReport.category || selectedReport.type || 'N/A'}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Always show generated report data in a table for preview */}
          {renderJsonTable(selectedReport.content || selectedReport.data || selectedReport)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
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
                placeholder="Search reports..."
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
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {categories.map(category => {
          const Icon = category.icon;
          const categoryReports = reports.filter(report => report.category === category.id);
          
          return (
            <div 
              key={category.id} 
              className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                selectedCategory === category.id 
                  ? `bg-${category.color}-50 border-${category.color}-200` 
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedCategory(selectedCategory === category.id ? '' : category.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icon className={`h-6 w-6 ${
                    selectedCategory === category.id 
                      ? `text-${category.color}-600` 
                      : 'text-gray-400'
                  }`} />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">{categoryReports.length}</div>
                    <div className="text-xs text-gray-500">Reports</div>
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <div className="text-sm font-medium text-gray-900">{category.name}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Generation UI */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <select
            value={reportType}
            onChange={e => setReportType(e.target.value)}
            className="block w-full sm:w-64 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {reportOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={handleGenerateReport}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Generated Reports List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Generated Reports ({generatedReports.length})</h2>
        </div>
        {generatedReports.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No generated reports yet.</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {generatedReports.map(report => (
              <div key={report._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
                    <div className="text-xs text-gray-500">{new Date(report.generatedAt).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Type: {report.type}</div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedReport({
                          ...report,
                          // Ensure compatibility with renderReportContent
                          data: report.content || report.data || report
                        });
                        setShowReportView(true);
                      }}
                      className="flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          // Try to fetch PDF from backend
                          const res = await fetch(`/api/generated-reports/${report._id}/export`, {
                            headers: { Accept: 'application/pdf' }
                          });
                          if (res.headers.get('content-type')?.includes('application/pdf')) {
                            const blob = await res.blob();
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${report.title.replace(/\s+/g, '_')}.pdf`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          } else {
                            // Fallback: generate PDF on frontend with table
                            // import('jspdf').then(async ({ jsPDF }) => {
                            //   const doc = new jsPDF();
                            //   doc.setFontSize(16);
                            //   doc.text(report.title, 10, 20);
                            //   doc.setFontSize(12);
                            //   doc.text(`Generated: ${new Date(report.generatedAt || report.generatedDate).toLocaleString()}`, 10, 30);
                            //   doc.text(`Type: ${report.type || report.category || ''}`, 10, 40);
                            //   let y = 50;
                            //   // Table rendering
                            //   const data = report.content || report.data || report;
                            //   if (Array.isArray(data) && data.length > 0) {
                            //     const columns = Object.keys(data[0]);
                            //     // Header
                            //     columns.forEach((col, i) => {
                            //       doc.text(col, 10 + i * 40, y);
                            //     });
                            //     y += 8;
                            //     // Rows
                            //     data.forEach((row) => {
                            //       columns.forEach((col, i) => {
                            //         let val = row[col] !== undefined ? row[col].toString() : '';
                            //         doc.text(val, 10 + i * 40, y);
                            //       });
                            //       y += 8;
                            //     });
                            //   } else if (typeof data === 'object' && data !== null) {
                            //     Object.entries(data).forEach(([key, value], i) => {
                            //       doc.text(key, 10, y);
                            //       doc.text(typeof value === 'object' ? JSON.stringify(value) : value?.toString(), 60, y);
                            //       y += 8;
                            //     });
                            //   } else {
                            //     doc.text(data ? data.toString() : 'No data', 10, y);
                            //   }
                            //   doc.save(`${report.title.replace(/\s+/g, '_')}.pdf`);
                            // });
                          }
                        } catch (err) {
                          alert('Failed to export report');
                        }
                      }}
                      className="flex items-center px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Export
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Available Reports ({filteredReports.length})
          </h2>
        </div>

        {filteredReports.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm || selectedCategory ? 'No reports match your search criteria.' : 'No reports available.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReports.map((report) => {
              const category = categories.find(cat => cat.id === report.category);
              const Icon = category?.icon || DocumentTextIcon;

              return (
                <div key={report.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex">
                      <div className={`p-2 rounded-lg bg-${category?.color || 'gray'}-50`}>
                        <Icon className={`h-6 w-6 text-${category?.color || 'gray'}-600`} />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                        <div className="flex items-center mt-3 text-xs text-gray-400 space-x-4">
                          <span>Generated: {new Date(report.generatedDate).toLocaleDateString()}</span>
                          <span>Size: {report.size}</span>
                          <span>Pages: {report.pages}</span>
                          <span className={`px-2 py-1 rounded-full bg-${category?.color || 'gray'}-100 text-${category?.color || 'gray'}-800`}>
                            {category?.name || 'General'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleViewReport(report)}
                        className="flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleDownloadReport(report)}
                        className="flex items-center px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
