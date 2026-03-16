import React, { useEffect, useState } from "react";
import "../styles/dashboard.css"

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

function Dashboard(){

const [profile,setProfile] = useState(null)
const [eloHistory,setEloHistory] = useState([])
const [concepts,setConcepts] = useState([])
const [mistakes,setMistakes] = useState({})
const [recommendation,setRecommendation] = useState({})
const [insight,setInsight] = useState({})
const [studyTip,setStudyTip] = useState({})

useEffect(()=>{

/* ================= PROFILE ================= */

setProfile({
name:"Scholar",
elo_rating:1115,
accuracy:45.95,
streak:0,
total_attempts:37,
classification:"Professional Level"
})

/* ================= ELO HISTORY ================= */

setEloHistory([
{attempt:1,elo:1000},
{attempt:2,elo:1030},
{attempt:3,elo:1060},
{attempt:4,elo:1090},
{attempt:5,elo:1115}
])

/* ================= CONCEPT MASTERY ================= */

setConcepts([
{topic:"Mechanics",mastery:82},
{topic:"Thermodynamics",mastery:54},
{topic:"Electrostatics",mastery:31},
{topic:"Modern Physics",mastery:71}
])

/* ================= MISTAKE ANALYSIS ================= */

setMistakes({
concept_errors:35,
calculation_errors:40,
formula_errors:25
})

/* ================= AI RECOMMENDATION ================= */

setRecommendation({
topic:"Electrostatics",
elo_gain:40
})

/* ================= INSIGHT ================= */

setInsight({
message:"Your accuracy improved but Electrostatics performance dropped",
improvement:8
})

/* ================= STUDY TIP ================= */

setStudyTip({
tip:"Students with 1100 ELO improve accuracy by practicing Electrostatics daily"
})

},[])

if(!profile){
return <div>Loading...</div>
}

return(

<div className="dashboard">

{/* ===== SIDEBAR ===== */}

<Sidebar/>

{/* ===== MAIN AREA ===== */}

<div className="main">

<Header profile={profile}/>

<InsightBanner insight={insight}/>

{/* ===== STATS ROW ===== */}

<div className="statsRow">

<StatCard
title="ELO Rating"
value={profile.elo_rating}
subtitle={profile.classification}
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

{/* ===== ANALYTICS GRID ===== */}

<div className="analyticsGrid">

{/* AI Recommendation */}

<div className="card">
<AIRecommendation data={recommendation}/>
</div>

{/* Practice Calendar (Mistake Analysis की जगह) */}

<div className="card">
<PracticeCalendar/>
</div>

{/* Concept Mastery (ELO Progress की जगह) */}

<div className="card">
<ConceptMastery data={concepts}/>
</div>

{/* Study Tip */}

<div className="card">
<StudyTip data={studyTip}/>
</div>

{/* ELO Progress (Concept Mastery की जगह) */}

<div className="card">
<EloChart data={eloHistory}/>
</div>

{/* Mistake Analysis (Calendar की जगह) */}

<div className="card">
<MistakeAnalysis data={mistakes}/>
</div>

</div>

</div>

</div>

)

}

export default Dashboard