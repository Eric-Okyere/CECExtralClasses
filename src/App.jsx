import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login"
import Register from "./Pages/Register"
import Dashboard from "./Pages/Dashboard";
import Subjects from "./Pages/Subjects"
import Lesson from "./Pages/Lesson"
import Quiz from "./Pages/Quiz"
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* PROTECTED ROUTES */}
        <Route 
          path="/dashboard" 
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
          path="/create-quiz" 
          element={<ProtectedRoute><CreateLesson /></ProtectedRoute>} 
        />
        <Route 
          path="/manage-lessons" 
          element={<ProtectedRoute><ManageLessons /></ProtectedRoute>} 
        />
        <Route 
          path="/create-subject" 
          element={<ProtectedRoute><CreateSubjectForm /></ProtectedRoute>} 
        />
      
        <Route 
          path="/all-subjects" 
          element={<ProtectedRoute><AllSubjects /></ProtectedRoute>} 
        />
        <Route 
          path="/edit-lesson/:id" 
          element={<ProtectedRoute><EditLesson /></ProtectedRoute>} 
        />
        <Route 
          path="/subject-details/:id" 
          element={<ProtectedRoute><SubjectDetails /></ProtectedRoute>} 
        />
        <Route 
          path="/admindashboard" 
          element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/edit-subject/:id" 
          element={<ProtectedRoute><EditSubjectForm /></ProtectedRoute>} 
        />
        <Route path="/lesson/:subject/:level/:subStrand" element={<LessonView />} />
        <Route 
          path="/topics/:subject/:level" 
          element={<ProtectedRoute><Topics /></ProtectedRoute>} 
        />
        <Route 
          path="/lesson/:subject/:level/:sub" 
          element={<ProtectedRoute><Lesson /></ProtectedRoute>} 
        />

        <Route path="/lesson/:id" element={
          <ProtectedRoute>
            <LessonDetails />
          </ProtectedRoute>
        } />
        <Route path="/profile/:id" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;