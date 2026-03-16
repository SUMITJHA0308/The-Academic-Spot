import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:8000";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {

      const res = await axios.post(`${API}/auth/login`, {
        email,
        password
      });

      console.log(res.data);

      // ------------------------
      // ADMIN LOGIN
      // ------------------------
      if (res.data.role === "admin") {

        navigate("/admin");
        return;
      }

      // ------------------------
      // STUDENT LOGIN
      // ------------------------

      localStorage.setItem("user_id", res.data.user_id);

      navigate("/dashboard");

    } catch (err) {

      alert("Invalid credentials");

      console.log(err.response?.data || err.message);

    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Login</h2>

        <input
          style={inputStyle}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={inputStyle}
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button style={buttonStyle} onClick={handleLogin}>
          Login
        </button>

      </div>
    </div>
  );
}


/* ================= STYLES ================= */

const containerStyle = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #667eea, #764ba2)",
  fontFamily: "Segoe UI, sans-serif"
};

const cardStyle = {
  background: "white",
  padding: "40px",
  borderRadius: "15px",
  width: "100%",
  maxWidth: "400px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
  textAlign: "center"
};

const titleStyle = {
  marginBottom: "25px",
  color: "#333"
};

const inputStyle = {
  width: "100%",
  padding: "12px 15px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  fontSize: "14px",
  outline: "none"
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  background: "#667eea",
  border: "none",
  borderRadius: "8px",
  color: "white",
  fontSize: "15px",
  fontWeight: "bold",
  cursor: "pointer"
};

export default Login;