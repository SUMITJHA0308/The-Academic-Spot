import React,{useEffect,useState} from "react";
import axios from "axios";

const API="https://the-academic-spot.onrender.com";

function StudentsAnalytics(){

const [students,setStudents]=useState([]);

useEffect(()=>{
fetchStudents();
},[]);

const fetchStudents=async()=>{
const res=await axios.get(`${API}/admin/students`);
setStudents(res.data);
};

const deleteStudent=async(id)=>{
await axios.delete(`${API}/admin/student/${id}`);
fetchStudents();
};

return(

<div style={container}>

<h2 style={title}>Students Analytics</h2>

<table style={table}>

<thead>
<tr>
<th style={th}>Student ID</th>
<th style={th}>Email</th>
<th style={th}>Total Attempts</th>
<th style={th}>Accuracy</th>
<th style={th}>Score</th>
<th style={th}>Actions</th>
</tr>
</thead>

<tbody>

{students.map((s)=>{

let score=Math.round((s.accuracy/100)*1000)

return(

<tr key={s.id}>

<td style={td}>{s.id}</td>
<td style={td}>{s.email}</td>
<td style={td}>{s.attempts}</td>

<td style={td}>
<span style={{
background:"#f1f5f9",
padding:"6px 10px",
borderRadius:"6px"
}}>
{s.accuracy}%
</span>
</td>

<td style={td}>{score}</td>

<td style={td}>

<button
style={editBtn}
>
Edit
</button>

<button
style={deleteBtn}
onClick={()=>deleteStudent(s.id)}
>
Delete
</button>

</td>

</tr>

)

})}

</tbody>

</table>

</div>

)

}

export default StudentsAnalytics;


/* ---------- CSS ---------- */

const container={
padding:"40px",
fontFamily:"Inter, sans-serif",
background:"#f8fafc",
minHeight:"100vh"
}

const title={
fontSize:"26px",
marginBottom:"25px"
}

const table={
width:"100%",
borderCollapse:"collapse",
background:"white",
boxShadow:"0 4px 10px rgba(0,0,0,0.08)"
}

const th={
textAlign:"left",
padding:"14px",
borderBottom:"2px solid #e5e7eb",
background:"#f9fafb"
}

const td={
padding:"14px",
borderBottom:"1px solid #e5e7eb"
}

const editBtn={
background:"#2563eb",
color:"white",
border:"none",
padding:"6px 12px",
borderRadius:"6px",
marginRight:"8px",
cursor:"pointer"
}

const deleteBtn={
background:"#ef4444",
color:"white",
border:"none",
padding:"6px 12px",
borderRadius:"6px",
cursor:"pointer"
}