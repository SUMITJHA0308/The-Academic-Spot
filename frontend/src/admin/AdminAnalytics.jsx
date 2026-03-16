import React,{useEffect,useState} from "react";
import axios from "axios";

const API="http://127.0.0.1:8000";

function AdminAnalytics(){

const [weak,setWeak]=useState([]);
const [risk,setRisk]=useState([]);
const [difficulty,setDifficulty]=useState([]);
const [leaderboard,setLeaderboard]=useState([]);

useEffect(()=>{
fetchWeak();
fetchRisk();
fetchDifficulty();
fetchLeaderboard();
},[]);

const fetchWeak=async()=>{
const res=await axios.get(`${API}/analytics/weak-chapters`);
setWeak(res.data);
};

const fetchRisk=async()=>{
const res=await axios.get(`${API}/analytics/student-risk`);
setRisk(res.data);
};

const fetchDifficulty=async()=>{
const res=await axios.get(`${API}/analytics/difficulty-success`);
setDifficulty(res.data);
};

const fetchLeaderboard=async()=>{
const res=await axios.get(`${API}/analytics/leaderboard`);
setLeaderboard(res.data);
};

return(

<div style={container}>

<h1 style={title}>Admin Analytics Dashboard</h1>

{/* Weak Chapters */}

<div style={card}>

<h3>Weak Chapters</h3>

<table style={table}>

<thead>
<tr>
<th style={th}>Chapter</th>
<th style={th}>Accuracy</th>
</tr>
</thead>

<tbody>

{weak.map((c,i)=>(
<tr key={i}>
<td style={td}>{c.chapter}</td>
<td style={td}>{c.accuracy}%</td>
</tr>
))}

</tbody>

</table>

</div>


{/* Student Risk */}

<div style={card}>

<h3>Student Risk Detector</h3>

<table style={table}>

<thead>
<tr>
<th style={th}>Student</th>
<th style={th}>Accuracy</th>
<th style={th}>Risk</th>
</tr>
</thead>

<tbody>

{risk.map((s,i)=>{

let color="green"

if(s.risk_level==="HIGH") color="red"
if(s.risk_level==="MEDIUM") color="orange"

return(

<tr key={i}>
<td style={td}>{s.student_id}</td>
<td style={td}>{s.accuracy}%</td>
<td style={{...td,color:color,fontWeight:"bold"}}>
{s.risk_level}
</td>
</tr>

)

})}

</tbody>

</table>

</div>


{/* Difficulty Success Rate */}

<div style={card}>

<h3>Difficulty Success Rate</h3>

<table style={table}>

<thead>
<tr>
<th style={th}>Difficulty</th>
<th style={th}>Success Rate</th>
</tr>
</thead>

<tbody>

{difficulty.map((d,i)=>(
<tr key={i}>
<td style={td}>{d.difficulty}</td>
<td style={td}>{d.success_rate}%</td>
</tr>
))}

</tbody>

</table>

</div>


{/* Top Students */}

<div style={card}>

<h3>Top Students</h3>

<table style={table}>

<thead>
<tr>
<th style={th}>Rank</th>
<th style={th}>Student</th>
<th style={th}>Accuracy</th>
</tr>
</thead>

<tbody>

{leaderboard.map((s,i)=>(
<tr key={i}>
<td style={td}>{i+1}</td>
<td style={td}>{s.student_id}</td>
<td style={td}>{s.accuracy}%</td>
</tr>
))}

</tbody>

</table>

</div>

</div>

);

}

export default AdminAnalytics;


/* ===================== CSS ===================== */

const container={
padding:40,
fontFamily:"Inter, sans-serif",
background:"#f8fafc",
minHeight:"100vh"
}

const title={
fontSize:28,
marginBottom:30
}

const card={
background:"white",
padding:25,
borderRadius:10,
marginBottom:30,
boxShadow:"0 4px 10px rgba(0,0,0,0.08)"
}

const table={
width:"100%",
borderCollapse:"collapse",
marginTop:"15px"
}

const th={
textAlign:"left",
padding:"12px",
borderBottom:"2px solid #eee",
fontWeight:"600"
}

const td={
padding:"12px",
borderBottom:"1px solid #eee"
}