// src/pages/Admin/AdminPage.tsx
import { useState, useEffect } from "react";
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
  Lock,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAdminConversations } from "../../hooks/useAdminConversations";
import { useSupportChannels } from "../../hooks/useSupportChannels";
import type { SupportChannel } from "../../hooks/useSupportChannels";
import type { ConversationSummary } from "../../hooks/useAdminConversations";
import HelpdeskPanel from "./HelpdeskPage";
import PosgradosPanel from "./PosgradosPage";
import { useProfile } from "../../hooks/useProfile";

type AdminTab = "conversations" | "channels" | "helpdesk" | "posgrados" | "profile";
type StatusFilter = "all" | "active" | "escalated" | "closed" | "expired";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: {
    label: "Activa",
    color: "bg-usta-green/15 text-usta-green border-usta-green/30",
  },
  escalated: {
    label: "Escalada",
    color: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  closed: {
    label: "Cerrada",
    color: "bg-white/10 text-white/40 border-white/15",
  },
  expired: {
    label: "Expirada",
    color: "bg-red-500/15 text-red-400 border-red-500/30",
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
  <div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center'>
    <div className='bg-usta-card rounded-2xl border border-white/10 p-6 max-w-sm w-full mx-4'>
      <div className='flex items-center gap-3 mb-4'>
        <div className='bg-red-500/20 p-2 rounded-xl'>
          <Trash2 size={18} className='text-red-400' />
        </div>
        <h3 className='font-bold text-white'>Eliminar conversación</h3>
      </div>
      <p className='text-sm text-white/50 mb-6'>
        Esta acción eliminará permanentemente la conversación y todos sus
        mensajes. No se puede deshacer.
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
        <div className={`${showDetail ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-white/10 flex-col bg-usta-bg`}>
          <div className='p-4 space-y-3 border-b border-white/10'>
            <div className='relative'>
              <Search
                className='absolute left-3 top-1/2 -translate-y-1/2 text-white/50'
                size={14}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Buscar por ID, nombre, correo...'
                className='w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-xs text-white
                  focus:ring-2 focus:ring-usta-blue/20 focus:border-usta-blue/40 outline-none transition-all
                  placeholder:text-white/25'
              />
            </div>
            <div className='flex gap-1 flex-wrap'>
              {(["all", "active", "escalated", "closed", "expired"] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                    statusFilter === s
                      ? "bg-white/15 text-white border-white/25"
                      : "bg-white/5 text-white/40 border-white/10 hover:border-white/20"
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
                <RefreshCw size={18} className='text-white/30 animate-spin' />
              </div>
            ) : filtered.length === 0 ? (
              <div className='text-center py-12 text-white/50 text-xs'>
                Sin resultados
              </div>
            ) : (
              filtered.map((conv: ConversationSummary) => (
                <button
                  key={conv.conversationId}
                  onClick={() => handleSelectMobile(conv.conversationId)}
                  className={`w-full p-4 text-left border-b border-white/5 transition-all group ${
                    selectedId === conv.conversationId
                      ? "bg-usta-blue/15 border-l-2 border-l-usta-blue"
                      : "hover:bg-white/5 border-l-2 border-l-transparent"
                  } ${conv.status === "closed" ? "opacity-50" : ""}`}
                >
                  <div className='flex justify-between items-start mb-1.5'>
                    <span className='font-mono text-[10px] font-bold text-white/50'>
                      #{conv.conversationId.slice(0, 8)}
                    </span>
                    <div className='flex items-center gap-1'>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${STATUS_LABELS[conv.status]?.color}`}
                      >
                        {STATUS_LABELS[conv.status]?.label}
                      </span>
                      <div className='flex gap-0.5'>
                        {conv.status !== "closed" && (
                          <button
                            onClick={(e) => handleClose(e, conv.conversationId)}
                            title='Marcar como resuelta'
                            className='p-1 rounded hover:bg-usta-green/20 text-white/30 hover:text-usta-green transition-colors'
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
                          className='p-1 rounded hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors'
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {conv.nombre && (
                    <div className='flex items-center gap-1 mb-1'>
                      <UserCircle size={11} className='text-amber-400 shrink-0' />
                      <span className='text-xs font-semibold text-white truncate'>
                        {conv.nombre}
                      </span>
                    </div>
                  )}
                  {conv.correo && (
                    <div className='flex items-center gap-1 mb-1'>
                      <AtSign size={11} className='text-white/50 shrink-0' />
                      <span className='text-[11px] text-white/50 truncate'>
                        {conv.correo}
                      </span>
                    </div>
                  )}
                  {conv.title && (
                    <p className='text-xs font-semibold text-white/80 mb-1 truncate'>
                      📋 {conv.title}
                    </p>
                  )}
                  <p className='text-xs text-white/40 truncate leading-relaxed'>
                    {conv.lastMessage || "Sin mensajes"}
                  </p>
                  <div className='flex items-center gap-2 mt-2'>
                    <Clock size={10} className='text-white/20' />
                    <span className='text-[10px] text-white/50'>
                      {conv.updatedAt}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className='p-3 border-t border-white/10 text-center'>
            <span className='text-[10px] text-white/40'>
              {filtered.length} conversaciones
            </span>
          </div>
        </div>

        {/* Detalle */}
        <div className={`${showDetail ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-hidden bg-usta-bg`}>
          {selectedId ? (
            <>
              <div className='bg-usta-surface border-b border-white/10 px-4 md:px-6 py-4 flex items-start justify-between shrink-0'>
                <button
                  onClick={() => setShowDetail(false)}
                  className='md:hidden flex items-center gap-1.5 text-sm font-semibold text-usta-blue-lt mr-3 shrink-0 self-center'
                >
                  ← Volver
                </button>
                <div className='space-y-0.5'>
                  <div className='flex items-center gap-2'>
                    <h3 className='font-bold text-white text-sm'>
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
                    <p className='text-xs text-white/60 flex items-center gap-1'>
                      <UserCircle size={12} className='text-amber-400' />
                      <span className='font-semibold'>{selectedConv.nombre}</span>
                    </p>
                  )}
                  {selectedConv?.correo && (
                    <p className='text-xs text-white/40 flex items-center gap-1'>
                      <AtSign size={12} className='text-white/50' />
                      {selectedConv.correo}
                    </p>
                  )}
                  {selectedConv?.title && (
                    <p className='text-xs text-amber-400 font-semibold'>
                      📋 {selectedConv.title}
                    </p>
                  )}
                  <p className='text-[10px] font-mono text-white/40'>
                    ID: {selectedId}
                  </p>
                </div>

                <div className='flex items-center gap-2 shrink-0 ml-2'>
                  {selectedConv?.status !== "closed" && (
                    <button
                      onClick={(e) => handleClose(e, selectedId)}
                      className='flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg border border-usta-green/30 bg-usta-green/10 text-usta-green text-xs font-semibold hover:bg-usta-green/20 transition-all'
                    >
                      <CheckCheck size={13} />
                      <span className='hidden sm:inline'>Marcar resuelta</span>
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmDeleteId(selectedId)}
                    className='flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-all'
                  >
                    <Trash2 size={13} />
                    <span className='hidden sm:inline'>Eliminar</span>
                  </button>
                </div>
              </div>

              <div className='flex-1 overflow-y-auto p-6 bg-usta-bg'>
                <div className='max-w-2xl mx-auto space-y-4'>
                  {chatHistory.length === 0 ? (
                    <div className='text-center py-16 text-white/50 text-sm'>
                      <MessageSquare size={32} className='mx-auto mb-3 text-white/10' />
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
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? "bg-white/10 text-white/60" : "bg-usta-blue/20 text-usta-blue-lt"}`}
                          >
                            {isUser ? <User size={14} /> : <Bot size={14} />}
                          </div>
                          <div
                            className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${isUser ? "bg-usta-blue text-white rounded-tr-none" : "bg-usta-card text-white/85 border border-white/10 rounded-tl-none"}`}
                          >
                            <ReactMarkdown
                              components={{
                                p: ({ ...props }) => (
                                  <p className='mb-1 last:mb-0 leading-relaxed' {...props} />
                                ),
                                strong: ({ ...props }) => (
                                  <span className='font-bold' {...props} />
                                ),
                                a: ({ ...props }) => (
                                  <a
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='underline text-usta-blue-lt'
                                    {...props}
                                  />
                                ),
                              }}
                            >
                              {msg.message}
                            </ReactMarkdown>
                            <p className={`text-[10px] mt-1.5 text-white/50 ${isUser ? "text-right" : ""}`}>
                              {new Date(msg.createAt).toLocaleTimeString("es-CO", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
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
            <div className='flex-1 flex flex-col items-center justify-center text-white/50'>
              <div className='bg-usta-card border border-white/10 p-8 rounded-2xl mb-4'>
                <MessageSquare size={40} className='text-white/10' />
              </div>
              <p className='text-sm font-medium text-white/40'>
                Selecciona una conversación
              </p>
              <p className='text-xs text-white/40 mt-1'>
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
const ALL_CONTEXTS: Array<"posgrados" | "mesa_ayuda"> = ["posgrados", "mesa_ayuda"];

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
  const missingContexts = ALL_CONTEXTS.filter((ctx) => !existingContexts.includes(ctx));

  const getEdited = (ch: SupportChannel) => editing[ch.id] ?? ch;

  const handleChange = (ch: SupportChannel, field: "whatsapp" | "email", value: string) => {
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

  const isNewChannelValid = newChannel.whatsapp.trim() && newChannel.email.trim();

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white outline-none transition-all placeholder:text-white/20";
  const focusBlue = "focus:border-usta-blue/50 focus:ring-2 focus:ring-usta-blue/20";
  const focusGreen = "focus:border-usta-green/50 focus:ring-2 focus:ring-usta-green/20";

  return (
    <div className='flex-1 overflow-y-auto p-4 md:p-8 bg-usta-bg'>
      {confirmDeleteId && (
        <ConfirmModal
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
      <div className='max-w-2xl mx-auto'>
        <div className='mb-8 flex items-start justify-between'>
          <div>
            <h2 className='text-xl font-bold text-white'>Canales de Contacto</h2>
            <p className='text-sm text-white/40 mt-1'>
              Estos canales se muestran al usuario al finalizar un escalado.
            </p>
          </div>
          {!loading && missingContexts.length > 0 && !showCreateForm && (
            <button
              onClick={handleOpenCreateForm}
              className='flex items-center gap-2 px-4 py-2 rounded-xl bg-usta-blue hover:bg-usta-blue-dark text-white text-sm font-bold shadow-sm transition-all'
            >
              <Plus size={15} /> Nuevo canal
            </button>
          )}
        </div>

        {error && (
          <div className='mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-300 text-sm'>
            <AlertCircle size={16} className='shrink-0' /> {error}
          </div>
        )}
        {successMsg && (
          <div className='mb-6 p-4 bg-usta-green/10 border border-usta-green/30 rounded-xl flex items-center gap-3 text-usta-green text-sm'>
            <CheckCircle2 size={16} className='shrink-0' /> {successMsg}
          </div>
        )}

        {loading ? (
          <div className='flex items-center justify-center h-48'>
            <RefreshCw size={20} className='text-white/30 animate-spin' />
          </div>
        ) : (
          <div className='space-y-6'>
            {showCreateForm && (
              <div className='bg-usta-card rounded-2xl border-2 border-dashed border-usta-blue/40 overflow-hidden'>
                <div className='px-6 py-4 border-b border-white/10 flex items-center justify-between bg-usta-blue/10'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 rounded-xl bg-usta-blue text-white'>
                      <Plus size={18} />
                    </div>
                    <div>
                      <h3 className='font-bold text-white text-sm'>Nuevo canal de contacto</h3>
                      <p className='text-xs text-white/40'>Solo se puede crear un canal por contexto.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className='p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors'
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className='p-6 space-y-4'>
                  <div>
                    <label className='flex items-center gap-1.5 text-xs font-bold text-white/40 uppercase tracking-wider mb-2'>
                      Contexto
                    </label>
                    <div className='flex gap-2'>
                      {missingContexts.map((ctx) => (
                        <button
                          key={ctx}
                          onClick={() => setNewChannel((prev) => ({ ...prev, context: ctx }))}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                            newChannel.context === ctx
                              ? "bg-usta-blue text-white border-usta-blue"
                              : "bg-white/5 text-white/60 border-white/10 hover:border-white/25"
                          }`}
                        >
                          {ctx === "posgrados" ? <GraduationCap size={14} /> : <Headphones size={14} />}
                          {CONTEXT_INFO[ctx].label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className='flex items-center gap-1.5 text-xs font-bold text-white/40 uppercase tracking-wider mb-2'>
                      <Phone size={12} /> WhatsApp
                    </label>
                    <input
                      value={newChannel.whatsapp}
                      onChange={(e) => setNewChannel((prev) => ({ ...prev, whatsapp: e.target.value }))}
                      className={`${inputClass} ${focusBlue}`}
                      placeholder='+57 300 000 0000'
                    />
                  </div>
                  <div>
                    <label className='flex items-center gap-1.5 text-xs font-bold text-white/40 uppercase tracking-wider mb-2'>
                      <Mail size={12} /> Correo electrónico
                    </label>
                    <input
                      value={newChannel.email}
                      onChange={(e) => setNewChannel((prev) => ({ ...prev, email: e.target.value }))}
                      className={`${inputClass} ${focusBlue}`}
                      placeholder='contacto@santoto.edu.co'
                    />
                  </div>
                  <div className='flex justify-end pt-2'>
                    <button
                      onClick={handleCreate}
                      disabled={!isNewChannelValid || saving}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        isNewChannelValid && !saving
                          ? "bg-usta-blue hover:bg-usta-blue-dark text-white shadow-sm"
                          : "bg-white/10 text-white/50 cursor-not-allowed"
                      }`}
                    >
                      <Save size={14} />
                      {saving ? "Creando..." : "Crear canal"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {channels.map((ch: SupportChannel) => {
              const info = CONTEXT_INFO[ch.context] ?? CONTEXT_INFO.posgrados;
              const edited = getEdited(ch);
              const dirty = isDirty(ch);
              const { isBlue } = info;
              const focusClass = isBlue ? focusBlue : focusGreen;
              const dirtyBorder = isBlue
                ? "border-usta-blue/50 ring-2 ring-usta-blue/20"
                : "border-usta-green/50 ring-2 ring-usta-green/20";

              return (
                <div key={ch.id} className='bg-usta-card rounded-2xl border border-white/10 overflow-hidden'>
                  <div className={`px-6 py-4 border-b border-white/10 flex items-center gap-3 ${isBlue ? "bg-usta-blue/10" : "bg-usta-green/10"}`}>
                    <div className={`p-2 rounded-xl text-white ${isBlue ? "bg-usta-blue" : "bg-usta-green/20 border border-usta-green/30 !text-usta-green"}`}>
                      {info.icon}
                    </div>
                    <div>
                      <h3 className='font-bold text-white text-sm'>{info.label}</h3>
                      <p className='text-xs text-white/40'>{info.desc}</p>
                    </div>
                  </div>
                  <div className='p-6 space-y-4'>
                    <div>
                      <label className='flex items-center gap-1.5 text-xs font-bold text-white/40 uppercase tracking-wider mb-2'>
                        <Phone size={12} /> WhatsApp
                      </label>
                      <input
                        value={edited.whatsapp}
                        onChange={(e) => handleChange(ch, "whatsapp", e.target.value)}
                        className={`${inputClass} ${dirty ? dirtyBorder : focusClass}`}
                        placeholder='+57 300 000 0000'
                      />
                    </div>
                    <div>
                      <label className='flex items-center gap-1.5 text-xs font-bold text-white/40 uppercase tracking-wider mb-2'>
                        <Mail size={12} /> Correo electrónico
                      </label>
                      <input
                        value={edited.email}
                        onChange={(e) => handleChange(ch, "email", e.target.value)}
                        className={`${inputClass} ${dirty ? dirtyBorder : focusClass}`}
                        placeholder='contacto@santoto.edu.co'
                      />
                    </div>
                    <div className='flex items-center justify-between pt-2'>
                      <p className='text-[10px] text-white/40'>
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
                          className='flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed'
                        >
                          <Trash2 size={14} /> Eliminar
                        </button>
                        <button
                          onClick={() => handleSave(ch)}
                          disabled={!dirty || saving}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            dirty
                              ? isBlue
                                ? "bg-usta-blue hover:bg-usta-blue-dark text-white shadow-sm"
                                : "bg-usta-green hover:bg-usta-green-dark text-usta-bg shadow-sm"
                              : "bg-white/10 text-white/50 cursor-not-allowed"
                          }`}
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

// ─── Profile Panel ───────────────────────────────────────────────────────────
const ProfilePanel = () => {
  const { profile, loading, saving, error, successMsg, updateProfile, changePassword, clearFeedback } = useProfile();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileDirty, setProfileDirty] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
    }
  }, [profile]);

  const handleProfileChange = (field: "name" | "email", value: string) => {
    if (field === "name") setName(value);
    else setEmail(value);
    setProfileDirty(true);
    clearFeedback();
  };

  const handleSaveProfile = () => {
    updateProfile(name, email);
    setProfileDirty(false);
  };

  const handleChangePassword = async () => {
    clearFeedback();
    if (newPassword !== confirmPassword) return;
    const ok = await changePassword(currentPassword, newPassword);
    if (ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const passwordValid =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword;

  if (loading) {
    return (
      <div className='flex-1 flex items-center justify-center bg-usta-bg'>
        <RefreshCw size={20} className='text-white/30 animate-spin' />
      </div>
    );
  }

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-usta-blue/50 focus:ring-2 focus:ring-usta-blue/20";

  return (
    <div className='flex-1 overflow-y-auto p-4 md:p-8 bg-usta-bg'>
      <div className='max-w-lg mx-auto space-y-6'>

        {error && (
          <div className='p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-300 text-sm'>
            <AlertCircle size={16} className='shrink-0' /> {error}
          </div>
        )}
        {successMsg && (
          <div className='p-4 bg-usta-green/10 border border-usta-green/30 rounded-xl flex items-center gap-3 text-usta-green text-sm'>
            <CheckCircle2 size={16} className='shrink-0' /> {successMsg}
          </div>
        )}

        {/* Datos del perfil */}
        <div className='bg-usta-card rounded-2xl border border-white/10 overflow-hidden'>
          <div className='px-6 py-4 border-b border-white/10 bg-usta-blue/10 flex items-center gap-3'>
            <div className='p-2 rounded-xl bg-usta-blue text-white'>
              <UserCircle size={18} />
            </div>
            <div>
              <h3 className='font-bold text-white text-sm'>Datos del perfil</h3>
              <p className='text-xs text-white/40'>Nombre y correo de acceso al panel</p>
            </div>
          </div>
          <div className='p-6 space-y-4'>
            <div>
              <label className='block text-xs font-bold text-white/40 uppercase tracking-wider mb-2'>
                Nombre
              </label>
              <input
                value={name}
                onChange={(e) => handleProfileChange("name", e.target.value)}
                className={inputClass}
                placeholder='Nombre del administrador'
              />
            </div>
            <div>
              <label className='block text-xs font-bold text-white/40 uppercase tracking-wider mb-2'>
                Correo electrónico
              </label>
              <div className='relative'>
                <AtSign size={14} className='absolute left-3 top-1/2 -translate-y-1/2 text-white/50' />
                <input
                  type='email'
                  value={email}
                  onChange={(e) => handleProfileChange("email", e.target.value)}
                  className={`${inputClass} pl-9`}
                  placeholder='admin@santoto.edu.co'
                />
              </div>
            </div>
            <div className='flex justify-end pt-2'>
              <button
                onClick={handleSaveProfile}
                disabled={!profileDirty || saving}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  profileDirty && !saving
                    ? "bg-usta-blue hover:bg-usta-blue-dark text-white shadow-sm"
                    : "bg-white/10 text-white/50 cursor-not-allowed"
                }`}
              >
                <Save size={14} />
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>

        {/* Cambiar contraseña */}
        <div className='bg-usta-card rounded-2xl border border-white/10 overflow-hidden'>
          <div className='px-6 py-4 border-b border-white/10 bg-white/5 flex items-center gap-3'>
            <div className='p-2 rounded-xl bg-white/10 text-white/70'>
              <Lock size={18} />
            </div>
            <div>
              <h3 className='font-bold text-white text-sm'>Cambiar contraseña</h3>
              <p className='text-xs text-white/40'>Mínimo 8 caracteres</p>
            </div>
          </div>
          <div className='p-6 space-y-4'>
            <div>
              <label className='block text-xs font-bold text-white/40 uppercase tracking-wider mb-2'>
                Contraseña actual
              </label>
              <div className='relative'>
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => { setCurrentPassword(e.target.value); clearFeedback(); }}
                  className={`${inputClass} pr-10`}
                  placeholder='Tu contraseña actual'
                />
                <button
                  type='button'
                  onClick={() => setShowCurrent((v) => !v)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60'
                >
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className='block text-xs font-bold text-white/40 uppercase tracking-wider mb-2'>
                Nueva contraseña
              </label>
              <div className='relative'>
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); clearFeedback(); }}
                  className={`${inputClass} pr-10`}
                  placeholder='Mínimo 8 caracteres'
                />
                <button
                  type='button'
                  onClick={() => setShowNew((v) => !v)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60'
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className='block text-xs font-bold text-white/40 uppercase tracking-wider mb-2'>
                Confirmar contraseña
              </label>
              <input
                type='password'
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); clearFeedback(); }}
                className={`${inputClass} ${
                  confirmPassword && newPassword !== confirmPassword
                    ? "border-red-500/50 focus:ring-red-500/20"
                    : ""
                }`}
                placeholder='Repite la nueva contraseña'
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className='text-xs text-red-400 mt-1'>Las contraseñas no coinciden</p>
              )}
            </div>
            <div className='flex justify-end pt-2'>
              <button
                onClick={handleChangePassword}
                disabled={!passwordValid || saving}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  passwordValid && !saving
                    ? "bg-white/15 hover:bg-white/20 text-white border border-white/15 shadow-sm"
                    : "bg-white/5 text-white/40 cursor-not-allowed"
                }`}
              >
                <Lock size={14} />
                {saving ? "Guardando..." : "Cambiar contraseña"}
              </button>
            </div>
          </div>
        </div>

        {/* Recuperación de emergencia */}
        <div className='bg-amber-500/10 rounded-2xl border border-amber-500/30 p-5'>
          <div className='flex items-start gap-3'>
            <KeyRound size={18} className='text-amber-400 mt-0.5 shrink-0' />
            <div>
              <h4 className='font-bold text-amber-300 text-sm mb-1'>¿Olvidaste tu contraseña?</h4>
              <p className='text-xs text-amber-400/80 leading-relaxed'>
                Si no puedes iniciar sesión, usa el endpoint de recuperación con el token configurado en el servidor:
              </p>
              <code className='block mt-2 bg-black/30 border border-amber-500/20 rounded-lg px-3 py-2 text-xs text-amber-200 font-mono leading-relaxed'>
                POST /admin-auth/reset-password<br />
                {'{ "resetToken": "ADMIN_RESET_TOKEN", "newPassword": "..." }'}
              </code>
              <p className='text-xs text-amber-400/60 mt-2'>
                El valor de <strong className='text-amber-300'>ADMIN_RESET_TOKEN</strong> está definido en el archivo <code>.env</code> del servidor.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// ─── AdminPage ────────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    label: "Monitoreo",
    tabs: [
      { id: "conversations" as AdminTab, label: "Conversaciones", shortLabel: "Chats", icon: <MessageSquare size={16} /> },
    ],
  },
  {
    label: "Asistente",
    tabs: [
      { id: "helpdesk"       as AdminTab, label: "Mesa de Ayuda",    shortLabel: "Ayuda",    icon: <Headphones size={16} /> },
      { id: "posgrados"      as AdminTab, label: "Posgrados",        shortLabel: "Posgrados", icon: <GraduationCap size={16} /> },
    ],
  },
  {
    label: "Configuración",
    tabs: [
      { id: "channels" as AdminTab, label: "Canales de Soporte", shortLabel: "Canales", icon: <Settings size={16} /> },
      { id: "profile"  as AdminTab, label: "Mi Perfil",          shortLabel: "Perfil",  icon: <UserCircle size={16} /> },
    ],
  },
];

