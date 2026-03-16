import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const API = "http://127.0.0.1:8000";

function Login() {

const navigate = useNavigate();
const [active, setActive] = useState(false);

const [loginData, setLoginData] = useState({
email: "",
password: ""
});

const [registerData, setRegisterData] = useState({
email: "",
password: "",
role: "student"
});

// ---------------- LOGIN ----------------

const handleLogin = async (e) => {

e.preventDefault();

if (!loginData.email || !loginData.password) {
  alert("Fill all fields");
  return;
}

try {

  const res = await axios.post(`${API}/auth/login`, {
    email: loginData.email,
    password: loginData.password
  });

  if (res.data.role === "admin") {
    navigate("/admin");
    return;
  }

  localStorage.setItem("user_id", res.data.user_id);

  navigate("/dashboard");

} catch (err) {

  alert("Invalid credentials");

}

};

// ---------------- REGISTER ----------------

const handleRegister = async (e) => {

e.preventDefault();

if (!registerData.email || !registerData.password) {
  alert("Fill all fields");
  return;
}

try {

  await axios.post(`${API}/auth/register`, registerData);

  alert("Registration successful");

  setActive(false);

} catch (err) {

  alert(err.response?.data?.detail || "Registration failed");

}

};

// ---------------- UI ----------------

return (

<div className="auth-wrapper">

  <div className={`container ${active ? "active" : ""}`}>

    {/* LOGIN */}

    <div className="form-container sign-in">

      <form onSubmit={handleLogin}>

        <h2>The Academic Spot</h2>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) =>
            setLoginData({ ...loginData, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) =>
            setLoginData({ ...loginData, password: e.target.value })
          }
        />

        <button type="submit">Login</button>

        <p>
          Don't have an account?
          <span onClick={() => setActive(true)}> Sign Up</span>
        </p>

      </form>

    </div>

    {/* REGISTER */}

    <div className="form-container sign-up">

      <form onSubmit={handleRegister}>

        <h2>Create Account</h2>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) =>
            setRegisterData({ ...registerData, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) =>
            setRegisterData({ ...registerData, password: e.target.value })
          }
        />

        <select
          onChange={(e) =>
            setRegisterData({ ...registerData, role: e.target.value })
          }
        >
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit">Register</button>

        <p>
          Already have an account?
          <span onClick={() => setActive(false)}> Login</span>
        </p>

      </form>

    </div>

    {/* SLIDING PANEL */}

    <div className="overlay-container">

      <div className="overlay">

        <div className="overlay-panel overlay-left">
          <img
src={logo}
alt="The Academic Spot"
style={{
width:"130px",
display:"block",
margin:"0 auto 25px auto"
}}
/>
          <h1>WELCOME BACK</h1>
          <p>Login to continue your learning journey</p>
        </div>

        <div className="overlay-panel overlay-right">
          <img
src={logo}
alt="The Academic Spot"
style={{
width:"130px",
display:"block",
margin:"0 auto 25px auto"
}}
/>
          <h1>THE ACADEMIC SPOT</h1>
          <p>Where AI meets exam preparation</p>
        </div>

      </div>

    </div>

  </div>

  {/* CSS */}

  <style>{`

*{
margin:0;
padding:0;
box-sizing:border-box;
font-family:Arial, Helvetica, sans-serif;
}

.auth-wrapper{

height:100vh;
display:flex;
justify-content:center;
align-items:center;

background:linear-gradient(135deg,#f6f9fc,#e9f2ff,#dbeafe);

}
.container{

position:relative;

width:760px;
height:420px;

border-radius:18px;

overflow:hidden;

background:white;

border:1px solid #e2e8f0;

box-shadow:
0 20px 40px rgba(0,0,0,0.15);

}

.form-container{

position:absolute;
top:0;

height:100%;
width:50%;

display:flex;
align-items:center;
justify-content:center;

background:#ffffff;

color:#1e293b;

transition:all .6s ease;

}

.form-container form{
display:flex;
flex-direction:column;
gap:15px;
width:70%;
}

input,select{

padding:12px;

border:none;
outline:none;

border-radius:8px;

background:rgba(255,255,255,0.1);

color:#1e293b;

border:1px solid rgba(255,255,255,0.2);

}

button{

padding:12px;

border:none;
border-radius:25px;

background:linear-gradient(90deg,#36d1dc,#5b86e5);

color:white;

font-weight:600;

cursor:pointer;

transition:0.3s;

}

button:hover{

transform:scale(1.05);

}

.sign-in{
left:0;
z-index:2;
}

.sign-up{
left:0;
opacity:0;
z-index:1;
}

.container.active .sign-in{
transform:translateX(100%);
opacity:0;
}

.container.active .sign-up{
transform:translateX(100%);
opacity:1;
z-index:5;
}

.overlay-container{
position:absolute;
top:0;
left:50%;
width:50%;
height:100%;
overflow:hidden;
transition:transform .6s ease;
}

.overlay{
background:linear-gradient(135deg,#0f2027,#203a43,#2c5364);

position:relative;
left:-100%;
height:100%;
width:200%;
transition:transform .6s ease;
}

.container.active .overlay-container{
transform:translateX(-100%);
}

.container.active .overlay{
transform:translateX(50%);
}

.overlay-panel{

position:absolute;
display:flex;
flex-direction:column;
align-items:center;
justify-content:center;

text-align:center;

padding:40px;

height:100%;
width:50%;

color:white;

}

.overlay-left{
transform:translateX(0);
padding:40px;
}

.overlay-right{
right:0;
}

span{
color:#00eaff;
cursor:pointer;
}

`}</style>

</div>

);
}

export default Login;