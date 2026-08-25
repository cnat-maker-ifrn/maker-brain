import { Routes, Route } from 'react-router-dom';
import { RegisterRequesterPage } from '@/pages/RegisterRequesterPage';
import { RegisterScholarshipStudentPage } from '@/pages/RegisterScholarshipStudentPage';
import { LoginPage } from '@/pages/LoginPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/register" element={<RegisterRequesterPage />} />
      <Route path="/register/bolsista" element={<RegisterScholarshipStudentPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/scholarship-students/pending" element={<ProtectedRoute allowedGroups={['Owners', 'Managers']}><ScholarshipStudentsApprovalPage /></ProtectedRoute>}/>
    </Routes>
  );
}