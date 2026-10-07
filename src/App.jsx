import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Dashboard from "./Pages/Dashboard";
import Subjects from "./Pages/Subjects";
import Quiz from "./Pages/Quiz";
import Topics from "./Pages/Topics";
import Home from "./Pages/Home";
import CreateLesson from "./Pages/Dashboard/CreateLesson";
import ManageLessons from "./Pages/Dashboard/ManageLesson";
import EditLesson from "./Pages/Dashboard/EditLesson";
import AdminDashboard from "./Pages/Dashboard/AdminDashboard";
import LessonDetails from "./Pages/Dashboard/LessonDetails";
import CreateSubjectForm from "./Pages/Dashboard/CreateSubjectForm";
import AllSubjects from "./Pages/Dashboard/AllSubjects";
import EditSubjectForm from "./Pages/Dashboard/EditSubjectForm";
import SubjectDetails from "./Pages/Dashboard/SubjectDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import VerifyEmail from "./Pages/VerifyEmail";
import Profile from "./Pages/Profile";
import LessonView from "./Pages/LessonView";
import UserDetails from "./Pages/Userpage/UserDetails";
import PrivacyPolicy from "./Pages/Userpage/PrivacyPolicy";
import Terms from "./Pages/Userpage/Terms";
import AddTaskModal from "./Pages/Userpage/AddTaskModal";
import NotFound from "./Pages/NotFound";
import AdminFeedback from "./Pages/Dashboard/AdminFeedback";
import FeedbackModal from "./components/FeedbackModal";
import AdminRoute from "./Pages/Dashboard/AdminRoute";
import PaymentSuccess from "./Pages/PaymentSuccess";

// Helper component that checks the current path before showing FeedbackModal
function ConditionalFeedbackModal() {
  const location = useLocation();

  // Define paths or path prefixes where FeedbackModal should NOT appear
  const excludedPaths = [
    '/login',
    '/register',
    '/admindashboard',
    '/all-subjects',
    '/create-subject',
    '/manage-lessons',
    '/create-quiz'
  ];

  // Check if current path matches an excluded exact path OR starts with /admin
  const isExcluded =
    excludedPaths.includes(location.pathname) ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/edit-');

  if (isExcluded) {
    return null; // Don't render the modal on admin or auth pages
  }

  return <FeedbackModal />;
}

function App() {
  return (
    <BrowserRouter>
      {/* Renders FeedbackModal globally, except on specified admin & login routes */}
      <ConditionalFeedbackModal />

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/lesson/:subject/:level/:subStrand/:lessonNumber?" element={<LessonView />} />

        {/* GENERAL USER PROTECTED ROUTES */}
        <Route 
          path="/dashboard/:id" 
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/subjects" 
          element={<ProtectedRoute><Subjects /></ProtectedRoute>} 
        />
        <Route 
          path="/quiz" 
          element={<ProtectedRoute><Quiz /></ProtectedRoute>} 
        />
        <Route 
          path="/topics/:subject/:level" 
          element={<ProtectedRoute><Topics /></ProtectedRoute>} 
        />
        <Route 
          path="/lesson/:id" 
          element={<ProtectedRoute><LessonDetails /></ProtectedRoute>} 
        />
        <Route 
          path="/profile/:id" 
          element={<ProtectedRoute><Profile /></ProtectedRoute>} 
        />
        <Route 
          path="/timetable" 
          element={<ProtectedRoute><AddTaskModal /></ProtectedRoute>} 
        />

        {/* ADMIN ONLY ROUTES */}
        <Route 
          path="/admindashboard" 
          element={<AdminRoute><AdminDashboard /></AdminRoute>} 
        />
        <Route 
          path="/admin/feedback" 
          element={<AdminRoute><AdminFeedback /></AdminRoute>} 
        />
        <Route 
          path="/admin/user/:id" 
          element={<AdminRoute><UserDetails /></AdminRoute>} 
        />
        <Route 
          path="/create-quiz" 
          element={<AdminRoute><CreateLesson /></AdminRoute>} 
        />
        <Route 
          path="/manage-lessons" 
          element={<AdminRoute><ManageLessons /></AdminRoute>} 
        />
        <Route 
          path="/edit-lesson/:id" 
          element={<AdminRoute><EditLesson /></AdminRoute>} 
        />
        <Route 
          path="/create-subject" 
          element={<AdminRoute><CreateSubjectForm /></AdminRoute>} 
        />
        <Route 
          path="/all-subjects" 
          element={<AdminRoute><AllSubjects /></AdminRoute>} 
        />
        <Route 
          path="/edit-subject/:id" 
          element={<AdminRoute><EditSubjectForm /></AdminRoute>} 
        />
        <Route 
          path="/subject-details/:id" 
          element={<AdminRoute><SubjectDetails /></AdminRoute>} 
        />

        {/* 404 CATCH-ALL ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;