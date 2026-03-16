import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Trophy, 
  Target, 
  AlertCircle, 
  TrendingUp, 
  RotateCcw, 
  LayoutDashboard 
} from "lucide-react";

const Feedback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extracting data passed from Quiz.jsx
  const { analysis, profile } = location.state || {
    analysis: { total_questions: 0, correct: 0, wrong: 0, weak_points: [], recommendation: "No data" },
    profile: { elo_rating: 0, improvement_percentage: 0, classification: "N/A" }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <Trophy className="mx-auto text-yellow-500 mb-4" size={64} />
          <h1 className="text-4xl font-extrabold text-gray-900">Quiz Completed!</h1>
          <p className="text-gray-500 mt-2">Here is your AI-generated performance analysis.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <TrendingUp className="text-blue-500 mx-auto mb-2" size={28} />
            <h3 className="text-sm font-medium text-gray-400 uppercase">Current ELO</h3>
            <p className="text-3xl font-bold text-gray-800">{Math.round(profile.elo_rating)}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <Target className="text-green-500 mx-auto mb-2" size={28} />
            <h3 className="text-sm font-medium text-gray-400 uppercase">Accuracy</h3>
            <p className="text-3xl font-bold text-gray-800">{profile.improvement_percentage}%</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="text-purple-500 font-bold mb-2 text-xl">🏆</div>
            <h3 className="text-sm font-medium text-gray-400 uppercase">Rank</h3>
            <p className="text-2xl font-bold text-gray-800 uppercase">{profile.classification}</p>
          </div>
        </div>

        {/* Detailed Analysis Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <AlertCircle className="text-orange-500" size={24} /> 
              AI Learning Insights
            </h2>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Identified Weak Points</h4>
              {analysis.weak_points && analysis.weak_points.length > 0 ? (
                <ul className="space-y-3">
                  {analysis.weak_points.map((point, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-700 bg-red-50 p-3 rounded-lg border-l-4 border-red-400">
                      <span className="text-red-500 font-bold">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-600 bg-green-50 p-3 rounded-lg">Great job! No specific weak patterns detected in this session.</p>
              )}
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h4 className="text-blue-800 font-bold mb-1">Recommended Next Step:</h4>
              <p className="text-blue-700">{analysis.recommendation}</p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col md:flex-row gap-4">
          <button 
            onClick={() => navigate("/quiz")}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            <RotateCcw size={20} /> Retake Quiz
          </button>
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex-1 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <LayoutDashboard size={20} /> Back to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};

export default Feedback;