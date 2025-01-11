import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [role, setRole] = useState(null);
    const [sheets, setSheets] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Fetch the current user's details
        axios.get('/api/user/me')
            .then((response) => {
                const { role, sheets } = response.data;
                if (!role) {
                    setMessage("You don't have permission to see anything in this app.");
                } else {
                    setRole(role);
                    setSheets(sheets);
                }
            })
            .catch(() => {
                setMessage('Error fetching user details.');
            });
    }, []);

    return (
        <div>
            {message && <p>{message}</p>}
            {role && (
                <div>
                    <h1>Your Role: {role}</h1>
                    <h2>Your Sheets:</h2>
                    <ul>
                        {sheets.map((sheet, index) => (
                            <li key={index}>
                                <a href={sheet} target="_blank" rel="noopener noreferrer">{sheet}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
