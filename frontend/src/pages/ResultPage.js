import { useLocation, useNavigate } from "react-router-dom";

export default function ResultPage() {
    const { state } = useLocation();
    const navigate = useNavigate();

    if (!state || !state.results) {
        return (
            <div className="p-8 text-center text-gray-400">
                No data available. Please go back and query again.
                <br />
                <button
                    onClick={() => navigate("/")}
                    className="mt-4 bg-green-400 text-black px-4 py-2 rounded-lg"
                >
                    ← Back to Home
                </button>
            </div>
        );
    }

    const data = state.results;

    if (!data || data.length === 0) {
        return (
            <div className="p-8 text-center text-gray-400">
                No results to display 📭
                <br />
                <button
                    onClick={() => navigate("/")}
                    className="mt-4 bg-green-400 text-black px-4 py-2 rounded-lg"
                >
                    ← Back
                </button>
            </div>
        );
    }

    const keys = Object.keys(data[0]);

    // 🔥 COPY SQL
    const handleCopySQL = () => {
        navigator.clipboard.writeText(state.sql);
    };

    // 🔥 DOWNLOAD CSV
    const downloadCSV = () => {
        const headers = keys;

        const csv = [
            headers.join(","),
            ...data.map(row => headers.map(h => row[h]).join(","))
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "askdb_results.csv";
        a.click();
    };

    return (
        <div className="p-8 max-w-6xl mx-auto bg-[#0b0f14] min-h-screen">

            {/* 🔙 BACK BUTTON */}
            <button
                onClick={() => navigate("/")}
                className="mb-6 bg-green-400 text-black px-4 py-2 rounded-lg hover:scale-105"
            >
                ← Back
            </button>

            {/* QUESTION */}
            <h2 className="text-green-400 text-lg">Your Question</h2>
            <p className="mb-4 text-gray-300">{state.question}</p>

            {/* SQL */}
            <div className="flex justify-between items-center">
                <h2 className="text-green-400 text-lg">Generated SQL</h2>

                <button
                    onClick={handleCopySQL}
                    className="text-sm bg-green-400 text-black px-3 py-1 rounded hover:scale-105"
                >
                    Copy SQL
                </button>
            </div>

            <pre className="bg-black text-green-400 p-4 rounded-lg mb-6 shadow-lg shadow-green-400/10 overflow-x-auto">
                {state.sql}
            </pre>

            {/* DOWNLOAD BUTTON */}
            <button
                onClick={downloadCSV}
                className="mb-4 bg-green-400 text-black px-4 py-2 rounded hover:scale-105"
            >
                Download CSV
            </button>

            {/* TABLE */}
            <h2 className="text-green-400 text-lg mb-2">Results</h2>

            <div className="overflow-x-auto">
                <table className="table-auto w-full border border-gray-700">
                    <thead>
                        <tr>
                            {keys.map((key) => (
                                <th key={key} className="border px-2 py-2 text-green-400">
                                    {key}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((row, i) => (
                            <tr key={i} className="hover:bg-[#11161c]">
                                {keys.map((key, j) => (
                                    <td key={j} className="border px-2 py-2 text-gray-300">
                                        {row[key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}