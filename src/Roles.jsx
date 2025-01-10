import React, { useState, useEffect } from "react";
import { auth } from "./firebase"; // Import auth from your Firebase config
import API from "./api"; // Adjust the path to your api.js

function Role() {
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState("");
  const [newSheet, setNewSheet] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchRoles = async () => {
    const user = auth.currentUser; // Get current authenticated user
    if (!user) return; // If no user is authenticated, stop

    try {
      const idToken = await user.getIdToken(); // Get Firebase ID token
      const response = await API.get("/roles", {
        headers: {
          Authorization: `Bearer ${idToken}`, // Pass the token in request headers
        },
      });
      setRoles(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [auth.currentUser]); // Re-fetch roles when the user changes

  const handleAddRole = async (e) => {
    e.preventDefault();
    if (!newRole.trim()) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const idToken = await user.getIdToken();
      const response = await API.post("/roles", { name: newRole }, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setRoles([...roles, response.data.role]);
      setNewRole(""); 
    } catch (error) {
      console.error("Error adding role:", error);
    }
  };

  const handleAddSheet = async (e) => {
    e.preventDefault();
    if (!newSheet.trim() || !selectedRole) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const idToken = await user.getIdToken();
      const response = await API.post(
        "/sheets", 
        { sheetId: newSheet, roleId: selectedRole },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      const updatedRoles = roles.map((role) =>
        role._id === selectedRole
          ? { ...role, sheets: [...(role.sheets || []), response.data.sheet] }
          : role
      );
      setRoles(updatedRoles);
      setNewSheet("");
    } catch (error) {
      console.error("Error adding sheet:", error);
    }
  };

  const handleDeleteRole = async (roleId) => {
    setLoading(true);

    const user = auth.currentUser;
    if (!user) return;

    try {
      const idToken = await user.getIdToken();
      await API.delete(`/roles/${roleId}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setRoles(roles.filter((role) => role._id !== roleId));
    } catch (error) {
      console.error("Error deleting role:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSheet = async (sheetId, roleId) => {
    setLoading(true);

    const user = auth.currentUser;
    if (!user) return;

    try {
      const idToken = await user.getIdToken();
      await API.delete(`/sheets/${sheetId}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      const updatedRoles = roles.map((role) =>
        role._id === roleId
          ? {
              ...role,
              sheets: role.sheets.filter((sheet) => sheet._id !== sheetId),
            }
          : role
      );
      setRoles(updatedRoles);
    } catch (error) {
      console.error("Error deleting sheet:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Roles and Sheets Management</h1>

      {/* Form to add a new role */}
      <form onSubmit={handleAddRole}>
        <input
          type="text"
          placeholder="Enter new role name"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
        />
        <button type="submit">Add Role</button>
      </form>

      {/* Form to add a new sheet */}
      <form onSubmit={handleAddSheet}>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="">Select a Role</option>
          {roles.map((role) => (
            <option key={role._id} value={role._id}>
              {role.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Enter new sheet ID"
          value={newSheet}
          onChange={(e) => setNewSheet(e.target.value)}
        />
        <button type="submit">Add Sheet</button>
      </form>

      {/* Display roles and associated sheets */}
      <h2>Existing Roles and Sheets:</h2>
      <ul>
        {roles.map((role) => (
          <li key={role._id}>
            <strong>{role.name}</strong>
            <button onClick={() => handleDeleteRole(role._id)}>Delete Role</button>

            {role.sheets && role.sheets.length > 0 && (
              <ul>
                {role.sheets.map((sheet) => (
                  <li key={sheet._id}>
                    {sheet.sheetId}
                    <button
                      onClick={() => handleDeleteSheet(sheet._id, role._id)}
                    >
                      Delete Sheet
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      {/* Show loading indicator while deletion is in progress */}
      {loading && <p>Loading...</p>}
    </div>
  );
}

export default Role;
