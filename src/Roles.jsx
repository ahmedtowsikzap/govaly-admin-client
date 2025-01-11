import React, { useState, useEffect } from "react";
import { auth } from "./firebase"; // Firebase auth import
import API from "./api"; // Adjust path to your api.js

function Role() {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]); // State for users
  const [sheets, setSheets] = useState([]); // State for sheets
  const [newRole, setNewRole] = useState("");
  const [newSheet, setNewSheet] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUser, setSelectedUser] = useState(""); // Selected user for role assignment
  const [selectedRoleForUser, setSelectedRoleForUser] = useState(""); // Selected role for user assignment
  const [selectedSheetForUser, setSelectedSheetForUser] = useState(""); // Selected sheet for user assignment
  const [userEmailForRole, setUserEmailForRole] = useState(""); // Email for assigning role to user
  const [userEmailForSheet, setUserEmailForSheet] = useState(""); // Email for assigning sheet to user
  const [loading, setLoading] = useState(false);

  const fetchRoles = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const idToken = await user.getIdToken();
      const response = await API.get("/roles", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setRoles(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const fetchUsers = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const idToken = await user.getIdToken();
      const response = await API.get("/users", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchSheets = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const idToken = await user.getIdToken();
      const response = await API.get("/sheets", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setSheets(response.data);
    } catch (error) {
      console.error("Error fetching sheets:", error);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchUsers();
    fetchSheets();
  }, [auth.currentUser]);

  // Add Role
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
      setRoles([...roles, response.data]);
      setNewRole("");
    } catch (error) {
      console.error("Error adding role:", error);
    }
  };

  // Add Sheet
  const handleAddSheet = async (e) => {
    e.preventDefault();
    if (!newSheet.trim() || !selectedRole) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const idToken = await user.getIdToken();
      const response = await API.post("/sheets", { sheetId: newSheet, roleId: selectedRole }, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setSheets([...sheets, response.data.sheet]);
      setNewSheet("");
    } catch (error) {
      console.error("Error adding sheet:", error);
    }
  };

  // Delete Role
  const handleDeleteRole = async (roleId) => {
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) return;

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

  // Delete Sheet
  const handleDeleteSheet = async (sheetId) => {
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) return;

      const idToken = await user.getIdToken();
      await API.delete(`/sheets/${sheetId}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setSheets(sheets.filter((sheet) => sheet._id !== sheetId));
    } catch (error) {
      console.error("Error deleting sheet:", error);
    } finally {
      setLoading(false);
    }
  };

  // Assign Role to User (By Email)
  const handleAssignRoleToUser = async (e) => {
    e.preventDefault();
    if (!userEmailForRole.trim() || !selectedRoleForUser) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const idToken = await user.getIdToken();
      await API.post(
        `/users/assign-role`,
        { email: userEmailForRole, roleId: selectedRoleForUser },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setUserEmailForRole(""); // Reset the input
      fetchUsers(); // Refetch users after role assignment
    } catch (error) {
      console.error("Error assigning role to user:", error);
    }
  };

  // Assign Sheet to User (By Email)
  const handleAssignSheetToUser = async (e) => {
    e.preventDefault();
    if (!userEmailForSheet.trim() || !selectedSheetForUser) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const idToken = await user.getIdToken();
      await API.post(
        `/users/assign-sheet`,
        { email: userEmailForSheet, sheetId: selectedSheetForUser },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setUserEmailForSheet(""); // Reset the input
      fetchUsers(); // Refetch users after sheet assignment
    } catch (error) {
      console.error("Error assigning sheet to user:", error);
    }
  };

  return (
    <div>
      <h1>Admin Panel</h1>

      {/* Add Role */}
      <form onSubmit={handleAddRole}>
        <input
          type="text"
          placeholder="Enter new role"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
        />
        <button type="submit">Add Role</button>
      </form>

      {/* Add Sheet */}
      <form onSubmit={handleAddSheet}>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="">Select Role for Sheet</option>
          {roles.map((role) => (
            <option key={role._id} value={role._id}>
              {role.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Enter sheet ID"
          value={newSheet}
          onChange={(e) => setNewSheet(e.target.value)}
        />
        <button type="submit">Add Sheet</button>
      </form>

      {/* Assign Role to User */}
      <form onSubmit={handleAssignRoleToUser}>
        <input
          type="email"
          placeholder="Enter user email"
          value={userEmailForRole}
          onChange={(e) => setUserEmailForRole(e.target.value)}
        />
        <select
          value={selectedRoleForUser}
          onChange={(e) => setSelectedRoleForUser(e.target.value)}
        >
          <option value="">Select Role</option>
          {roles.map((role) => (
            <option key={role._id} value={role._id}>
              {role.name}
            </option>
          ))}
        </select>
        <button type="submit">Assign Role</button>
      </form>

      {/* Assign Sheet to User */}
      <form onSubmit={handleAssignSheetToUser}>
        <input
          type="email"
          placeholder="Enter user email"
          value={userEmailForSheet}
          onChange={(e) => setUserEmailForSheet(e.target.value)}
        />
        <select
          value={selectedSheetForUser}
          onChange={(e) => setSelectedSheetForUser(e.target.value)}
        >
          <option value="">Select Sheet</option>
          {sheets.map((sheet) => (
            <option key={sheet._id} value={sheet._id}>
              {sheet.sheetId}
            </option>
          ))}
        </select>
        <button type="submit">Assign Sheet</button>
      </form>

      {/* List Users with Email */}
      <h2>Users:</h2>
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            <strong>{user.email}</strong>
          </li>
        ))}
      </ul>

      {/* List Roles and Sheets */}
      <h2>Existing Roles:</h2>
      <ul>
        {roles.map((role) => (
          <li key={role._id}>
            <strong>{role.name}</strong>
            <button onClick={() => handleDeleteRole(role._id)}>Delete</button>
            {role.sheets && role.sheets.length > 0 && (
              <ul>
                {role.sheets.map((sheet) => (
                  <li key={sheet._id}>
                    {sheet.sheetId}
                    <button onClick={() => handleDeleteSheet(sheet._id)}>Delete</button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      {/* Show loading indicator */}
      {loading && <p>Loading...</p>}
    </div>
  );
}

export default Role;
