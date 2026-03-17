import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import { 
  ChevronRight, Lightbulb, 
  Target, CheckCircle, LogOut, Home, Zap, X, Lock, Unlock
} from "lucide-react";

const API = "http://127.0.0.1:8000";
const TOTAL_QUESTIONS = 20;

function Quiz() {
  const userId = localStorage.getItem("user_id");
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState("");
  const [hintLevel, setHintLevel] = useState(0);
  const [hints, setHints] = useState({ level1: "", level2: "", level3: "" });
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eloAnimation, setEloAnimation] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);

  const [questionStatus, setQuestionStatus] = useState(
    Array(TOTAL_QUESTIONS).fill("not-visited")
  );

  useEffect(() => {
    fetchProfile();
    fetchQuestion();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        `${API}/student/profile?student_id=${userId}`
      );
      setUser(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchQuestion = async () => {
    try {
      const res = await axios.get(
        `${API}/student/next-question?student_id=${userId}`
      );
      setQuestion(res.data);
      setSelected("");
      setHintLevel(0);
      setHints({ level1: "", level2: "", level3: "" });
      setIsAnswered(false);

      setQuestionStatus((prev) => {
        const updated = [...prev];
        if (updated[currentIndex - 1] === "not-visited") {
          updated[currentIndex - 1] = "unanswered";
        }
        return updated;
      });
    } catch (err) {
      console.log(err);
    }
  };
 const downloadReport = async () => {

  const response = await fetch(
    `http://127.0.0.1:8000/student/generate-report?student_id=${userId}`
  );

  const blob = await response.blob();

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quiz_report.pdf";

  document.body.appendChild(a);
  a.click();

  a.remove();

};

  const handleSubmitAndNext = async () => {

  if (isSubmitting) return;   // 🚨 duplicate submit block

  if (!selected && !isAnswered) return;

  setIsSubmitting(true);

  try {

    const res = await axios.post(`${API}/student/attempt`, null, {
      params: {
        student_id: userId,
        question_id: question.question_id,
        answer: selected,
        time_taken: 45,
      },
    });

    const isCorrect = res.data.correct;
    const eloChange = res.data.elo_change || (isCorrect ? 15 : -7);

    triggerEloAnimation(eloChange, isCorrect);

    setQuestionStatus((prev) => {
      const updated = [...prev];
      updated[currentIndex - 1] = isCorrect ? "correct" : "wrong";
      return updated;
    });

    setIsAnswered(true);

    setTimeout(() => {

      fetchProfile();

      if (currentIndex < TOTAL_QUESTIONS) {
        setCurrentIndex((prev) => prev + 1);   // 🚨 important fix
        fetchQuestion();
      } else {
        alert("Quiz Complete! Click Submit Test to finish.");
      }

      setIsSubmitting(false);  // unlock

    }, 1200);

  } catch (err) {
    console.log(err);
    setIsSubmitting(false);
  }

};
  const triggerEloAnimation = (eloChange, isCorrect) => {
    setEloAnimation({
      id: Math.random(),
      value: eloChange,
      isCorrect: isCorrect,
    });

    setTimeout(() => {
      setEloAnimation(null);
    }, 1200);
  };

  const handleHint = async () => {
    if (hintLevel >= 3) return;

    const nextLevel = hintLevel + 1;

    try {
      const res = await axios.post(`${API}/student/hint`, null, {
        params: {
          question_id: question.question_id,
          level: nextLevel,
        },
      });

      setHints((prev) => ({
        ...prev,
        [`level${nextLevel}`]: res.data.hint,
      }));
      setHintLevel(nextLevel);
      setShowHintModal(true);

      setQuestionStatus((prev) => {
        const updated = [...prev];
        if (
          updated[currentIndex - 1] !== "correct" &&
          updated[currentIndex - 1] !== "wrong"
        ) {
          updated[currentIndex - 1] = "hinted";
        }
        return updated;
      });


      setTimeout(() => {
        setShowHintModal(false);
      }, 4000);

    } catch (err) {
      console.log(err);
    }
  };

const handleFinalSubmit = async () => {

  setIsSubmitting(true);

  await downloadReport();   // 👈 PDF download

  setTimeout(() => {

    navigate("/dashboard");

  }, 1000);

};

  if (!question || !user) {
    return <div style={loadingStyle}>Loading Quiz...</div>;
  }

  const attempted = questionStatus.filter(
    (s) => s === "correct" || s === "wrong"
  ).length;
  const correct = questionStatus.filter((s) => s === "correct").length;
  const wrong = questionStatus.filter((s) => s === "wrong").length;
  const hinted = questionStatus.filter((s) => s === "hinted").length;

  const getLevelStyle = (level) => {
    switch (level?.toLowerCase()) {
      case "easy":
        return { bg: "#d1fae5", text: "#065f46", badge: "#10b981" };
      case "medium":
        return { bg: "#fef3c7", text: "#b45309", badge: "#f59e0b" };
      case "hard":
        return { bg: "#fee2e2", text: "#b9a1a1", badge: "#ef4444" };
      default:
        return { bg: "#dbeafe", text: "#1e40af", badge: "#3b82f6" };
    }
  };
 
  const levelStyle = getLevelStyle(user.current_level);

  const getHintLevelInfo = (level) => {
    switch(level) {
      case 1:
        return { title: "BASIC HINT", color: "#3b82f6", icon: "💡" };
      case 2:
        return { title: "MODERATE HINT", color: "#8b5cf6", icon: "✨" };
      case 3:
        return { title: "ADVANCED HINT", color: "#ec4899", icon: "🔥" };
      default:
        return { title: "HINT", color: "#3b82f6", icon: "💡" };
    }
  };

  const currentHintInfo = getHintLevelInfo(hintLevel);

  return (
    <Layout>
    <div style={layoutStyle}>
      {/* Left Sidebar */}
      <aside style={leftSidebarStyle}>
        <div style={eloSectionStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5vw", marginBottom: "1.5vw" }}>
            <span style={{ fontSize: "0.85vw", fontWeight: "700", color: "#1a1a1a" }}>Live Elo</span>
          </div>
          <div style={enhancedEloCircleStyle}>
            <span style={{ fontSize: "3.2vw", fontWeight: "900", color: "#1a1a1a", position: "relative", zIndex: 1 }}>
              {Math.round(user.elo_rating || 710)}
            </span>
          </div>
          <p style={{ margin: "1.2vw 0 0 0", textAlign: "center", fontSize: "0.8vw", color: "#6b7280", fontWeight: "600" }}>
            Current Elo Rating
          </p>
        </div>
        

        {/* ELO Changes */}
        <div style={{ marginTop: "2vw", paddingTop: "1.5vw", borderTop: "0.1vw solid #e5e7eb", display: "flex", flexDirection: "column", gap: "0.8vw" }}>
          <div style={eloBlockStyle("linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)", "#065f46", "#10b981")}>
            <p style={{ margin: 0, fontSize: "0.7vw", color: "#065f46", fontWeight: "700" }}>Correct answer</p>
            <p style={{ margin: "0.3vw 0 0 0", fontSize: "1.1vw", color: "#059669", fontWeight: "900" }}>+15
               Elo</p>
          </div>

          <div style={eloBlockStyle("linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", "#1e40af", "#3b82f6")}>
            <p style={{ margin: 0, fontSize: "0.7vw", color: "#1e40af", fontWeight: "700" }}>With hint</p>
            <p style={{ margin: "0.3vw 0 0 0", fontSize: "1.1vw", color: "#2563eb", fontWeight: "900" }}>+5 Elo</p>
          </div>

          <div style={eloBlockStyle("linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)", "#991b1b", "#ef4444")}>
            <p style={{ margin: 0, fontSize: "0.7vw", color: "#991b1b", fontWeight: "700" }}>Incorrect answer</p>
            <p style={{ margin: "0.3vw 0 0 0", fontSize: "1.1vw", color: "#dc2626", fontWeight: "900" }}>-7 Elo</p>
          </div>
        </div>
      </aside>

      {/* Top Navigation */}
      <div style={topNavStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "1vw", flex: 1 }}>
          <button onClick={() => navigate("/dashboard")} style={navButtonStyle}>
            <Home size="1.3vw" />
          </button>

          <h1 style={{ margin: 0, color: "white", fontSize: "1.4vw", fontWeight: "900" }}>The Academic Spot</h1>

          <h1 style={{ margin: 0, color: "white", fontSize: "1.4vw", fontWeight: "900" }}>Quiz Arena</h1>

        </div>

        <div style={headerStatBoxStyle}>
          <span style={{ fontSize: "0.6vw", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase" }}>QUESTION</span>
          <span style={{ fontSize: "1.1vw", color: "white", fontWeight: "900" }}>
            {currentIndex}/{TOTAL_QUESTIONS}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.7vw", marginLeft: "auto" }}>
          <div style={{ background: `linear-gradient(135deg, ${levelStyle.bg} 0%, ${levelStyle.bg}dd 100%)`, color: levelStyle.text, padding: "0.7vw 1.1vw", borderRadius: "0.8vw", fontSize: "0.75vw", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", border: `0.12vw solid ${levelStyle.badge}`, boxShadow: `0 0.3vw 0.8vw ${levelStyle.badge}30` }}>
            {user.current_level}
          </div>

          <button onClick={() => { localStorage.clear(); navigate("/login"); }} style={logoutNavBtn}>
            <LogOut size="1vw" />

          </button>
        </div>
      </div>

      <div style={mainBodyStyle}>
        {/* Main Question Container */}
        <div style={questionContainerStyle}>
          {/* ELO Animation */}
          {eloAnimation && (
            <div style={eloAnimationStyle(eloAnimation.isCorrect)}>
              <span style={{ fontSize: "2.5vw", fontWeight: "900" }}>
                {eloAnimation.isCorrect ? "+" : ""}{eloAnimation.value} ELO
              </span>
            </div>
          )}

          {/* Hint Modal */}
          {showHintModal && (
            <div style={hintModalOverlay} onClick={() => setShowHintModal(false)}>
              <div style={hintModalContainer} onClick={(e) => e.stopPropagation()}>
                <div style={{ ...hintModalHeader, background: `linear-gradient(135deg, ${currentHintInfo.color} 0%, ${currentHintInfo.color}dd 100%)` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
                    <span style={{ fontSize: "2vw" }}>{currentHintInfo.icon}</span>
                    <div>
                      <h2 style={{ margin: 0, color: "white", fontSize: "1.3vw", fontWeight: "900" }}>{currentHintInfo.title}</h2>
                      <p style={{ margin: "0.2vw 0 0 0", fontSize: "0.75vw", color: "rgba(255,255,255,0.85)" }}>Level {hintLevel} of 3</p>
                    </div>
                  </div>
                  <button onClick={() => setShowHintModal(false)} style={hintCloseBtn}>
                    <X size="1.2vw" />
                  </button>
                </div>

                <div style={hintModalProgressBar}>
                  {[1, 2, 3].map((level) => (
                    <div key={level} style={{ flex: 1, height: "0.35vw", background: level <= hintLevel ? `linear-gradient(90deg, ${currentHintInfo.color} 0%, ${currentHintInfo.color}99)` : "#e5e7eb", borderRadius: "0.15vw", transition: "all 0.5s ease" }} />
                  ))}
                </div>

                <div style={hintModalContent}>
                  <p style={{ margin: 0, fontSize: "0.8vw", color: "#64748b", fontWeight: "700", textTransform: "uppercase", marginBottom: "0.8vw" }}>
                    Get a hint to help solve this question
                  </p>
                  <div style={{ background: `linear-gradient(135deg, ${currentHintInfo.color}08 0%, ${currentHintInfo.color}04 100%)`, padding: "1.2vw", borderRadius: "0.9vw", border: `0.15vw solid ${currentHintInfo.color}30`, borderLeft: `0.4vw solid ${currentHintInfo.color}` }}>
                    <p style={{ margin: 0, fontSize: "0.95vw", color: "#1a1a1a", lineHeight: "1.6", fontWeight: "500" }}>
                      {hints[`level${hintLevel}`]}
                    </p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.8vw", marginTop: "1.2vw" }}>
                    {[1, 2, 3].map((level) => (
                      <div key={level} style={{ padding: "0.9vw", borderRadius: "0.8vw", background: level <= hintLevel ? `linear-gradient(135deg, ${currentHintInfo.color}15 0%, ${currentHintInfo.color}08 100%)` : "#f8fafc", border: `0.12vw solid ${level <= hintLevel ? currentHintInfo.color : "#e2e8f0"}`, textAlign: "center", transition: "all 0.3s ease", boxShadow: level <= hintLevel ? `0 0.2vw 0.6vw ${currentHintInfo.color}20` : "none" }}>
                        <p style={{ margin: 0, fontSize: "0.7vw", fontWeight: "800", color: level <= hintLevel ? currentHintInfo.color : "#9ca3af", textTransform: "uppercase" }}>L{level}</p>
                        <p style={{ margin: "0.3vw 0 0 0", fontSize: "0.65vw", color: level <= hintLevel ? currentHintInfo.color : "#6b7280", fontWeight: "700" }}>
                          {level <= hintLevel ? "✓" : "Locked"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={hintModalFooter}>
                  <button onClick={() => setShowHintModal(false)} style={hintModalBtn}>
                    Got it!
                  </button>
                  {hintLevel < 3 && (
                    <button onClick={() => { setShowHintModal(false); handleHint(); }} style={{ ...hintModalBtn, background: `linear-gradient(135deg, ${currentHintInfo.color} 0%, ${currentHintInfo.color}dd 100%)`, color: "white", border: `0.15vw solid ${currentHintInfo.color}` }}>
                      Next Hint
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Scrollable Content */}
          <div style={scrollableContentStyle}>
            {/* Question Header */}
            <div style={questionHeaderStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8vw" }}>
                <div>
                  <span style={{ fontSize: "0.75vw", color: "#3b82f6", fontWeight: "800", textTransform: "uppercase" }}>📍 QUESTION {currentIndex}</span>
                  <p style={{ margin: "0.3vw 0 0 0", fontSize: "0.7vw", color: "#94a3b8", fontWeight: "600" }}>
                    Progress: {Math.round((currentIndex / TOTAL_QUESTIONS) * 100)}%
                  </p>
                </div>
              </div>
              <div style={{ width: "100%", height: "0.6vw", background: "linear-gradient(90deg, #e0e7ff 0%, #f3f4f6 100%)", borderRadius: "0.3vw", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(currentIndex / TOTAL_QUESTIONS) * 100}%`, background: "linear-gradient(90deg, #3b82f6 0%, #1d4ed8 50%, #2563eb 100%)", transition: "width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)", borderRadius: "0.3vw" }} />
              </div>
            </div>

            {/* Question Text */}
            <div style={questionTextStyle}>
              <h2 style={{ margin: 0, color: "#1a1a1a", fontSize: "1.15vw", fontWeight: "900", lineHeight: "1.5" }}>
                {question.question}
              </h2>
            </div>

            {/* Options */}
            <div style={optionsContainerStyle}>
              {Object.entries(question.options).map(([key, value]) => (
                <button key={key} style={{ ...optionButtonStyle(selected === key, isAnswered), opacity: isAnswered ? 0.65 : 1, pointerEvents: isAnswered ? "none" : "auto" }} onClick={() => !isAnswered && setSelected(key)} onMouseEnter={(e) => { if (selected !== key && !isAnswered) { e.currentTarget.style.background = "linear-gradient(135deg, #f0f4ff 0%, #f5f3ff 100%)"; e.currentTarget.style.boxShadow = "0 0.6vw 1.4vw rgba(59, 130, 246, 0.35)"; } }} onMouseLeave={(e) => { if (selected !== key && !isAnswered) { e.currentTarget.style.background = "white"; e.currentTarget.style.boxShadow = "none"; } }}>
                  <div style={{ width: "2.2vw", height: "2.2vw", borderRadius: "50%", background: selected === key ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" : "linear-gradient(135deg, #f1f5f9 0%, #e5e7eb 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: selected === key ? "white" : "#6b7280", fontWeight: "800", flexShrink: 0, fontSize: "0.8vw", boxShadow: selected === key ? "0 0.4vw 1.2vw rgba(59, 130, 246, 0.4)" : "none" }}>
                    {key}
                  </div>
                  <span style={{ fontSize: "0.9vw", color: "#1a1a1a", fontWeight: "600", flex: 1, textAlign: "left" }}>
                    {value}
                  </span>
                </button>
              ))}
            </div>

            {/* Hints Section */}
            <div style={compactHintContainerStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.7vw", borderBottom: "0.1vw solid rgba(59, 130, 246, 0.25)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6vw" }}>
                  <Lightbulb size="1.2vw" color="#3b82f6" />
                  <span style={{ fontSize: "0.85vw", fontWeight: "900", color: "#1e293b", textTransform: "uppercase" }}>Hints</span>
                </div>
                <div style={{ fontSize: "0.75vw", fontWeight: "900", color: "#3b82f6", background: "rgba(59, 130, 246, 0.2)", padding: "0.3vw 0.7vw", borderRadius: "0.5vw" }}>
                  {hintLevel}/3
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.8vw", marginTop: "0.8vw" }}>
                {[1, 2, 3].map((level) => (
                  <div key={level} style={getHintCardStyle(level, hintLevel, currentHintInfo)}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4vw" }}>
                      {hintLevel >= level ? <Unlock size="1vw" color={level === 1 ? "#3b82f6" : level === 2 ? "#8b5cf6" : "#ec4899"} /> : <Lock size="1vw" color="#cbd5e1" />}
                      <span style={{ fontSize: "0.7vw", fontWeight: "900", color: hintLevel >= level ? (level === 1 ? "#1d4ed8" : level === 2 ? "#6d28d9" : "#be185d") : "#94a3b8", textTransform: "uppercase" }}>
                        L{level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={handleHint} disabled={hintLevel >= 3 || isAnswered} style={compactHintButtonStyle(hintLevel >= 3 || isAnswered)}>
                <Lightbulb size="0.95vw" />
                <span style={{ fontWeight: "800" }}>{hintLevel >= 3 ? "All Done" : `Get Hint (${3 - hintLevel})`}</span>
              </button>
            </div>
          </div>

          {/* Fixed Submit Button */}
          <div style={fixedBottomStyle}>
            <button onClick={handleSubmitAndNext}disabled={(!selected && !isAnswered) || isSubmitting} style={submitNextButtonStyle(!selected && !isAnswered, isAnswered)}>
              <CheckCircle size="1.2vw" />
              <span style={{ fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.9vw" }}>
                {isAnswered ? currentIndex >= TOTAL_QUESTIONS ? "✓ Complete" : "Next ⏭️" : "Save & Next"}
              </span>
              <ChevronRight size="1.1vw" />
            </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside style={sidebarStyle}>
          {/* Stats */}
          <div style={overviewBoxStyle}>
            <h3 style={{ margin: "0 0 0.8vw 0", fontSize: "0.8vw", color: "#1e293b", fontWeight: "900", textTransform: "uppercase" }}>📊 STATS</h3>

            <div style={overviewItemStyle}>
              <span style={{ fontSize: "0.7vw", fontWeight: "700", color: "#64748b" }}>📝 Attempted</span>
              <span style={{ fontSize: "1.2vw", fontWeight: "900", color: "#3b82f6" }}>{attempted}</span>
            </div>

            <div style={overviewItemStyle}>
              <span style={{ fontSize: "0.7vw", fontWeight: "700", color: "#64748b" }}>✅ Correct</span>
              <span style={{ fontSize: "1.2vw", fontWeight: "900", color: "#10b981" }}>{correct}</span>
            </div>

            <div style={overviewItemStyle}>
              <span style={{ fontSize: "0.7vw", fontWeight: "700", color: "#64748b" }}>❌ Wrong</span>
              <span style={{ fontSize: "1.2vw", fontWeight: "900", color: "#ef4444" }}>{wrong}</span>
            </div>

            <div style={{ ...overviewItemStyle, borderBottom: "none" }}>
              <span style={{ fontSize: "0.7vw", fontWeight: "700", color: "#64748b" }}>💡 Hints</span>
              <span style={{ fontSize: "1.2vw", fontWeight: "900", color: "#f59e0b" }}>{hinted}</span>
            </div>
          </div>

          {/* Question Palette */}
          <div style={paletteContainerStyle}>
            <h3 style={{ margin: "0 0 0.7vw 0", fontSize: "0.8vw", color: "#1e293b", fontWeight: "900", textTransform: "uppercase" }}>📍 QUESTIONS</h3>
            <div style={paletteGridStyle}>
              {questionStatus.map((status, index) => (
                <button key={index} style={paletteBoxStyle(status, currentIndex === index + 1)} onClick={() => { }} title={`Q${index + 1}`}>
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Test */}
          <button onClick={handleFinalSubmit} disabled={isSubmitting} style={submitTestButtonStyle(isSubmitting)}>
            <Zap size="1vw" />
            <span style={{ fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.8vw" }}>Submit</span>
            <ChevronRight size="0.95vw" />
          </button>
        </aside>

      </div>
      



      <style>{`
        @keyframes floatAndFade {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          10% { opacity: 1; transform: translate(-50%, -60%) scale(1.2); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: translate(calc(-50% + 400px), calc(-50% - 300px)) scale(0.8); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes floatDown {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          10% { opacity: 1; transform: translate(-50%, -60%) scale(1.2); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: translate(calc(-50% + 400px), calc(-50% + 200px)) scale(0.8); }
        }
        @keyframes modalSlideIn {
          from { opacity: 0; transform: scale(0.8) translateY(1vw); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 0.5vw; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%); border-radius: 0.8vw; }
        ::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #94a3b8 0%, #64748b 100%); }
      `}</style>
    </div>
    </Layout>
  );
}

// STYLE CONSTANTS
const layoutStyle = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  overflow: "hidden"
};

const leftSidebarStyle = {
  width: "18vw",
  padding: "2vw",
  borderRight: "0.1vw solid #e5e7eb",
  display: "flex",
  flexDirection: "column",
  position: "fixed",
  left: 0,
  top: 0,
  height: "100vh",
  overflowY: "auto",
  zIndex: 10,
  background: "linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%)"
};

const eloSectionStyle = {
  backgroundColor: "white",
  padding: "1.5vw",
  borderRadius: "1vw",
  boxShadow: "0 0.4vw 1.2vw rgba(20, 184, 166, 0.1)",
  border: "0.1vw solid #ccfbf1",
  textAlign: "center",
  background: "linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%)"
};

const enhancedEloCircleStyle = {
  width: "11vw",
  height: "11vw",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "1.2vw auto",
  background: "radial-gradient(circle at 30% 30%, #ffffff, #f0fdfa)",
  position: "relative",
  boxShadow: "inset 0 0.3vw 0.8vw rgba(20, 184, 166, 0.15), 0 0.6vw 1.5vw rgba(20, 184, 166, 0.25)"
};

const eloBlockStyle = (bgColor, textColor, borderColor) => ({
  padding: "1.1vw",
  background: bgColor,
  borderRadius: "0.9vw",
  border: `0.1vw solid ${borderColor}`,
  borderLeft: `0.4vw solid ${borderColor}`,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  boxShadow: `0 0.3vw 0.8vw ${borderColor}25`
});

const topNavStyle = {
  background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
  padding: "0.95vw 2vw",
  display: "flex",
  alignItems: "center",
  gap: "1.5vw",
  boxShadow: "0 0.6vw 1.8vw rgba(0,0,0,0.2)",
  border: "0.1vw solid rgba(255,255,255,0.1)",
  flexShrink: 0,
  marginLeft: "18vw"
};

const navButtonStyle = {
  background: "rgba(255,255,255,0.12)",
  border: "0.1vw solid rgba(255,255,255,0.25)",
  borderRadius: "0.7vw",
  padding: "0.6vw 0.9vw",
  color: "white",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.3s ease",
  backdropFilter: "blur(10px)",
  flexShrink: 0
};

const headerStatBoxStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.2vw",
  padding: "0.7vw 1.1vw",
  background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.08) 100%)",
  borderRadius: "0.8vw",
  backdropFilter: "blur(10px)",
  border: "0.1vw solid rgba(255,255,255,0.2)"
};

const logoutNavBtn = {
  background: "linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(236, 72, 153, 0.1) 100%)",
  border: "0.1vw solid rgba(236, 72, 153, 0.4)",
  color: "#f9a8d4",
  padding: "0.6vw 0.9vw",
  borderRadius: "0.7vw",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.3s ease",
  backdropFilter: "blur(10px)",
  flexShrink: 0
};

const eloAnimationStyle = (isCorrect) => ({
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  fontWeight: "900",
  color: isCorrect ? "#6366f1" : "#ec4899",
  textShadow: isCorrect ? "0 0 2vw rgba(99, 102, 241, 0.8)" : "0 0 2vw rgba(236, 72, 153, 0.8)",
  zIndex: 9999,
  pointerEvents: "none",
  animation: isCorrect ? "floatAndFade 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "floatDown 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, shake 0.5s ease-in-out 0s"
});

const hintModalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.65)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10000,
  backdropFilter: "blur(5px)"
};

const hintModalContainer = {
  backgroundColor: "white",
  borderRadius: "1.4vw",
  boxShadow: "0 2.5vw 6vw rgba(0, 0, 0, 0.35)",
  maxWidth: "45vw",
  width: "90%",
  overflow: "hidden",
  animation: "modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
  border: "0.15vw solid rgba(255, 255, 255, 0.3)"
};

const hintModalHeader = {
  padding: "1.9vw",
  color: "white",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "0.15vw solid rgba(255, 255, 255, 0.2)"
};

const hintCloseBtn = {
  background: "rgba(255,255,255,0.2)",
  border: "0.1vw solid rgba(255,255,255,0.3)",
  borderRadius: "0.6vw",
  padding: "0.4vw 0.6vw",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  transition: "all 0.3s ease",
  backdropFilter: "blur(10px)"
};

const hintModalProgressBar = {
  display: "flex",
  gap: "0.8vw",
  padding: "1.3vw 1.9vw",
  background: "linear-gradient(135deg, #f8fafc 0%, #f0f4ff 100%)",
  borderBottom: "0.1vw solid #dbeafe"
};

const hintModalContent = {
  padding: "2.1vw 1.9vw"
};

const hintModalFooter = {
  display: "flex",
  gap: "1vw",
  padding: "1.6vw 1.9vw",
  borderTop: "0.1vw solid #e2e8f0",
  background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)"
};

const hintModalBtn = {
  flex: 1,
  padding: "0.95vw 1.2vw",
  background: "white",
  border: "0.15vw solid #3b82f6",
  borderRadius: "0.8vw",
  color: "#3b82f6",
  fontWeight: "800",
  fontSize: "0.85vw",
  cursor: "pointer",
  transition: "all 0.3s ease",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  boxShadow: "0 0.2vw 0.5vw rgba(59, 130, 246, 0.15)"
};

const mainBodyStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 20vw",
  gap: "1.2vw",
  padding: "1.2vw 2vw",
  paddingLeft: "calc(18vw + 2vw)",
  flex: 1,
  marginTop: "calc(4.5vw)",
  minHeight: 0
};

const questionContainerStyle = {
  backgroundColor: "white",
  borderRadius: "1.2vw",
  boxShadow: "0 1vw 3vw rgba(59, 130, 246, 0.12)",
  border: "0.1vw solid #dbeafe",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  minHeight: 0,
  overflow: "hidden",
  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)"
};

const scrollableContentStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "1.2vw",
  overflow: "auto",
  padding: "1.6vw",
  flex: 1
};

const questionHeaderStyle = {
  paddingBottom: "0.95vw",
  borderBottom: "0.15vw solid #f1f5f9",
  flexShrink: 0
};

const questionTextStyle = {
  padding: "1.4vw",
  borderRadius: "1vw",
  border: "0.15vw solid #bfdbfe",
  borderLeft: "0.4vw solid #3b82f6",
  background: "linear-gradient(135deg, #f0f4ff 0%, #f8fafc 100%)",
  flexShrink: 0,
  boxShadow: "0 0.3vw 0.8vw rgba(59, 130, 246, 0.15)"
};

const optionsContainerStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0.95vw",
  flexShrink: 0
};

const optionButtonStyle = (isSelected, isAnswered) => ({
  padding: "1.1vw 1.3vw",
  border: `0.12vw solid ${isSelected ? "#3b82f6" : "#e2e8f0"}`,
  borderRadius: "0.95vw",
  background: isSelected ? "linear-gradient(135deg, #eff6ff 0%, #f0f4ff 100%)" : "white",
  cursor: isAnswered ? "not-allowed" : "pointer",
  display: "flex",
  alignItems: "center",
  gap: "0.9vw",
  transition: "all 0.3s ease",
  fontWeight: isSelected ? "700" : "550",
  color: "#1a1a1a",
  boxShadow: isSelected ? "0 0.4vw 1vw rgba(59, 130, 246, 0.2)" : "0 0.2vw 0.4vw rgba(0,0,0,0.04)"
});

const compactHintContainerStyle = {
  background: "linear-gradient(135deg, #dbeafe 0%, #f0f4ff 100%)",
  padding: "1.3vw",
  borderRadius: "1.1vw",
  border: "0.12vw solid #bfdbfe",
  borderLeft: "0.4vw solid #3b82f6",
  boxShadow: "0 0.5vw 1.5vw rgba(59, 130, 246, 0.18)",
  display: "flex",
  flexDirection: "column",
  gap: "0.9vw",
  flexShrink: 0
};

const getHintCardStyle = (level, hintLevel, currentHintInfo) => {
  let bgColor = "#f8fafc";
  let gradStart = "#f8fafc";
  let gradEnd = "#f3f4f6";
  let borderCol = "#e2e8f0";
  let shadowCol = "transparent";

  if (hintLevel >= level) {
    if (level === 1) {
      gradStart = "#dbeafe";
      gradEnd = "#bfdbfe";
      borderCol = "#3b82f6";
      shadowCol = "rgba(59, 130, 246, 0.25)";
    } else if (level === 2) {
      gradStart = "#ede9fe";
      gradEnd = "#ddd6fe";
      borderCol = "#8b5cf6";
      shadowCol = "rgba(139, 92, 246, 0.25)";
    } else {
      gradStart = "#fce7f3";
      gradEnd = "#fbcfe8";
      borderCol = "#ec4899";
      shadowCol = "rgba(236, 72, 153, 0.25)";
    }
  }

  return {
    padding: "0.95vw",
    background: `linear-gradient(135deg, ${gradStart} 0%, ${gradEnd} 100%)`,
    border: `0.12vw solid ${borderCol}`,
    borderRadius: "0.9vw",
    cursor: hintLevel >= level ? "pointer" : "default",
    transition: "all 0.3s ease",
    boxShadow: hintLevel >= level ? `0 0.4vw 1vw ${shadowCol}` : "none"
  };
};

const compactHintButtonStyle = (isDisabled) => ({
  width: "100%",
  padding: "0.9vw 1.1vw",
  background: isDisabled ? "linear-gradient(135deg, #e5e7eb 0%, #d4d4d8 100%)" : "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)",
  color: isDisabled ? "#9ca3af" : "white",
  border: isDisabled ? "0.1vw solid #d1d5db" : "0.1vw solid #1e40af",
  borderRadius: "0.85vw",
  fontWeight: "800",
  fontSize: "0.78vw",
  cursor: isDisabled ? "not-allowed" : "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.65vw",
  transition: "all 0.3s ease",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  boxShadow: isDisabled ? "none" : "0 0.5vw 1.2vw rgba(59, 130, 246, 0.4)",
  opacity: isDisabled ? 0.65 : 1,
  flexShrink: 0
});

const fixedBottomStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "1vw",
  padding: "1.6vw",
  borderTop: "0.15vw solid #dbeafe",
  flexShrink: 0,
  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)"
};

const submitNextButtonStyle = (isDisabled, isAnswered) => ({
  padding: "1.15vw 1.5vw",
  background: isDisabled ? "linear-gradient(135deg, #e5e7eb 0%, #d4d4d8 100%)" : "linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)",
  color: isDisabled ? "#9ca3af" : "white",
  border: isDisabled ? "0.1vw solid #d1d5db" : "0.1vw solid #312e81",
  borderRadius: "0.95vw",
  fontWeight: "900",
  fontSize: "0.9vw",
  cursor: isDisabled ? "not-allowed" : "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.75vw",
  transition: "all 0.3s ease",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  boxShadow: isDisabled ? "none" : "0 0.9vw 2vw rgba(99, 102, 241, 0.55)",
  opacity: isDisabled ? 0.65 : 1,
  transform: isAnswered ? "scale(0.97)" : "scale(1)"
});

const sidebarStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "1vw",
  height: "100%",
  overflow: "hidden",
  minHeight: 0
};

const overviewBoxStyle = {
  backgroundColor: "white",
  padding: "1.1vw",
  borderRadius: "1vw",
  boxShadow: "0 0.4vw 1.2vw rgba(59, 130, 246, 0.12)",
  border: "0.1vw solid #dbeafe",
  background: "linear-gradient(135deg, #f8fafc 0%, #f0f4ff 100%)",
  flexShrink: 0
};

const overviewItemStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.8vw 0",
  borderBottom: "0.1vw solid #f1f5f9"
};

const paletteContainerStyle = {
  backgroundColor: "white",
  padding: "1.1vw",
  borderRadius: "1vw",
  boxShadow: "0 0.4vw 1.2vw rgba(0,0,0,0.08)",
  border: "0.1vw solid #e5e7eb",
  background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
  flex: 1,
  overflow: "auto",
  minHeight: 0
};

const paletteGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "0.35vw"
};

const paletteBoxStyle = (status, isCurrent) => {
  let bgColor = "#f3f4f6";
  let color = "#6b7280";
  let borderColor = "#e5e7eb";

  if (status === "correct") {
    bgColor = "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)";
    color = "#065f46";
    borderColor = "#6ee7b7";
  } else if (status === "wrong") {
    bgColor = "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)";
    color = "#991b1b";
    borderColor = "#fca5a5";
  } else if (status === "hinted") {
    bgColor = "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)";
    color = "#92400e";
    borderColor = "#fcd34d";
  } else if (status === "unanswered") {
    bgColor = "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)";
    color = "#1d4ed8";
    borderColor = "#93c5fd";
  }

  return {
    width: "100%",
    aspectRatio: "1",
    padding: "0.35vw",
    background: bgColor,
    color: color,
    border: `0.15vw solid ${isCurrent ? "#3b82f6" : borderColor}`,
    borderRadius: "0.6vw",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "0.65vw",
    boxShadow: isCurrent ? "0 0 0 0.3vw rgba(59, 130, 246, 0.3)" : "none"
  };
};

const submitTestButtonStyle = (isDisabled) => ({
  padding: "0.9vw 0.8vw",
  background: isDisabled ? "linear-gradient(135deg, #e5e7eb 0%, #d4d4d8 100%)" : "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)",
  color: isDisabled ? "#9ca3af" : "white",
  border: isDisabled ? "0.1vw solid #d1d5db" : "0.1vw solid #1e40af",
  borderRadius: "0.8vw",
  fontWeight: "900",
  fontSize: "0.8vw",
  cursor: isDisabled ? "not-allowed" : "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5vw",
  transition: "all 0.3s ease",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  boxShadow: isDisabled ? "none" : "0 0.6vw 1.4vw rgba(59, 130, 246, 0.5)",
  opacity: isDisabled ? 0.6 : 1,
  flexShrink: 0
});

const loadingStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
  fontSize: "1.2vw",
  color: "#64748b",
  fontWeight: "500"
};

export default Quiz;