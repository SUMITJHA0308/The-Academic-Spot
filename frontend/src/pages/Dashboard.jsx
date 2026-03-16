import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, TrendingDown, Award, Target, 
  CheckCircle, Calendar, LogOut, Flame, Activity,
  ChevronLeft, ChevronRight, Zap, BookOpen, BarChart3
} from "lucide-react";

const API = "http://127.0.0.1:8000";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [eloHistory, setEloHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activityData, setActivityData] = useState({});
  const [improvement, setImprovement] = useState(0);
  const [volatility, setVolatility] = useState(0);
  const [consistency, setConsistency] = useState(0);
  const [momentum, setMomentum] = useState(0);
  const [conceptMastery, setConceptMastery] = useState([]);
  const [recommendedTopic, setRecommendedTopic] = useState(null);
  const [mistakeStats, setMistakeStats] = useState({
  concept: 0,
  calculation: 0,
  formula: 0
});
  const navigate = useNavigate();

  const generateActivityData = () => {
    const data = {};
    const today = new Date();
    
    for (let i = 365; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      data[dateString] = Math.random() > 0.4 ? Math.floor(Math.random() * 5) + 1 : 0;
    }
    
    return data;
  };

  // ===== CALCULATE IMPROVEMENT =====
  const calculateImprovement = (eloData) => {
    if (!eloData || eloData.length < 2) return 0;

    const firstScore = eloData[0].elo;
    const lastScore = eloData[eloData.length - 1].elo;
    
    if (firstScore === 0) return 0;
    
    const improvementValue = ((lastScore - firstScore) / firstScore) * 100;
    return Math.round(improvementValue * 10) / 10;
  };

  // ===== CALCULATE VOLATILITY =====
  const calculateVolatility = (eloData) => {
    if (!eloData || eloData.length < 2) return 0;

    const scores = eloData.map(d => d.elo);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    
    const volatilityPercent = (stdDev / mean) * 100;
    return Math.round(volatilityPercent * 10) / 10;
  };

  // ===== CALCULATE CONSISTENCY =====
  const calculateConsistency = (eloData) => {
    if (!eloData || eloData.length < 2) return 0;

    const scores = eloData.map(d => d.elo);
    const changes = [];
    
    for (let i = 1; i < scores.length; i++) {
      changes.push(Math.abs(scores[i] - scores[i - 1]));
    }

    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
    const variance = changes.reduce((sum, change) => sum + Math.pow(change - avgChange, 2), 0) / changes.length;
    const stdDev = Math.sqrt(variance);

    const consistency = Math.max(0, 100 - (stdDev * 5));
    return Math.round(consistency * 10) / 10;
  };

  // ===== CALCULATE MOMENTUM =====
  const calculateMomentum = (eloData) => {
    if (!eloData || eloData.length < 3) return 0;

    const scores = eloData.map(d => d.elo);
    const recentLen = Math.ceil(scores.length / 2);
    
    const firstHalf = scores.slice(0, scores.length - recentLen).reduce((a, b) => a + b, 0) / (scores.length - recentLen);
    const secondHalf = scores.slice(scores.length - recentLen).reduce((a, b) => a + b, 0) / recentLen;

    const momentumValue = secondHalf - firstHalf;
    return Math.round(momentumValue * 10) / 10;
  };

  // ===== GET VOLATILITY STATUS =====
  const getVolatilityStatus = (volatility) => {
    if (volatility < 2) return { label: 'Stable Preparation', color: '#1e40af' };
    if (volatility < 4) return { label: 'Steady Progress', color: '#1e3a8a' };
    if (volatility < 6) return { label: 'Moderate Variation', color: '#1e40af' };
    return { label: 'Unstable Performance', color: '#1e3a8a' };
  };

  // ===== GET CONSISTENCY STATUS =====
  const getConsistencyStatus = (consistency) => {
    if (consistency >= 80) return { label: 'Highly Consistent', color: '#1e40af' };
    if (consistency >= 60) return { label: 'Mostly Consistent', color: '#1e3a8a' };
    if (consistency >= 40) return { label: 'Moderately Consistent', color: '#1e40af' };
    return { label: 'Inconsistent Practice', color: '#1e3a8a' };
  };

  // ===== GET MOMENTUM STATUS =====
  const getMomentumStatus = (momentum) => {
    if (momentum > 10) return { label: 'Strong Upward Trend', color: '#1e40af', icon: '↑↑' };
    if (momentum > 2) return { label: 'Positive Momentum', color: '#1e3a8a', icon: '↑' };
    if (momentum > -2) return { label: 'Stable Trend', color: '#1e40af', icon: '→' };
    if (momentum > -10) return { label: 'Downward Trend', color: '#1e3a8a', icon: '↓' };
    return { label: 'Strong Decline', color: '#1e3a8a', icon: '↓↓' };
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) { 
        navigate("/login"); 
        return; 
      }
      try {
        const res = await axios.get(
          `${API}/student/profile?student_id=${userId}`
        );
        setUser(res.data);
        
        const mockEloHistory = Array.from({ length: 15 }, (_, i) => {
          const baseElo = res.data.elo_rating || 1000;
          const trend = Math.sin(i * 0.4) * 30 + i * 3 + (Math.random() * 20 - 10);
          return {
            day: i + 1,
            elo: Math.round(baseElo + trend)
          };
        });
        
        setEloHistory(mockEloHistory);
        
        const improvementPercent = calculateImprovement(mockEloHistory);
        setImprovement(improvementPercent);
        
        const volatilityPercent = calculateVolatility(mockEloHistory);
        setVolatility(volatilityPercent);

        const consistencyScore = calculateConsistency(mockEloHistory);
        setConsistency(consistencyScore);

        const momentumScore = calculateMomentum(mockEloHistory);
        setMomentum(momentumScore);
        
        setActivityData(generateActivityData());
        // MOCK CONCEPT MASTERY
setConceptMastery([
  { topic: "Mechanics", accuracy: 82 },
  { topic: "Thermodynamics", accuracy: 54 },
  { topic: "Electrostatics", accuracy: 31 },
  { topic: "Modern Physics", accuracy: 71 }
]);

// AI recommendation
setRecommendedTopic({
  topic: "Electrostatics",
  chapter: "Coulomb Law",
  expected_gain: 40
});

// Mistake stats
setMistakeStats({
  concept: 35,
  calculation: 40,
  formula: 25
});
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        navigate("/login");
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) return <div style={loadingStyle}>Preparing your workspace...</div>;
  if (!user) return <div style={loadingStyle}>Loading...</div>;

  const isImproved = improvement >= 0;
  let streak = user.streak || 0;

  const handleSolveTest = () => {
    streak += 1;
    localStorage.setItem('streak', streak);
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const getActivityColor = (day) => {
  if (!day) return null;

  const dateStr = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    day
  ).toISOString().split("T")[0];

  const attempts = activityData[dateStr] || 0;

  if (attempts === 0) return "#e5e7eb";
  if (attempts <= 2) return "#bfdbfe";
  if (attempts <= 5) return "#3b82f6";
  if (attempts <= 8) return "#1e40af";

  return "#1e3a8a";
};

  const calendarDays = generateCalendarDays();
  // ===== BEST DAY =====
