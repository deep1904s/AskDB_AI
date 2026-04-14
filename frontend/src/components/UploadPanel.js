import { useState } from "react";
import API from "../services/api";

export default function UploadPanel() {
    const [file, setFile] = useState(null);

    const upload = async () => {
        const formData = new FormData();
        formData.append("file", file);
        await API.post("/upload", formData);
        alert("Uploaded!");
    };

    return (
        <div>
            <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="mb-3 text-sm"
            />

            <button
                onClick={upload}
                className="w-full bg-green-400 text-black py-2 rounded-lg font-semibold"
            >
                Upload 🚀
            </button>
        </div>
    );
}