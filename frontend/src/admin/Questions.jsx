import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "https://the-academic-spot-2.onrender.com";

function Questions() {

  const [subjects,setSubjects] = useState([]);
  const [chapters,setChapters] = useState([]);
  const [questions,setQuestions] = useState([]);
  const [filtered,setFiltered] = useState([]);

  const [subject,setSubject] = useState("");
  const [chapter,setChapter] = useState("");

  const [search,setSearch] = useState("");
  const [difficulty,setDifficulty] = useState("All");



  // =========================
  // LOAD SUBJECTS
  // =========================

  useEffect(()=>{

    axios.get(`${API}/admin/subjects`)
      .then(res => setSubjects(res.data))
      .catch(err => console.log(err))

  },[])



  // =========================
  // LOAD CHAPTERS
  // =========================

  const loadChapters = async(sub)=>{

    setSubject(sub)

    const res = await axios.get(
      `${API}/admin/chapters/${sub}`
    )

    setChapters(res.data)

  }



  // =========================
  // LOAD QUESTIONS
  // =========================

  const loadQuestions = async(chp)=>{

    setChapter(chp)

    const res = await axios.get(
      `${API}/admin/questions/${subject}/${chp}`
    )

    setQuestions(res.data)
    setFiltered(res.data)

  }



  // =========================
  // SEARCH + FILTER
  // =========================

  useEffect(()=>{

    let data = [...questions]

    if(search){

      data = data.filter(q =>
        q.question.toLowerCase().includes(search.toLowerCase())
      )

    }

    if(difficulty !== "All"){

      data = data.filter(q =>
        q.difficulty === difficulty
      )

    }

    setFiltered(data)

  },[search,difficulty,questions])



  // =========================
  // DELETE
  // =========================

  const deleteQuestion = async(id)=>{

    if(!window.confirm("Delete this question?")) return

    await axios.delete(`${API}/admin/question/${id}`)

    const updated = questions.filter(q => q.id !== id)

    setQuestions(updated)
    setFiltered(updated)

  }



  // =========================
  // EDIT
  // =========================

  const editQuestion = async(q)=>{

    const newQuestion = prompt("Edit Question",q.question)

    if(!newQuestion) return

    await axios.put(`${API}/admin/question/${q.id}`,{
      question:newQuestion
    })

    const updated = questions.map(item =>
      item.id === q.id
      ? {...item,question:newQuestion}
      : item
    )

    setQuestions(updated)
    setFiltered(updated)

  }



  const difficultyColor = (d)=>{

    if(d==="Easy") return "#22c55e"
    if(d==="Medium") return "#f59e0b"
    return "#ef4444"

  }



  return(

    <div style={container}>

      <h2 style={title}>Question Bank</h2>



      {/* FILTER BAR */}

      <div style={topBar}>

        <select
          style={select}
          onChange={(e)=>loadChapters(e.target.value)}
        >
          <option>Select Subject</option>

          {subjects.map((s,i)=>(
            <option key={i}>{s}</option>
          ))}

        </select>



        <select
          style={select}
          onChange={(e)=>loadQuestions(e.target.value)}
        >

          <option>Select Chapter</option>

          {chapters.map((c,i)=>(
            <option key={i}>{c}</option>
          ))}

        </select>



        <input
          style={searchBox}
          placeholder="Search question..."
          onChange={(e)=>setSearch(e.target.value)}
        />



        <select
          style={select}
          onChange={(e)=>setDifficulty(e.target.value)}
        >

          <option value="All">All</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>

        </select>

      </div>



      {/* QUESTIONS */}

      {filtered.map((q)=>(

        <div key={q.id} style={card}>

          <div style={cardHeader}>

            <span style={badge(difficultyColor(q.difficulty))}>
              {q.difficulty}
            </span>

          </div>



          <p style={questionText}>{q.question}</p>



          <div style={options}>

            <p>A. {q.option_a}</p>
            <p>B. {q.option_b}</p>
            <p>C. {q.option_c}</p>
            <p>D. {q.option_d}</p>

          </div>



          <div style={buttons}>

            <button
              style={editBtn}
              onClick={()=>editQuestion(q)}
            >
              Edit
            </button>

            <button
              style={deleteBtn}
              onClick={()=>deleteQuestion(q.id)}
            >
              Delete
            </button>

          </div>

        </div>

      ))}

    </div>

  )

}

export default Questions



// =========================
// CSS
// =========================

const container = {

  padding:"40px",
  fontFamily:"Segoe UI"

}

const title = {

  marginBottom:"25px",
  fontSize:"28px"

}

const topBar = {

  display:"flex",
  gap:"15px",
  marginBottom:"30px",
  flexWrap:"wrap"

}

const select = {

  padding:"8px 12px",
  borderRadius:"6px",
  border:"1px solid #ddd"

}

const searchBox = {

  padding:"8px 12px",
  borderRadius:"6px",
  border:"1px solid #ddd",
  width:"250px"

}

const card = {

  background:"white",
  padding:"20px",
  borderRadius:"10px",
  marginBottom:"20px",
  boxShadow:"0 4px 12px rgba(0,0,0,0.08)"

}

const cardHeader = {

  display:"flex",
  justifyContent:"flex-end"

}

const badge = (color)=>({

  background:color,
  color:"white",
  padding:"4px 10px",
  borderRadius:"6px",
  fontSize:"12px"

})

const questionText = {

  fontSize:"16px",
  fontWeight:"600",
  margin:"10px 0"

}

const options = {

  marginTop:"10px"

}

const buttons = {

  marginTop:"15px",
  display:"flex",
  gap:"10px"

}

const editBtn = {

  background:"#3b82f6",
  border:"none",
  color:"white",
  padding:"8px 14px",
  borderRadius:"6px",
  cursor:"pointer"

}

const deleteBtn = {

  background:"#ef4444",
  border:"none",
  color:"white",
  padding:"8px 14px",
  borderRadius:"6px",
  cursor:"pointer"

}