const bestDayEntry = Object.entries(activityData).reduce(
  (max, current) => (current[1] > max[1] ? current : max),
  ["", 0]
);

const bestDay = bestDayEntry[0];

// ===== STREAK DAYS =====
const streakDays = Object.entries(activityData)
  .filter(([date, val]) => val > 0)
  .map(([date]) => date);

// ===== WEEKLY SCORE =====
const last7 = Object.values(activityData).slice(-7);

const weeklyQuestions = last7.reduce((a, b) => a + b, 0);

const weeklyDays = last7.filter((v) => v > 0).length;

// ===== BADGES =====
const badges = [];

if (weeklyQuestions >= 30) badges.push("🏅 Hard Worker");

if (weeklyDays >= 5) badges.push("🔥 Consistency Master");

if ((user?.elo_rating || 0) > 1050) badges.push("⚡ Rising Scholar");
  const totalAttempts = Object.values(activityData).reduce((sum, val) => sum + val, 0);

  const weekDays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonthName = monthNames[currentMonth.getMonth()];
  const currentYear = currentMonth.getFullYear();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const volatilityStatus = getVolatilityStatus(volatility);
  const consistencyStatus = getConsistencyStatus(consistency);
  const momentumStatus = getMomentumStatus(momentum);

  return (
    <div style={layoutStyle}>
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        <div style={logoContainer}>
          <div style={logoIcon}>EP</div>
          <h2 style={{fontSize: "1.3vw", color: "white", margin: 0, fontWeight: '900'}}>EduPrep</h2>
        </div>
        
        <nav style={navStyle}>
          <div style={activeNavItem}><Target size="1.2vw"/> <span style={{marginLeft: '0.5vw'}}>Dashboard</span></div>
          <div style={navItem} onClick={() => navigate("/dpp")}><BookOpen size="1.2vw"/> <span style={{marginLeft: '0.5vw'}}>Daily Practice</span></div>
          <div style={navItem} onClick={() => navigate("/mock")}><Award size="1.2vw"/> <span style={{marginLeft: '0.5vw'}}>Mock Tests</span></div>
          <div style={navItem} onClick={() => { navigate("/quiz"); handleSolveTest(); }}><Zap size="1.2vw"/> <span style={{marginLeft: '0.5vw'}}>Take Quiz</span></div>
          <div style={navItem}><BarChart3 size="1.2vw"/> <span style={{marginLeft: '0.5vw'}}>Statistics</span></div>
        </nav>

        <div
  style={navItem}
  onClick={() => {
    const subject = "Physics";   // temporarily hardcoded
    const chapter = "Motion";    // temporarily hardcoded

    navigate(`/quiz?subject=${subject}&chapter=${chapter}`);
  }}
>
  <Zap size="1.2vw"/>
  <span style={{marginLeft: '0.5vw'}}>Take Quiz</span>
</div>
      </aside>

      <main style={mainContent}>
        {/* Header Section */}
        <div style={headerStyle}>
          <h1 style={{margin: 0, color: "white", fontSize: "1.8vw", fontWeight: '900', letterSpacing: '-0.02em'}}>Hello, Scholar! 👋</h1>
          
          <div style={{display: 'flex', alignItems: 'center', gap: '3vw', marginLeft: 'auto'}}>
            <span style={{color: 'rgba(255,255,255,0.9)', fontSize: '1vw', fontWeight: '600'}}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span style={{color: 'rgba(255,255,255,0.9)', fontSize: '1vw', fontWeight: '600'}}>
              {new Date().toLocaleTimeString()}
            </span>
          </div>

          <div style={classificationBadge}>{user.classification || "BEGINNER"}</div>
        </div>

        {/* Main Content Grid */}
        <div style={mainGridContainer}>
          {/* Left - Calendar */}
          <div style={calendarSection}>
            <div style={calendarCard}>
              {/* Calendar Header with Month Navigation */}
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5vw'}}>
                <button 
                  onClick={handlePrevMonth}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.4vw',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ChevronLeft size="1.5vw" color="#1e40af" />
                </button>
                
                <h3 style={{margin: 0, fontSize: '1.15vw', color: '#1a1a1a', fontWeight: '800'}}>
                  {currentMonthName} {currentYear}
                </h3>
                
                <button 
                  onClick={handleNextMonth}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.4vw',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ChevronRight size="1.5vw" color="#1e40af" />
                </button>
              </div>
              
              {/* Calendar Table */}
              <div style={{marginBottom: '1.5vw', overflow: 'hidden'}}>
                {/* Days of Week Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '0.4vw',
                  marginBottom: '0.8vw',
                  paddingRight: '0.3vw'
                }}>
                  {weekDays.map(day => (
                    <div key={day} style={{textAlign: 'center', fontSize: '0.7vw', fontWeight: '700', color: '#1e40af'}}>
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '0.5vw',
                  boxSizing: 'border-box',
                  paddingRight: '0.3vw'
                }}>
                  {calendarDays.map((day, index) => {
  if (!day) return <div key={index}></div>;

  const dateStr = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    day
  ).toISOString().split("T")[0];

  const attempts = activityData[dateStr] || 0;

  const dayColor = getActivityColor(day);

  const today = new Date();

  const isToday =
    day === today.getDate() &&
    currentMonth.getMonth() === today.getMonth() &&
    currentMonth.getFullYear() === today.getFullYear();

  const isBestDay = dateStr === bestDay;

  const isStreakDay = streakDays.includes(dateStr);

  return (
    <div
      key={index}
      style={{
        width: "100%",
        aspectRatio: "1/1",
        maxWidth: "2.3vw",
        borderRadius: "0.5vw",
        backgroundColor: dayColor || "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.65vw",
        fontWeight: "600",
        color: dayColor && dayColor !== "#e5e7eb" ? "white" : "#1a1a1a",

        border: isBestDay
          ? "2px solid gold"
          : isToday
          ? "2px solid #1e40af"
          : "none",

        boxShadow: isStreakDay
          ? "0 0 6px rgba(255,120,0,0.6)"
          : "none",

        cursor: "pointer",
        transition: "all 0.2s ease",
      }}

      title={`Questions: ${attempts}
Accuracy: ${Math.floor(Math.random() * 30 + 60)}%
Topic: Physics`}
    >
      {isBestDay ? "⭐" : day}
    </div>
  );
})}
                </div>
              </div>

              {/* Legend */}
              <div style={{display: 'flex', alignItems: 'center', gap: '0.6vw', marginBottom: '1.2vw', fontSize: '0.65vw', color: '#1e40af', fontWeight: '600', flexWrap: 'wrap'}}>
                <span>No Attempts</span>
                <div style={{width: '1vw', height: '1vw', borderRadius: '0.3vw', backgroundColor: '#d1d5db'}}></div>
                <span style={{marginLeft: '0.8vw'}}>Quiz Attempted</span>
                <div style={{width: '1vw', height: '1vw', borderRadius: '0.3vw', backgroundColor: '#bfdbfe'}}></div>
                <div style={{width: '1vw', height: '1vw', borderRadius: '0.3vw', backgroundColor: '#93c5fd'}}></div>
                <div style={{width: '1vw', height: '1vw', borderRadius: '0.3vw', backgroundColor: '#3b82f6'}}></div>
                <div style={{width: '1vw', height: '1vw', borderRadius: '0.3vw', backgroundColor: '#1e40af'}}></div>
              </div>

              {/* Stats Bar */}
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '1vw 0', borderTop: '0.1vw solid #bfdbfe', borderBottom: '0.1vw solid #bfdbfe'}}>
                <div>
                  <p style={{margin: 0, fontSize: '0.65vw', color: '#1e40af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Total</p>
                  <p style={{margin: '0.4vw 0 0 0', fontSize: '1.2vw', color: '#1e293b', fontWeight: '900'}}>{totalAttempts}</p>
                </div>
                <div style={{textAlign: 'right'}}>
                  <p style={{margin: 0, fontSize: '0.65vw', color: '#1e40af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Streak</p>
                  <div style={{margin: '0.4vw 0 0 0', fontSize: '1.2vw', color: '#1e40af', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3vw'}}>
                    <Flame size="1vw" fill="#1e40af" /> {streak}
                  </div>
                </div>
                <div style={{marginTop:"1vw"}}>

<h4 style={{fontSize:"0.9vw",marginBottom:"0.5vw"}}>
Achievements
</h4>

{badges.map((b,i)=>(
<span
key={i}
style={{
padding:"4px 8px",
background:"#1e40af",
color:"white",
borderRadius:"6px",
marginRight:"6px",
fontSize:"0.65vw"
}}
>
{b}
</span>
))}

</div>



              </div>
            </div>
          </div>
          

          {/* Right - Stats Cards */}
          <div style={statsCardsSection}>
            <div style={statsGrid}>
              {/* ELO Card */}
              <div style={{...statCard, background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)'}}>
                <p style={{margin: 0, fontSize: '0.7vw', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.05em'}}>Current ELO Rating</p>
                <h2 style={{margin: '0.5vw 0 0 0', fontSize: '2.2vw', fontWeight: '900', color: 'white'}}>{user.elo_rating || 910}</h2>
                <p style={{margin: '0.3vw 0 0 0', fontSize: '0.75vw', color: 'rgba(255,255,255,0.8)'}}>Professional Level</p>
                <div style={{position: 'absolute', top: '1.2vw', right: '1.2vw', width: '2.5vw', height: '2.5vw', borderRadius: '0.6vw', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '0.08vw solid rgba(255,255,255,0.2)'}}>
                  <Zap size="1.3vw" color="white" />
                </div>
              </div>

              {/* Streak Card - Blue Shade */}
              <div style={{...statCard, background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)'}}>
                <p style={{margin: 0, fontSize: '0.7vw', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.05em'}}>Current Streak</p>
                <h2 style={{margin: '0.5vw 0 0 0', fontSize: '2.2vw', fontWeight: '900', color: 'white'}}>{streak}</h2>
                <p style={{margin: '0.3vw 0 0 0', fontSize: '0.75vw', color: 'rgba(255,255,255,0.8)'}}>Days in a row</p>
                <div style={{position: 'absolute', top: '1.2vw', right: '1.2vw', width: '2.5vw', height: '2.5vw', borderRadius: '0.6vw', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '0.08vw solid rgba(255,255,255,0.2)'}}>
                  <Flame size="1.3vw" color="white" />
                </div>
              </div>

              {/* Improvement Card - Blue Shade */}
              <div style={{
                ...statCard, 
                background: improvement >= 0 
                  ? 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)' 
                  : 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)'
              }}>
                <p style={{margin: 0, fontSize: '0.7vw', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.05em'}}>Improvement</p>
                <h2 style={{margin: '0.5vw 0 0 0', fontSize: '2.2vw', fontWeight: '900', color: 'white'}}>
                  {improvement > 0 ? '+' : ''}{improvement}%
                </h2>
                <p style={{margin: '0.3vw 0 0 0', fontSize: '0.75vw', color: 'rgba(255,255,255,0.8)'}}>
                  {improvement >= 0 ? 'Last 15 ELO progression' : 'Recent progress'}
                </p>
                <div style={{position: 'absolute', top: '1.2vw', right: '1.2vw', width: '2.5vw', height: '2.5vw', borderRadius: '0.6vw', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '0.08vw solid rgba(255,255,255,0.2)'}}>
                  {improvement >= 0 ? (
                    <TrendingUp size="1.3vw" color="white" />
                  ) : (
                    <TrendingDown size="1.3vw" color="white" />
                  )}
                </div>
              </div>

              {/* Total Attempted Card - Blue Shade */}
              <div style={{...statCard, background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)'}}>
                <p style={{margin: 0, fontSize: '0.7vw', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.05em'}}>Total Attempted</p>
                <h2 style={{margin: '0.5vw 0 0 0', fontSize: '2.2vw', fontWeight: '900', color: 'white'}}>{user.total_attempts || 35}</h2>
                <p style={{margin: '0.3vw 0 0 0', fontSize: '0.75vw', color: 'rgba(255,255,255,0.85)'}}>Questions solved</p>
                <div style={{position: 'absolute', top: '1.2vw', right: '1.2vw', width: '2.5vw', height: '2.5vw', borderRadius: '0.6vw', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '0.08vw solid rgba(255,255,255,0.2)'}}>
                  <Activity size="1.3vw" color="white" />
                </div>
              </div>
            </div>

            {/* ELO Chart Section - FULL WIDTH */}
            <div style={eloChartCard}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5vw'}}>
                <h3 style={{margin: 0, fontSize: '1.15vw', color: '#1a1a1a', fontWeight: '800'}}>ELO Rating Progress</h3>
              </div>
              
              {/* Chart and Card in Row */}
              <div style={{display: 'flex', gap: '2vw', alignItems: 'flex-start'}}>
                {/* ELO Chart - Takes More Space */}
                <div style={{flex: 1, minHeight: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <EloChart data={eloHistory} />
                </div>

                {/* Get Started Card - Smaller and Fixed */}
                <div style={{...getStartedCard, minWidth: '180px', flexShrink: 0}}>
                  <h4 style={{margin: 0, fontSize: '0.9vw', fontWeight: '800', color: 'white', textAlign: 'center'}}>Start Your Preparation</h4>
                  <p style={{margin: '0.6vw 0 0 0', fontSize: '0.75vw', lineHeight: '1.3', color: 'rgba(255,255,255,0.9)', fontWeight: '500', textAlign: 'center'}}>
                    Dive into adaptive quizzes tailored to skill level. Your ELO rating is {user.elo_rating || 910}.
                  </p>
                  <button 
                    onClick={() => navigate("/quiz")}
                    style={{...getStartedBtn, marginTop: '1.2vw', padding: '0.7vw 1vw', fontSize: '0.65vw'}}
                  >
                    GET STARTED
                  </button>
                </div>
              </div>
              {/* AI Recommendation */}
<div style={{
  padding: '1.5vw',
  background: 'linear-gradient(135deg,#1e293b,#0f172a)',
  borderRadius: '0.8vw',
  color: 'white',
  marginBottom: '1.5vw'
}}>
  <h3 style={{margin:0,fontSize:'1vw'}}>🎯 AI Recommended Topic</h3>
  {recommendedTopic && (
    <>
      <p style={{marginTop:'0.5vw',fontSize:'0.85vw'}}>
        {recommendedTopic.topic} – {recommendedTopic.chapter}
      </p>
      <p style={{fontSize:'0.75vw',opacity:0.8}}>
        Estimated ELO Gain +{recommendedTopic.expected_gain}
      </p>
    </>
  )}
</div>

              {/* Performance Metrics Section */}
              <div style={{marginTop: '2vw', paddingTop: '1.5vw', borderTop: '0.1vw solid #bfdbfe', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.2vw'}}>
                
                {/* Volatility Card - Blue Shade */}
                <div style={{
                  padding: '1.2vw 1.5vw',
                  background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
                  borderRadius: '0.8vw',
                  border: `0.1vw solid #1e40af88`
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6vw'}}>
                    <span style={{
                      fontSize: '0.75vw',
                      fontWeight: '700',
                      color: 'rgba(255,255,255,0.9)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Performance Volatility
                    </span>
                    <div style={{
                      fontSize: '1vw',
                      fontWeight: '800',
                      color: 'white'
                    }}>
                      {volatility}%
                    </div>
                  </div>
                  
                  <p style={{margin: 0, fontSize: '0.75vw', color: 'rgba(255,255,255,0.85)', lineHeight: '1.4', fontWeight: '500'}}>
                    {volatilityStatus.label}
                  </p>
                  
                  <div style={{marginTop: '0.6vw', width: '100%', height: '0.35vw', background: 'rgba(255,255,255,0.2)', borderRadius: '0.3vw', overflow: 'hidden'}}>
                    <div style={{
                      width: `${Math.min(volatility * 10, 100)}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, #93c5fd 0%, #bfdbfe99)`,
                      transition: 'width 0.5s ease'
                    }}></div>
                  </div>
                </div>
                {/* Concept Mastery */}
<div style={{
  marginTop:'1.5vw',
  background:'white',
  padding:'1.5vw',
  borderRadius:'0.8vw',
  border:'1px solid #bfdbfe'
}}>
<h3 style={{marginBottom:'1vw'}}>Concept Mastery</h3>

{conceptMastery.map((c,i)=>(
<div key={i} style={{marginBottom:'0.7vw'}}>
<div style={{display:'flex',justifyContent:'space-between'}}>
<span>{c.topic}</span>
<span>{c.accuracy}%</span>
</div>

<div style={{
height:'6px',
background:'#e5e7eb',
borderRadius:'4px',
marginTop:'3px'
}}>
<div style={{
width:`${c.accuracy}%`,
height:'100%',
background:'#1e40af',
borderRadius:'4px'
}}></div>
</div>

</div>
))}
</div>
{/* Mistake Analysis */}
<div style={{
marginTop:'1.5vw',
background:'white',
padding:'1.5vw',
borderRadius:'0.8vw',
border:'1px solid #bfdbfe'
}}>
<h3 style={{marginBottom:'1vw'}}>Mistake Analysis</h3>

<p>Concept Errors: {mistakeStats.concept}%</p>
<p>Calculation Errors: {mistakeStats.calculation}%</p>
<p>Formula Errors: {mistakeStats.formula}%</p>

</div>

                {/* Consistency Card - Blue Shade */}
                <div style={{
                  padding: '1.2vw 1.5vw',
                  background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
                  borderRadius: '0.8vw',
                  border: `0.1vw solid #1e40af88`
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6vw'}}>
                    <span style={{
                      fontSize: '0.75vw',
                      fontWeight: '700',
                      color: 'rgba(255,255,255,0.9)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Consistency Score
                    </span>
                    <div style={{
                      fontSize: '1vw',
                      fontWeight: '800',
                      color: 'white'
                    }}>
                      {consistency}%
                    </div>
                  </div>
                  
                  <p style={{margin: 0, fontSize: '0.75vw', color: 'rgba(255,255,255,0.85)', lineHeight: '1.4', fontWeight: '500'}}>
                    {consistencyStatus.label}
                  </p>
                  
                  <div style={{marginTop: '0.6vw', width: '100%', height: '0.35vw', background: 'rgba(255,255,255,0.2)', borderRadius: '0.3vw', overflow: 'hidden'}}>
                    <div style={{
                      width: `${Math.min(consistency, 100)}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, #93c5fd 0%, #bfdbfe99)`,
                      transition: 'width 0.5s ease'
                    }}></div>
                  </div>
                </div>

                {/* Momentum Card - Blue Shade */}
                <div style={{
                  padding: '1.2vw 1.5vw',
                  background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
                  borderRadius: '0.8vw',
                  border: `0.1vw solid #1e40af88`
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6vw'}}>
                    <span style={{
                      fontSize: '0.75vw',
                      fontWeight: '700',
                      color: 'rgba(255,255,255,0.9)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Momentum Trend
                    </span>
                    <div style={{
                      fontSize: '1.2vw',
                      fontWeight: '800',
                      color: 'white'
                    }}>
                      {momentumStatus.icon}
                    </div>
                  </div>
                  
                  <p style={{margin: 0, fontSize: '0.75vw', color: 'rgba(255,255,255,0.85)', lineHeight: '1.4', fontWeight: '500'}}>
                    {momentumStatus.label}
                  </p>

                  <div style={{marginTop: '0.6vw', padding: '0.6vw', background: 'rgba(255,255,255,0.1)', borderRadius: '0.5vw', border: `0.08vw solid rgba(255,255,255,0.2)`, textAlign: 'center'}}>
                    <p style={{margin: 0, fontSize: '0.9vw', fontWeight: '800', color: 'white'}}>
                      {momentum > 0 ? '+' : ''}{momentum}
                    </p>
                  </div>
                </div>

              </div>

              {/* Info Grid */}
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5vw', marginTop: '1.5vw'}}>
                <div>
                  <p style={{margin: 0, fontSize: '0.7vw', fontWeight: '700', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Questions Attempted:</p>
                  <p style={{margin: '0.3vw 0 0 0', fontSize: '1vw', color: '#1a1a1a', fontWeight: '700'}}>{user.total_attempts || 35} total</p>
                </div>
                <div>
                  <p style={{margin: 0, fontSize: '0.7vw', fontWeight: '700', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Difficulty Level:</p>
                  <p style={{margin: '0.3vw 0 0 0', fontSize: '1vw', color: '#1e40af', fontWeight: '700'}}>{user.current_level || 'Easy'}</p>
                </div>
                <div>
                  <p style={{margin: 0, fontSize: '0.7vw', fontWeight: '700', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Mistakes Made:</p>
                  <p style={{margin: '0.3vw 0 0 0', fontSize: '1vw', color: '#1a1a1a', fontWeight: '700'}}>{user.mistake_counter || 0} errors</p>
                </div>
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
          background: #3b82f6;
          border-radius: 0.3vw;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #1e40af;
        }
      `}</style>
    </div>
  );
}

// ===== ELO CHART COMPONENT =====
const EloChart = ({ data }) => {
  if (!data || data.length === 0) return <div>No data</div>;

  const width = 800;
  const height = 350;
  const padding = 40;
  const graphWidth = width - 2 * padding;
  const graphHeight = height - 2 * padding;

  const maxElo = Math.max(...data.map(d => d.elo));
  const minElo = Math.min(...data.map(d => d.elo));
  const range = maxElo - minElo || 1;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * graphWidth;
    const y = height - padding - ((d.elo - minElo) / range) * graphHeight;
    return { x, y };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{minHeight: '350px', maxWidth: '100%'}}>
      <defs>
        <linearGradient id="chartGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="chartGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e40af" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect x={padding} y={padding} width={graphWidth} height={graphHeight} fill="#f8fafc" rx="8" />

      {/* Grid lines */}
      {[0, 1, 2, 3, 4].map(i => (
        <line key={i} x1={padding} y1={padding + (i * graphHeight) / 4} x2={width - padding} y2={padding + (i * graphHeight) / 4} stroke="#bfdbfe" strokeWidth="1" strokeDasharray="4,4" opacity="0.6" />
      ))}

      {/* Y-axis labels */}
      {[0, 1, 2, 3, 4].map(i => {
        const elo = maxElo - (i * range) / 4;
        return <text key={i} x={padding - 15} y={padding + (i * graphHeight) / 4 + 5} textAnchor="end" fontSize="14" fill="#1e40af" fontWeight="600">{Math.round(elo)}</text>;
      })}

      {/* Y-Axis */}
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#1e40af" strokeWidth="2" />

      {/* X-Axis */}
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#1e40af" strokeWidth="2" />

      {/* Area under curve */}
      <path d={`${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`} fill="url(#chartGradient2)" />

      {/* Main line (Blue) */}
      <path d={pathD} stroke="#1e40af" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Secondary line (Light Blue) */}
      <path d={points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y + 8}`).join(' ')} stroke="#3b82f6" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />

      {/* Points on Main Line */}
      {points.map((p, i) => (
        <circle key={`p1-${i}`} cx={p.x} cy={p.y} r="4.5" fill="white" stroke="#1e40af" strokeWidth="2" />
      ))}

      {/* Points on Secondary Line */}
      {points.map((p, i) => (
        <circle key={`p2-${i}`} cx={p.x} cy={p.y + 8} r="4.5" fill="white" stroke="#3b82f6" strokeWidth="2" />
      ))}

      {/* X-axis labels */}
      {data.map((d, i) => {
        const x = padding + (i / (data.length - 1 || 1)) * graphWidth;
        return (
          <g key={`x-label-${i}`}>
            <line x1={x} y1={height - padding} x2={x} y2={height - padding + 5} stroke="#1e40af" strokeWidth="1" />
            <text x={x} y={height - padding + 20} textAnchor="middle" fontSize="12" fill="#1e40af" fontWeight="500">
              {d.day}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// Styles
const layoutStyle = {
  display: 'flex',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
};

const sidebarStyle = {
  width: '18vw',
  backgroundColor: '#1e293b',
  color: 'white',
  padding: '2vw',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0.3vw 0 1vw rgba(0,0,0,0.1)',
  position: 'sticky',
  top: 0,
  height: '100vh',
  overflowY: 'auto'
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
  padding: '2.5vw',
  overflowY: 'auto'
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.5vw',
  marginBottom: '2.5vw',
  padding: '1.5vw 2vw',
  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  borderRadius: '1.2vw',
  boxShadow: '0 0.8vw 2vw rgba(0,0,0,0.15)'
};

const classificationBadge = {
  marginLeft: 'auto',
  backgroundColor: '#1e40af',
  color: 'white',
  padding: '0.6vw 1.2vw',
  borderRadius: '0.8vw',
  fontSize: '0.75vw',
  fontWeight: '800',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  boxShadow: '0 0.3vw 0.8vw rgba(30, 64, 175, 0.3)',
  whiteSpace: 'nowrap'
};

const mainGridContainer = {
  display: 'grid',
  gridTemplateColumns: '20vw 1fr',
  gap: '1.8vw',
  alignItems: 'start'
};

const calendarSection = {
  display: 'flex'
};

const calendarCard = {
  backgroundColor: 'white',
  padding: '1.8vw',
  borderRadius: '1.1vw',
  boxShadow: '0 0.8vw 2vw rgba(30, 64, 175, 0.08)',
  border: '0.1vw solid #bfdbfe',
  width: '100%'
};

const statsCardsSection = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.8vw'
};

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '1.2vw'
};

const statCard = {
  padding: '1.5vw',
  borderRadius: '1vw',
  color: 'white',
  boxShadow: '0 0.8vw 2vw rgba(0,0,0,0.12)',
  border: '0.1vw solid rgba(255,255,255,0.2)',
  position: 'relative',
  minHeight: '140px'
};

const eloChartCard = {
  backgroundColor: 'white',
  padding: '2vw',
  borderRadius: '1.1vw',
  boxShadow: '0 0.8vw 2vw rgba(30, 64, 175, 0.08)',
  border: '0.1vw solid #bfdbfe'
};

const getStartedCard = {
  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  color: 'white',
  padding: '1.2vw',
  borderRadius: '1vw',
  border: '0.1vw solid rgba(255,255,255,0.1)',
  boxShadow: '0 0.6vw 1.5vw rgba(0,0,0,0.2)'
};

const getStartedBtn = {
  width: '100%',
  padding: '0.7vw 1vw',
  background: 'white',
  color: '#1e40af',
  border: 'none',
  borderRadius: '0.8vw',
  fontWeight: '800',
  fontSize: '0.65vw',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const loadingStyle = {
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  color: '#1e40af',
  fontSize: '1.2vw',
  fontWeight: '500'
};

export default Dashboard;