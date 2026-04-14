import React, { useState } from "react";
import API from "../services/api";

export default function Upload() {
    const [file, setFile] = useState(null);

    const handleUpload = async () => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            await API.post("/upload", formData);
            alert("Upload successful!");
        } catch {
            alert("Upload failed!");
        }
    };

    return (
        <div>
            <h2>Upload CSV</h2>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <button onClick={handleUpload}>Upload</button>
        </div>
    );
}