// src/pages/Admin/PosgradosPage.tsx
import { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

type UploadStatus = "idle" | "uploading" | "success" | "error";

const ACCEPTED_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

const ACCEPTED_EXTENSIONS = ".xlsx,.xls";

const PosgradosPanel = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!ACCEPTED_TYPES.includes(f.type)) return;
    setFile(f);
    setStatus("idle");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setStatus("idle");
    if (inputRef.current) inputRef.current.value = "";
  };

  const { logout } = useAuth();

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${SERVER_URL}/admin/knowledge/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        body: formData,
      });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className='flex-1 overflow-y-auto p-4 md:p-8 bg-[#0f0a1e]'>
      <div className='max-w-2xl mx-auto'>
        <div className='mb-8'>
          <h2 className='text-xl font-bold text-white'>
            Ingesta de conocimientos — Posgrados
          </h2>
          <p className='text-sm text-white/40 mt-1'>
            Sube el documento con la información de los programas de posgrado.
            El sistema extraerá automáticamente el contenido para el asistente virtual.
          </p>
        </div>

        <input
          ref={inputRef}
          type='file'
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleInputChange}
          className='hidden'
        />

        {/* ── Área drag-and-drop — desktop ─────────────────────────── */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !file && inputRef.current?.click()}
          className={`hidden md:block relative border-2 border-dashed rounded-2xl transition-all
            ${file
              ? "border-white/10 bg-[#1e1040] cursor-default"
              : dragging
                ? "border-[#4c6ef5]/70 bg-[#4c6ef5]/10 cursor-copy"
                : "border-white/15 bg-[#1e1040] hover:border-[#4c6ef5]/50 hover:bg-[#4c6ef5]/5 cursor-pointer"
            }`}
        >
          {!file ? (
            <div className='flex flex-col items-center justify-center py-16 px-6 text-center'>
              <div className={`p-4 rounded-2xl mb-4 transition-colors ${dragging ? "bg-[#4c6ef5]/20" : "bg-white/5"}`}>
                <UploadCloud size={32} className={dragging ? "text-[#7b9fff]" : "text-white/30"} />
              </div>
              <p className='text-sm font-semibold text-white/80 mb-1'>
                Arrastra el archivo aquí
              </p>
              <p className='text-xs text-white/40 mb-4'>o haz clic para seleccionarlo</p>
              <span className='text-[10px] font-medium text-white/30 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full'>
                XLS · XLSX
              </span>
            </div>
          ) : (
            <div className='flex items-center gap-4 p-5'>
              <div className='p-3 bg-[#4c6ef5]/20 rounded-xl shrink-0'>
                <FileText size={24} className='text-[#7b9fff]' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-semibold text-white truncate'>{file.name}</p>
                <p className='text-xs text-white/40 mt-0.5'>{formatSize(file.size)}</p>
              </div>
              {status !== "uploading" && (
                <button
                  onClick={handleRemoveFile}
                  className='p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors shrink-0'
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Selector — móvil ─────────────────────────────────────── */}
        <div className='md:hidden'>
          {!file ? (
            <button
              onClick={() => inputRef.current?.click()}
              className='w-full flex flex-col items-center justify-center gap-3 py-10 border-2 border-dashed border-white/15 rounded-2xl bg-[#1e1040] active:bg-[#4c6ef5]/10 active:border-[#4c6ef5]/50 transition-all'
            >
              <div className='p-4 rounded-2xl bg-white/5'>
                <UploadCloud size={28} className='text-white/30' />
              </div>
              <div className='text-center'>
                <p className='text-sm font-semibold text-white/80'>
                  Toca para seleccionar el archivo
                </p>
                <p className='text-xs text-white/30 mt-1'>XLS · XLSX</p>
              </div>
            </button>
          ) : (
            <div className='flex items-center gap-4 p-4 bg-[#1e1040] border border-white/10 rounded-2xl'>
              <div className='p-3 bg-[#4c6ef5]/20 rounded-xl shrink-0'>
                <FileText size={22} className='text-[#7b9fff]' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-semibold text-white truncate'>{file.name}</p>
                <p className='text-xs text-white/40 mt-0.5'>{formatSize(file.size)}</p>
              </div>
              {status !== "uploading" && (
                <button
                  onClick={handleRemoveFile}
                  className='p-1.5 rounded-lg bg-white/5 text-white/30 shrink-0'
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        {status === "success" && (
          <div className='mt-4 p-4 bg-[#39d98a]/10 border border-[#39d98a]/30 rounded-xl flex items-center gap-3 text-[#39d98a] text-sm'>
            <CheckCircle2 size={16} className='shrink-0' />
            Documento procesado correctamente. El asistente ya tiene la información actualizada.
          </div>
        )}
        {status === "error" && (
          <div className='mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-300 text-sm'>
            <AlertCircle size={16} className='shrink-0' />
            Error al procesar el documento. Verifica el archivo e inténtalo de nuevo.
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || status === "uploading" || status === "success"}
          className='mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl
            bg-[#4c6ef5] hover:bg-[#3b5de5] text-white text-sm font-bold
            shadow-lg shadow-[#4c6ef5]/20 transition-all
            disabled:opacity-40 disabled:cursor-not-allowed'
        >
          {status === "uploading" ? (
            <>
              <Loader2 size={16} className='animate-spin' />
              Procesando documento...
            </>
          ) : (
            <>
              <UploadCloud size={16} />
              Subir y procesar documento
            </>
          )}
        </button>

        <p className='text-center text-[10px] text-white/25 mt-4'>
          El contenido anterior será reemplazado al procesar un nuevo documento.
        </p>
      </div>
    </div>
  );
};

export default PosgradosPanel;
