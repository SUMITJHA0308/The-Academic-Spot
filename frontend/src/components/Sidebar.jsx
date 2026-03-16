import React from "react"
import { useNavigate } from "react-router-dom"

function Sidebar(){

const navigate = useNavigate()

return(

<div className="sidebar">

<h2 className="logo">The Academic Spot</h2>

<ul>

<li onClick={()=>navigate("/dashboard")}>
Dashboard
</li>

<li onClick={()=>navigate("/dpp")}>
Daily Practice
</li>

<li onClick={()=>navigate("/mock")}>
Mock Tests
</li>

<li onClick={()=>navigate("/quiz")}>
Quiz
</li>

<li onClick={()=>navigate("/analytics")}>
Analytics
</li>

</ul>

</div>

)

}

export default Sidebar