import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "https://the-academic-spot-2.onrender.com"; // change if deployed

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${API}/admin/files`);
      setFiles(res.data);
    } catch (err) {
      console.log("File fetch error", err);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`${API}/admin/questions`);
      setQuestions(res.data);
    } catch (err) {
      console.log("Question fetch error", err);
    }
  };

  const uploadCSV = async () => {
    if (!file) return alert("Select CSV file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      await axios.post(`${API}/admin/upload-csv`, formData);
      alert("Uploaded successfully");
      fetchFiles();
      fetchQuestions();
    } catch (err) {
      console.log("Upload error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchQuestions();
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <h1>Admin Dashboard</h1>

      {/* Upload Section */}
      <div style={{ marginBottom: "30px" }}>
        <h3>Upload CSV</h3>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button onClick={uploadCSV} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {/* Uploaded Files */}
      <div style={{ marginBottom: "30px" }}>
        <h3>Uploaded Files</h3>
        <ul>
          {files.map((f, index) => (
            <li key={index}>{f.filename}</li>
          ))}
        </ul>
      </div>

      {/* Questions */}
      <div>
        <h3>Questions</h3>
        <table border="1" width="100%" cellPadding="10">
          <thead>
            <tr>
              <th>ID</th>
              <th>Question</th>
              <th>Correct Answer</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id}>
                <td>{q.id}</td>
                <td>{q.question_text}</td>
                <td>{q.correct_answer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;