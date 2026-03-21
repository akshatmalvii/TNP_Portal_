import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import LoginPage from './pages/LoginPage'
import DashboardLayout from './components/DashboardLayout'
import StudentDashboardPage from './pages/student/StudentDashboardPage'
import StudentApplicationPage from './pages/student/StudentApplicationPage'
import StudentDrivePage from './pages/student/StudentDrivePage'
import StudentProfilePage from './pages/student/StudentProfilePage'
import StudentSettingPage from './pages/student/StudentSettingPage'
import CoordinatorDashboardPage from './pages/coordinator/CoordinatorDashboardPage'
import PendingPage from './pages/coordinator/PendingPage'
import SettingsPage from './pages/coordinator/SettingsPage'
import StudentsPage from './pages/coordinator/StudentsPage'
import VerificationsPage from './pages/coordinator/VerificationsPage'
import TPODashboardPage from './pages/tpo/TPODashboardPage'
import TPODrivesPage from './pages/tpo/TPODrivesPage'
import CompaniesPage from './pages/tpo/CompaniesPage'
import ApprovalsPage from './pages/tpo/ApprovalsPage'
import AnalyticsPage from './pages/tpo/AnalyticsPage'
import TPOSettingsPage from './pages/tpo/TPOSettingsPage'

function App() {

  return (
    <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route path="student" element={<StudentDashboardPage />} />
            <Route path="student/applications" element={<StudentApplicationPage />} />
            <Route path="student/drives" element={<StudentDrivePage />} />
            <Route path="student/profile" element={<StudentProfilePage />} />
            <Route path="student/settings" element={<StudentSettingPage />} />
            <Route path="coordinator" element={<CoordinatorDashboardPage />} />
            <Route path="coordinator/pending" element={<PendingPage />} />
            <Route path="coordinator/settings" element={<SettingsPage />} />
            <Route path="coordinator/students" element={<StudentsPage />} />
            <Route path="coordinator/verifications" element={<VerificationsPage />} />
            <Route path="tpo" element={<TPODashboardPage />} />
            <Route path="tpo/drives" element={<TPODrivesPage />} />
            <Route path="tpo/companies" element={<CompaniesPage />} />
            <Route path="tpo/approvals" element={<ApprovalsPage />} />
            <Route path="tpo/analytics" element={<AnalyticsPage />} />
            <Route path="tpo/settings" element={<TPOSettingsPage />} />
          </Route>
        </Routes>
    </Router>
  )
}

export default App
