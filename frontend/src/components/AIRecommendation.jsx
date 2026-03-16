import React from "react" 
import { useNavigate } from "react-router-dom"

function AIRecommendation({data}){

const navigate = useNavigate()

return(

<div className="aiCard">

<h3>AI Recommended Topic</h3>

<p>{data?.topic}</p>

<button
className="startQuizBtn"
onClick={()=>navigate("/quiz")}
>

Start Quiz

</button>

</div>

)

}

export default AIRecommendation