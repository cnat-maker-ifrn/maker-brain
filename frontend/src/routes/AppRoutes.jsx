import { Routes, Route } from 'react-router-dom';
import { RegisterRequesterPage } from '@/pages/RegisterRequesterPage';
import { RegisterScholarshipStudentPage } from '@/pages/RegisterScholarshipStudentPage';
import { LoginPage } from '@/pages/LoginPage';
import ScholarshipStudentsApprovalPage from '@/pages/ScholarshipStudentApprovalPage';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/register" element={<RegisterRequesterPage />} />
      <Route path="/register/bolsista" element={<RegisterScholarshipStudentPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute allowedGroups={['Owners', 'Managers']} />}>
        <Route path="/scholarship-students/pending" element={<ScholarshipStudentsApprovalPage />} />
      </Route>
    </Routes>
  );
}