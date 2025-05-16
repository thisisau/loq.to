import { useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./css/index.css";
import "./css/components/modal.css";
import "./css/components/misc.css";
import {
  AlertHandler,
  AlertHandlerContext,
} from "./components/alerts/alert_context";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import NotFound from "./pages/not_found";
import { GlobalElement } from "./components/alerts/global_element";

function App() {
  const alertHandler = useRef(new AlertHandler());

  return (
    <AlertHandlerContext.Provider value={alertHandler.current}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <GlobalElement />
    </AlertHandlerContext.Provider>
  );
}

export default App;
