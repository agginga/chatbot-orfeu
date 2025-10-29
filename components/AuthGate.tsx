import React, { useState } from "react";
import GingaLogoNew from "./icons/GingaLogoNew";

// Seus dados de login
const USER = "orfeu";
const PASS = "orfeutemginga";

const AuthGate: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    // Verifica se as credenciais estão corretas
    if (user === USER && pass === PASS) {
      
      // --- INÍCIO DA LÓGICA DE SESSÃO (AJUSTE) ---

      // 1. Calcula a data de expiração (48 horas a partir de agora)
      const expirationTime = new Date().getTime() + 48 * 60 * 60 * 1000; // 48h em milissegundos

      // 2. Cria o objeto da sessão
      const session = {
        isLoggedIn: true,
        expiresAt: expirationTime,
      };

      // 3. Salva o objeto como uma string no localStorage
      localStorage.setItem("userSession", JSON.stringify(session));

      // --- FIM DA LÓGICA DE SESSÃO ---

      // 4. Libera o acesso no componente principal
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