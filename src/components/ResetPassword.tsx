import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

interface ResetPasswordProps {
  onFinish: () => void; // Função para voltar ao login ou home
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ onFinish }) => {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const accessToken = new URLSearchParams(hash.replace("#", "?")).get(
      "access_token"
    );

    if (!accessToken) {
      setMessage("Token inválido ou expirado.");
      return;
    }

    // Seta sessão com token recebido na URL
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: "", // O Supabase ignora isso se não for necessário
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setMessage("Erro ao redefinir a senha. Tente novamente.");
    } else {
      setMessage("Senha atualizada com sucesso!");
      setTimeout(() => {
        onFinish(); // Voltar para o login ou home
      }, 2000);
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto max-w-md py-12">
      <h2 className="text-2xl font-bold mb-4 text-center">Redefinir Senha</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          className="w-full border p-2 rounded"
          placeholder="Nova senha"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
        >
          {loading ? "Atualizando..." : "Atualizar Senha"}
        </button>
      </form>
      {message && (
        <p className="mt-4 text-center text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
};

export default ResetPassword;
