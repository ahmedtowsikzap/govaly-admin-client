import React from "react";
import { auth, provider, signInWithPopup, signOut } from "./firebase";

const SignIn = () => {
  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("User Info:", result.user);

      // Get the Firebase ID token
      const idToken = await result.user.getIdToken();
      console.log("ID Token:", idToken);

      // Send ID token to backend to test admin role
      try {
        const response = await fetch('http://localhost:5000/auth/signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`, // Send token as Bearer token
          },
          body: JSON.stringify({ token: idToken }),
        });
        const data = await response.json();
        console.log("Response from backend:", data);

        // If the role is admin, handle accordingly (e.g., redirect or show admin panel)
        if (data.role === "admin") {
          console.log("User is an Admin");
          // Redirect or show Admin panel
        } else {
          console.log("User is not an Admin");
          // Redirect or show regular user panel
        }
      } catch (error) {
        console.error("Error sending token to backend:", error);
      }
      
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div>
      <button onClick={handleSignIn}>Sign In with Google</button>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
};

export default SignIn;
