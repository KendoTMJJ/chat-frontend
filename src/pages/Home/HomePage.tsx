import { Link } from "react-router";
import {
  MessageSquareText,
  Settings2,
  GraduationCap,
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
    <div className="min-h-screen w-full bg-[#0f0a1e] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-xl flex flex-col items-center text-center">
        {/* Logo */}
        <div className="bg-[#4c6ef5]/20 border border-[#4c6ef5]/30 p-5 rounded-3xl mb-8">
          <GraduationCap size={48} className="text-[#7b9fff]" />
        </div>

        <div className="space-y-2 mb-10">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-white/50 border border-white/10 uppercase tracking-wider">
            Plataforma Interna
          </span>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Asistente <span className="text-[#7b9fff]">Posgrados</span>
          </h1>
          <p className="text-white/40 font-medium">
            Universidad Santo Tomás • Seccional Tunja
          </p>
        </div>

        {/* Módulos */}
        <div className="w-full grid gap-4">
          <Link
            to="/dev/chat"
            className="group flex items-center p-5 bg-[#1e1040] border border-white/10 rounded-2xl
              hover:border-[#4c6ef5]/50 hover:bg-[#4c6ef5]/10 transition-all duration-300"
          >
            <div className="bg-[#4c6ef5] p-3 rounded-xl text-white group-hover:scale-110 transition-transform shrink-0">
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
              className="text-white/20 group-hover:text-[#7b9fff] group-hover:translate-x-1 transition-all shrink-0"
            />
          </Link>

          <Link
            to="/admin"
            className="group flex items-center p-5 bg-[#1e1040] border border-white/10 rounded-2xl
              hover:border-[#39d98a]/50 hover:bg-[#39d98a]/10 transition-all duration-300"
          >
            <div className="bg-[#39d98a]/20 border border-[#39d98a]/30 p-3 rounded-xl text-[#39d98a] group-hover:scale-110 transition-transform shrink-0">
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
              className="text-white/20 group-hover:text-[#39d98a] group-hover:translate-x-1 transition-all shrink-0"
            />
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 w-full flex flex-col md:flex-row items-center justify-between pt-6 border-t border-white/10 gap-4">
          <div className="flex items-center gap-2 text-white/25 text-xs">
            <ShieldCheck size={14} className="text-[#7b9fff]" />
            <span>Acceso Seguro • Personal Autorizado</span>
          </div>
          <div className="flex items-center gap-2 text-white/25 text-xs">
            <Clock size={14} />
            <span>{currentDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
