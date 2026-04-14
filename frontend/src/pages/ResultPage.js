import { useLocation } from "react-router-dom";

export default function ResultPage() {
    const { state } = useLocation();

    if (!state) return <div>No data</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto">

            {/* Question */}
            <div className="mb-6">
                <h2 className="text-green-400 text-lg">Your Question</h2>
                <p className="text-gray-300">{state.question}</p>
            </div>

            {/* SQL */}
            <div className="mb-6">
                <h2 className="text-green-400 text-lg">Generated SQL</h2>
                <pre className="bg-black text-green-400 p-4 rounded-lg">
                    {state.sql}
                </pre>
            </div>

            {/* Results */}
            <div>
                <h2 className="text-green-400 text-lg">Results</h2>

                {state.results && state.results.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="table-auto w-full border border-gray-700 mt-2">
                            <thead>
                                <tr>
                                    {Object.keys(state.results[0]).map((key) => (
                                        <th key={key} className="border px-2 py-1">
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {state.results.map((row, i) => (
                                    <tr key={i}>
                                        {Object.values(row).map((val, j) => (
                                            <td key={j} className="border px-2 py-1">
                                                {val}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>

        </div>
    );
}