import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  BookOpen,
  FileText,
  Grid,
  MessageSquare,
  HelpCircle,
  DollarSign,
  Tag,
  Users,
  X,
  Bell,
} from "lucide-react";
import logo from "../../assets/images/logo1.png";

const iconMap = {
  Home,
  BookOpen,
  FileText,
  Grid,
  MessageSquare,
  HelpCircle,
  DollarSign,
  Tag,
  Users,
  Bell,
};

const AdminSidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: "Home" },
    { id: "chapters", label: "Chapters", path: "/chapters", icon: "BookOpen" },
    { id: "lessons", label: "Lessons", path: "/lessons", icon: "FileText" },
    { id: "topics", label: "Topics", path: "/topics", icon: "Grid" },
    {
      id: "subtopics",
      label: "A to Z SubTopics",
      path: "/subtopics",
      icon: "Grid",
    },
    {
      id: "grammer",
      label: "Grammer SubTopics",
      path: "/grammer",
      icon: "BookOpen",
    },
    {
      id: "chat-categories",
      label: "Chat Categories",
      path: "/chat-categories",
      icon: "MessageSquare",
    },
    {
      id: "language",
      label: "Languages",
      path: "/language",
      icon: "BookOpen",
    },
    // {
    //   id: "native-language",
    //   label: "Native Languages",
    //   path: "/nativelanguage",
    //   icon: "BookOpen",
    // },
    {
      id: "push-messages",
      label: "Push Messages",
      path: "/push-messages",
      icon: "MessageSquare",
    },

    { id: "quizzes", label: "Quizzes", path: "/quizzes", icon: "HelpCircle" },
    {
      id: "subscriptions",
      label: "Subscriptions",
      path: "/subscriptions",
      icon: "DollarSign",
    },
    // { id: "discounts", label: "Discounts", path: "/discounts", icon: "Tag" },
    {
      id: "onboarding",
      label: "OnBoarding",
      path: "/onboarding",
      icon: "Users",
    },
    {
      id: "notification",
      label: "Push Notification",
      path: "/pushNotification",
      icon: "Bell",
    },
    {
      id: "payments",
      label: "Payments",
      path: "/payments",
      icon: "DollarSign",
    },

    { id: "user", label: "Users", path: "/user", icon: "Users" },
  ];

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg">
                <img src={logo} alt="" className="h-9 mx-1" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Admin Panel</h2>
                <p className="text-xs text-cyan-400">Blingoo</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden text-white hover:bg-slate-700 rounded-lg p-2 transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-120px)]">
          {menuItems.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) => `
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition
                  ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-slate-700"
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;
