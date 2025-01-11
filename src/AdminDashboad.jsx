import React, { useState, useEffect } from "react";
import { auth } from "./firebase"; // Import auth from Firebase config
import API from "./api"; // Import your API for backend communication

function AdminDashboard() {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]); // List of users from MongoDB
  const [newRole, setNewRole] = useState("");
  const [newSheet, setNewSheet] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUser, setSelectedUser] = useState(""); // Email of the user being assigned a role

  // Fetch roles and sheets from the backend
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

  // Fetch users from MongoDB
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
      setUsers(response.data); // Assume API returns an array of user emails
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, [auth.currentUser]);

  // Add a new role
  const handleAddRole = async (e) => {
    e.preventDefault();
    if (!newRole.trim()) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const idToken = await user.getIdToken();
      const response = await API.post(
        "/roles",
        { name: newRole },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      setRoles([...roles, response.data.role]);
      setNewRole("");
    } catch (error) {
      console.error("Error adding role:", error);
    }
  };

  // Add a new sheet to a role
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
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
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

  // Assign a role to a user
  const handleAssignRole = async (e) => {
    e.preventDefault();
    if (!selectedUser || !selectedRole) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const idToken = await user.getIdToken();
      await API.put(
        "/users/assign-by-email",
        { email: selectedUser, role: selectedRole },  // selectedRole should be 'admin' or 'user', etc.
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      
      alert(`Role assigned successfully to ${selectedUser}`);
    } catch (error) {
      console.error("Error assigning role:", error);
    }
  };

  // Delete a role
  const handleDeleteRole = async (roleId) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;

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
    }
  };

  // Delete a sheet from a role
  const handleDeleteSheet = async (roleId, sheetId) => {
    if (!window.confirm("Are you sure you want to delete this sheet?")) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const idToken = await user.getIdToken();
      await API.delete(`/sheets/${sheetId}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        data: { roleId },
      });
      const updatedRoles = roles.map((role) =>
        role._id === roleId
          ? { ...role, sheets: role.sheets.filter((sheet) => sheet._id !== sheetId) }
          : role
      );
      setRoles(updatedRoles);
    } catch (error) {
      console.error("Error deleting sheet:", error);
    }
  };

  return (
    <div>
      <h1>Admin Dashboard - Roles, Sheets, and User Assignment</h1>

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

      {/* Form to add a new sheet to a role */}
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
            <strong>
              {role.name}{" "}
              <button onClick={() => handleDeleteRole(role._id)}>Delete Role</button>
            </strong>
            {role.sheets && role.sheets.length > 0 && (
              <ul>
                {role.sheets.map((sheet) => (
                  <li key={sheet._id}>
                    {sheet.sheetId}{" "}
                    <button
                      onClick={() => handleDeleteSheet(role._id, sheet._id)}
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

      {/* Form to assign a role to a user */}
      <form onSubmit={handleAssignRole}>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">Select a User</option>
          {users.map((user) => (
            <option key={user.email} value={user.email}>
              {user.email}
            </option>
          ))}
        </select>
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
        <button type="submit">Assign Role</button>
      </form>
    </div>
  );
}

export default AdminDashboard;
