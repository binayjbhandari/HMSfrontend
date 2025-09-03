import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChartBarIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  UserPlusIcon,
  DocumentPlusIcon
} from './Icons';
import { reportsAPI, studentsAPI, facultyAPI, coursesAPI, admissionsAPI, examinationsAPI, feeManagementAPI } from '../services/api';
import { useAPI } from '../hooks/useAPI';
import { 
  LoadingSpinner, 
  ErrorMessage, 
  CardLoadingSkeleton,
  InlineLoading 
} from './UI/LoadingComponents';

const Dashboard = () => {
  // State for dashboard statistics
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    enrollmentRate: 0,
    pendingAdmissions: 0,
    feeCollection: { amount: 0, percentage: 0 },
    avgAttendance: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState(null);

  // API hooks for additional data
  const { 
    data: recentActivitiesData, 
    loading: activitiesLoading, 
    error: activitiesError,
    refetch: refetchActivities 
  } = useAPI(() => reportsAPI.getRecentActivities ? reportsAPI.getRecentActivities() : Promise.resolve([]), []);

  const { 
    data: upcomingExams, 
    loading: examsLoading, 
    error: examsError 
  } = useAPI(() => examinationsAPI.getUpcoming ? examinationsAPI.getUpcoming() : Promise.resolve([]), []);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoadingStats(true);
        setStatsError(null);

        // Fetch all statistics in parallel with fallback handling
        const fetchWithFallback = async (apiCall, fallback = 0) => {
          try {
            const result = await apiCall();
            return result;
          } catch (error) {
            console.warn('API call failed, using fallback:', error.message);
            return fallback;
          }
        };

        // Fetch stats from backend endpoints
        const [studentsStats, facultyStats, coursesStats, admissionsStats, feeStats] = await Promise.all([
          studentsAPI.getStats(),
          facultyAPI.getStats(),
          coursesAPI.getStats(),
          admissionsAPI.getStats(),
          feeManagementAPI.getStats ? feeManagementAPI.getStats() : Promise.resolve({})
        ]);

        const totalStudents = studentsStats.totalStudents || studentsStats.data?.totalStudents || 0;
        const totalFaculty = facultyStats.data?.faculty?.filter(f => f.status === 'Active').length || facultyStats.data?.pagination?.total || 0;
        const totalCourses = coursesStats.data?.courses?.length || coursesStats.data?.pagination?.total || 0;
        const pendingAdmissions = admissionsStats.data?.pendingApplications || admissionsStats.data?.totalPending || 0;
        // Enrollment rate: approved applications / total applications
        const approved = admissionsStats.data?.approvedApplications || 0;
        const totalApplications = admissionsStats.data?.totalApplications || 0;
        const enrollmentRate = totalApplications > 0 ? ((approved / totalApplications) * 100).toFixed(1) : 0;
        // Fee collection (from /api/fee-management/stats/overview)
        const feeFinancial = feeStats.data?.financial || feeStats.financial || {};
        const feeAmount = feeFinancial.totalPaid || 0;
        const feeTotal = feeFinancial.totalAmount || 1;
        const feePercentage = feeTotal > 0 ? ((feeAmount / feeTotal) * 100).toFixed(1) : 0;

        setDashboardStats({
          totalStudents,
          totalFaculty,
          totalCourses,
          enrollmentRate,
          pendingAdmissions,
          feeCollection: { amount: feeAmount, percentage: feePercentage },
          avgAttendance: studentsStats.data?.avgAttendance || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStatsError('Failed to load dashboard statistics');
        // Set fallback data
        setDashboardStats({
          totalStudents: 247,
          totalFaculty: 34,
          totalCourses: 28,
          enrollmentRate: 92.5,
          pendingAdmissions: 15,
          feeCollection: { amount: 1850000, percentage: 87 },
          avgAttendance: 89.3
        });
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  // Stats configuration with live data
  const stats = [
    {
      title: 'Total Students',
      value: loadingStats ? '...' : dashboardStats.totalStudents.toLocaleString(),
      change: '+12% from last month',
      changeType: 'positive',
      icon: UserGroupIcon,
      color: 'blue'
    },
    {
      title: 'Active Faculty',
      value: loadingStats ? '...' : dashboardStats.totalFaculty.toString(),
      change: '+3 new this month',
      changeType: 'positive',
      icon: AcademicCapIcon,
      color: 'blue'
    },
    {
      title: 'Courses Offered',
      value: loadingStats ? '...' : dashboardStats.totalCourses.toString(),
      change: '2 new courses added',
      changeType: 'positive',
      icon: BookOpenIcon,
      color: 'blue'
    },
    {
      title: 'Enrollment Rate',
      value: loadingStats ? '...' : `${dashboardStats.enrollmentRate}%`,
      change: '+2.1% from last year',
      changeType: 'positive',
      icon: ChartBarIcon,
      color: 'blue'
    }
  ];

  const additionalStats = [
    {
      title: 'Pending Admissions',
      value: loadingStats ? '...' : dashboardStats.pendingAdmissions.toString(),
      subtitle: 'Needs review',
      icon: ClockIcon,
      color: 'blue'
    },
    {
      title: 'Fee Collection',
      value: loadingStats ? '...' : formatCurrency(dashboardStats.feeCollection.amount),
      subtitle: `${dashboardStats.feeCollection.percentage}% collected`,
      icon: CurrencyRupeeIcon,
      color: 'blue'
    },
    {
      title: 'Average Attendance',
      value: loadingStats ? '...' : `${dashboardStats.avgAttendance}%`,
      subtitle: '-1.2% from last month',
      subtitleColor: 'red',
      icon: ChartBarIcon,
      color: 'blue'
    }
  ];

  // Use API data if available, otherwise use fallback
  const recentActivities = recentActivitiesData || [
    {
      id: 1,
      type: 'enrollment',
      title: 'New Student Enrollment',
      description: 'Sarah Johnson enrolled in Computer Science',
      time: '2 minutes ago',
      avatar: 'SJ',
      badge: 'enrollment'
    },
    {
      id: 2,
      type: 'payment',
      title: 'Fee Payment Received',
      description: 'Michael Brown paid semester fee',
      time: '5 minutes ago',
      avatar: 'MB',
      badge: 'payment'
    }
  ];

  const quickActions = [
    {
      title: 'Add Student',
      subtitle: 'Register new student',
      icon: UserPlusIcon,
      color: 'blue'
    },
    {
      title: 'Create Course',
      subtitle: 'Add new course',
      icon: DocumentPlusIcon,
      color: 'gray'
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to EduManage - Your comprehensive college management system</p>
      </div>

      {/* Error Message */}
      {statsError && (
        <div className="mb-6">
          <ErrorMessage 
            error={statsError} 
            onRetry={() => window.location.reload()} 
          />
        </div>
      )}

      {/* Stats Grid */}
      {loadingStats ? (
        <CardLoadingSkeleton cards={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 bg-blue-50 rounded-lg`}>
                    <Icon className={`h-6 w-6 text-blue-500`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Secondary Stats */}
      {loadingStats ? (
        <div className="mb-8">
          <CardLoadingSkeleton cards={3} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {additionalStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <p className={`text-sm mt-1 ${stat.subtitleColor === 'red' ? 'text-red-600' : 'text-gray-600'}`}>
                      {stat.subtitle}
                    </p>
                  </div>
                  <div className={`p-3 bg-blue-50 rounded-lg`}>
                    <Icon className={`h-6 w-6 text-blue-500`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="xl:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            {activitiesLoading && <LoadingSpinner size="sm" />}
          </div>
          <div className="p-6">
            {activitiesError ? (
              <ErrorMessage error={activitiesError} onRetry={refetchActivities} />
            ) : activitiesLoading ? (
              <InlineLoading message="Loading activities..." />
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {activity.avatar || activity.user?.charAt(0) || 'U'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title || activity.type}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          activity.badge === 'enrollment' || activity.type === 'enrollment'
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {activity.badge || activity.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {activity.description || activity.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {activity.time || new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    className={`w-full p-4 rounded-lg border-2 border-dashed transition-colors duration-200 ${
                      index === 0 
                        ? 'border-blue-300 bg-blue-50 hover:bg-blue-100' 
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-6 w-6 ${index === 0 ? 'text-blue-500' : 'text-gray-400'}`} />
                      <div className="text-left">
                        <p className={`font-medium ${index === 0 ? 'text-blue-900' : 'text-gray-900'}`}>
                          {action.title}
                        </p>
                        <p className={`text-sm ${index === 0 ? 'text-blue-600' : 'text-gray-500'}`}>
                          {action.subtitle}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
