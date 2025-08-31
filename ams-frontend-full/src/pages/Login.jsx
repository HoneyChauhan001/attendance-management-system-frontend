import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(username, password);
      if (user.role === "EMPLOYEE") navigate("/employee");
      else navigate("/admin");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="p-6 bg-white shadow rounded w-80">
        <h1 className="text-xl mb-4">Login</h1>
        <input className="w-full border p-2 mb-3" placeholder="Email"
          value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="w-full border p-2 mb-3" type="password" placeholder="Password"
          value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full bg-blue-600 text-white py-2">Login</button>
      </form>
    </div>
  );
}
