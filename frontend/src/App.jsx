import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

/* ================= STUDENT PAGES ================= */

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import Mock from "./pages/Mock";
import DPP from "./pages/DPP";
import Feedback from "./pages/Feedback";

/* ================= ADMIN PAGES ================= */

import AdminDashboard from "./admin/AdminDashboard";
import UploadQuestions from "./admin/UploadQuestions";
import Questions from "./admin/Questions";
import Students from "./admin/Students";
import AdminAnalytics from "./admin/AdminAnalytics";

function App() {
  return (
    <Routes>

      {/* DEFAULT */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* AUTH */}
      <Route path="/login" element={<Login />} />

      {/* STUDENT */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/mock" element={<Mock />} />
      <Route path="/dpp" element={<DPP />} />
      <Route path="/feedback" element={<Feedback />} />

      {/* ADMIN */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/upload" element={<UploadQuestions />} />
      <Route path="/admin/questions" element={<Questions />} />
      <Route path="/admin/students" element={<Students />} />
      <Route path="/admin/analytics" element={<AdminAnalytics />} />

      {/* NOT FOUND */}
      <Route path="*" element={<Navigate to="/login" />} />

    </Routes>
  );
}

export default App;