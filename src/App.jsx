import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Faculty from './components/Faculty';
import Courses from './components/Courses';
import Students from './components/Students';
import Admissions from './components/Admissions';
import Examinations from './components/Examinations';
import FeeManagement from './components/FeeManagement';
import Timetable from './components/Timetable';
import Reports from './components/Reports';
import Notifications from './components/Notifications';
import Settings from './components/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="faculty" element={<Faculty />} />
          <Route path="courses" element={<Courses />} />
          <Route path="students" element={<Students />} />
          <Route path="admissions" element={<Admissions />} />
          <Route path="examinations" element={<Examinations />} />
          <Route path="fee-management" element={<FeeManagement />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
