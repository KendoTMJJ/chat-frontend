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
  <div className='fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center'>
    <div className='bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm w-full mx-4'>
      <div className='flex items-center gap-3 mb-4'>
        <div className='bg-red-100 p-2 rounded-xl'>
          <Trash2 size={18} className='text-red-600' />
        </div>
        <h3 className='font-bold text-slate-800'>Eliminar categoría</h3>
      </div>
      <p className='text-sm text-slate-500 mb-6'>
        Esta acción eliminará permanentemente la categoría. No se puede deshacer.
      </p>
      <div className='flex gap-3'>
        <button
          onClick={onCancel}
          className='flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all'
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
  const [label, setLabel] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [description, setDescription] = useState("");

  const isValid = intent.trim().length > 0 && label.trim().length > 0;

  return (
    <div className='fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md'>
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100'>
          <h3 className='font-bold text-slate-800'>Nueva categoría</h3>
          <button
            onClick={onCancel}
            className='p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors'
          >
            <X size={16} />
          </button>
        </div>
        <div className='p-6 space-y-4'>
          <div>
            <label className='block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5'>
              Intent <span className='text-red-400'>*</span>
            </label>
            <input
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              placeholder='ej: pagos'
              className='w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all'
            />
          </div>
          <div>
            <label className='block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5'>
              Categoría <span className='text-red-400'>*</span>
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder='ej: 💳 Pagos'
              className='w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all'
            />
          </div>
          <div>
            <label className='block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5'>
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Breve descripción de la categoría...'
              rows={3}
              className='w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none'
            />
          </div>
          <div>
            <label className='block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5'>
              Enlace PDF
            </label>
            <input
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder='https://...'
              className='w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all'
            />
          </div>
        </div>
        <div className='flex gap-3 px-6 py-4 border-t border-slate-100'>
          <button
            onClick={onCancel}
            className='flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all'
          >
            Cancelar
          </button>
          <button
            onClick={() =>
              onSubmit({
                intent: intent.trim(),
                label: label.trim(),
                description: description.trim() || null,
                pdf_url: pdfUrl.trim() || null,
              })
            }
            disabled={!isValid || saving}
            className='flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed'
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
  const [label, setLabel] = useState(category.label);
  const [pdfUrl, setPdfUrl] = useState(category.pdf_url ?? "");
  const [description, setDescription] = useState(category.description ?? "");

  const isValid = label.trim().length > 0;

  return (
    <div className='fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md'>
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100'>
          <h3 className='font-bold text-slate-800'>Editar categoría</h3>
          <button
            onClick={onCancel}
            className='p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors'
          >
            <X size={16} />
          </button>
        </div>

        <div className='p-6 space-y-4'>
          <div>
            <label className='block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5'>
              Intent
            </label>
            <div className='bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3'>
              <span className='font-mono text-sm text-slate-500'>
                {category.intent}
              </span>
            </div>
            <p className='text-[10px] text-slate-400 mt-1'>
              El intent no se puede modificar.
            </p>
          </div>

          <div>
            <label className='block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5'>
              Categoría <span className='text-red-400'>*</span>
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder='ej: 💳 Pagos'
              className='w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all'
            />
          </div>

          <div>
            <label className='block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5'>
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Breve descripción de la categoría...'
              rows={3}
              className='w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none'
            />
          </div>

          <div>
            <label className='block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5'>
              Enlace PDF
            </label>
            <input
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder='https://...'
              className='w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all'
            />
          </div>
        </div>

        <div className='flex gap-3 px-6 py-4 border-t border-slate-100'>
          <button
            onClick={onCancel}
            className='flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all'
          >
            Cancelar
          </button>
          <button
            onClick={() =>
              onSubmit({
                label: label.trim(),
                description: description.trim() || null,
                pdf_url: pdfUrl.trim() || null,
              })
            }
            disabled={!isValid || saving}
            className='flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed'
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
        <CreateModal
          saving={saving}
          onSubmit={handleCreate}
          onCancel={() => setCreating(false)}
        />
      )}
      {editing && (
        <EditModal
          category={editing}
          saving={saving}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className='flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50'>
        <div className='max-w-4xl mx-auto'>
          {/* Header */}
          <div className='mb-6 flex items-start justify-between'>
            <div>
              <h2 className='text-xl font-bold text-slate-800'>
                Categorías Mesa de Ayuda
              </h2>
              <p className='text-sm text-slate-500 mt-1'>
                Gestiona las categorías y sus enlaces a manuales PDF.
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={refresh}
                className='p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all'
              >
                <RefreshCw size={15} />
              </button>
              <button
                onClick={() => setCreating(true)}
                className='flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition-all'
              >
                <Plus size={15} /> Nueva categoría
              </button>
            </div>
          </div>

          {/* Feedback */}
          {error && (
            <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-3 text-red-700 text-sm'>
              <div className='flex items-center gap-3'>
                <AlertCircle size={16} className='shrink-0' /> {error}
              </div>
              <button
                onClick={refresh}
                className='text-xs font-semibold underline underline-offset-2 shrink-0'
              >
                Reintentar
              </button>
            </div>
          )}
          {successMsg && (
            <div className='mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700 text-sm'>
              <CheckCircle2 size={16} className='shrink-0' /> {successMsg}
            </div>
          )}

          {/* Table / Cards */}
          {loading ? (
            <div className='flex items-center justify-center h-48'>
              <RefreshCw size={20} className='text-slate-400 animate-spin' />
            </div>
          ) : categories.length === 0 && !error ? (
            <div className='flex flex-col items-center justify-center h-48 text-slate-400 bg-white rounded-2xl border border-slate-200'>
              <p className='text-sm font-medium text-slate-500'>Sin categorías</p>
              <p className='text-xs mt-1'>El backend no devolvió datos.</p>
            </div>
          ) : (
            <>
              {/* ── Cards — móvil ──────────────────────────────────────── */}
              <div className='md:hidden space-y-3'>
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className='bg-white rounded-2xl border border-slate-200 p-4 space-y-3'
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <p className='font-semibold text-slate-800 text-sm leading-snug'>
                        {cat.label}
                      </p>
                      <div className='flex items-center gap-1 shrink-0'>
                        <button
                          onClick={() => setEditing(cat)}
                          className='p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 transition-colors'
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(cat.id)}
                          className='p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-red-600 transition-colors'
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <span className='font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg'>
                      {cat.intent}
                    </span>
                    {cat.description && (
                      <p className='text-xs text-slate-500 line-clamp-2'>
                        {cat.description}
                      </p>
                    )}
                    {cat.pdf_url ? (
                      <a
                        href={cat.pdf_url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold'
                      >
                        <ExternalLink size={12} /> Ver PDF
                      </a>
                    ) : (
                      <span className='inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-400 text-xs'>
                        Sin enlace
                      </span>
                    )}
                  </div>
                ))}
                <p className='text-center text-[10px] text-slate-400 pt-1'>
                  {categories.length} categoría{categories.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* ── Tabla — desktop ────────────────────────────────────── */}
              <div className='hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-slate-100 bg-slate-50'>
                      <th className='text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider'>Categoría</th>
                      <th className='text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider'>Intent</th>
                      <th className='text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider'>Descripción</th>
                      <th className='text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider'>Enlace PDF</th>
                      <th className='px-5 py-3' />
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-slate-100'>
                    {categories.map((cat) => (
                      <tr key={cat.id} className='hover:bg-slate-50 transition-colors'>
                        <td className='px-5 py-3.5 font-medium text-slate-800'>{cat.label}</td>
                        <td className='px-5 py-3.5'>
                          <span className='font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg'>
                            {cat.intent}
                          </span>
                        </td>
                        <td className='px-5 py-3.5 text-sm text-slate-500 max-w-xs'>
                          {cat.description
                            ? <span className='line-clamp-2'>{cat.description}</span>
                            : <span className='text-slate-300'>—</span>}
                        </td>
                        <td className='px-5 py-3.5'>
                          {cat.pdf_url ? (
                            <a href={cat.pdf_url} target='_blank' rel='noopener noreferrer'
                              className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors'>
                              <ExternalLink size={12} /> Ver PDF
                            </a>
                          ) : (
                            <span className='inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-400 text-xs font-medium'>Sin enlace</span>
                          )}
                        </td>
                        <td className='px-5 py-3.5'>
                          <div className='flex items-center gap-1 justify-end'>
                            <button onClick={() => setEditing(cat)}
                              className='p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors' title='Editar'>
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => setConfirmDeleteId(cat.id)}
                              className='p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors' title='Eliminar'>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className='px-5 py-3 border-t border-slate-100 text-center'>
                  <span className='text-[10px] text-slate-400'>
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
