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
  const currentDate = "Sábado, 14 De Febrero De 2026 - 03:18 P. M.";

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-xl flex flex-col items-center text-center">
        {/* Logo e Identidad */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 mb-8">
          <GraduationCap size={48} className="text-blue-600" />
        </div>

        <div className="space-y-2 mb-10">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
            Plataforma Interna
          </span>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            Asistente <span className="text-blue-600">Postgrados</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Universidad Santo Tomás • Seccional Tunja
          </p>
        </div>

        {/* Módulos */}
        <div className="w-full grid gap-4">
          <Link
            to="/dev/chat"
            className="group flex items-center p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-300"
          >
            <div className="bg-blue-600 p-3 rounded-xl text-white group-hover:scale-110 transition-transform">
              <MessageSquareText size={24} />
            </div>
            <div className="ml-5 text-left flex-1">
              <h3 className="text-lg font-bold text-slate-800">Chat Público</h3>
              <p className="text-sm text-slate-500">
                Consulta información sobre programas
              </p>
            </div>
            <ArrowRight
              size={20}
              className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
            />
          </Link>

          <Link
            to="/admin"
            className="group flex items-center p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-slate-400 hover:shadow-md transition-all duration-300"
          >
            <div className="bg-slate-800 p-3 rounded-xl text-white group-hover:scale-110 transition-transform">
              <Settings2 size={24} />
            </div>
            <div className="ml-5 text-left flex-1">
              <h3 className="text-lg font-bold text-slate-800">
                Panel de Administración
              </h3>
              <p className="text-sm text-slate-500">
                Gestión de logs, usuarios y sistema
              </p>
            </div>
            <ArrowRight
              size={20}
              className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all"
            />
          </Link>
        </div>

        {/* Footer info */}
        <div className="mt-12 w-full flex flex-col md:flex-row items-center justify-between pt-6 border-t border-slate-200 gap-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <ShieldCheck size={14} className="text-blue-500" />
            <span>Acceso Seguro • Personal Autorizado</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Clock size={14} />
            <span className="uppercase">{currentDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
