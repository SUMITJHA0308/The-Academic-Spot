import React from "react";
import {
LineChart,
Line,
XAxis,
YAxis,
CartesianGrid,
Tooltip,
ResponsiveContainer
} from "recharts";

function EloChart({ history }) {

const data = history?.length
? history
: [
{ day: "Mon", elo: 980 },
{ day: "Tue", elo: 1000 },
{ day: "Wed", elo: 1030 },
{ day: "Thu", elo: 1080 },
{ day: "Fri", elo: 1115 }
];

return (

<div className="card">

<h3>ELO Progress</h3>

<ResponsiveContainer width="100%" height={220}>

<LineChart data={data}>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="day"/>

<YAxis/>

<Tooltip/>

<Line
type="monotone"
dataKey="elo"
stroke="#2563eb"
strokeWidth={3}
/>

</LineChart>

</ResponsiveContainer>

</div>

)

}

export default EloChart;