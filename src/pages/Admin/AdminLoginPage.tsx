import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/admin-auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
      navigate("/admin", { replace: true });
    } catch {
      setError("Los datos ingresados no son válidos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-usta-bg p-6 font-sans">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/logos/SNIES_USantoTomas_Horizontal%20color%20blanco.png"
            alt="Universidad Santo Tomás Tunja"
            className="h-16 object-contain mb-5"
          />
          <h2 className="text-2xl font-bold text-white">Acceso Admin</h2>
          <p className="text-white/40 text-sm mt-1">
            Panel de administración
          </p>
        </div>

        <div className="bg-usta-surface border border-white/10 p-8 rounded-3xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-300 text-sm">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2 ml-1">
                Usuario / Email
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                  size={18}
                />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white
                    focus:ring-2 focus:ring-usta-blue/30 focus:border-usta-blue/50 outline-none transition-all
                    placeholder:text-white/20"
                  placeholder="admin@usantoto.edu.co"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white
                    focus:ring-2 focus:ring-usta-blue/30 focus:border-usta-blue/50 outline-none transition-all
                    placeholder:text-white/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-usta-blue hover:bg-usta-blue-dark text-white font-bold py-4 rounded-xl
                shadow-lg shadow-usta-blue/20 transition-all active:scale-[0.98]
                disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {isLoading ? "Verificando identidad..." : "Entrar al Panel"}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-white/25 text-xs font-medium">
          © 2026 Universidad Santo Tomás • Tunja
        </p>
      </div>
    </div>
  );
}
