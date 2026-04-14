import React, { useState } from "react";
import API from "../services/api";

export default function Query() {
    const [question, setQuestion] = useState("");
    const [data, setData] = useState(null);

    const handleAsk = async () => {
        const formData = new FormData();
        formData.append("question", question);

        const res = await API.post("/ask", formData);
        setData(res.data);
    };

    return (
        <div>
            <h2>Ask your data 💬</h2>

            <input
                type="text"
                value={question}
                placeholder="Ask something..."
                onChange={(e) => setQuestion(e.target.value)}
            />
            <button onClick={handleAsk}>Ask</button>

            {data && (
                <div>
                    <h3>Generated SQL</h3>
                    <pre>{data.sql_query}</pre>

                    <h3>Results</h3>
                    <table border="1">
                        <thead>
                            <tr>
                                {data.results &&
                                    data.results.length > 0 &&
                                    Object.keys(data.results[0]).map((key) => (
                                        <th key={key}>{key}</th>
                                    ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.results &&
                                data.results.map((row, i) => (
                                    <tr key={i}>
                                        {Object.values(row).map((val, j) => (
                                            <td key={j}>{val}</td>
                                        ))}
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}