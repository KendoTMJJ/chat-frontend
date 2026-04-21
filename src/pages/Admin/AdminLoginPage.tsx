import { useState } from "react";
import { useNavigate } from "react-router";
import { Lock, User, Eye, EyeOff, AlertCircle, Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

type Step = "login" | "forgot" | "sent";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export default function AdminLoginPage() {
  const [step, setStep] = useState<Step>("login");

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
            {step === "login" ? "Acceso Admin" : step === "forgot" ? "Recuperar acceso" : "Revisa tu correo"}
          </h2>
          <p className="text-white/40 text-sm mt-1">
            {step === "login" ? "Panel de administración" : step === "forgot" ? "Te enviamos un enlace seguro" : "Las instrucciones están en camino"}
          </p>
        </div>

        {step === "login" && <LoginForm onForgot={() => setStep("forgot")} />}
        {step === "forgot" && <ForgotForm onBack={() => setStep("login")} onSent={() => setStep("sent")} />}
        {step === "sent" && <SentConfirmation onBack={() => setStep("login")} />}

        <p className="text-center mt-8 text-white/40 text-xs font-medium">
          © 2026 Universidad Santo Tomás • Tunja
        </p>
      </div>
    </div>
  );
}

// ── Paso 1: Login ──────────────────────────────────────────────────────────────

function LoginForm({ onForgot }: { onForgot: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

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
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
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
          <div className="flex items-center justify-between mb-2 ml-1">
            <label className="block text-xs font-bold text-white/40 uppercase tracking-wider">
              Contraseña
            </label>
            <button
              type="button"
              onClick={onForgot}
              className="text-xs text-usta-blue-lt hover:text-white transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
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
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Verificando identidad...
            </span>
          ) : "Entrar al Panel"}
        </button>
      </form>
    </div>
  );
}

// ── Paso 2: Solicitar recuperación ────────────────────────────────────────────

function ForgotForm({ onBack, onSent }: { onBack: () => void; onSent: () => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/admin-auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 404) {
        setError("Este correo no está registrado en el sistema.");
        return;
      }
      if (!res.ok) throw new Error();
      onSent();
    } catch {
      setError("Ocurrió un problema. Intenta de nuevo en un momento.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-usta-surface border border-white/10 p-8 rounded-3xl">
      <p className="text-white/60 text-sm leading-relaxed mb-6">
        Escribe el correo electrónico de tu cuenta y te enviaremos un enlace para
        restablecer tu contraseña. El enlace es válido por <strong className="text-white/80">1 hora</strong>.
      </p>

      {error && (
        <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-300 text-sm">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2 ml-1">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white
                focus:ring-2 focus:ring-usta-blue/30 focus:border-usta-blue/50 outline-none transition-all
                placeholder:text-white/20"
              placeholder="tu@correo.com"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-usta-blue hover:bg-usta-blue-dark text-white font-bold py-4 rounded-xl
            shadow-lg shadow-usta-blue/20 transition-all active:scale-[0.98]
            disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Enviando instrucciones...
            </span>
          ) : "Enviar instrucciones"}
        </button>
      </form>

      <button
        onClick={onBack}
        className="mt-5 w-full flex items-center justify-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
      >
        <ArrowLeft size={15} /> Volver al inicio de sesión
      </button>
    </div>
  );
}

// ── Paso 3: Confirmación de envío ─────────────────────────────────────────────

function SentConfirmation({ onBack }: { onBack: () => void }) {
  return (
    <div className="bg-usta-surface border border-white/10 p-8 rounded-3xl text-center">
      <div className="flex justify-center mb-5">
        <div className="p-4 bg-usta-green/15 border border-usta-green/30 rounded-2xl">
          <CheckCircle2 size={36} className="text-usta-green" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-2">¡Correo enviado!</h3>
      <p className="text-white/60 text-sm leading-relaxed mb-2">
        Si tu correo está registrado, recibirás un mensaje con un enlace para
        restablecer tu contraseña.
      </p>
      <p className="text-white/40 text-xs leading-relaxed mb-8">
        No olvides revisar la carpeta de <strong className="text-white/60">spam o correo no deseado</strong> si
        no lo encuentras en tu bandeja principal.
      </p>

      <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-left mb-6">
        <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">¿Qué sigue?</p>
        <ol className="text-sm text-white/60 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-usta-blue-lt font-bold shrink-0">1.</span>
            Abre el correo que te enviamos
          </li>
          <li className="flex items-start gap-2">
            <span className="text-usta-blue-lt font-bold shrink-0">2.</span>
            Haz clic en el botón "Restablecer contraseña"
          </li>
          <li className="flex items-start gap-2">
            <span className="text-usta-blue-lt font-bold shrink-0">3.</span>
            Elige una nueva contraseña segura
          </li>
        </ol>
      </div>

      <button
        onClick={onBack}
        className="w-full flex items-center justify-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
      >
        <ArrowLeft size={15} /> Volver al inicio de sesión
      </button>
    </div>
  );
}
