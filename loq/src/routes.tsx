import { useRef } from "react";
import "./css/index.css";
import "./css/components/modal.css";
import "./css/components/misc.css";
import "./css/components/layout.css";
import "./css/pages/login.css";
import "./css/components/input.css";
import "./css/pages/editor.css";
import "./css/components/notification.css";
import {
  AlertHandler,
  AlertHandlerContext,
} from "./components/alerts/alert_context";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import NotFound from "./pages/not_found";
import { GlobalElement } from "./components/alerts/global_element";
import Login from "./pages/account/login";
import UserProfile from "./pages/account/profile";
import Editor from "./pages/editor/editor";
import NotificationProvider from "./components/page/notification/provider";

function App() {
  const alertHandler = useRef(new AlertHandler());

  return (
    <AlertHandlerContext.Provider value={alertHandler.current}>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="account" element={<UserProfile />} />
            <Route path="editor/:id?" element={<Editor />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <GlobalElement />
      </NotificationProvider>
    </AlertHandlerContext.Provider>
  );
}

export default App;
