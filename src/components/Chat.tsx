// src/components/Chat.tsx
import { useEffect, useRef, useState } from "react";
import { socket } from "../socket/socket";
import { useChatSocket } from "../socket/useChatSocket";
import { emitSendMessage, connectSocket } from "../socket/connectSocket";
import {
  Send,
  RefreshCw,
  GraduationCap,
  HeadphonesIcon,
  Circle,
  Bot,
  User,
  ArrowRight,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import ChatButton from "./ChatButton";

export type ChatContext = "posgrados" | "mesa_ayuda";

const CONTEXT_CONFIG: Record<
  ChatContext,
  {
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    accentLight: string;
    ring: string;
    sendBtn: string;
    chipHover: string;
    badge: string;
    avatarBot: string;
    heading: string;
  }
> = {
  posgrados: {
    label: "Asistente Posgrados",
    sublabel: "Información académica y programas",
    icon: <GraduationCap size={22} />,
    accentLight: "bg-blue-600 shadow-blue-200",
    ring: "focus:ring-blue-500/20 focus:border-blue-500",
    sendBtn: "bg-blue-600 hover:bg-blue-700",
    chipHover: "hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50",
    badge: "bg-blue-50 text-blue-600 border-blue-200",
    avatarBot: "bg-blue-100 text-blue-600",
    heading: "text-blue-600",
  },
  mesa_ayuda: {
    label: "Mesa de Ayuda",
    sublabel: "Soporte y trámites universitarios",
    icon: <HeadphonesIcon size={22} />,
    accentLight: "bg-violet-600 shadow-violet-200",
    ring: "focus:ring-violet-500/20 focus:border-violet-500",
    sendBtn: "bg-violet-600 hover:bg-violet-700",
    chipHover:
      "hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50",
    badge: "bg-violet-50 text-violet-600 border-violet-200",
    avatarBot: "bg-violet-100 text-violet-600",
    heading: "text-violet-600",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Tipos de mensaje — texto normal o burbuja de opciones
// ─────────────────────────────────────────────────────────────────────────────
type TextMessage = {
  type: "text";
  userId: string;
  name: string;
  message: string;
  sender: "user" | "bot";
  conversationId: string | null;
  id?: string;
  answered?: boolean;
  buttons?: Array<{
    label: string;
    message?: string;
    url?: string;
  }>;
};

type OptionsMessage = {
  type: "options";
  id: string; // para poder marcarlo como "respondido"
  question: string;
  options: { id: string; label: string; confirmed: boolean }[];
  answered: boolean;
};

type ConfirmationMessage = {
  type: "confirmation";
  id: string;
  nombre: string;
  correo: string;
  motivo: string;
  answered: boolean;
};

type ChatMessage = TextMessage | OptionsMessage | ConfirmationMessage;

interface QuickAction {
  id: string;
  label: string;
  displayMessage: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "escalate",
    label: "📞 Canales de contacto",
    displayMessage: "¿Cuáles son los canales de contacto?",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Pantalla de bienvenida
// ─────────────────────────────────────────────────────────────────────────────
const WelcomeScreen = ({
  onSelect,
}: {
  onSelect: (ctx: ChatContext) => void;
}) => (
  <div className='flex flex-col items-center justify-center h-full px-6 py-10 bg-slate-50'>
    <div className='w-full max-w-sm space-y-6'>
      <div className='flex justify-center'>
        <div className='w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center'>
          <Bot size={32} className='text-slate-400' />
        </div>
      </div>
      <div className='text-center space-y-2'>
        <h1 className='text-lg font-bold text-slate-800'>
          ¡Hola! Soy tu asistente virtual
        </h1>
        <p className='text-sm text-slate-500 leading-relaxed'>
          Puedo ayudarte con información de posgrados o con soporte
          universitario. ¿Sobre qué te gustaría hablar?
        </p>
      </div>
      <div className='space-y-3'>
        <button
          onClick={() => onSelect("posgrados")}
          className='w-full flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl
            hover:border-blue-400 hover:shadow-md hover:shadow-blue-50
            transition-all group text-left'
        >
          <div className='w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow shadow-blue-200'>
            <GraduationCap size={20} />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-semibold text-slate-800'>
              Información de Posgrados
            </p>
            <p className='text-xs text-slate-400 mt-0.5'>
              Programas, admisiones, costos
            </p>
          </div>
          <ArrowRight
            size={16}
            className='text-slate-300 group-hover:text-blue-400 transition-colors shrink-0'
          />
        </button>

        <button
          onClick={() => onSelect("mesa_ayuda")}
          className='w-full flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl
            hover:border-violet-400 hover:shadow-md hover:shadow-violet-50
            transition-all group text-left'
        >
          <div className='w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shrink-0 shadow shadow-violet-200'>
            <HeadphonesIcon size={20} />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-semibold text-slate-800'>
              Mesa de Ayuda
            </p>
            <p className='text-xs text-slate-400 mt-0.5'>
              Trámites, carnet, soporte técnico
            </p>
          </div>
          <ArrowRight
            size={16}
            className='text-slate-300 group-hover:text-violet-400 transition-colors shrink-0'
          />
        </button>
      </div>
      <p className='text-center text-[10px] text-slate-400'>
        Universidad Santo Tomás • Tunja
      </p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────
const Chat = () => {
  const [context, setContext] = useState<ChatContext | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [chatExpired, setChatExpired] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [showEscalatePrompt, setShowEscalatePrompt] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMsgSigRef = useRef<string>("");

  const cfg = context ? CONTEXT_CONFIG[context] : null;

  const startExpirationTimer = (
    timeoutMinutes: number,
    lastActivityAt: string,
  ) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const expireAt =
      new Date(lastActivityAt).getTime() + timeoutMinutes * 60 * 1000;
    const remaining = expireAt - Date.now();
    if (remaining <= 0) {
      setChatExpired(true);
      return;
    }
    timeoutRef.current = setTimeout(() => setChatExpired(true), remaining);
  };

  useChatSocket({
    onConnect: () => setConnected(true),
    onDisconnect: () => setConnected(false),
    onChatJoined: (payload) => {
      setConversationId(payload.conversationId);
      setChatExpired(false);
      if (payload.timeoutMinutes)
        startExpirationTimer(payload.timeoutMinutes, payload.lastActivityAt);
    },
    onChatExpired: () => setChatExpired(true),
    onSessionExpired: (payload) => {
      console.log("⏳ sesión expirada:", payload);
      setChatExpired(true);
    },
    onSessionError: (payload) => {
      console.warn("⚠️ session-error:", payload.message);
      setChatExpired(true);
    },
    onHistory: (history) =>
      setMessages(
        history.map((m: any, idx: number) => ({
          type: "text" as const,
          id: m.id ?? `msg-${Date.now()}-${idx}`,
          answered: false,
          ...m,
        })),
      ),
    onMessage: (payload: Omit<TextMessage, "type">) => {
      const sig = `${payload.sender}|${payload.userId}|${payload.message}|${payload.conversationId ?? ""}`;
      if (sig === lastMsgSigRef.current) return;
      lastMsgSigRef.current = sig;
      if (payload.sender === "bot") setIsBotTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          type: "text",
          id: payload.id ?? `msg-${Date.now()}-${prev.length}`,
          answered: false,
          ...payload,
        },
      ]);
    },
    onChatEscalated: () => {
      setIsBotTyping(false);
      setEscalated(true);
      setShowEscalatePrompt(false);
    },
    onShowConfirmation: (payload) => {
      setIsBotTyping(false);
      const confirmMsg: ConfirmationMessage = {
        type: "confirmation",
        id: `confirmation-${Date.now()}`,
        nombre: payload.nombre,
        correo: payload.correo,
        motivo: payload.motivo,
        answered: false,
      };
      setMessages((prev) => [...prev, confirmMsg]);
    },
    onShowEscalateButton: () => {
      setIsBotTyping(false);
      setShowEscalatePrompt(true);
      // Insertar burbuja de opciones en el historial
      const optionsMsg: OptionsMessage = {
        type: "options",
        id: `escalate-${Date.now()}`,
        question:
          "¿Quieres que te compartamos los canales de contacto directo?",
        options: [
          {
            id: "escalate_yes",
            label: "✅ Sí, quiero los canales",
            confirmed: true,
          },
          { id: "escalate_no", label: "❌ No, gracias", confirmed: false },
        ],
        answered: false,
      };
      setMessages((prev) => [...prev, optionsMsg]);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectContext = (ctx: ChatContext) => {
    setContext(ctx);
    connectSocket(ctx);
    emitSendMessage({
      message: `context_selected:${ctx}`,
      context: ctx,
      meta: { source: "quick_reply", optionId: "context_select" },
    });
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !connected || chatExpired || !context) return;
    setIsBotTyping(true);
    emitSendMessage({ message: input.trim(), context });
    setInput("");
  };

  const handleQuickAction = (action: QuickAction) => {
    if (!connected || chatExpired || !context) return;
    setIsBotTyping(true);
    emitSendMessage({
      message: action.displayMessage,
      context,
      meta: { source: "quick_reply", optionId: action.id },
    });
  };

  // El usuario toca una opción dentro de la burbuja
  const handleOptionClick = (
    msgId: string,
    optionId: string,
    confirmed: boolean,
  ) => {
    if (!connected || !context) return;

    // Marcar la burbuja como respondida
    setMessages((prev) =>
      prev.map((m) =>
        m.type === "options" && m.id === msgId ? { ...m, answered: true } : m,
      ),
    );

    setShowEscalatePrompt(false);

    // Enviar al gateway — el back reenvía el mensaje via on-message, no se agrega manualmente
    setIsBotTyping(true);
    emitSendMessage({
      message: confirmed ? "Sí, quiero los canales de contacto" : "No, gracias",
      context,
      meta: { source: "quick_reply", optionId },
    });
  };

  const handleConfirmationClick = (msgId: string, optionId: string) => {
    if (!connected || !context) return;
    setMessages((prev) =>
      prev.map((m) =>
        m.type === "confirmation" && m.id === msgId
          ? { ...m, answered: true }
          : m,
      ),
    );
    setIsBotTyping(true);
    emitSendMessage({
      message: optionId,
      context,
      meta: { source: "quick_reply", optionId },
    });
  };

  const handleButtonClick = (
    msgId: string,
    button: NonNullable<TextMessage["buttons"]>[number],
  ) => {
    if (!connected || !context) return;
    // Botón URL: solo abrir enlace, sin marcar como respondido
    // (el usuario puede querer tocar otros botones del mismo mensaje después)
    if (button.url) {
      window.open(button.url, "_blank");
      return;
    }
    // Botón con mensaje: marcar como respondido y enviar
    if (button.message) {
      setMessages((prev) =>
        prev.map((m) =>
          m.type === "text" && m.id === msgId ? { ...m, answered: true } : m,
        ),
      );
      setIsBotTyping(true);
      emitSendMessage({
        message: button.message,
        context,
        meta: { source: "quick_reply", button: button.label },
      });
    }
  };

  const resetChat = () => {
    localStorage.removeItem("user-id");
    sessionStorage.removeItem("tab-id");
    socket.disconnect();
    window.location.reload();
  };

  const isInputDisabled = !connected || chatExpired || !context;

  // ── Pantalla de bienvenida ─────────────────────────────────────────────────
  if (!context) {
    return (
      <div className='flex flex-col h-screen w-full bg-slate-50 font-sans text-slate-900'>
        <header className='p-4 bg-white border-b border-slate-200 shadow-sm flex justify-between items-center'>
          <div className='flex items-center gap-3'>
            <div className='bg-slate-200 p-2 rounded-lg'>
              <Bot size={22} className='text-slate-500' />
            </div>
            <div>
              <h2 className='text-sm font-bold text-slate-800'>
                Asistente Virtual
              </h2>
              <p className='text-[10px] flex items-center gap-1.5 font-medium uppercase tracking-wider text-slate-500'>
                <Circle
                  size={8}
                  className={`fill-current ${connected ? "text-emerald-500" : "text-red-500"}`}
                />
                {connected ? "En línea" : "Desconectado"}
              </p>
            </div>
          </div>
          <button
            onClick={resetChat}
            className='p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-all'
          >
            <RefreshCw size={18} />
          </button>
        </header>
        <WelcomeScreen onSelect={handleSelectContext} />
      </div>
    );
  }

  // ── Chat activo ────────────────────────────────────────────────────────────
  return (
    <div className='flex flex-col h-screen w-full bg-slate-50 font-sans text-slate-900'>
      {/* Header */}
      <header className='p-4 bg-white border-b border-slate-200 shadow-sm flex justify-between items-center z-10 sticky top-0'>
        <div className='flex items-center gap-3'>
          <div
            className={`${cfg!.accentLight} p-2 rounded-lg text-white shadow-lg`}
          >
            {cfg!.icon}
          </div>
          <div>
            <h2 className='text-sm font-bold text-slate-800'>{cfg!.label}</h2>
            <p className='text-[10px] flex items-center gap-1.5 font-medium uppercase tracking-wider text-slate-500'>
              <Circle
                size={8}
                className={`fill-current ${connected ? "text-emerald-500" : "text-red-500"}`}
              />
              {connected ? "En línea" : "Desconectado"}
              {conversationId && (
                <span className='text-slate-300'>
                  | ID: {conversationId.slice(0, 8)}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <span
            className={`hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${cfg!.badge}`}
          >
            {context === "posgrados" ? "Posgrados" : "Mesa de Ayuda"}
          </span>
          <button
            onClick={resetChat}
            className='p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-all'
            title='Reiniciar conversación'
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      {/* Mensajes */}
      <div className='flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50'>
        <div className='w-full max-w-2xl mx-auto space-y-6 pb-4'>
          {messages.map((msg, index) => {
            // ── Burbuja de confirmación de datos ────────────────────────────
            if (msg.type === "confirmation") {
              const isDisabled =
                msg.answered || isInputDisabled || chatExpired || escalated;
              return (
                <div key={msg.id} className='flex gap-4 flex-row'>
                  <div
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${cfg!.avatarBot}`}
                  >
                    <Bot size={16} />
                  </div>
                  <div className='bg-white border border-slate-100 rounded-2xl rounded-tl-none shadow-sm px-5 py-4 max-w-[85%]'>
                    <p className='text-[15px] text-slate-700 mb-3'>
                      Antes de continuar, confirma tus datos:
                    </p>
                    <div className='text-sm text-slate-700 mb-4 space-y-1'>
                      <p>
                        👤 <strong>Nombre:</strong> {msg.nombre}
                      </p>
                      <p>
                        📧 <strong>Correo:</strong> {msg.correo}
                      </p>
                      <p>
                        💬 <strong>Motivo:</strong> {msg.motivo}
                      </p>
                    </div>
                    <div className='flex flex-col gap-2'>
                      {[
                        { id: "confirm",     label: "✅ Confirmar",       variant: "confirm"  as const },
                        { id: "edit_nombre", label: "✏️ Corregir nombre", variant: "default" as const },
                        { id: "edit_correo", label: "✏️ Corregir correo", variant: "default" as const },
                        { id: "edit_motivo", label: "✏️ Corregir motivo", variant: "default" as const },
                      ].map((opt) => (
                        <ChatButton
                          key={opt.id}
                          label={opt.label}
                          variant={opt.variant}
                          disabled={isDisabled}
                          onClick={() => handleConfirmationClick(msg.id, opt.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            // ── Burbuja de opciones ──────────────────────────────────────────
            if (msg.type === "options") {
              return (
                <div key={msg.id} className='flex gap-4 flex-row'>
                  <div
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${cfg!.avatarBot}`}
                  >
                    <Bot size={16} />
                  </div>
                  <div className='bg-white border border-slate-100 rounded-2xl rounded-tl-none shadow-sm px-5 py-4 max-w-[85%]'>
                    <p className='text-[15px] text-slate-700 mb-3'>
                      {msg.question}
                    </p>
                    <div className='flex flex-col gap-2'>
                      {msg.options.map((opt) => (
                        <button
                          key={opt.id}
                          disabled={msg.answered || isInputDisabled}
                          onClick={() =>
                            handleOptionClick(msg.id, opt.id, opt.confirmed)
                          }
                          className={`text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all
                            ${
                              msg.answered
                                ? "opacity-40 cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                                : opt.confirmed
                                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            // ── Burbuja de texto normal ──────────────────────────────────────
            const isUser = msg.sender === "user";
            return (
              <div
                key={index}
                className={`flex gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${isUser ? "bg-slate-200 text-slate-600" : cfg!.avatarBot}`}
                >
                  {isUser ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className='flex flex-col gap-2 max-w-[85%]'>
                  <div
                    className={`relative px-5 py-4 rounded-2xl shadow-sm text-[15px] leading-relaxed
                    ${
                      isUser
                        ? `${cfg!.sendBtn.replace("hover:bg-", "bg-").split(" ")[0]} text-white rounded-tr-none`
                        : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                    }`}
                  >
                    <ReactMarkdown
                      components={{
                        h2: ({ node, ...props }) => (
                          <h3
                            className={`text-sm font-bold uppercase tracking-wider mt-4 mb-2 border-b pb-1 ${cfg!.heading}`}
                            {...props}
                          />
                        ),
                        p: ({ node, ...props }) => (
                          <p className='mb-2 last:mb-0' {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className='space-y-1 my-2 pl-1' {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li className='flex items-start gap-2' {...props} />
                        ),
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            target='_blank'
                            rel='noopener noreferrer'
                            className={`font-semibold underline underline-offset-2 transition-colors ${isUser ? "text-white hover:text-white/80" : cfg!.heading}`}
                          />
                        ),
                        strong: ({ node, ...props }) => (
                          <span
                            className={`font-bold ${isUser ? "text-white" : "text-slate-900"}`}
                            {...props}
                          />
                        ),
                        hr: ({ node, ...props }) => (
                          <hr
                            className='my-4 border-slate-200 border-dashed'
                            {...props}
                          />
                        ),
                      }}
                    >
                      {msg.message}
                    </ReactMarkdown>
                  </div>
                  {!isUser && msg.buttons && msg.buttons.length > 0 && (
                    <div className='flex flex-wrap gap-2'>
                      {msg.buttons.map((button, idx) => (
                        <ChatButton
                          key={idx}
                          label={button.label}
                          disabled={msg.answered || isInputDisabled}
                          onClick={() => handleButtonClick(msg.id!, button)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {/* Indicador de escritura del bot */}
          {isBotTyping && (
            <div className='flex gap-4 flex-row'>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm mt-1 ${cfg?.avatarBot ?? "bg-slate-100 text-slate-500"}`}
              >
                <Bot size={16} />
              </div>
              <div className='flex items-center gap-1 px-4 py-3 bg-white border border-slate-100 rounded-2xl rounded-tl-none shadow-sm'>
                <span className='w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]' />
                <span className='w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]' />
                <span className='w-2 h-2 rounded-full bg-slate-400 animate-bounce' />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat expirado */}
      {chatExpired && (
        <div className='mx-auto max-w-3xl mt-3 px-4'>
          <div className='bg-red-50 border border-red-200 text-red-900 rounded-xl p-3'>
            <div className='text-sm'>
              ⏱️ La conversación finalizó por inactividad. Puedes iniciar una
              nueva sesión.
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className='p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]'>
        <div className='max-w-2xl mx-auto space-y-2'>
          {!chatExpired && !escalated && !showEscalatePrompt && (
            <div className='flex flex-wrap gap-2'>
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  disabled={isInputDisabled}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200
                    bg-white text-slate-600 text-xs font-medium ${cfg!.chipHover}
                    disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
          <form onSubmit={sendMessage} className='flex gap-3 relative'>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                chatExpired
                  ? "Conversación finalizada"
                  : showEscalatePrompt
                    ? "O escribe tu mensaje..."
                    : "Escribe tu consulta aquí..."
              }
              disabled={isInputDisabled}
              className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-5 pr-14
                text-sm focus:ring-2 outline-none disabled:opacity-50 transition-all
                placeholder:text-slate-400 ${cfg!.ring}`}
            />
            <button
              type='submit'
              disabled={isInputDisabled || !input.trim()}
              className={`absolute right-2 top-2 bottom-2 aspect-square ${cfg!.sendBtn} text-white
                rounded-lg disabled:bg-slate-200 disabled:text-slate-400
                flex items-center justify-center transition-all shadow-sm`}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
        <div className='text-center mt-2 space-y-0.5'>
          <p className='text-[10px] text-slate-400'>
            Universidad Santo Tomás • Tunja{" · "}
            <span className={cfg!.heading}>{cfg!.sublabel}</span>
          </p>
          <p className='text-[10px] text-slate-400'>
            El asistente puede cometer errores. Verifica la información importante.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
