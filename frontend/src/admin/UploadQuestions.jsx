import React, { useState } from "react";
import axios from "axios";

const API = "https://the-academic-spot.onrender.com";

function UploadQuestions() {

  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {

    if (!file) {
      alert("Please select a CSV file");
      return;
    }

    if (!subject || !chapter) {
      alert("Please enter Subject and Chapter");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("subject", subject);
    formData.append("chapter", chapter);

    try {

      setLoading(true);
      setMessage("");

      const res = await axios.post(
        `${API}/admin/upload-csv`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setMessage(`✅ Uploaded ${res.data.inserted_questions} questions successfully`);

      setFile(null);
      setSubject("");
      setChapter("");

    } catch (err) {

      console.log(err);

      const errorMessage =
        err.response?.data?.detail || "Upload failed";

      setMessage(`❌ ${errorMessage}`);

    } finally {

      setLoading(false);

    }
  };

  return (

    <div style={container}>

      <h2 style={title}>Upload Question Bank</h2>

      {/* Subject Input */}

      <input
        style={input}
        placeholder="Enter Subject (e.g. Physics)"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />

      {/* Chapter Input */}

      <input
        style={input}
        placeholder="Enter Chapter (e.g. Thermodynamics)"
        value={chapter}
        onChange={(e) => setChapter(e.target.value)}
      />

      {/* File Input */}

      <input
        style={fileInput}
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
      />

      {/* Upload Button */}

      <button
        style={button}
        onClick={handleUpload}
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload CSV"}
      </button>

      {/* Message */}

      {message && (
        <p style={messageStyle}>{message}</p>
      )}

    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  padding: "40px",
  fontFamily: "Segoe UI",
  maxWidth: "500px"
};

const title = {
  marginBottom: "20px"
};

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "6px",
  border: "1px solid #ccc"
};

const fileInput = {
  marginBottom: "15px"
};

const button = {
  padding: "12px 20px",
  background: "#667eea",
  border: "none",
  color: "white",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold"
};

const messageStyle = {
  marginTop: "20px",
  fontSize: "16px"
};

export default UploadQuestions;