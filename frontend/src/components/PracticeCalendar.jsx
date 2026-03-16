import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const performance = {
"2026-03-16":"best",
"2026-03-17":"good",
"2026-03-20":"miss",
"2026-03-22":"good"
};

function tileContent({date}){

const d = date.toISOString().split("T")[0];

if(performance[d] === "best"){
return <span className="star">⭐</span>
}

return null
}

function tileClassName({date}){

const d = date.toISOString().split("T")[0]

if(performance[d] === "best") return "bestDay"
if(performance[d] === "good") return "practiceDay"
if(performance[d] === "miss") return "missDay"

return null
}

function PracticeCalendar(){

return(

<div className="calendarCard">

<h3>Practice Calendar</h3>

<Calendar
tileClassName={tileClassName}
tileContent={tileContent}
/>

<div className="calendarLegend">

<div><span className="legendBox green"></span> Good Practice</div>

<div><span className="legendBox dark"></span> High Score ⭐</div>

<div><span className="legendBox red"></span> Missed Day</div>

</div>

</div>

)

}

export default PracticeCalendar