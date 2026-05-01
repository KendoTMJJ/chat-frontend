// src/pages/Admin/HelpdeskPage.tsx
import { useState } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  ExternalLink,
} from "lucide-react";
import {
  useHelpdeskCategories,
  type HelpdeskCategory,
  type CreateHelpdeskCategoryDto,
  type UpdateHelpdeskCategoryDto,
} from "../../hooks/useHelpdeskResponses";

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
const ConfirmModal = ({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center'>
    <div className='bg-usta-card rounded-2xl border border-white/10 p-6 max-w-sm w-full mx-4'>
      <div className='flex items-center gap-3 mb-4'>
        <div className='bg-red-500/20 p-2 rounded-xl'>
          <Trash2 size={18} className='text-red-400' />
        </div>
        <h3 className='font-bold text-white'>Eliminar categoría</h3>
      </div>
      <p className='text-sm text-white/50 mb-6'>
        Esta acción eliminará permanentemente la categoría. No se puede deshacer.
      </p>
      <div className='flex gap-3'>
        <button
          onClick={onCancel}
          className='flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-white/70 hover:bg-white/5 transition-all'
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className='flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all'
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
);

// ─── Create Modal ─────────────────────────────────────────────────────────────
const CreateModal = ({
  saving,
  onSubmit,
  onCancel,
}: {
  saving: boolean;
  onSubmit: (dto: CreateHelpdeskCategoryDto) => Promise<void>;
  onCancel: () => void;
}) => {
  const [intent, setIntent] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [description, setDescription] = useState("");

  const isValid = intent.trim().length > 0;

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
      <div className='bg-usta-card rounded-2xl border border-white/10 w-full max-w-md'>
        <div className='flex items-center justify-between px-6 py-4 border-b border-white/10'>
          <h3 className='font-bold text-white'>Nueva categoría</h3>
          <button
            onClick={onCancel}
            className='p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors'
          >
            <X size={16} />
          </button>
        </div>
        <div className='p-6 space-y-4'>
          <div>
            <label className='flex items-center gap-1.5 text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5'>
              Identificador <span className='text-red-400'>*</span>
              <span
                title="Solo minúsculas y guión bajo, sin espacios ni tildes. Ej: paz_y_salvos. Este valor lo usa n8n para enrutar la consulta y se convierte automáticamente en el nombre visible del chip."
                className='cursor-help text-white/30 normal-case font-normal'
              >ⓘ</span>
            </label>
            <input
              value={intent}
              onChange={(e) => setIntent(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
              placeholder='ej: paz_y_salvos'
              className='w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white font-mono
                outline-none focus:border-usta-blue/50 focus:ring-2 focus:ring-usta-blue/20 transition-all
                placeholder:text-white/20'
            />
            {intent && (
              <p className='text-[11px] text-white/30 mt-1'>
                Se mostrará como: <span className='text-white/50'>{intent.replace(/_/g, " ").replace(/^\w/, c => c.toUpperCase())}</span>
              </p>
            )}
          </div>
          <div>
            <label className='block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5'>
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Describe qué tipo de consultas cubre esta categoría. El clasificador usa este texto para identificar la intención del usuario.'
              rows={3}
              className='w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white
                outline-none focus:border-usta-blue/50 focus:ring-2 focus:ring-usta-blue/20 transition-all resize-none
                placeholder:text-white/20'
            />
          </div>
          <div>
            <label className='block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5'>
              Enlace PDF
            </label>
            <input
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder='https://...'
              className='w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white
                outline-none focus:border-usta-blue/50 focus:ring-2 focus:ring-usta-blue/20 transition-all
                placeholder:text-white/20'
            />
          </div>
        </div>
        <div className='flex gap-3 px-6 py-4 border-t border-white/10'>
          <button
            onClick={onCancel}
            className='flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-white/70 hover:bg-white/5 transition-all'
          >
            Cancelar
          </button>
          <button
            onClick={() =>
              onSubmit({
                intent: intent.trim(),
                description: description.trim() || null,
                pdf_url: pdfUrl.trim() || null,
              })
            }
            disabled={!isValid || saving}
            className='flex-1 py-2.5 rounded-xl bg-usta-blue hover:bg-usta-blue-dark text-white text-sm font-semibold
              transition-all disabled:opacity-40 disabled:cursor-not-allowed'
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────
const EditModal = ({
  category,
  saving,
  onSubmit,
  onCancel,
}: {
  category: HelpdeskCategory;
  saving: boolean;
  onSubmit: (dto: UpdateHelpdeskCategoryDto) => Promise<void>;
  onCancel: () => void;
}) => {
  const [pdfUrl, setPdfUrl] = useState(category.pdf_url ?? "");
  const [description, setDescription] = useState(category.description ?? "");

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
      <div className='bg-usta-card rounded-2xl border border-white/10 w-full max-w-md'>
        <div className='flex items-center justify-between px-6 py-4 border-b border-white/10'>
          <h3 className='font-bold text-white'>Editar categoría</h3>
          <button
            onClick={onCancel}
            className='p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors'
          >
            <X size={16} />
          </button>
        </div>

        <div className='p-6 space-y-4'>
          <div>
            <label className='block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5'>
              Identificador
            </label>
            <div className='bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 flex items-center justify-between'>
              <span className='font-mono text-sm text-white/50'>{category.intent}</span>
              <span className='text-xs text-white/30'>→ {category.display_label}</span>
            </div>
            <p className='text-[10px] text-white/40 mt-1'>El identificador no se puede modificar.</p>
          </div>

          <div>
            <label className='block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5'>
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Describe qué tipo de consultas cubre esta categoría. El clasificador usa este texto para identificar la intención del usuario.'
              rows={3}
              className='w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white
                outline-none focus:border-usta-blue/50 focus:ring-2 focus:ring-usta-blue/20 transition-all resize-none
                placeholder:text-white/20'
            />
          </div>

          <div>
            <label className='block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5'>
              Enlace PDF
            </label>
            <input
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder='https://...'
              className='w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white
                outline-none focus:border-usta-blue/50 focus:ring-2 focus:ring-usta-blue/20 transition-all
                placeholder:text-white/20'
            />
          </div>
        </div>

        <div className='flex gap-3 px-6 py-4 border-t border-white/10'>
          <button
            onClick={onCancel}
            className='flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-white/70 hover:bg-white/5 transition-all'
          >
            Cancelar
          </button>
          <button
            onClick={() => onSubmit({ description: description.trim() || null, pdf_url: pdfUrl.trim() || null })}
            disabled={saving}
            className='flex-1 py-2.5 rounded-xl bg-usta-blue hover:bg-usta-blue-dark text-white text-sm font-semibold
              transition-all disabled:opacity-40 disabled:cursor-not-allowed'
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Helpdesk Panel ───────────────────────────────────────────────────────────
const HelpdeskPanel = () => {
  const { categories, loading, saving, error, successMsg, create, update, remove, refresh } =
    useHelpdeskCategories();

  const [editing, setEditing] = useState<HelpdeskCategory | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const handleCreate = async (dto: CreateHelpdeskCategoryDto) => {
    await create(dto);
    setCreating(false);
  };

  const handleUpdate = async (dto: UpdateHelpdeskCategoryDto) => {
    if (!editing) return;
    await update(editing.id, dto);
    setEditing(null);
  };

  const handleDeleteConfirm = async () => {
    if (confirmDeleteId === null) return;
    await remove(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  return (
    <>
      {confirmDeleteId !== null && (
        <ConfirmModal
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
      {creating && (
        <CreateModal saving={saving} onSubmit={handleCreate} onCancel={() => setCreating(false)} />
      )}
      {editing && (
        <EditModal
          category={editing}
          saving={saving}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className='flex-1 overflow-y-auto p-4 md:p-8 bg-usta-bg'>
        <div className='max-w-4xl mx-auto'>
          <div className='mb-6 flex items-start justify-between'>
            <div>
              <h2 className='text-xl font-bold text-white'>
                Categorías Mesa de Ayuda
              </h2>
              <p className='text-sm text-white/40 mt-1'>
                Gestiona las categorías y sus enlaces a manuales PDF.
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={refresh}
                className='p-2 rounded-xl border border-white/10 bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10 transition-all'
              >
                <RefreshCw size={15} />
              </button>
              <button
                onClick={() => setCreating(true)}
                className='flex items-center gap-2 px-4 py-2 rounded-xl bg-usta-blue hover:bg-usta-blue-dark text-white text-sm font-bold shadow-sm transition-all'
              >
                <Plus size={15} /> Nueva categoría
              </button>
            </div>
          </div>

          {error && (
            <div className='mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between gap-3 text-red-300 text-sm'>
              <div className='flex items-center gap-3'>
                <AlertCircle size={16} className='shrink-0' /> {error}
              </div>
              <button onClick={refresh} className='text-xs font-semibold underline underline-offset-2 shrink-0'>
                Reintentar
              </button>
            </div>
          )}
          {successMsg && (
            <div className='mb-4 p-4 bg-usta-green/10 border border-usta-green/30 rounded-xl flex items-center gap-3 text-usta-green text-sm'>
              <CheckCircle2 size={16} className='shrink-0' /> {successMsg}
            </div>
          )}

          {loading ? (
            <div className='flex items-center justify-center h-48'>
              <RefreshCw size={20} className='text-white/30 animate-spin' />
            </div>
          ) : categories.length === 0 && !error ? (
            <div className='flex flex-col items-center justify-center h-48 text-white/40 bg-usta-card rounded-2xl border border-white/10'>
              <p className='text-sm font-medium text-white/50'>Sin categorías</p>
              <p className='text-xs mt-1'>El backend no devolvió datos.</p>
            </div>
          ) : (
            <>
              {/* ── Cards — móvil ──────────────────────────────────────── */}
              <div className='md:hidden space-y-3'>
                {categories.map((cat) => (
                  <div key={cat.id} className='bg-usta-card rounded-2xl border border-white/10 p-4 space-y-3'>
                    <div className='flex items-start justify-between gap-2'>
                      <p className='font-semibold text-white text-sm leading-snug'>{cat.display_label}</p>
                      <div className='flex items-center gap-1 shrink-0'>
                        <button
                          onClick={() => setEditing(cat)}
                          className='p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-usta-blue-lt transition-colors'
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(cat.id)}
                          className='p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-red-400 transition-colors'
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <span className='font-mono text-xs bg-white/5 border border-white/10 text-white/60 px-2 py-1 rounded-lg'>
                      {cat.intent}
                    </span>
                    {cat.description && (
                      <p className='text-xs text-white/50 line-clamp-2'>{cat.description}</p>
                    )}
                    {cat.pdf_url ? (
                      <a
                        href={cat.pdf_url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-usta-blue/20 text-usta-blue-lt text-xs font-semibold'
                      >
                        <ExternalLink size={12} /> Ver PDF
                      </a>
                    ) : (
                      <span className='inline-flex items-center px-2.5 py-1 rounded-lg bg-white/5 text-white/50 text-xs'>
                        Sin enlace
                      </span>
                    )}
                  </div>
                ))}
                <p className='text-center text-[10px] text-white/40 pt-1'>
                  {categories.length} categoría{categories.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* ── Tabla — desktop ────────────────────────────────────── */}
              <div className='hidden md:block bg-usta-card rounded-2xl border border-white/10 overflow-hidden'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-white/10 bg-white/5'>
                      <th className='text-left px-5 py-3 text-xs font-bold text-white/40 uppercase tracking-wider'>Categoría</th>
                      <th className='text-left px-5 py-3 text-xs font-bold text-white/40 uppercase tracking-wider'>Intent</th>
                      <th className='text-left px-5 py-3 text-xs font-bold text-white/40 uppercase tracking-wider'>Descripción</th>
                      <th className='text-left px-5 py-3 text-xs font-bold text-white/40 uppercase tracking-wider'>Enlace PDF</th>
                      <th className='px-5 py-3' />
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-white/5'>
                    {categories.map((cat) => (
                      <tr key={cat.id} className='hover:bg-white/5 transition-colors'>
                        <td className='px-5 py-3.5 font-medium text-white'>{cat.display_label}</td>
                        <td className='px-5 py-3.5'>
                          <span className='font-mono text-xs bg-white/5 border border-white/10 text-white/60 px-2 py-1 rounded-lg'>
                            {cat.intent}
                          </span>
                        </td>
                        <td className='px-5 py-3.5 text-sm text-white/50 max-w-xs'>
                          {cat.description
                            ? <span className='line-clamp-2'>{cat.description}</span>
                            : <span className='text-white/20'>—</span>}
                        </td>
                        <td className='px-5 py-3.5'>
                          {cat.pdf_url ? (
                            <a href={cat.pdf_url} target='_blank' rel='noopener noreferrer'
                              className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-usta-blue/20 text-usta-blue-lt text-xs font-semibold hover:bg-usta-blue/30 transition-colors'>
                              <ExternalLink size={12} /> Ver PDF
                            </a>
                          ) : (
                            <span className='inline-flex items-center px-2.5 py-1 rounded-lg bg-white/5 text-white/50 text-xs font-medium'>Sin enlace</span>
                          )}
                        </td>
                        <td className='px-5 py-3.5'>
                          <div className='flex items-center gap-1 justify-end'>
                            <button onClick={() => setEditing(cat)}
                              className='p-1.5 rounded-lg hover:bg-usta-blue/20 text-white/40 hover:text-usta-blue-lt transition-colors' title='Editar'>
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => setConfirmDeleteId(cat.id)}
                              className='p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors' title='Eliminar'>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className='px-5 py-3 border-t border-white/10 text-center'>
                  <span className='text-[10px] text-white/40'>
                    {categories.length} categoría{categories.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default HelpdeskPanel;
