import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  PlayCircle,
  LayoutDashboard,
  BookOpenCheck,
  Award,
  TrendingUp,
  LogOut,
  Clock,
  ChevronRight
} from "lucide-react";

const API = "https://the-academic-spot.onrender.com";

function DPP() {

  const [user,setUser] = useState(null);
  const [loading,setLoading] = useState(true);
  const [currentTime,setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );

  const [subjects,setSubjects] = useState([]);
  const [chapters,setChapters] = useState({});
  const [expandedSubject,setExpandedSubject] = useState(null);

  const navigate = useNavigate();

  // ================= PROFILE + SUBJECTS =================

  useEffect(()=>{

    const timer = setInterval(()=>{
      setCurrentTime(new Date().toLocaleTimeString());
    },1000);

    const fetchProfile = async()=>{

      const userId = localStorage.getItem("user_id");

      if(!userId){
        navigate("/login");
        return;
      }

      try{

        const res = await axios.get(
          `${API}/student/profile?student_id=${userId}`
        );

        setUser(res.data);
        setLoading(false);

      }catch{
        navigate("/login");
      }

    };


    const fetchSubjects = async()=>{

      try{

        const res = await axios.get(
          `${API}/admin/subjects`
        );

        setSubjects(res.data);

      }catch(err){
        console.log(err);
      }

    };

    fetchProfile();
    fetchSubjects();

    return ()=>clearInterval(timer);

  },[navigate]);



  // ================= FETCH CHAPTERS =================

  const fetchChapters = async(subject)=>{

    try{

      const res = await axios.get(
        `${API}/admin/chapters/${subject}`
      );

      setChapters(prev=>({
        ...prev,
        [subject]:res.data
      }));

    }catch(err){
      console.log(err);
    }

  };



  // ================= SUBJECT CLICK =================

  const handleSubjectClick = (subject)=>{

    if(expandedSubject === subject){

      setExpandedSubject(null);

    }else{

      setExpandedSubject(subject);

      if(!chapters[subject]){
        fetchChapters(subject);
      }

    }

  };



  if(loading || !user)
    return <div style={loadingStyle}>Loading DPP...</div>



  return(

    <div style={layoutStyle}>


      {/* SIDEBAR */}

      <aside style={sidebarStyle}>

        <h2 style={{color:"white"}}>EduPrep</h2>

        <div
          style={navItem}
          onClick={()=>navigate("/dashboard")}
        >
          <LayoutDashboard size={18}/>
          Dashboard
        </div>

        <div style={activeNavItem}>
          <BookOpenCheck size={18}/>
          Daily Practice
        </div>

        <div
          style={navItem}
          onClick={()=>navigate("/mock")}
        >
          <Award size={18}/>
          Mock Tests
        </div>

        <div style={navItem}>
          <TrendingUp size={18}/>
          Statistics
        </div>

        <button
          style={logoutBtn}
          onClick={()=>{
            localStorage.clear();
            navigate("/login");
          }}
        >
          <LogOut size={16}/> Sign Out
        </button>

      </aside>



      {/* MAIN CONTENT */}

      <main style={mainContent}>


        <header style={headerStyle}>

          <div>

            <h1 style={{margin:0}}>
              Daily Practice Problems 📚
            </h1>

            <p>
              Your Level: <strong>{user.current_level}</strong>
            </p>

          </div>

          <div style={headerTimeSection}>
            <Clock size={16}/>
            {currentTime}
          </div>

        </header>



        <h3>Select Subject & Chapter</h3>



        {/* SUBJECT ACCORDION */}

        {subjects.map((subject)=>(
          
          <div
            key={subject}
            style={subjectAccordionStyle}
          >

            <div
              style={subjectHeaderStyle}
              onClick={()=>handleSubjectClick(subject)}
            >

              <h3 style={{margin:0}}>
                {subject}
              </h3>

              {expandedSubject === subject
                ? <ChevronUp/>
                : <ChevronDown/>
              }

            </div>



            {expandedSubject === subject && (

              <div style={chaptersListStyle}>

                {(chapters[subject] || []).map((chapter,i)=>(

                  <div
                    key={i}
                    style={chapterCardStyle}
                  >

                    <span>{chapter}</span>

                    <button
                      style={attemptButtonStyle}
                      onClick={()=>navigate(
                        `/quiz?subject=${subject}&chapter=${encodeURIComponent(chapter)}`
                      )}
                    >

                      <PlayCircle size={16}/>
                      Start Practice
                      <ChevronRight size={16}/>

                    </button>

                  </div>

                ))}

              </div>

            )}

          </div>

        ))}

      </main>

    </div>

  );

}

export default DPP;



/* ================= CSS ================= */

const layoutStyle={
  display:"flex",
  minHeight:"100vh",
  fontFamily:"Inter, sans-serif",
  background:"#f8fafc"
};

const sidebarStyle={
  width:"220px",
  background:"#1e293b",
  color:"#94a3b8",
  padding:"30px",
  display:"flex",
  flexDirection:"column",
  gap:"15px"
};

const navItem={
  display:"flex",
  gap:"8px",
  alignItems:"center",
  cursor:"pointer"
};

const activeNavItem={
  ...navItem,
  color:"#667eea",
  fontWeight:"bold"
};

const logoutBtn={
  marginTop:"auto",
  padding:"10px",
  border:"none",
  background:"#334155",
  color:"white",
  borderRadius:"8px",
  cursor:"pointer"
};

const mainContent={
  flex:1,
  padding:"40px"
};

const headerStyle={
  display:"flex",
  justifyContent:"space-between",
  marginBottom:"30px"
};

const headerTimeSection={
  display:"flex",
  alignItems:"center",
  gap:"8px"
};

const subjectAccordionStyle={
  background:"white",
  borderRadius:"10px",
  marginBottom:"15px",
  boxShadow:"0 4px 10px rgba(0,0,0,0.05)"
};

const subjectHeaderStyle={
  padding:"18px",
  display:"flex",
  justifyContent:"space-between",
  alignItems:"center",
  cursor:"pointer",
  background:"#e0e7ff",
  borderRadius:"10px"
};

const chaptersListStyle={
  padding:"15px"
};

const chapterCardStyle={
  display:"flex",
  justifyContent:"space-between",
  alignItems:"center",
  padding:"12px",
  marginBottom:"10px",
  background:"#f1f5f9",
  borderRadius:"8px"
};

const attemptButtonStyle={
  padding:"8px 14px",
  background:"#667eea",
  color:"white",
  border:"none",
  borderRadius:"8px",
  cursor:"pointer",
  display:"flex",
  alignItems:"center",
  gap:"6px"
};

const loadingStyle={
  height:"100vh",
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  fontSize:"18px"
};