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
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
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
    <div className='flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50'>
      <div className='max-w-2xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h2 className='text-xl font-bold text-slate-800'>
            Ingesta de conocimientos — Posgrados
          </h2>
          <p className='text-sm text-slate-500 mt-1'>
            Sube el documento con la información de los programas de posgrado.
            El sistema extraerá automáticamente el contenido para el asistente virtual.
          </p>
        </div>

        {/* Input oculto compartido */}
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
              ? "border-slate-200 bg-white cursor-default"
              : dragging
                ? "border-blue-400 bg-blue-50 cursor-copy"
                : "border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer"
            }`}
        >
          {!file ? (
            <div className='flex flex-col items-center justify-center py-16 px-6 text-center'>
              <div className={`p-4 rounded-2xl mb-4 transition-colors ${dragging ? "bg-blue-100" : "bg-slate-100"}`}>
                <UploadCloud size={32} className={dragging ? "text-blue-500" : "text-slate-400"} />
              </div>
              <p className='text-sm font-semibold text-slate-700 mb-1'>
                Arrastra el archivo aquí
              </p>
              <p className='text-xs text-slate-400 mb-4'>o haz clic para seleccionarlo</p>
              <span className='text-[10px] font-medium text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full'>
                XLS · XLSX
              </span>
            </div>
          ) : (
            <div className='flex items-center gap-4 p-5'>
              <div className='p-3 bg-blue-50 rounded-xl shrink-0'>
                <FileText size={24} className='text-blue-600' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-semibold text-slate-800 truncate'>{file.name}</p>
                <p className='text-xs text-slate-400 mt-0.5'>{formatSize(file.size)}</p>
              </div>
              {status !== "uploading" && (
                <button onClick={handleRemoveFile}
                  className='p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0'>
                  <X size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Selector de archivo — móvil ──────────────────────────── */}
        <div className='md:hidden'>
          {!file ? (
            <button
              onClick={() => inputRef.current?.click()}
              className='w-full flex flex-col items-center justify-center gap-3 py-10 border-2 border-dashed border-slate-300 rounded-2xl bg-white active:bg-blue-50 active:border-blue-400 transition-all'
            >
              <div className='p-4 rounded-2xl bg-slate-100'>
                <UploadCloud size={28} className='text-slate-400' />
              </div>
              <div className='text-center'>
                <p className='text-sm font-semibold text-slate-700'>
                  Toca para seleccionar el archivo
                </p>
                <p className='text-xs text-slate-400 mt-1'>XLS · XLSX</p>
              </div>
            </button>
          ) : (
            <div className='flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl'>
              <div className='p-3 bg-blue-50 rounded-xl shrink-0'>
                <FileText size={22} className='text-blue-600' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-semibold text-slate-800 truncate'>{file.name}</p>
                <p className='text-xs text-slate-400 mt-0.5'>{formatSize(file.size)}</p>
              </div>
              {status !== "uploading" && (
                <button onClick={handleRemoveFile}
                  className='p-1.5 rounded-lg bg-slate-100 text-slate-400 shrink-0'>
                  <X size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Feedback */}
        {status === "success" && (
          <div className='mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700 text-sm'>
            <CheckCircle2 size={16} className='shrink-0' />
            Documento procesado correctamente. El asistente ya tiene la información actualizada.
          </div>
        )}
        {status === "error" && (
          <div className='mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm'>
            <AlertCircle size={16} className='shrink-0' />
            Error al procesar el documento. Verifica el archivo e inténtalo de nuevo.
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleUpload}
          disabled={!file || status === "uploading" || status === "success"}
          className='mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700
            text-white text-sm font-bold shadow-sm transition-all
            disabled:opacity-50 disabled:cursor-not-allowed'
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

        <p className='text-center text-[10px] text-slate-400 mt-4'>
          El contenido anterior será reemplazado al procesar un nuevo documento.
        </p>
      </div>
    </div>
  );
};

export default PosgradosPanel;
