import { useState, useEffect, useRef } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "./App.css";

import Layout from "./components/Layout";
import Login from "./components/pages/Login";
import Dashboard from "./components/pages/Dashboard";
import Chapters from "./components/pages/Chapters";
import Lessons from "./components/pages/Lessons";
import Topics from "./components/pages/Topics";
import SubTopicAtoZ from "./components/pages/SubTopicAtoZ";
import ChatCategories from "./components/pages/ChatCategories";
import Quizzes from "./components/pages/Qizzes";
import Subscriptions from "./components/pages/Subscriptions";
import Discounts from "./components/pages/Discounts";
import OnboardingQuestions from "./components/pages/OnboardingQstns";
import Users from "./components/pages/User";
import GrammerSub from "./components/pages/GrammerSub";
import Languages from "./components/pages/Languages";
import NativeLang from "./components/pages/NativeLang";
import PushNotifications from "./components/pages/Notification";
import PushMessages from "./components/pages/PushMessages";
import Payments from "./components/pages/Payments";

const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;

// =====================
// AUTH CHECK (PURE)
// =====================
const checkAuth = () => {
  const token = localStorage.getItem("adminToken");
  const expiry = localStorage.getItem("adminExpiry");

  if (!token || !expiry) return false;

  if (Date.now() > Number(expiry)) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminExpiry");
    return false;
  }

  return true;
};

function App() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuth);
  const justLoggedIn = useRef(false);

  // =====================
  // SESSION EXPIRY WATCHER
  // =====================
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      // Skip check if we just logged in (give it 30 seconds to stabilize)
      if (justLoggedIn.current) return;
      
      if (!checkAuth()) {
        setIsAuthenticated(false);
        navigate("/login");
        alert("Session expired. Please log in again.");
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isAuthenticated, navigate]);

  // =====================
  // LOGIN HANDLER
  // =====================
  const handleLogin = () => {
    // Double-check that localStorage has the token
    if (!checkAuth()) {
      console.error("Login failed: Token not in localStorage");
      alert("Login failed. Please try again.");
      return;
    }

    console.log("Login successful - setting authenticated state");
    
    // Set flag to prevent session watcher from interfering temporarily
    justLoggedIn.current = true;
    
    // Update state
    setIsAuthenticated(true);
    
    // Clear the flag after 30 seconds
    setTimeout(() => {
      justLoggedIn.current = false;
    }, 30000);
  };

  // =====================
  // EFFECT TO NAVIGATE AFTER AUTH STATE CHANGES
  // =====================
  useEffect(() => {
    if (isAuthenticated && justLoggedIn.current) {
      console.log("Auth state updated, navigating to dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // =====================
  // LOGOUT HANDLER
  // =====================
  const handleLogout = () => {
    justLoggedIn.current = false;
    
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminExpiry");

    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <Routes>
      {/* LOGIN */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login onLogin={handleLogin} />
          )
        }
      />

      {/* PROTECTED */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Layout onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="chapters/*" element={<Chapters />} />
        <Route path="lessons/*" element={<Lessons />} />
        <Route path="topics/*" element={<Topics />} />
        <Route path="subtopics/*" element={<SubTopicAtoZ />} />
        <Route path="grammer/*" element={<GrammerSub />} />
        <Route path="chat-categories" element={<ChatCategories />} />
        <Route path="onboarding" element={<OnboardingQuestions />} />
        <Route path="subscriptions/*" element={<Subscriptions />} />
        <Route path="language" element={<Languages />} />
        <Route path="nativelanguage" element={<NativeLang />} />
        <Route path="discounts/*" element={<Discounts />} />
        <Route path="pushNotification" element={<PushNotifications />} />
        <Route path="quizzes/*" element={<Quizzes />} />
        <Route path="user" element={<Users />} />
        <Route path="push-messages" element={<PushMessages />} />
        <Route path="payments" element={<Payments />} />
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-3xl font-bold">404 – Page Not Found</h1>
          </div>
        }
      />
    </Routes>
  );
}

export default App;