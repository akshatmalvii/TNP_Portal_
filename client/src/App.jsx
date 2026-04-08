import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './index.css';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';

// Student pages
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import StudentApplicationPage from './pages/student/StudentApplicationPage';
import StudentDrivePage from './pages/student/StudentDrivePage';
import StudentProfilePage from './pages/student/StudentProfilePage';
import StudentSettingPage from './pages/student/StudentSettingPage';
import StudentProfileFormPage from './pages/student/StudentProfileFormPage';
import VerificationPendingPage from './pages/student/VerificationPendingPage';

// Coordinator pages
import CoordinatorDashboardPage from './pages/coordinator/CoordinatorDashboardPage';
import PendingPage from './pages/coordinator/PendingPage';
import SettingsPage from './pages/coordinator/SettingsPage';
import StudentsPage from './pages/coordinator/StudentsPage';
import VerificationsPage from './pages/coordinator/VerificationsPage';

// TPO pages
import TPODashboardPage from './pages/tpo/TPODashboardPage';
import TPODrivesPage from './pages/tpo/TPODrivesPage';
import CompaniesPage from './pages/tpo/CompaniesPage';
import ApprovalsPage from './pages/tpo/ApprovalsPage';
import AnalyticsPage from './pages/tpo/AnalyticsPage';
import ManageCoordinatorsPage from './pages/tpo/ManageCoordinatorsPage';
import TPOSettingsPage from './pages/tpo/TPOSettingsPage';

// TPO Head pages
import TPOHeadDashboardPage from './pages/tpohead/TPOHeadDashboardPage';
import DepartmentsPage from './pages/tpohead/DepartmentsPage';
import ManageTPOsPage from './pages/tpohead/ManageTPOsPage';
import ReportsPage from './pages/tpohead/ReportsPage';
import TPOHeadSettingsPage from './pages/tpohead/SettingsPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path='/' element={<LoginPage />} />
                <Route path='/login' element={<LoginPage />} />
                <Route path='/dashboard' element={<DashboardLayout />}>
                    {/* Student */}
                    <Route path='student' element={<StudentDashboardPage />} />
                    <Route
                        path='student/applications'
                        element={<StudentApplicationPage />}
                    />
                    <Route
                        path='student/drives'
                        element={<StudentDrivePage />}
                    />
                    <Route
                        path='student/profile'
                        element={<StudentProfilePage />}
                    />
                    <Route
                        path='student/settings'
                        element={<StudentSettingPage />}
                    />
                    <Route
                        path='student/profile-form'
                        element={<StudentProfileFormPage />}
                    />
                    <Route
                        path='student/verification-pending'
                        element={<VerificationPendingPage />}
                    />

                    {/* Coordinator */}
                    <Route
                        path='coordinator'
                        element={<CoordinatorDashboardPage />}
                    />
                    <Route
                        path='coordinator/pending'
                        element={<PendingPage />}
                    />
                    <Route
                        path='coordinator/settings'
                        element={<SettingsPage />}
                    />
                    <Route
                        path='coordinator/students'
                        element={<StudentsPage />}
                    />
                    <Route
                        path='coordinator/verifications'
                        element={<VerificationsPage />}
                    />

                    {/* TPO */}
                    <Route path='tpo' element={<TPODashboardPage />} />
                    <Route
                        path='tpo/coordinators'
                        element={<ManageCoordinatorsPage />}
                    />
                    <Route path='tpo/drives' element={<TPODrivesPage />} />
                    <Route path='tpo/companies' element={<CompaniesPage />} />
                    <Route path='tpo/approvals' element={<ApprovalsPage />} />
                    <Route path='tpo/analytics' element={<AnalyticsPage />} />
                    <Route path='tpo/settings' element={<TPOSettingsPage />} />

                    {/* TPO Head */}
                    <Route path='tpohead' element={<TPOHeadDashboardPage />} />
                    <Route
                        path='tpohead/departments'
                        element={<DepartmentsPage />}
                    />
                    <Route path='tpohead/tpos' element={<ManageTPOsPage />} />
                    <Route path='tpohead/reports' element={<ReportsPage />} />
                    <Route
                        path='tpohead/settings'
                        element={<TPOHeadSettingsPage />}
                    />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
