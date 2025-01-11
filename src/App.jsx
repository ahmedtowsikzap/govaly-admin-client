import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Ensure you're using BrowserRouter for routing
import Dashboard from "./Dashboard";
import AdminDashboard from "./AdminDashboad"; // Ensure the filename is correctly referenced (with "AdminDashboard" instead of "AdminDashboad")
import Role from "./Roles"; // Ensure the Role component file exists
import SignIn from "./SignIn";

function App() {
  return (
    <Router>
      <Routes>
         <Route path="/" element={<SignIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/role" element={<Role />} />
      </Routes>
    </Router>
  );
}

export default App;
