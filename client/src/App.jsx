import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import './index.css';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardLayout from './components/DashboardLayout';

// Student pages
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import StudentApplicationPage from './pages/student/StudentApplicationPage';
import StudentDrivePage from './pages/student/StudentDrivePage';
import StudentProfilePage from './pages/student/StudentProfilePage';
import StudentSettingPage from './pages/student/StudentSettingPage';
import StudentProfileFormPage from './pages/student/StudentProfileFormPage';
import VerificationPendingPage from './pages/student/VerificationPendingPage';
import StudentNotificationsPage from './pages/student/StudentNotificationsPage';
import OfferLetterPage from './pages/student/OfferLetterPage';

// Coordinator pages
import SettingsPage from './pages/coordinator/SettingsPage';
import StudentsPage from './pages/coordinator/StudentsPage';
import VerificationsPage from './pages/coordinator/VerificationsPage';
import DriveUpdatesPage from './pages/coordinator/DriveUpdatesPage';
import CreateDrivePage from './pages/coordinator/CreateDrivePage';
import CoordinatorCompaniesPage from './pages/coordinator/CompaniesPage';

// TPO pages
import TPODrivesPage from './pages/tpo/TPODrivesPage';
import CompaniesPage from './pages/tpo/CompaniesPage';
import TPOOfferLettersPage from './pages/tpo/OfferLettersPage';
import ApprovalsPage from './pages/tpo/ApprovalsPage';
import ManageCoordinatorsPage from './pages/tpo/ManageCoordinatorsPage';
import TPOSettingsPage from './pages/tpo/TPOSettingsPage';
import PlacementPolicyPage from './pages/tpo/PlacementPolicyPage';
import TPOReportsPage from './pages/tpo/ReportsPage';
import PlacementSeasonPage from './pages/tpo/PlacementSeasonPage';

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
                <Route path='/forgot-password' element={<ForgotPasswordPage />} />
                <Route path='/reset-password' element={<ResetPasswordPage />} />
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
                        path='student/notifications'
                        element={<StudentNotificationsPage />}
                    />
                    <Route
                        path='student/offer-letter'
                        element={<OfferLetterPage />}
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
                        element={<Navigate to='/dashboard/coordinator/students' replace />}
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
                    <Route
                        path='coordinator/create-drive'
                        element={<CreateDrivePage />}
                    />
                    <Route
                        path='coordinator/drive-updates'
                        element={<DriveUpdatesPage />}
                    />
                    <Route
                        path='coordinator/companies'
                        element={<CoordinatorCompaniesPage />}
                    />

                    {/* TPO */}
                    <Route
                        path='tpo'
                        element={<Navigate to='/dashboard/tpo/placement-season' replace />}
                    />
                    <Route
                        path='tpo/coordinators'
                        element={<ManageCoordinatorsPage />}
                    />
                    <Route
                        path='tpo/placement-season'
                        element={<PlacementSeasonPage />}
                    />
                    <Route
                        path='tpo/policy'
                        element={<PlacementPolicyPage />}
                    />
                    <Route path='tpo/drives' element={<TPODrivesPage />} />
                    <Route path='tpo/companies' element={<CompaniesPage />} />
                    <Route path='tpo/approvals' element={<ApprovalsPage />} />
                    <Route path='tpo/offer-letters' element={<TPOOfferLettersPage />} />
                    <Route
                        path='tpo/analytics'
                        element={<Navigate to='/dashboard/tpo/reports' replace />}
                    />
                    <Route path='tpo/reports' element={<TPOReportsPage />} />
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




