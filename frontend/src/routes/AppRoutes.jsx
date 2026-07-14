import { Routes, Route } from 'react-router-dom';
import { RegisterRequesterPage } from '@/pages/RegisterRequesterPage';
import { RegisterScholarshipStudentPage } from '@/pages/RegisterScholarshipStudentPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/register" element={<RegisterRequesterPage />} />
      <Route path="/register/bolsista" element={<RegisterScholarshipStudentPage />} />
    </Routes>
  );
}