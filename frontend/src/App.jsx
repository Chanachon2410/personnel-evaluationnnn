import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AdminEvaluations from './pages/admin/Evaluations';
import AdminEvaluationDetail from './pages/admin/EvaluationDetail';
import UserManagement from './pages/admin/UserManagement';
import EvaluatorEvaluations from './pages/evaluator/Evaluations';
import EvaluatorAssignmentList from './pages/evaluator/AssignmentList';
import EvaluatorEvaluationForm from './pages/evaluator/EvaluationForm';
import EvaluatorEvaluationResult from './pages/evaluator/EvaluationResult';
import EvaluateeEvaluations from './pages/me/Evaluations';
import EvaluateeEvidenceUpload from './pages/me/EvidenceUpload';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            
            <Route path="/home" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/evaluations" element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminEvaluations />
              </ProtectedRoute>
            } />
            <Route path="/admin/evaluations/:id" element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminEvaluationDetail />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute roles={['ADMIN']}>
                <UserManagement />
              </ProtectedRoute>
            } />

            {/* Evaluator Routes */}
            <Route path="/evaluator/evaluations" element={
              <ProtectedRoute roles={['EVALUATOR', 'ADMIN']}>
                <EvaluatorEvaluations />
              </ProtectedRoute>
            } />
            <Route path="/evaluator/evaluations/:evaluationId" element={
              <ProtectedRoute roles={['EVALUATOR', 'ADMIN']}>
                <EvaluatorAssignmentList />
              </ProtectedRoute>
            } />
            <Route path="/evaluator/assignments/:id" element={
              <ProtectedRoute roles={['EVALUATOR', 'ADMIN']}>
                <EvaluatorEvaluationForm />
              </ProtectedRoute>
            } />
            <Route path="/evaluator/assignments/:id/result" element={
              <ProtectedRoute roles={['EVALUATOR', 'ADMIN']}>
                <EvaluatorEvaluationResult />
              </ProtectedRoute>
            } />

            {/* Evaluatee Routes */}
            <Route path="/me/evaluations" element={
              <ProtectedRoute roles={['EVALUATEE', 'ADMIN', 'EVALUATOR']}>
                <EvaluateeEvaluations />
              </ProtectedRoute>
            } />
            <Route path="/me/evaluations/:evaluationId" element={
              <ProtectedRoute roles={['EVALUATEE', 'ADMIN', 'EVALUATOR']}>
                <EvaluateeEvidenceUpload />
              </ProtectedRoute>
            } />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
