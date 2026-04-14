import React from "react";

export default function Message({ role, text, sql, results }) {
    return (
        <div style={{
            textAlign: role === "user" ? "right" : "left",
            margin: "10px 0"
        }}>
            <div style={{
                display: "inline-block",
                padding: "10px",
                borderRadius: "10px",
                backgroundColor: role === "user" ? "#007bff" : "#f1f1f1",
                color: role === "user" ? "white" : "black",
                maxWidth: "70%"
            }}>
                <p>{text}</p>

                {sql && (
                    <pre style={{ background: "#222", color: "#0f0", padding: "5px" }}>
                        {sql}
                    </pre>
                )}

                {results && results.length > 0 && (
                    <table border="1" style={{ marginTop: "10px" }}>
                        <thead>
                            <tr>
                                {Object.keys(results[0]).map((key) => (
                                    <th key={key}>{key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((row, i) => (
                                <tr key={i}>
                                    {Object.values(row).map((val, j) => (
                                        <td key={j}>{val}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}