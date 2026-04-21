import { Link } from "react-router";
import {
  MessageSquareText,
  Settings2,
  ArrowRight,
  ShieldCheck,
  Clock,
} from "lucide-react";

const HomePage = () => {
  const currentDate = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).toUpperCase();

  return (
    <div className="min-h-screen w-full bg-usta-bg flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-xl flex flex-col items-center text-center">
        {/* Logo */}
        <img
          src="/logos/SNIES_USantoTomas_Horizontal%20color%20blanco.png"
          alt="Universidad Santo Tomás Tunja"
          className="h-20 object-contain mb-8"
        />

        <div className="space-y-2 mb-10">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-white/50 border border-white/10 uppercase tracking-wider">
            Plataforma Interna
          </span>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Asistente <span className="text-usta-blue-lt">Posgrados</span>
          </h1>
        </div>

        {/* Módulos */}
        <div className="w-full grid gap-4">
          <Link
            to="/dev/chat"
            className="group flex items-center p-5 bg-usta-card border border-white/10 rounded-2xl
              hover:border-usta-blue/50 hover:bg-usta-blue/10 transition-all duration-300"
          >
            <div className="bg-usta-blue p-3 rounded-xl text-white group-hover:scale-110 transition-transform shrink-0">
              <MessageSquareText size={24} />
            </div>
            <div className="ml-5 text-left flex-1">
              <h3 className="text-lg font-bold text-white">Chat Público</h3>
              <p className="text-sm text-white/40">
                Consulta información sobre programas
              </p>
            </div>
            <ArrowRight
              size={20}
              className="text-white/20 group-hover:text-usta-blue-lt group-hover:translate-x-1 transition-all shrink-0"
            />
          </Link>

          <Link
            to="/admin"
            className="group flex items-center p-5 bg-usta-card border border-white/10 rounded-2xl
              hover:border-usta-green/50 hover:bg-usta-green/10 transition-all duration-300"
          >
            <div className="bg-usta-green/20 border border-usta-green/30 p-3 rounded-xl text-usta-green group-hover:scale-110 transition-transform shrink-0">
              <Settings2 size={24} />
            </div>
            <div className="ml-5 text-left flex-1">
              <h3 className="text-lg font-bold text-white">
                Panel de Administración
              </h3>
              <p className="text-sm text-white/40">
                Gestión de conversaciones y configuración
              </p>
            </div>
            <ArrowRight
              size={20}
              className="text-white/20 group-hover:text-usta-green group-hover:translate-x-1 transition-all shrink-0"
            />
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 w-full flex flex-col md:flex-row items-center justify-between pt-6 border-t border-white/10 gap-4">
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <ShieldCheck size={14} className="text-usta-blue-lt" />
            <span>Acceso Seguro • Personal Autorizado</span>
          </div>
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <Clock size={14} />
            <span>{currentDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