const ALL_TABS = NAV_SECTIONS.flatMap((s) => s.tabs);

const TAB_DESCRIPTIONS: Record<AdminTab, string> = {
  conversations: "Historial completo de interacciones del chat",
  channels:      "Canales de contacto mostrados al escalar una consulta",
  helpdesk:      "Categorías y manuales de la Mesa de Ayuda",
  posgrados:     "Ingesta de conocimientos del asistente de posgrados",
  profile:       "Nombre, correo y contraseña del administrador",
};

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("conversations");
  const activeTabDef = ALL_TABS.find((t) => t.id === activeTab)!;

  return (
    <div className='flex h-screen w-full bg-usta-bg font-sans text-white overflow-hidden'>
      {/* Sidebar — solo desktop */}
      <aside className='hidden md:flex w-60 bg-usta-surface border-r border-white/10 flex-col shrink-0'>
        {/* Logo */}
        <div className='px-5 py-4 border-b border-white/10 flex items-center justify-center'>
          <img
            src="/logos/SNIES_USantoTomas_Horizontal%20color%20blanco.png"
            alt="Universidad Santo Tomás Tunja"
            className='h-9 object-contain'
          />
        </div>

        {/* Nav agrupada */}
        <nav className='flex-1 overflow-y-auto py-3'>
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className='mb-1'>
              <p className='px-4 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/25'>
                {section.label}
              </p>
              {section.tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 mx-0 text-sm font-medium transition-all rounded-none
                    border-l-2 ${
                    activeTab === tab.id
                      ? "border-l-usta-blue-lt bg-usta-blue/15 text-white"
                      : "border-l-transparent text-white/50 hover:bg-white/5 hover:text-white/80 hover:border-l-white/20"
                  }`}
                >
                  <span className={activeTab === tab.id ? "text-usta-blue-lt" : "text-white/40"}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Salir */}
        <div className='p-4 border-t border-white/10'>
          <Link
            to='/'
            className='flex items-center justify-center gap-2 w-full py-2.5 bg-white/5 hover:bg-red-500/15
              text-white/50 hover:text-red-400 rounded-xl text-sm font-semibold transition-all border border-white/10 hover:border-red-500/30'
          >
            <LogOut size={15} /> Salir del panel
          </Link>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className='flex-1 flex flex-col overflow-hidden pb-16 md:pb-0'>
        {/* Header */}
        <header className='bg-usta-surface border-b border-white/10 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shrink-0'>
          <div className='flex items-center gap-3'>
            <div className={`p-1.5 rounded-lg bg-usta-blue/20 text-usta-blue-lt`}>
              {activeTabDef.icon}
            </div>
            <div>
              <h2 className='font-bold text-white text-sm md:text-base leading-tight'>
                {activeTabDef.label}
              </h2>
              <p className='text-xs text-white/40 mt-0.5 hidden sm:block'>
                {TAB_DESCRIPTIONS[activeTab]}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <span className='hidden sm:block text-[10px] text-white/40 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full font-medium tabular-nums'>
              {new Date().toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <Link
              to='/'
              className='md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-red-500/15
                text-white/50 hover:text-red-400 rounded-xl text-xs font-semibold transition-all border border-white/10'
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
          {activeTab === "profile" && <ProfilePanel />}
        </div>
      </main>

      {/* Bottom nav — solo móvil */}
      <nav className='md:hidden fixed bottom-0 left-0 right-0 bg-usta-surface border-t border-white/10 flex z-40'>
        {ALL_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold transition-colors ${
              activeTab === tab.id
                ? "text-usta-blue-lt bg-usta-blue/15"
                : "text-white/50"
            }`}
          >
            <span className={activeTab === tab.id ? "text-usta-blue-lt" : "text-white/40"}>
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
