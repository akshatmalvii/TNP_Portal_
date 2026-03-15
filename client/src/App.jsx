import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import LoginPage from './pages/LoginPage'
import DashboardLayout from './components/DashboardLayout'
import StudentDashboardPage from './pages/student/StudentDashboardPage'
import StudentApplicationPage from './pages/student/StudentApplicationPage'
import StudentDrivePage from './pages/student/StudentDrivePage'
import StudentProfilePage from './pages/student/StudentProfilePage'
import StudentSettingPage from './pages/student/StudentSettingPage'

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
          </Route>
        </Routes>
    </Router>
  )
}

export default App
