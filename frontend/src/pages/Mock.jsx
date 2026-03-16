import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  ClipboardList, Clock, Calendar, ChevronRight, Layout, BookOpenCheck, Award, 
  TrendingUp, LogOut, Zap, Target, BookOpen, TrendingDown, Flame, Activity
} from "lucide-react";

const API = "http://127.0.0.1:8000";

// ===== RANK PREDICTION FUNCTION =====
function predictRank(userScore, maxScore, attempts) {
  if (!userScore || !maxScore || !attempts) return null;
  const percentile = Math.max(0, Math.min(100, (userScore / maxScore) * 100));
  const rank = Math.round(attempts * (1 - percentile / 100)) + 1;
  return rank;
}

function getRankColor(rank, totalAttempts) {
  const percentile = ((totalAttempts - rank) / totalAttempts) * 100;
  if (percentile >= 90) return "#1e40af"; // Blue - Top 10%
  if (percentile >= 75) return "#3b82f6"; // Light Blue - Top 25%
  if (percentile >= 50) return "#f59e0b"; // Amber - Top 50%
  return "#ef4444"; // Red - Below 50%
}

function Mock() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [hoveredTest, setHoveredTest] = useState(null);
  const navigate = useNavigate();

  const mockTests = [
    { 
      id: 1, 
      title: "Easy Mode", 
      subtitle: "Beginner Level Practice",
      description: "Start with foundational concepts and build your knowledge progressively",
      subject: "Foundation", 
      duration: "45 min", 
      questions: 20,
      difficulty: "Easy",
      color: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
      bgGradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(30, 64, 175, 0.1) 100%)",
      icon: "📚",
      stats: { avgScore: "78/100", attempts: 450 },
      userScore: 85,
      maxScore: 100,
      percentile: 82,
      glow: "rgba(59, 130, 246, 0.6)"
    },
    { 
      id: 2, 
      title: "Hard Mode", 
      subtitle: "Advanced Challenge",
      description: "Test your mastery with complex problems and advanced concepts",
      subject: "Advanced", 
      duration: "180 min", 
      questions: 90,
      difficulty: "Hard",
      color: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      bgGradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)",
      icon: "⚡",
      stats: { avgScore: "156/300", attempts: 1250 },
      userScore: 185,
      maxScore: 300,
      percentile: 78,
      glow: "rgba(239, 68, 68, 0.6)"
    },
    { 
      id: 3, 
      title: "Medium Mode", 
      subtitle: "Intermediate Level",
      description: "Balance between difficulty and learning with intermediate problems",
      subject: "Intermediate", 
      duration: "90 min", 
      questions: 45,
      difficulty: "Medium",
      color: "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)",
      bgGradient: "linear-gradient(135deg, rgba(156, 163, 175, 0.1) 0%, rgba(107, 114, 128, 0.1) 100%)",
      icon: "🎯",
      stats: { avgScore: "120/200", attempts: 750 },
      userScore: 145,
      maxScore: 200,
      percentile: 80,
      glow: "rgba(156, 163, 175, 0.6)"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);

    const fetchProfile = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) { 
        navigate("/login"); 
        return; 
      }
      try {
        const res = await axios.get(`${API}/student/profile?student_id=${userId}`);
        setUser(res.data);
        setLoading(false);
      } catch (err) { 
        console.error("Fetch error:", err);
        navigate("/login"); 
      }
    };
    fetchProfile();
    return () => clearInterval(timer);
  }, [navigate]);

  if (loading || !user) return <div style={loadingStyle}>Loading Mock Tests Arena...</div>;

  return (
    <div style={layoutStyle}>
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        <div style={logoContainer}>
          <div style={logoIcon}>EP</div>
          <h2 style={{fontSize: "1.3vw", color: "white", margin: 0, fontWeight: '900'}}>EduPrep</h2>
        </div>

        <nav style={navStyle}>
          <div style={navItem} onClick={() => navigate("/dashboard")}>
            <Layout size="1.2vw"/>
            <span style={{marginLeft: '0.5vw'}}>Dashboard</span>
          </div>
          <div style={navItem} onClick={() => navigate("/dpp")}>
            <BookOpenCheck size="1.2vw"/>
            <span style={{marginLeft: '0.5vw'}}>Daily Practice</span>
          </div>
          <div style={activeNavItem}>
            <ClipboardList size="1.2vw"/>
            <span style={{marginLeft: '0.5vw'}}>Mock Tests</span>
          </div>
          <div style={navItem} onClick={() => navigate("/quiz")}>
            <Award size="1.2vw"/>
            <span style={{marginLeft: '0.5vw'}}>Take Quiz</span>
          </div>
          <div style={navItem}>
            <TrendingUp size="1.2vw"/>
            <span style={{marginLeft: '0.5vw'}}>Statistics</span>
          </div>
        </nav>

        <div style={{marginTop: 'auto'}}>
          <button onClick={() => { localStorage.clear(); navigate("/login"); }} style={logoutBtn}>
            <LogOut size="1vw" /> Sign Out
          </button>
        </div>
      </aside>

      <main style={mainContent}>
        {/* Header Section */}
        <header style={headerStyle}>
          <div>
            <h1 style={{ fontSize: "1.8vw", margin: 0, color: "white", fontWeight: '900', letterSpacing: '-0.02em' }}>
              Quiz Challenge System 🚀
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: '0.6vw', fontSize: '0.95vw', fontWeight: '500' }}>
              Choose your difficulty level and test your knowledge • Your Level: <strong>{user.current_level || 'Intermediate'}</strong>
            </p>
          </div>
          <div style={headerTimeSection}>
            <Clock size="1vw" color="#fff" />
            <span style={{color: 'white', fontWeight: '700', fontSize: '0.95vw'}}>{currentTime}</span>
          </div>
        </header>

        {/* Conveyor Belt Visualization Section */}
        <div style={conveyorSectionStyle}>
          <svg style={conveyorSvgStyle} viewBox="0 0 1200 400">
            {/* Defs */}
            <defs>
              <filter id="glow-easy">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="glow-hard">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <linearGradient id="easy-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6"/>
                <stop offset="100%" stopColor="#1e40af"/>
              </linearGradient>
              <linearGradient id="hard-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ef4444"/>
                <stop offset="100%" stopColor="#dc2626"/>
              </linearGradient>
              <linearGradient id="medium-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#9ca3af"/>
                <stop offset="100%" stopColor="#6b7280"/>
              </linearGradient>
            </defs>

            {/* Conveyor Belt Track */}
            <ellipse cx="600" cy="80" rx="480" ry="50" fill="none" stroke="#475569" strokeWidth="10"/>
            <ellipse cx="600" cy="320" rx="480" ry="50" fill="none" stroke="#475569" strokeWidth="10"/>
            <line x1="120" y1="80" x2="120" y2="320" stroke="#475569" strokeWidth="10"/>
            <line x1="1080" y1="80" x2="1080" y2="320" stroke="#475569" strokeWidth="10"/>

            {/* Wheels */}
            {[120, 1080].map((x, idx) => (
              <g key={`wheel-${idx}`}>
                <circle cx={x} cy="80" r="45" fill="none" stroke="#64748b" strokeWidth="6"/>
                <circle cx={x} cy="80" r="30" fill="none" stroke="#334155" strokeWidth="3"/>
                <circle cx={x} cy="320" r="45" fill="none" stroke="#64748b" strokeWidth="6"/>
                <circle cx={x} cy="320" r="30" fill="none" stroke="#334155" strokeWidth="3"/>
              </g>
            ))}

            {/* Question Boxes on Belt with Glow */}
            {/* Easy Box (Left) */}
            <g filter="url(#glow-easy)">
              <rect x="250" y="20" width="80" height="120" rx="10" fill="url(#easy-grad)" opacity="0.9"/>
              <rect x="250" y="20" width="80" height="25" rx="10" fill="rgba(255,255,255,0.3)"/>
            </g>

            {/* Hard Box (Center) */}
            <g filter="url(#glow-hard)">
              <rect x="560" y="10" width="80" height="140" rx="10" fill="url(#hard-grad)" opacity="0.95"/>
              <rect x="560" y="10" width="80" height="30" rx="10" fill="rgba(255,255,255,0.3)"/>
            </g>

            {/* Medium Box (Right) */}
            <g filter="url(#glow-easy)">
              <rect x="870" y="30" width="80" height="100" rx="10" fill="url(#medium-grad)" opacity="0.85"/>
              <rect x="870" y="30" width="80" height="20" rx="10" fill="rgba(255,255,255,0.2)"/>
            </g>

            {/* Equations/Math Text */}
            <text x="250" y="200" fontSize="18" fill="#3b82f6" opacity="0.5" fontFamily="Arial" fontStyle="italic">
              E = mc²
            </text>
            <text x="560" y="200" fontSize="18" fill="#ef4444" opacity="0.6" fontFamily="Arial" fontStyle="italic">
              ∑F = ma
            </text>
            <text x="870" y="200" fontSize="18" fill="#9ca3af" opacity="0.4" fontFamily="Arial" fontStyle="italic">
              ∫dx
            </text>

            {/* Difficulty Labels */}
            <text x="290" y="380" fontSize="16" fontWeight="bold" fill="#3b82f6" fontFamily="Arial">
              EASY
            </text>
            <text x="580" y="380" fontSize="16" fontWeight="bold" fill="#ef4444" fontFamily="Arial">
              HARD
            </text>
            <text x="900" y="380" fontSize="16" fontWeight="bold" fill="#9ca3af" fontFamily="Arial">
              MEDIUM
            </text>
          </svg>
        </div>

        {/* Quick Stats */}
        <div style={quickStatsGrid}>
          <div style={{...quickStatCard, animation: 'slideUp 0.6s ease-out 0.1s both'}}>
            <div style={{fontSize: '2.2vw', marginBottom: '0.8vw'}}>📚</div>
            <p style={{margin: 0, fontSize: '0.75vw', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em'}}>Total Modes</p>
            <h3 style={{margin: '0.6vw 0 0 0', fontSize: '1.8vw', fontWeight: '900', color: '#1a1a1a'}}>3</h3>
          </div>
          <div style={{...quickStatCard, animation: 'slideUp 0.6s ease-out 0.2s both'}}>
            <div style={{fontSize: '2.2vw', marginBottom: '0.8vw'}}>⏱️</div>
            <p style={{margin: 0, fontSize: '0.75vw', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em'}}>Total Hours</p>
            <h3 style={{margin: '0.6vw 0 0 0', fontSize: '1.8vw', fontWeight: '900', color: '#1a1a1a'}}>9</h3>
          </div>
          <div style={{...quickStatCard, animation: 'slideUp 0.6s ease-out 0.3s both'}}>
            <div style={{fontSize: '2.2vw', marginBottom: '0.8vw'}}>🎯</div>
            <p style={{margin: 0, fontSize: '0.75vw', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em'}}>Total Questions</p>
            <h3 style={{margin: '0.6vw 0 0 0', fontSize: '1.8vw', fontWeight: '900', color: '#1a1a1a'}}>155+</h3>
          </div>
        </div>

        {/* Mock Tests Grid */}
        <div style={gridStyle}>
          {mockTests.map((test, index) => {
            const predictedRank = predictRank(test.userScore, test.maxScore, test.stats.attempts);
            const rankColor = getRankColor(predictedRank, test.stats.attempts);

            return (
              <div
                key={test.id}
                style={{
                  ...cardStyle(hoveredTest === test.id),
                  animation: `slideUp 0.6s ease-out ${0.1 + index * 0.15}s both`,
                  background: test.bgGradient
                }}
                onMouseEnter={() => setHoveredTest(test.id)}
                onMouseLeave={() => setHoveredTest(null)}
              >
                {/* Card Top Section with Gradient */}
                <div style={{...cardTopSection, background: test.color, position: 'relative', overflow: 'hidden', boxShadow: `0 0 2vw ${test.glow}`}}>
                  <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                    animation: hoveredTest === test.id ? 'float 4s ease-in-out infinite' : 'none'
                  }}></div>

                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1vw', position: 'relative', zIndex: 2}}>
                    <span style={{fontSize: '2.5vw', animation: hoveredTest === test.id ? 'bounce 0.8s ease-out' : 'none'}}>{test.icon}</span>
                    <span style={{...difficultybadge, color: test.difficulty === "Hard" ? "#ef4444" : test.difficulty === "Easy" ? "#3b82f6" : "#9ca3af"}}>
                      {test.difficulty}
                    </span>
                  </div>
                  <h2 style={{margin: 0, fontSize: '1.5vw', fontWeight: '900', color: 'white', position: 'relative', zIndex: 2}}>
                    {test.title}
                  </h2>
                  <p style={{margin: '0.5vw 0 0 0', color: 'rgba(255,255,255,0.95)', fontSize: '0.85vw', fontWeight: '500', position: 'relative', zIndex: 2}}>
                    {test.subtitle}
                  </p>
                </div>

                {/* Card Content Section */}
                <div style={{padding: '1.8vw'}}>
                  <p style={{margin: '0 0 1.2vw 0', fontSize: '0.8vw', color: '#64748b', lineHeight: '1.6', fontWeight: '500'}}>
                    {test.description}
                  </p>

                  {/* Meta Information Grid */}
                  <div style={metaGridStyle}>
                    <div style={metaItemStyle} className="metaItem">
                      <div style={{...metaIconBox, borderLeft: `4px solid ${test.difficulty === "Easy" ? "#3b82f6" : test.difficulty === "Hard" ? "#ef4444" : "#9ca3af"}`, background: `linear-gradient(135deg, rgba(${test.difficulty === "Easy" ? "59, 130, 246" : test.difficulty === "Hard" ? "239, 68, 68" : "156, 163, 175"}, 0.1) 0%, rgba(${test.difficulty === "Easy" ? "59, 130, 246" : test.difficulty === "Hard" ? "239, 68, 68" : "156, 163, 175"}, 0.05) 100%)`}}>
                        <ClipboardList size="1.2vw" color={test.difficulty === "Easy" ? "#3b82f6" : test.difficulty === "Hard" ? "#ef4444" : "#9ca3af"} />
                      </div>
                      <div>
                        <p style={{margin: 0, fontSize: '0.65vw', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em'}}>Questions</p>
                        <p style={{margin: '0.4vw 0 0 0', fontSize: '0.95vw', fontWeight: '800', color: '#1a1a1a'}}>{test.questions}</p>
                      </div>
                    </div>

                    <div style={metaItemStyle} className="metaItem">
                      <div style={{...metaIconBox, borderLeft: `4px solid ${test.difficulty === "Easy" ? "#3b82f6" : test.difficulty === "Hard" ? "#ef4444" : "#9ca3af"}`, background: `linear-gradient(135deg, rgba(${test.difficulty === "Easy" ? "59, 130, 246" : test.difficulty === "Hard" ? "239, 68, 68" : "156, 163, 175"}, 0.1) 0%, rgba(${test.difficulty === "Easy" ? "59, 130, 246" : test.difficulty === "Hard" ? "239, 68, 68" : "156, 163, 175"}, 0.05) 100%)`}}>
                        <Clock size="1.2vw" color={test.difficulty === "Easy" ? "#3b82f6" : test.difficulty === "Hard" ? "#ef4444" : "#9ca3af"} />
                      </div>
                      <div>
                        <p style={{margin: 0, fontSize: '0.65vw', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em'}}>Duration</p>
                        <p style={{margin: '0.4vw 0 0 0', fontSize: '0.95vw', fontWeight: '800', color: '#1a1a1a'}}>{test.duration}</p>
                      </div>
                    </div>

                    <div style={metaItemStyle} className="metaItem">
                      <div style={{...metaIconBox, borderLeft: `4px solid ${test.difficulty === "Easy" ? "#3b82f6" : test.difficulty === "Hard" ? "#ef4444" : "#9ca3af"}`, background: `linear-gradient(135deg, rgba(${test.difficulty === "Easy" ? "59, 130, 246" : test.difficulty === "Hard" ? "239, 68, 68" : "156, 163, 175"}, 0.1) 0%, rgba(${test.difficulty === "Easy" ? "59, 130, 246" : test.difficulty === "Hard" ? "239, 68, 68" : "156, 163, 175"}, 0.05) 100%)`}}>
                        <Target size="1.2vw" color={test.difficulty === "Easy" ? "#3b82f6" : test.difficulty === "Hard" ? "#ef4444" : "#9ca3af"} />
                      </div>
                      <div>
                        <p style={{margin: 0, fontSize: '0.65vw', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em'}}>Level</p>
                        <p style={{margin: '0.4vw 0 0 0', fontSize: '0.95vw', fontWeight: '800', color: '#1a1a1a'}}>{test.subject}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Section with Rank Prediction */}
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8vw', marginTop: '1.2vw', paddingTop: '1.2vw', borderTop: '0.1vw solid #e2e8f0'}}>
                    <div style={{textAlign: 'center', padding: '0.9vw', background: '#f8fafc', borderRadius: '0.8vw', transition: 'all 0.3s ease', border: '0.1vw solid #e5e7eb'}}>
                      <p style={{margin: 0, fontSize: '0.7vw', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Avg Score</p>
                      <p style={{margin: '0.4vw 0 0 0', fontSize: '0.9vw', fontWeight: '900', color: test.difficulty === "Easy" ? "#3b82f6" : test.difficulty === "Hard" ? "#ef4444" : "#9ca3af"}}>{test.stats.avgScore}</p>
                    </div>
                    <div style={{textAlign: 'center', padding: '0.9vw', background: '#f8fafc', borderRadius: '0.8vw', transition: 'all 0.3s ease', border: '0.1vw solid #e5e7eb'}}>
                      <p style={{margin: 0, fontSize: '0.7vw', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Attempts</p>
                      <p style={{margin: '0.4vw 0 0 0', fontSize: '0.9vw', fontWeight: '900', color: test.difficulty === "Easy" ? "#3b82f6" : test.difficulty === "Hard" ? "#ef4444" : "#9ca3af"}}>{test.stats.attempts}+</p>
                    </div>
                    {predictedRank && (
                      <div style={{textAlign: 'center', padding: '0.9vw', background: `linear-gradient(135deg, rgba(${test.difficulty === "Easy" ? "59, 130, 246" : test.difficulty === "Hard" ? "239, 68, 68" : "156, 163, 175"}, 0.1) 0%, rgba(${test.difficulty === "Easy" ? "59, 130, 246" : test.difficulty === "Hard" ? "239, 68, 68" : "156, 163, 175"}, 0.05) 100%)`, borderRadius: '0.8vw', border: `0.1vw solid ${rankColor}33`, transition: 'all 0.3s ease'}}>
                        <p style={{margin: 0, fontSize: '0.7vw', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Predicted Rank</p>
                        <p style={{margin: '0.4vw 0 0 0', fontSize: '0.95vw', fontWeight: '900', color: rankColor}}>#{predictedRank}</p>
                      </div>
                    )}
                  </div>

                  {/* Percentile Bar */}
                  {test.percentile && (
                    <div style={{marginTop: '1.2vw', padding: '0.9vw', background: '#f8fafc', borderRadius: '0.8vw', border: '0.1vw solid #e5e7eb'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.6vw'}}>
                        <p style={{margin: 0, fontSize: '0.7vw', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Your Percentile</p>
                        <p style={{margin: 0, fontSize: '0.85vw', fontWeight: '900', color: rankColor}}>{test.percentile}%</p>
                      </div>
                      <div style={{width: '100%', height: '0.4vw', background: '#e2e8f0', borderRadius: '0.3vw', overflow: 'hidden'}}>
                        <div style={{width: `${test.percentile}%`, height: '100%', background: `linear-gradient(90deg, ${rankColor} 0%, ${rankColor}99)`, transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'}}></div>
                      </div>
                    </div>
                  )}

                  {/* Attempt Button */}
                  <button 
                    style={{...attemptButtonStyle(hoveredTest === test.id, test.color)}}
                    onClick={() => navigate("/quiz")}
                  >
                    <span style={{flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6vw'}}>
                      <Zap size="1.2vw" />
                      Start Challenge
                    </span>
                    <ChevronRight size="1.3vw" style={{transition: 'transform 0.3s ease', transform: hoveredTest === test.id ? 'translateX(4px)' : 'translateX(0)'}} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div style={{...infoSectionStyle, animation: 'slideUp 0.6s ease-out 0.7s both'}}>
          <div style={{display: 'flex', gap: '1.5vw'}}>
            <div style={{fontSize: '2.2vw', flexShrink: 0}}>🚀</div>
            <div>
              <h3 style={{marginTop: 0, marginBottom: '0.8vw', color: '#1e293b', fontSize: '1.1vw', fontWeight: '900'}}>
                Master Your Skills with Difficulty Levels
              </h3>
              <p style={{margin: '0 0 1vw 0', fontSize: '0.85vw', color: '#64748b', lineHeight: '1.7'}}>
                Choose from three difficulty levels to match your current skill level and progressively improve your knowledge and problem-solving abilities.
              </p>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8vw'}}>
                <div style={benefitItemStyle}>✓ Adaptive Learning Path</div>
                <div style={benefitItemStyle}>✓ Progressive Difficulty</div>
                <div style={benefitItemStyle}>✓ Real-time Performance</div>
                <div style={benefitItemStyle}>✓ Detailed Feedback</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
        }

        ::-webkit-scrollbar {
          width: 0.6vw;
        }

        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 0.3vw;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
        }

        .metaItem {
          animation: slideUp 0.6s ease-out forwards;
        }

        .metaItem:nth-child(1) {
          animation-delay: 0.2s;
        }

        .metaItem:nth-child(2) {
          animation-delay: 0.3s;
        }

        .metaItem:nth-child(3) {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
}

// --- CSS-in-JS Styles ---
const layoutStyle = { 
  display: "flex", 
  minHeight: "100vh", 
  background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", 
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
};

const sidebarStyle = { 
  width: "18vw", 
  backgroundColor: "#1e293b", 
  color: "white", 
  padding: "2vw", 
  display: "flex", 
  flexDirection: "column",
  boxShadow: "0.3vw 0 1vw rgba(0,0,0,0.1)",
  position: "sticky",
  top: 0,
  height: "100vh",
  overflowY: "auto"
};

const logoContainer = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '0.8vw', 
  marginBottom: '3vw' 
};

const logoIcon = { 
  background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)', 
  color: 'white', 
  width: '2.5vw', 
  height: '2.5vw', 
  borderRadius: '0.7vw', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  fontWeight: 'bold',
  fontSize: '0.9vw',
  boxShadow: '0 0.3vw 0.8vw rgba(30, 64, 175, 0.3)'
};

const navStyle = { flex: 1 };

const navItem = { 
  display: 'flex', 
  alignItems: 'center', 
  padding: '0.9vw 1.2vw', 
  marginBottom: '0.6vw', 
  borderRadius: '0.9vw', 
  cursor: 'pointer', 
  color: '#94a3b8', 
  transition: 'all 0.3s ease',
  fontSize: '0.9vw',
  fontWeight: '500'
};

const activeNavItem = { 
  ...navItem, 
  backgroundColor: 'rgba(30, 64, 175, 0.15)', 
  color: '#3b82f6', 
  fontWeight: '700',
  borderLeft: '0.3vw solid #3b82f6'
};

const logoutBtn = {
  width: '100%',
  padding: '1vw',
  background: 'transparent',
  border: '0.1vw solid #334155',
  color: '#94a3b8',
  borderRadius: '0.8vw',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.6vw',
  transition: 'all 0.3s ease',
  fontSize: '0.9vw',
  fontWeight: '600'
};

const mainContent = { 
  flex: 1, 
  padding: "2.5vw", 
  overflowY: "auto",
  background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)"
};

const headerStyle = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'flex-start', 
  marginBottom: '2vw',
  padding: '2vw',
  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  borderRadius: '1.2vw',
  boxShadow: '0 0.8vw 2vw rgba(0,0,0,0.15)',
  border: '0.1vw solid rgba(255,255,255,0.1)'
};

const headerTimeSection = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.8vw',
  padding: '0.8vw 1.2vw',
  background: 'rgba(255,255,255,0.1)',
  borderRadius: '0.8vw',
  border: '0.1vw solid rgba(255,255,255,0.2)',
  backdropFilter: 'blur(10px)'
};

const conveyorSectionStyle = {
  background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
  padding: "3vw 2vw",
  borderRadius: "1.5vw",
  marginBottom: "2.5vw",
  boxShadow: "0 1vw 3vw rgba(0,0,0,0.2), inset 0 0.1vw 0.3vw rgba(255,255,255,0.1)",
  border: "0.1vw solid rgba(255,255,255,0.1)",
  position: "relative",
  overflow: "hidden"
};

const conveyorSvgStyle = {
  width: "100%",
  height: "400px",
  maxWidth: "100%"
};

const quickStatsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '1.2vw',
  marginBottom: '2.5vw'
};

const quickStatCard = {
  backgroundColor: 'white',
  padding: '1.5vw',
  borderRadius: '1vw',
  boxShadow: '0 0.4vw 1.2vw rgba(0,0,0,0.08)',
  border: '0.1vw solid #e5e7eb',
  textAlign: 'center',
  transition: 'all 0.3s ease',
  cursor: 'pointer'
};

const gridStyle = { 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
  gap: '1.8vw', 
  marginBottom: '2.5vw'
};

const cardStyle = (isHovered) => ({
  backgroundColor: "white", 
  borderRadius: "1.2vw", 
  overflow: "hidden",
  boxShadow: isHovered ? '0 1.5vw 3vw rgba(0,0,0,0.15)' : '0 0.4vw 1.2vw rgba(0,0,0,0.08)',
  border: '0.1vw solid #e5e7eb',
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  transform: isHovered ? 'translateY(-0.8vw) scale(1.02)' : 'translateY(0) scale(1)',
  cursor: 'pointer'
});

const cardTopSection = {
  padding: '1.8vw',
  color: 'white',
  position: 'relative',
  overflow: 'hidden'
};

const difficultybadge = {
  fontSize: '0.7vw',
  fontWeight: '800',
  padding: '0.5vw 1vw',
  borderRadius: '0.6vw',
  backgroundColor: 'rgba(255,255,255,0.2)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  backdropFilter: 'blur(10px)',
  border: '0.1vw solid rgba(255,255,255,0.3)'
};

const metaGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '0.8vw'
};

const metaItemStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.8vw'
};

const metaIconBox = {
  width: '2.8vw',
  height: '2.8vw',
  borderRadius: '0.8vw',
  background: '#f8fafc',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: 'all 0.3s ease'
};

const attemptButtonStyle = (isHovered, gradient) => ({
  width: '100%',
  padding: '1vw 1.2vw',
  background: gradient,
  color: 'white',
  border: 'none',
  borderRadius: '0.8vw',
  fontWeight: '800',
  fontSize: '0.85vw',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: '1.2vw',
  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  boxShadow: isHovered ? '0 0.8vw 2vw rgba(0,0,0,0.3)' : '0 0.4vw 1vw rgba(0,0,0,0.15)',
  transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
});

const infoSectionStyle = {
  backgroundColor: 'white',
  padding: '2vw',
  borderRadius: '1.2vw',
  border: '0.15vw solid #bfdbfe',
  boxShadow: '0 0.6vw 1.5vw rgba(0, 0, 0, 0.05)',
  background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
  marginBottom: '1.5vw'
};

const benefitItemStyle = {
  fontSize: '0.85vw',
  color: '#1e293b',
  fontWeight: '700',
  padding: '0.8vw 1vw',
  background: 'white',
  borderRadius: '0.6vw',
  border: '0.1vw solid #bfdbfe',
  transition: 'all 0.3s ease',
  cursor: 'pointer'
};

const loadingStyle = { 
  height: "100vh", 
  display: "flex", 
  justifyContent: "center", 
  alignItems: "center", 
  background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", 
  color: "#64748b", 
  fontSize: "1.1vw",
  fontWeight: '500'
};

export default Mock;