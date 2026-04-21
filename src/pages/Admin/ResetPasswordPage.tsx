import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

type Step = "form" | "success" | "invalid";

function passwordStrength(pwd: string): { level: 0 | 1 | 2 | 3; label: string; color: string } {
  if (pwd.length === 0) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++;
  if (score === 1) return { level: 1, label: "Débil", color: "bg-red-500" };
  if (score === 2) return { level: 2, label: "Aceptable", color: "bg-yellow-400" };
  return { level: 3, label: "Segura", color: "bg-usta-green" };
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(token ? "form" : "invalid");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const strength = passwordStrength(password);
  const mismatch = confirm.length > 0 && password !== confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Las contraseñas no coinciden."); return; }
    if (password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; }

    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/admin-auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      if (res.status === 401) { setStep("invalid"); return; }
      if (!res.ok) throw new Error();
      setStep("success");
    } catch {
      setError("Ocurrió un problema. Intenta de nuevo o solicita un nuevo enlace.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-usta-bg p-6 font-sans">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/logos/SNIES_USantoTomas_Horizontal%20color%20blanco.png"
            alt="Universidad Santo Tomás Tunja"
            className="h-16 object-contain mb-5"
          />
          <h2 className="text-2xl font-bold text-white">
            {step === "success" ? "¡Listo!" : step === "invalid" ? "Enlace inválido" : "Nueva contraseña"}
          </h2>
          <p className="text-white/40 text-sm mt-1">Panel de administración</p>
        </div>

        {/* ── Formulario ── */}
        {step === "form" && (
          <div className="bg-usta-surface border border-white/10 p-8 rounded-3xl">
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Elige una contraseña nueva y segura para tu cuenta de administrador.
            </p>

            {error && (
              <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-300 text-sm">
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nueva contraseña */}
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2 ml-1">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white
                      focus:ring-2 focus:ring-usta-blue/30 focus:border-usta-blue/50 outline-none transition-all
                      placeholder:text-white/20"
                    placeholder="Mínimo 8 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Indicador de fortaleza */}
                {password.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 flex gap-1">
                      {[1, 2, 3].map((n) => (
                        <div
                          key={n}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            strength.level >= n ? strength.color : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs font-semibold ${
                      strength.level === 1 ? "text-red-400" :
                      strength.level === 2 ? "text-yellow-400" : "text-usta-green"
                    }`}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2 ml-1">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className={`w-full bg-white/5 border rounded-xl py-3 pl-12 pr-12 text-white
                      focus:ring-2 outline-none transition-all placeholder:text-white/20
                      ${mismatch
                        ? "border-red-500/50 focus:ring-red-500/20"
                        : "border-white/10 focus:ring-usta-blue/30 focus:border-usta-blue/50"
                      }`}
                    placeholder="Repite la contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {mismatch && (
                  <p className="mt-1.5 ml-1 text-xs text-red-400">Las contraseñas no coinciden</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || mismatch || password.length < 8}
                className="w-full bg-usta-blue hover:bg-usta-blue-dark text-white font-bold py-4 rounded-xl
                  shadow-lg shadow-usta-blue/20 transition-all active:scale-[0.98]
                  disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Guardando...
                  </span>
                ) : "Guardar nueva contraseña"}
              </button>
            </form>
          </div>
        )}

        {/* ── Éxito ── */}
        {step === "success" && (
          <div className="bg-usta-surface border border-white/10 p-8 rounded-3xl text-center">
            <div className="flex justify-center mb-5">
              <div className="p-4 bg-usta-green/15 border border-usta-green/30 rounded-2xl">
                <CheckCircle2 size={36} className="text-usta-green" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Contraseña actualizada</h3>
            <p className="text-white/60 text-sm leading-relaxed mb-8">
              Tu contraseña fue cambiada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <button
              onClick={() => navigate("/login", { replace: true })}
              className="w-full bg-usta-blue hover:bg-usta-blue-dark text-white font-bold py-4 rounded-xl
                shadow-lg shadow-usta-blue/20 transition-all active:scale-[0.98]"
            >
              Ir al inicio de sesión
            </button>
          </div>
        )}

        {/* ── Enlace inválido / expirado ── */}
        {step === "invalid" && (
          <div className="bg-usta-surface border border-white/10 p-8 rounded-3xl text-center">
            <div className="flex justify-center mb-5">
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
                <ShieldCheck size={36} className="text-red-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Enlace no válido</h3>
            <p className="text-white/60 text-sm leading-relaxed mb-8">
              Este enlace de recuperación ya fue usado o expiró. Los enlaces son válidos por{" "}
              <strong className="text-white/80">1 hora</strong> desde que se generan.
            </p>
            <button
              onClick={() => navigate("/login", { replace: true })}
              className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-4 rounded-xl
                transition-all active:scale-[0.98]"
            >
              Solicitar un nuevo enlace
            </button>
          </div>
        )}

        <p className="text-center mt-8 text-white/40 text-xs font-medium">
          © 2026 Universidad Santo Tomás • Tunja
        </p>
      </div>
    </div>
  );
}
