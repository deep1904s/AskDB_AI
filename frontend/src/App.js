import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ResultPage from "./pages/ResultPage";

function App() {
  return (
    <BrowserRouter>
      <div className="bg-[#0b0f14] min-h-screen text-white">


        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>

      </div>
    </BrowserRouter>
  );
}

export default App;