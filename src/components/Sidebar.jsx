import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UserGroupIcon, 
  AcademicCapIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  DocumentChartBarIcon,
  BellIcon,
  Cog6ToothIcon
} from './Icons';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon, path: '/dashboard' },
    { id: 'students', name: 'Students', icon: UserGroupIcon, path: '/students' },
    { id: 'faculty', name: 'Faculty', icon: AcademicCapIcon, path: '/faculty' },
    { id: 'courses', name: 'Courses', icon: BookOpenIcon, path: '/courses' },
    { id: 'admissions', name: 'Admissions', icon: ClipboardDocumentListIcon, path: '/admissions' },
    { id: 'examinations', name: 'Examinations', icon: ExclamationTriangleIcon, path: '/examinations' },
    { id: 'fee-management', name: 'Fee Management', icon: DocumentChartBarIcon, path: '/fee-management' },
    { id: 'timetable', name: 'Timetable', icon: CalendarIcon, path: '/timetable' },
    { id: 'reports', name: 'Reports', icon: DocumentChartBarIcon, path: '/reports' },
    { id: 'notifications', name: 'Notifications', icon: BellIcon, path: '/notifications' },
    { id: 'settings', name: 'Settings', icon: Cog6ToothIcon, path: '/settings' },
  ];

  return (
    <div className="bg-white w-64 min-h-screen shadow-sm border-r border-gray-200">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 text-lg">EduManage</h1>
            <p className="text-sm text-gray-500">Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        <div className="px-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Navigation
          </p>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
