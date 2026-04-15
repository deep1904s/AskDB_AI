import { useState } from "react";
import API from "../services/api";

export default function UploadPanel() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const upload = async () => {
        if (!file) {
            alert("⚠️ Please select a file first");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            await API.post("/upload", formData);

            setLoading(false);
            setSuccess(true);

        } catch (err) {
            setLoading(false);
            alert("❌ Upload failed. Try again.");
        }
    };

    return (
        <>
            {/* FILE INPUT */}
            <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="mb-3 text-sm text-gray-300"
            />

            {/* UPLOAD BUTTON */}
            <button
                onClick={upload}
                disabled={loading}
                className={`w-full py-2 rounded-lg font-semibold transition ${loading
                        ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                        : "bg-green-400 text-black hover:bg-green-300 neon-btn"
                    }`}
            >
                {loading ? "Uploading..." : "Upload 🚀"}
            </button>

            {/* 🔥 LOADING MODAL (CHEF) */}
            {loading && (
                <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50">

                    <div className="text-6xl animate-bounce">👨‍🍳</div>

                    <h2 className="text-green-400 mt-4 text-xl">
                        Cooking your data...
                    </h2>

                    <p className="text-gray-400 mt-2 animate-pulse">
                        Preparing insights for you 🍲
                    </p>

                </div>
            )}

            {/* ✅ SUCCESS MODAL */}
            {success && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">

                    <div className="bg-[#11161c] p-6 rounded-xl shadow-lg shadow-green-400/20 text-center max-w-sm">

                        <h2 className="text-green-400 text-xl mb-2">
                            ✅ Upload Successful!
                        </h2>

                        <p className="text-gray-400 mb-4">
                            Your data is ready to query 🚀
                        </p>

                        <button
                            onClick={() => setSuccess(false)}
                            className="bg-green-400 text-black px-4 py-2 rounded-lg hover:scale-105"
                        >
                            OK
                        </button>

                    </div>
                </div>
            )}
        </>
    );
}