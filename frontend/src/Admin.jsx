import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

function Admin() {
  
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");

  const [file, setFile] = useState(null);
  const [uploadSubject, setUploadSubject] = useState("");
  const [uploadChapter, setUploadChapter] = useState("");

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    const res = await axios.get(`${API}/admin/subjects`);
    setSubjects(res.data);
  };

  const fetchChapters = async (subject) => {
    const res = await axios.get(`${API}/admin/chapters/${subject}`);
    setChapters(res.data);
  };

  const fetchQuestions = async (subject, chapter) => {
    const res = await axios.get(`${API}/admin/questions/${subject}/${chapter}`);
    setQuestions(res.data);
  };

  const handleUpload = async () => {

    if (!file || !uploadSubject || !uploadChapter) {
      alert("Fill all fields");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("subject", uploadSubject);
    formData.append("chapter", uploadChapter);

    await axios.post(`${API}/api/upload-test-csv`, formData);

    alert("Upload Successful");

    fetchSubjects();
  };

  return (

    <div style={container}>

      <h1 style={title}>Admin Dashboard</h1>

      {/* Upload Section */}

      <div style={card}>

        <h2 style={sectionTitle}>Upload Questions CSV</h2>

        <input
          style={input}
          type="text"
          placeholder="Subject (Physics/Chemistry/Maths)"
          value={uploadSubject}
          onChange={(e) => setUploadSubject(e.target.value)}
        />

        <input
          style={input}
          type="text"
          placeholder="Chapter Name"
          value={uploadChapter}
          onChange={(e) => setUploadChapter(e.target.value)}
        />

        <input
          style={input}
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button style={uploadButton} onClick={handleUpload}>
          Upload CSV
        </button>

      </div>

      {/* View Questions */}

      <div style={card}>

        <h2 style={sectionTitle}>View Questions</h2>

        <select
          style={select}
          value={selectedSubject}
          onChange={(e) => {
            setSelectedSubject(e.target.value);
            fetchChapters(e.target.value);
          }}
        >
          <option value="">Select Subject</option>

          {subjects.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}

        </select>

        {chapters.length > 0 && (

          <select
            style={select}
            value={selectedChapter}
            onChange={(e) => {
              setSelectedChapter(e.target.value);
              fetchQuestions(selectedSubject, e.target.value);
            }}
          >

            <option value="">Select Chapter</option>

            {chapters.map((chap) => (
              <option key={chap} value={chap}>
                {chap}
              </option>
            ))}

          </select>

        )}

      </div>

      {/* Questions */}

      <div style={questionContainer}>

        {questions.map((q) => (

          <div key={q.id} style={questionCard}>

            <p style={questionText}>
              <strong>Q:</strong> {q.question}
            </p>

            <p>A. {q.option_a}</p>
            <p>B. {q.option_b}</p>
            <p>C. {q.option_c}</p>
            <p>D. {q.option_d}</p>

            <p style={answer}>
              Correct: {q.correct_answer}
            </p>

            <p style={difficulty}>
              Difficulty: {q.difficulty}
            </p>

          </div>

        ))}

      </div>

    </div>

  );

}

export default Admin;


const container = {
  padding: "40px",
  background: "#f4f6fb",
  minHeight: "100vh",
  fontFamily: "Arial"
};

const title = {
  fontSize: "32px",
  fontWeight: "700",
  marginBottom: "30px"
};

const card = {
  background: "white",
  padding: "25px",
  borderRadius: "10px",
  marginBottom: "30px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
};

const sectionTitle = {
  marginBottom: "15px"
};

const input = {
  display: "block",
  width: "300px",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc"
};

const select = {
  display: "block",
  width: "300px",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc"
};

const uploadButton = {
  padding: "10px 20px",
  background: "#4f46e5",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600"
};

const questionContainer = {
  marginTop: "20px"
};

const questionCard = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  marginBottom: "20px",
  boxShadow: "0 3px 8px rgba(0,0,0,0.08)"
};

const questionText = {
  fontSize: "16px",
  marginBottom: "10px"
};

const answer = {
  color: "green",
  fontWeight: "600"
};

const difficulty = {
  color: "#555",
  fontSize: "14px"
};