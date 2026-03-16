import React from "react";

const concepts = [
{ name: "Mechanics", value: 82, color: "#22c55e" },
{ name: "Thermodynamics", value: 54, color: "#f59e0b" },
{ name: "Electrostatics", value: 31, color: "#ef4444" },
{ name: "Modern Physics", value: 71, color: "#3b82f6" }
];

function ConceptMastery(){

return (

<div className="conceptCard">

<h3>Concept Mastery</h3>

{concepts.map((c,i)=>(
<div key={i} className="conceptRow">

<div className="conceptHeader">
<span>{c.name}</span>
<span>{c.value}%</span>
</div>

<div className="progressBar">

<div
className="progressFill"
style={{
width:`${c.value}%`,
background:c.color
}}
></div>

</div>

</div>
))}

</div>

)

}

export default ConceptMastery;