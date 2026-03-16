import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:8000";

function AdminDashboard() {

  const [stats, setStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {

    axios.get(`${API}/admin/dashboard`)
      .then(res => {
        setStats(res.data);
      })
      .catch(err => {
        console.log(err);
      });

  }, []);

  return (

    <div style={container}>

      <h1 style={title}>Admin Dashboard</h1>

      {/* STATS CARDS */}
      <div style={grid}>

        <div style={card}>
          <h2>{stats.total_students || 0}</h2>
          <p>Total Students</p>
        </div>

        <div style={card}>
          <h2>{stats.total_questions || 0}</h2>
          <p>Total Questions</p>
        </div>

        <div style={card}>
          <h2>{stats.total_attempts || 0}</h2>
          <p>Total Attempts</p>
        </div>

        <div style={card}>
          <h2>{stats.accuracy || 0}%</h2>
          <p>Average Accuracy</p>
        </div>

      </div>

      {/* ACTION BUTTONS */}

      <div style={actions}>

        <button
          style={button}
          onClick={() => navigate("/admin/upload")}
        >
          Upload Questions
        </button>

        <button
          style={button}
          onClick={() => navigate("/admin/questions")}
        >
          View Questions
        </button>

        <button
          style={button}
          onClick={() => navigate("/admin/students")}
        >
          Student Analytics
        </button>

       <button
          style={button}
          onClick={() => navigate("/admin/analytics")}
        >
          Analytics
        </button>

</div>

      </div>

  

  );
}


/* ================= STYLES ================= */

const container = {
  padding: "40px",
  fontFamily: "Segoe UI, sans-serif"
};

const title = {
  marginBottom: "30px"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(4,1fr)",
  gap: "20px",
  marginBottom: "40px"
};

const card = {
  background: "white",
  padding: "30px",
  borderRadius: "12px",
  boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
  textAlign: "center"
};

const actions = {
  display: "flex",
  gap: "20px"
};

const button = {
  padding: "12px 20px",
  border: "none",
  borderRadius: "8px",
  background: "#667eea",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer"
};

export default AdminDashboard;