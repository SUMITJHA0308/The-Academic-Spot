import { useState } from "react";
import API from "../api/api";

function HintSection({ questionId }) {
  const [hintLevel, setHintLevel] = useState(0);
  const [hintText, setHintText] = useState("");

  const getHint = async () => {
    if (hintLevel >= 3) return;

    const newLevel = hintLevel + 1;

    const res = await API.post("/student/hint", null, {
      params: {
        question_id: questionId,
        level: newLevel,
      },
    });

    setHintLevel(newLevel);
    setHintText(res.data.hint);
  };

  return (
    <div>
      <button onClick={getHint}>Get Hint</button>
      <p>{hintText}</p>
    </div>
  );
}

export default HintSection;
