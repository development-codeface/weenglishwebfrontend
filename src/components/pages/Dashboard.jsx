import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Grid, MessageSquare, HelpCircle, DollarSign, Tag, TrendingUp } from 'lucide-react';
import { 
  chaptersAPI, 
  lessonsAPI, 
  topicsAPI, 
  quizzesAPI,
  subscriptionsAPI,
  chatCategoriesAPI 
} from '../../services/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    chapters: 0,
    lessons: 0,
    topics: 0,
    quizzes: 0,
    subscriptions: 0,
    chatCategories: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

const fetchStats = async () => {
  try {
    const [
      chaptersRes,
      lessonsRes,
      topicsRes,
      quizzesRes,
      subscriptionsRes,
      chatCategoriesRes
    ] = await Promise.all([
      chaptersAPI.getAll().catch(() => ({ data: [] })),
      lessonsAPI.getAll().catch(() => ({ data: [] })),
      topicsAPI.getAll().catch(() => ({ data: [] })),
      quizzesAPI.getAll().catch(() => ({ data: [] })),
      subscriptionsAPI.getAll().catch(() => ({ data: [] })),
      chatCategoriesAPI.getAll().catch(() => ({ data: [] }))
    ]);

    const extractCount = (res) => {
      if (!res || !res.data) return 0;

      // Case 1: Array directly → [ ... ]
      if (Array.isArray(res.data)) return res.data.length;

      // Case 2: { data: [...] } → nested array
      if (Array.isArray(res.data.data)) return res.data.data.length;

      // Case 3: { items: [...] }
      if (Array.isArray(res.data.items)) return res.data.items.length;

      // Case 4: any other object with arrays
      const arrKey = Object.keys(res.data).find(
        (key) => Array.isArray(res.data[key])
      );
      if (arrKey) return res.data[arrKey].length;

      return 0;
    };

    setStats({
      chapters: extractCount(chaptersRes),
      lessons: extractCount(lessonsRes),
      topics: extractCount(topicsRes),
      quizzes: extractCount(quizzesRes),
      subscriptions: extractCount(subscriptionsRes),
      chatCategories: extractCount(chatCategoriesRes),
    });

  } catch (error) {
    console.error("Error fetching stats:", error);
  } finally {
    setLoading(false);
  }
};


  const statCards = [
    { 
      label: 'Total Chapters', 
      value: stats.chapters, 
      icon: BookOpen, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    // { 
    //   label: 'Total Lessons', 
    //   value: stats.lessons, 
    //   icon: FileText, 
    //   color: 'from-green-500 to-green-600',
    //   bgColor: 'bg-green-50',
    //   textColor: 'text-green-600'
    // },
    { 
      label: 'Total Topics', 
      value: stats.topics, 
      icon: Grid, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    { 
      label: 'Total Quizzes', 
      value: stats.quizzes, 
      icon: HelpCircle, 
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    { 
      label: 'Subscriptions', 
      value: stats.subscriptions, 
      icon: DollarSign, 
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-600'
    },
    { 
      label: 'Chat Categories', 
      value: stats.chatCategories, 
      icon: MessageSquare, 
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to the Language Learning Admin Panel</p>
        </div>
        {/* <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg shadow-md">
          <TrendingUp size={20} />
          <span className="font-semibold">Overview</span>
        </div> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
            >
              <div className={`h-2 bg-gradient-to-r ${stat.color}`}></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                    <Icon className={stat.textColor} size={28} />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                </div>
                <h3 className="text-gray-600 font-semibold">{stat.label}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            
            <button className="w-full text-left px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition shadow-md">
             <Link to="/chapters/create"> <span className="font-semibold">+ Add New Chapter</span></Link>
            </button>
        
           
            <button className="w-full text-left px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition shadow-md">
             <Link to="/lessons/create">  <span className="font-semibold">+ Add New Lesson</span></Link> 
            </button>
            
        
            <button className="w-full text-left px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition shadow-md">
                  <Link to="/quizzes/create"> <span className="font-semibold">+ Add New Quiz</span>   </Link>
            </button>
         
          </div>
        </div>

        {/* <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="text-blue-600" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">System initialized</p>
                <p className="text-xs text-gray-500">Just now</p>
              </div>
            </div>
            <div className="text-center text-gray-400 py-8">
              <p className="text-sm">No recent activity</p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Dashboard;