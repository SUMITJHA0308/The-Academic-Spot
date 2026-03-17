import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/dashboard.css";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import InsightBanner from "../components/InsightBanner";
import StatCard from "../components/StatCard";

import AIRecommendation from "../components/AIRecommendation";
import ConceptMastery from "../components/ConceptMastery";
import MistakeAnalysis from "../components/MistakeAnalysis";
import EloChart from "../components/EloChart";
import StudyTip from "../components/StudyTip";
import PracticeCalendar from "../components/PracticeCalendar";

const API = "https://the-academic-spot-2.onrender.com";

function Dashboard(){

const [profile,setProfile] = useState(null)

const [eloHistory,setEloHistory] = useState([])
const [concepts,setConcepts] = useState([])
const [mistakes,setMistakes] = useState({})
const [recommendation,setRecommendation] = useState({})
const [insight,setInsight] = useState({})
const [studyTip,setStudyTip] = useState({})

useEffect(()=>{

/* ================= FETCH PROFILE ================= */

axios
.get(`${API}/student/profile?student_id=1`)
.then(res => {

const data = res.data

setProfile({
name:"Scholar",
elo_rating:data.elo_rating,
accuracy:data.accuracy,
total_attempts:data.total_attempts,
current_level:data.current_level,
streak:0
})

})
.catch(err=>{
console.log("Profile API error",err)
})

/* ================= STATIC DATA ================= */

setEloHistory([
{attempt:1,elo:1000},
{attempt:2,elo:1020},
{attempt:3,elo:1050},
{attempt:4,elo:1070},
{attempt:5,elo:1080}
])

setConcepts([
{topic:"Mechanics",mastery:82},
{topic:"Thermodynamics",mastery:54},
{topic:"Electrostatics",mastery:31},
{topic:"Modern Physics",mastery:71}
])

setMistakes({
concept_errors:35,
calculation_errors:40,
formula_errors:25
})

setRecommendation({
topic:"Electrostatics",
elo_gain:40
})

setInsight({
message:"Your accuracy improved but Electrostatics performance dropped",
improvement:8
})

setStudyTip({
tip:"Students with 1100 ELO improve accuracy by practicing Electrostatics daily"
})

},[])

/* ================= LOADING ================= */

if(!profile){
return <div style={{padding:"40px"}}>Loading Dashboard...</div>
}

/* ================= UI ================= */

return(

<div className="dashboard">

{/* SIDEBAR */}

<Sidebar/>

{/* MAIN */}

<div className="main">

<Header profile={profile}/>

<InsightBanner insight={insight}/>

{/* ================= STATS ================= */}

<div className="statsRow">

<StatCard
title="ELO Rating"
value={profile.elo_rating}
subtitle={profile.current_level}
/>

<StatCard
title="Accuracy"
value={`${profile.accuracy}%`}
subtitle="Overall"
/>

<StatCard
title="Current Streak"
value={`${profile.streak} days`}
subtitle="Practice"
/>

<StatCard
title="Questions Attempted"
value={profile.total_attempts}
subtitle="Total Practice"
/>

</div>

{/* ================= ANALYTICS ================= */}

<div className="analyticsGrid">

{/* AI Recommendation */}

<div className="card">
<AIRecommendation data={recommendation}/>
</div>

{/* Practice Calendar */}

<div className="card">
<PracticeCalendar/>
</div>

{/* Concept Mastery */}

<div className="card">
<ConceptMastery data={concepts}/>
</div>

{/* Study Tip */}

<div className="card">
<StudyTip data={studyTip}/>
</div>

{/* ELO Progress */}

<div className="card">
<EloChart data={eloHistory}/>
</div>

{/* Mistake Analysis */}

<div className="card">
<MistakeAnalysis data={mistakes}/>
</div>

</div>

</div>

</div>

)

}

export default Dashboard;