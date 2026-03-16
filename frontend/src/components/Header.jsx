import React from "react"

function Header(){

return(

<div className="header">

<h1>Hello Scholar 👋</h1>

<div className="headerRight">

<span>{new Date().toDateString()}</span>

</div>

</div>

)

}

export default Header