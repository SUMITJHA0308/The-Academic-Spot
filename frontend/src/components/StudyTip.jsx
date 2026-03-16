import React from "react"
import { useNavigate } from "react-router-dom"

function StudyTip(){

const navigate = useNavigate()

return(

<div className="study-tip-card">

<h3>AI Study Tip</h3>

<p>
Students with ELO 1100 improve accuracy by 18%
</p>

<button
className="start-quiz-btn"
onClick={()=>navigate("/quiz")}
>

Start Adaptive Quiz

</button>

</div>

)

}

export default StudyTip