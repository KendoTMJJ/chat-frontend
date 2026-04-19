// src/pages/Admin/AdminPage.tsx
import { useState } from "react";
import { Link } from "react-router";
import {
  GraduationCap,
  LogOut,
  MessageSquare,
  Headphones,
  Bot,
  User,
  Search,
  RefreshCw,
  Phone,
  Mail,
  Save,
  AlertCircle,
  CheckCircle2,
  Settings,
  ChevronRight,
  Clock,
  CheckCheck,
  Trash2,
  UserCircle,
  AtSign,
  Plus,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAdminConversations } from "../../hooks/useAdminConversations";
import { useSupportChannels } from "../../hooks/useSupportChannels";
import type { SupportChannel } from "../../hooks/useSupportChannels";
import type { ConversationSummary } from "../../hooks/useAdminConversations";
import HelpdeskPanel from "./HelpdeskPage";
import PosgradosPanel from "./PosgradosPage";

type AdminTab = "conversations" | "channels" | "helpdesk" | "posgrados";
type StatusFilter = "all" | "active" | "escalated" | "closed" | "expired";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: {
    label: "Activa",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  escalated: {
    label: "Escalada",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  closed: {
    label: "Cerrada",
    color: "bg-slate-100 text-slate-500 border-slate-200",
  },
  expired: {
    label: "Expirada",
    color: "bg-red-50 text-red-500 border-red-200",
  },
};

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
        <h3 className='font-bold text-slate-800'>Eliminar conversación</h3>
      </div>
      <p className='text-sm text-slate-500 mb-6'>
        Esta acción eliminará permanentemente la conversación y todos sus
        mensajes. No se puede deshacer.
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

// ─── Conversations Panel ──────────────────────────────────────────────────────
const ConversationsPanel = () => {
  const {
    conversations,
    chatHistory,
    loading,
    fetchHistory,
    closeConversation,
    deleteConversation,
  } = useAdminConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = conversations
    .filter(
      (c: ConversationSummary) =>
        statusFilter === "all" || c.status === statusFilter,
    )
    .filter((c: ConversationSummary) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        c.conversationId.toLowerCase().includes(q) ||
        c.lastMessage?.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q) ||
        c.userId?.toLowerCase().includes(q) ||
        c.nombre?.toLowerCase().includes(q) ||
        c.correo?.toLowerCase().includes(q)
      );
    });

  const handleSelect = (id: string) => {
    setSelectedId(id);
    fetchHistory(id);
  };

  const handleClose = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await closeConversation(id);
    if (selectedId === id) setSelectedId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    await deleteConversation(confirmDeleteId);
    if (selectedId === confirmDeleteId) setSelectedId(null);
    setConfirmDeleteId(null);
  };

  const selectedConv = conversations.find(
    (c: ConversationSummary) => c.conversationId === selectedId,
  );

  const [showDetail, setShowDetail] = useState(false);

  const handleSelectMobile = (id: string) => {
    handleSelect(id);
    setShowDetail(true);
  };

  return (
    <>
      {confirmDeleteId && (
        <ConfirmModal
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      <div className='flex flex-1 h-full overflow-hidden'>
        {/* Lista */}
        <div className={`${showDetail ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-slate-200 flex-col bg-white`}>
          <div className='p-4 space-y-3 border-b border-slate-100'>
            <div className='relative'>
              <Search
                className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                size={14}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Buscar por ID, nombre, correo...'
                className='w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all'
              />
            </div>
            <div className='flex gap-1 flex-wrap'>
              {(
                [
                  "all",
                  "active",
                  "escalated",
                  "closed",
                  "expired",
                ] as StatusFilter[]
              ).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                    statusFilter === s
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {s === "all" ? "Todas" : STATUS_LABELS[s]?.label}
                </button>
              ))}
            </div>
          </div>

          <div className='flex-1 overflow-y-auto'>
            {loading ? (
              <div className='flex items-center justify-center h-32'>
                <RefreshCw size={18} className='text-slate-400 animate-spin' />
              </div>
            ) : filtered.length === 0 ? (
              <div className='text-center py-12 text-slate-400 text-xs'>
                Sin resultados
              </div>
            ) : (
              filtered.map((conv: ConversationSummary) => (
                <button
                  key={conv.conversationId}
                  onClick={() => handleSelectMobile(conv.conversationId)}
                  className={`w-full p-4 text-left border-b border-slate-100 transition-all group ${
                    selectedId === conv.conversationId
                      ? "bg-blue-50 border-l-2 border-l-blue-500"
                      : "hover:bg-slate-50 border-l-2 border-l-transparent"
                  } ${conv.status === "closed" ? "opacity-60" : ""}`}
                >
                  <div className='flex justify-between items-start mb-1.5'>
                    <span className='font-mono text-[10px] font-bold text-slate-400'>
                      #{conv.conversationId.slice(0, 8)}
                    </span>
                    <div className='flex items-center gap-1'>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${STATUS_LABELS[conv.status]?.color}`}
                      >
                        {STATUS_LABELS[conv.status]?.label}
                      </span>
                      {/* Acciones — visibles en hover */}
                      <div className='flex gap-0.5'>
                        {conv.status !== "closed" && (
                          <button
                            onClick={(e) => handleClose(e, conv.conversationId)}
                            title='Marcar como resuelta'
                            className='p-1 rounded hover:bg-emerald-100 text-slate-400 hover:text-emerald-600 transition-colors'
                          >
                            <CheckCheck size={13} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(conv.conversationId);
                          }}
                          title='Eliminar'
                          className='p-1 rounded hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors'
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Nombre y correo si es escalada */}
                  {conv.nombre && (
                    <div className='flex items-center gap-1 mb-1'>
                      <UserCircle
                        size={11}
                        className='text-amber-500 shrink-0'
                      />
                      <span className='text-xs font-semibold text-slate-700 truncate'>
                        {conv.nombre}
                      </span>
                    </div>
                  )}
                  {conv.correo && (
                    <div className='flex items-center gap-1 mb-1'>
                      <AtSign size={11} className='text-slate-400 shrink-0' />
                      <span className='text-[11px] text-slate-500 truncate'>
                        {conv.correo}
                      </span>
                    </div>
                  )}

                  {conv.title && (
                    <p className='text-xs font-semibold text-slate-700 mb-1 truncate'>
                      📋 {conv.title}
                    </p>
                  )}
                  <p className='text-xs text-slate-500 truncate leading-relaxed'>
                    {conv.lastMessage || "Sin mensajes"}
                  </p>
                  <div className='flex items-center gap-2 mt-2'>
                    <Clock size={10} className='text-slate-300' />
                    <span className='text-[10px] text-slate-400'>
                      {conv.updatedAt}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className='p-3 border-t border-slate-100 text-center'>
            <span className='text-[10px] text-slate-400'>
              {filtered.length} conversaciones
            </span>
          </div>
        </div>

        {/* Detalle */}
        <div className={`${showDetail ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-hidden bg-slate-50`}>
          {selectedId ? (
            <>
              <div className='bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex items-start justify-between shrink-0'>
                {/* Botón volver — solo móvil */}
                <button
                  onClick={() => setShowDetail(false)}
                  className='md:hidden flex items-center gap-1.5 text-sm font-semibold text-blue-600 mr-3 shrink-0 self-center'
                >
                  ← Volver
                </button>
                <div className='space-y-0.5'>
                  <div className='flex items-center gap-2'>
                    <h3 className='font-bold text-slate-800 text-sm'>
                      Detalle de conversación
                    </h3>
                    {selectedConv?.status && (
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${STATUS_LABELS[selectedConv.status]?.color}`}
                      >
                        {STATUS_LABELS[selectedConv.status]?.label}
                      </span>
                    )}
                  </div>
                  {selectedConv?.nombre && (
                    <p className='text-xs text-slate-600 flex items-center gap-1'>
                      <UserCircle size={12} className='text-amber-500' />
                      <span className='font-semibold'>
                        {selectedConv.nombre}
                      </span>
                    </p>
                  )}
                  {selectedConv?.correo && (
                    <p className='text-xs text-slate-500 flex items-center gap-1'>
                      <AtSign size={12} className='text-slate-400' />
                      {selectedConv.correo}
                    </p>
                  )}
                  {selectedConv?.title && (
                    <p className='text-xs text-amber-600 font-semibold'>
                      📋 {selectedConv.title}
                    </p>
                  )}
                  <p className='text-[10px] font-mono text-slate-400'>
                    ID: {selectedId}
                  </p>
                </div>

                {/* Acciones del detalle */}
                <div className='flex items-center gap-2 shrink-0 ml-2'>
                  {selectedConv?.status !== "closed" && (
                    <button
                      onClick={(e) => handleClose(e, selectedId)}
                      className='flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-all'
                    >
                      <CheckCheck size={13} />
                      <span className='hidden sm:inline'>Marcar resuelta</span>
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmDeleteId(selectedId)}
                    className='flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-all'
                  >
                    <Trash2 size={13} />
                    <span className='hidden sm:inline'>Eliminar</span>
                  </button>
                </div>
              </div>

              <div className='flex-1 overflow-y-auto p-6'>
                <div className='max-w-2xl mx-auto space-y-4'>
                  {chatHistory.length === 0 ? (
                    <div className='text-center py-16 text-slate-400 text-sm'>
                      <MessageSquare
                        size={32}
                        className='mx-auto mb-3 text-slate-200'
                      />
                      Cargando historial...
                    </div>
                  ) : (
                    chatHistory.map((msg, i) => {
                      const isUser = msg.sender === "user";
                      return (
                        <div
                          key={i}
                          className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? "bg-slate-800 text-white" : "bg-blue-600 text-white"}`}
                          >
                            {isUser ? <User size={14} /> : <Bot size={14} />}
                          </div>
                          <div
                            className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-sm ${isUser ? "bg-slate-800 text-white rounded-tr-none" : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"}`}
                          >
                            <ReactMarkdown
                              components={{
                                p: ({ ...props }) => (
                                  <p
                                    className='mb-1 last:mb-0 leading-relaxed'
                                    {...props}
                                  />
                                ),
                                strong: ({ ...props }) => (
                                  <span
                                    className={`font-bold ${isUser ? "text-white" : "text-slate-900"}`}
                                    {...props}
                                  />
                                ),
                                a: ({ ...props }) => (
                                  <a
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className={`underline ${isUser ? "text-blue-300" : "text-blue-600"}`}
                                    {...props}
                                  />
                                ),
                              }}
                            >
                              {msg.message}
                            </ReactMarkdown>
                            <p
                              className={`text-[10px] mt-1.5 ${isUser ? "text-slate-400 text-right" : "text-slate-400"}`}
                            >
                              {new Date(msg.createAt).toLocaleTimeString(
                                "es-CO",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className='flex-1 flex flex-col items-center justify-center text-slate-400'>
              <div className='bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-4'>
                <MessageSquare size={40} className='text-slate-200' />
              </div>
              <p className='text-sm font-medium text-slate-500'>
                Selecciona una conversación
              </p>
              <p className='text-xs text-slate-400 mt-1'>
                para ver el historial detallado
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ─── Channels Panel ───────────────────────────────────────────────────────────
const ALL_CONTEXTS: Array<"posgrados" | "mesa_ayuda"> = [
  "posgrados",
  "mesa_ayuda",
];

const CONTEXT_INFO: Record<
  string,
  { label: string; icon: React.ReactNode; desc: string; isBlue: boolean }
> = {
  posgrados: {
    label: "Información de Posgrados",
    icon: <GraduationCap size={20} />,
    desc: "Canales para consultas sobre programas, admisiones y costos.",
    isBlue: true,
  },
  mesa_ayuda: {
    label: "Mesa de Ayuda",
    icon: <Headphones size={20} />,
    desc: "Canales para soporte técnico, trámites y carnet.",
    isBlue: false,
  },
};

const EMPTY_NEW_CHANNEL = {
  context: "posgrados" as "posgrados" | "mesa_ayuda",
  whatsapp: "",
  email: "",
};

const ChannelsPanel = () => {
  const {
    channels,
    loading,
    saving,
    error,
    successMsg,
    createChannel,
    updateChannel,
    deleteChannel,
  } = useSupportChannels();
  const [editing, setEditing] = useState<Record<string, SupportChannel>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newChannel, setNewChannel] = useState(EMPTY_NEW_CHANNEL);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const existingContexts = channels.map((ch) => ch.context);
  const missingContexts = ALL_CONTEXTS.filter(
    (ctx) => !existingContexts.includes(ctx),
  );

  const getEdited = (ch: SupportChannel) => editing[ch.id] ?? ch;

  const handleChange = (
    ch: SupportChannel,
    field: "whatsapp" | "email",
    value: string,
  ) => {
    setEditing((prev) => ({
      ...prev,
      [ch.id]: { ...(prev[ch.id] ?? ch), [field]: value },
    }));
  };

  const handleSave = async (ch: SupportChannel) => {
    const updated = editing[ch.id] ?? ch;
    await updateChannel(updated);
    setEditing((prev) => {
      const n = { ...prev };
      delete n[ch.id];
      return n;
    });
  };

  const isDirty = (ch: SupportChannel) => {
    const e = editing[ch.id];
    return e && (e.whatsapp !== ch.whatsapp || e.email !== ch.email);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    await deleteChannel(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  const handleCreate = async () => {
    await createChannel(newChannel);
    setShowCreateForm(false);
    setNewChannel(EMPTY_NEW_CHANNEL);
  };

  const handleOpenCreateForm = () => {
    const defaultCtx = missingContexts[0];
    setNewChannel({ ...EMPTY_NEW_CHANNEL, context: defaultCtx });
    setShowCreateForm(true);
  };

  const isNewChannelValid =
    newChannel.whatsapp.trim() && newChannel.email.trim();

  return (
    <div className='flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50'>
      {confirmDeleteId && (
        <ConfirmModal
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
      <div className='max-w-2xl mx-auto'>
        <div className='mb-8 flex items-start justify-between'>
          <div>
            <h2 className='text-xl font-bold text-slate-800'>
              Canales de Contacto
            </h2>
            <p className='text-sm text-slate-500 mt-1'>
              Estos canales se muestran al usuario al finalizar un escalado.
            </p>
          </div>
          {!loading && missingContexts.length > 0 && !showCreateForm && (
            <button
              onClick={handleOpenCreateForm}
              className='flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition-all'
            >
              <Plus size={15} /> Nuevo canal
            </button>
          )}
        </div>

        {error && (
          <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm'>
            <AlertCircle size={16} className='shrink-0' /> {error}
          </div>
        )}
        {successMsg && (
          <div className='mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700 text-sm'>
            <CheckCircle2 size={16} className='shrink-0' /> {successMsg}
          </div>
        )}

        {loading ? (
          <div className='flex items-center justify-center h-48'>
            <RefreshCw size={20} className='text-slate-400 animate-spin' />
          </div>
        ) : (
          <div className='space-y-6'>
            {/* Formulario de creación */}
            {showCreateForm && (
              <div className='bg-white rounded-2xl border-2 border-dashed border-blue-300 shadow-sm overflow-hidden'>
                <div className='px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 rounded-xl bg-blue-600 text-white'>
                      <Plus size={18} />
                    </div>
                    <div>
                      <h3 className='font-bold text-slate-800 text-sm'>
                        Nuevo canal de contacto
                      </h3>
                      <p className='text-xs text-slate-500'>
                        Solo se puede crear un canal por contexto.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className='p-1.5 rounded-lg hover:bg-blue-100 text-slate-400 hover:text-slate-600 transition-colors'
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className='p-6 space-y-4'>
                  <div>
                    <label className='flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2'>
                      Contexto
                    </label>
                    <div className='flex gap-2'>
                      {missingContexts.map((ctx) => (
                        <button
                          key={ctx}
                          onClick={() =>
                            setNewChannel((prev) => ({ ...prev, context: ctx }))
                          }
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                            newChannel.context === ctx
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                          }`}
                        >
                          {ctx === "posgrados" ? (
                            <GraduationCap size={14} />
                          ) : (
                            <Headphones size={14} />
                          )}
                          {CONTEXT_INFO[ctx].label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className='flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2'>
                      <Phone size={12} /> WhatsApp
                    </label>
                    <input
                      value={newChannel.whatsapp}
                      onChange={(e) =>
                        setNewChannel((prev) => ({
                          ...prev,
                          whatsapp: e.target.value,
                        }))
                      }
                      className='w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all'
                      placeholder='+57 300 000 0000'
                    />
                  </div>
                  <div>
                    <label className='flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2'>
                      <Mail size={12} /> Correo electrónico
                    </label>
                    <input
                      value={newChannel.email}
                      onChange={(e) =>
                        setNewChannel((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className='w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all'
                      placeholder='contacto@santoto.edu.co'
                    />
                  </div>
                  <div className='flex justify-end pt-2'>
                    <button
                      onClick={handleCreate}
                      disabled={!isNewChannelValid || saving}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        isNewChannelValid && !saving
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <Save size={14} />
                      {saving ? "Creando..." : "Crear canal"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Canales existentes */}
            {channels.map((ch: SupportChannel) => {
              const info = CONTEXT_INFO[ch.context] ?? CONTEXT_INFO.posgrados;
              const edited = getEdited(ch);
              const dirty = isDirty(ch);
              const { isBlue } = info;

              return (
                <div
                  key={ch.id}
                  className='bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'
                >
                  <div
                    className={`px-6 py-4 border-b border-slate-100 flex items-center gap-3 ${isBlue ? "bg-blue-50" : "bg-violet-50"}`}
                  >
                    <div
                      className={`p-2 rounded-xl ${isBlue ? "bg-blue-600" : "bg-violet-600"} text-white`}
                    >
                      {info.icon}
                    </div>
                    <div>
                      <h3 className='font-bold text-slate-800 text-sm'>
                        {info.label}
                      </h3>
                      <p className='text-xs text-slate-500'>{info.desc}</p>
                    </div>
                  </div>
                  <div className='p-6 space-y-4'>
                    <div>
                      <label className='flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2'>
                        <Phone size={12} /> WhatsApp
                      </label>
                      <input
                        value={edited.whatsapp}
                        onChange={(e) =>
                          handleChange(ch, "whatsapp", e.target.value)
                        }
                        className={`w-full bg-slate-50 border rounded-xl py-2.5 px-4 text-sm outline-none transition-all ${dirty ? (isBlue ? "border-blue-400 ring-2 ring-blue-100" : "border-violet-400 ring-2 ring-violet-100") : "border-slate-200 focus:border-slate-400"}`}
                        placeholder='+57 300 000 0000'
                      />
                    </div>
                    <div>
                      <label className='flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2'>
                        <Mail size={12} /> Correo electrónico
                      </label>
                      <input
                        value={edited.email}
                        onChange={(e) =>
                          handleChange(ch, "email", e.target.value)
                        }
                        className={`w-full bg-slate-50 border rounded-xl py-2.5 px-4 text-sm outline-none transition-all ${dirty ? (isBlue ? "border-blue-400 ring-2 ring-blue-100" : "border-violet-400 ring-2 ring-violet-100") : "border-slate-200 focus:border-slate-400"}`}
                        placeholder='contacto@santoto.edu.co'
                      />
                    </div>
                    <div className='flex items-center justify-between pt-2'>
                      <p className='text-[10px] text-slate-400'>
                        Actualizado:{" "}
                        {new Date(ch.updatedAt).toLocaleDateString("es-CO", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => setConfirmDeleteId(ch.id)}
                          disabled={saving}
                          className='flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                          <Trash2 size={14} />
                          Eliminar
                        </button>
                        <button
                          onClick={() => handleSave(ch)}
                          disabled={!dirty || saving}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${dirty ? (isBlue ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" : "bg-violet-600 hover:bg-violet-700 text-white shadow-sm") : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                        >
                          <Save size={14} />
                          {saving ? "Guardando..." : "Guardar cambios"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── AdminPage ────────────────────────────────────────────────────────────────
const TABS: { id: AdminTab; label: string; shortLabel?: string; icon: React.ReactNode }[] = [
  {
    id: "conversations",
    label: "Conversaciones",
    shortLabel: "Chats",
    icon: <MessageSquare size={16} />,
  },
  { id: "channels", label: "Canales de Soporte", shortLabel: "Canales", icon: <Settings size={16} /> },
  { id: "helpdesk", label: "Mesa de Ayuda", shortLabel: "Ayuda", icon: <Headphones size={16} /> },
  { id: "posgrados", label: "Posgrados", icon: <GraduationCap size={16} /> },
];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("conversations");

  return (
    <div className='flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden'>
      {/* Sidebar — solo desktop */}
      <aside className='hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shadow-sm shrink-0'>
        <div className='p-6 border-b border-slate-100'>
          <div className='flex items-center gap-3'>
            <div className='bg-blue-600 p-2 rounded-lg text-white'>
              <GraduationCap size={18} />
            </div>
            <div>
              <h1 className='font-bold text-sm text-slate-800'>Panel Admin</h1>
              <p className='text-[10px] text-slate-400'>Santo Tomás Tunja</p>
            </div>
          </div>
        </div>
        <nav className='flex-1 p-3 space-y-1'>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? "bg-blue-50 text-blue-700 border border-blue-100" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
            >
              <span className={activeTab === tab.id ? "text-blue-600" : "text-slate-400"}>
                {tab.icon}
              </span>
              {tab.label}
              {activeTab === tab.id && (
                <ChevronRight size={14} className='ml-auto text-blue-400' />
              )}
            </button>
          ))}
        </nav>
        <div className='p-4 border-t border-slate-100'>
          <Link
            to='/'
            className='flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition-colors'
          >
            <LogOut size={15} /> Salir
          </Link>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className='flex-1 flex flex-col overflow-hidden pb-16 md:pb-0'>
        <header className='bg-white border-b border-slate-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shrink-0'>
          <div>
            <h2 className='font-bold text-slate-800 text-sm md:text-base'>
              {TABS.find((t) => t.id === activeTab)?.label}
            </h2>
            <p className='text-xs text-slate-400 mt-0.5 hidden sm:block'>
              {activeTab === "conversations"
                ? "Historial completo de interacciones del chat"
                : activeTab === "channels"
                  ? "Canales de contacto mostrados al escalar una consulta"
                  : activeTab === "helpdesk"
                    ? "Respuestas del bot para la Mesa de Ayuda"
                    : "Ingesta de conocimientos para el asistente de posgrados"}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <span className='hidden sm:block text-[10px] text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full font-medium'>
              {new Date().toLocaleDateString("es-CO", {
                day: "numeric",
                month: "short",
              })}
            </span>
            <Link
              to='/'
              className='md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors'
            >
              <LogOut size={13} /> Salir
            </Link>
          </div>
        </header>

        <div className='flex-1 flex overflow-hidden'>
          {activeTab === "conversations" && <ConversationsPanel />}
          {activeTab === "channels" && <ChannelsPanel />}
          {activeTab === "helpdesk" && <HelpdeskPanel />}
          {activeTab === "posgrados" && <PosgradosPanel />}
        </div>
      </main>

      {/* Bottom nav — solo móvil */}
      <nav className='md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex z-40 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]'>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold transition-colors ${
              activeTab === tab.id
                ? "text-blue-600 bg-blue-50"
                : "text-slate-400"
            }`}
          >
            <span className={activeTab === tab.id ? "text-blue-600" : "text-slate-400"}>
              {tab.icon}
            </span>
            <span className='leading-none'>{tab.shortLabel ?? tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default AdminPage;
