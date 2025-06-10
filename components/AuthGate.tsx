import React, { useState } from "react";
import GingaLogoNew from "./icons/GingaLogoNew";


const USER = "meli";
const PASS = "melimodatemginga";

const AuthGate: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (user === USER && pass === PASS) {
      onUnlock();
    } else {
      setError("Usuário ou senha inválidos");
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-b from-[#fffdf4] to-[#f9a01e10]">
      <div className="bg-white/70 backdrop-blur-md rounded-xl p-8 shadow-md max-w-sm w-full text-center">
<GingaLogoNew className="w-20 h-20 mx-auto mb-4" />
<h1 className="text-xl font-semibold mb-4">Acesso restrito</h1>
        <input
          type="text"
          placeholder="Usuário"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />
<input
  type="password"
  placeholder="Senha"
  value={pass}
  onChange={(e) => setPass(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") handleLogin();
  }}
  className="w-full mb-4 p-2 border rounded"
/>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <button
          onClick={handleLogin}
          className="bg-[#F9A01E] hover:bg-orange-500 text-white px-4 py-2 rounded w-full"
        >
          Entrar
        </button>
      </div>
    </div>
  );
};

export default AuthGate;