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
    accentBg: string;
    accentText: string;
    accentBorder: string;
    sendBtn: string;
    chipHover: string;
    avatarBot: string;
    heading: string;
    userBubble: string;
  }
> = {
  posgrados: {
    label: "Asistente Posgrados",
    sublabel: "Información académica y programas",
    icon: <GraduationCap size={22} />,
    accentBg: "bg-[#4c6ef5]",
    accentText: "text-[#7b9fff]",
    accentBorder: "border-[#4c6ef5]/50",
    sendBtn: "bg-[#4c6ef5] hover:bg-[#3b5de5]",
    chipHover: "hover:border-[#4c6ef5]/50 hover:text-[#7b9fff] hover:bg-[#4c6ef5]/10",
    avatarBot: "bg-[#4c6ef5]/20 text-[#7b9fff]",
    heading: "text-[#7b9fff]",
    userBubble: "bg-[#4c6ef5] text-white",
  },
  mesa_ayuda: {
    label: "Mesa de Ayuda",
    sublabel: "Soporte y trámites universitarios",
    icon: <HeadphonesIcon size={22} />,
    accentBg: "bg-[#39d98a]",
    accentText: "text-[#39d98a]",
    accentBorder: "border-[#39d98a]/50",
    sendBtn: "bg-[#39d98a] hover:bg-[#2bc77a]",
    chipHover: "hover:border-[#39d98a]/50 hover:text-[#39d98a] hover:bg-[#39d98a]/10",
    avatarBot: "bg-[#39d98a]/20 text-[#39d98a]",
    heading: "text-[#39d98a]",
    userBubble: "bg-[#39d98a] text-[#0f0a1e]",
  },
};

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
  id: string;
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
  <div className='flex flex-col items-center justify-center h-full px-6 py-10 bg-[#0f0a1e]'>
    <div className='w-full max-w-sm space-y-6'>
      <div className='flex justify-center'>
        <div className='w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center'>
          <Bot size={32} className='text-[#39d98a]' />
        </div>
      </div>
      <div className='text-center space-y-2'>
        <h1 className='text-lg font-bold text-white'>
          ¡Hola! Soy tu asistente virtual
        </h1>
        <p className='text-sm text-white/50 leading-relaxed'>
          Puedo ayudarte con información de posgrados o con soporte
          universitario. ¿Sobre qué te gustaría hablar?
        </p>
      </div>
      <div className='space-y-3'>
        <button
          onClick={() => onSelect("posgrados")}
          className='w-full flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl
            hover:border-[#4c6ef5]/50 hover:bg-[#4c6ef5]/10
            transition-all group text-left'
        >
          <div className='w-10 h-10 rounded-xl bg-[#4c6ef5] flex items-center justify-center text-white shrink-0'>
            <GraduationCap size={20} />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-semibold text-white'>
              Información de Posgrados
            </p>
            <p className='text-xs text-white/40 mt-0.5'>
              Programas, admisiones, costos
            </p>
          </div>
          <ArrowRight
            size={16}
            className='text-white/20 group-hover:text-[#7b9fff] transition-colors shrink-0'
          />
        </button>

        <button
          onClick={() => onSelect("mesa_ayuda")}
          className='w-full flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl
            hover:border-[#39d98a]/50 hover:bg-[#39d98a]/10
            transition-all group text-left'
        >
          <div className='w-10 h-10 rounded-xl bg-[#39d98a]/20 flex items-center justify-center text-[#39d98a] shrink-0 border border-[#39d98a]/30'>
            <HeadphonesIcon size={20} />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-semibold text-white'>
              Mesa de Ayuda
            </p>
            <p className='text-xs text-white/40 mt-0.5'>
              Trámites, carnet, soporte técnico
            </p>
          </div>
          <ArrowRight
            size={16}
            className='text-white/20 group-hover:text-[#39d98a] transition-colors shrink-0'
          />
        </button>
      </div>
      <p className='text-center text-[10px] text-white/25'>
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

  const handleOptionClick = (
    msgId: string,
    optionId: string,
    confirmed: boolean,
  ) => {
    if (!connected || !context) return;
    setMessages((prev) =>
      prev.map((m) =>
        m.type === "options" && m.id === msgId ? { ...m, answered: true } : m,
      ),
    );
    setShowEscalatePrompt(false);
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
    if (button.url) {
      window.open(button.url, "_blank");
      return;
    }
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
      <div className='flex flex-col h-screen w-full bg-[#0f0a1e] font-sans text-white'>
        <header className='p-4 bg-[#1a0a2e] border-b border-white/10 flex justify-between items-center'>
          <div className='flex items-center gap-3'>
            <div className='bg-white/5 border border-white/10 p-2 rounded-lg'>
              <Bot size={22} className='text-[#39d98a]' />
            </div>
            <div>
              <h2 className='text-sm font-bold text-white'>
                Asistente Virtual
              </h2>
              <p className='text-[10px] flex items-center gap-1.5 font-medium uppercase tracking-wider text-white/40'>
                <Circle
                  size={8}
                  className={`fill-current ${connected ? "text-[#39d98a]" : "text-red-400"}`}
                />
                {connected ? "En línea" : "Desconectado"}
              </p>
            </div>
          </div>
          <button
            onClick={resetChat}
            className='p-2 hover:bg-white/5 rounded-full text-white/30 hover:text-red-400 transition-all'
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
    <div className='flex flex-col h-screen w-full bg-[#0f0a1e] font-sans text-white'>
      {/* Header */}
      <header className='p-4 bg-[#1a0a2e] border-b border-white/10 flex justify-between items-center z-10 sticky top-0'>
        <div className='flex items-center gap-3'>
          <div className={`${cfg!.accentBg} p-2 rounded-lg text-white`}>
            {cfg!.icon}
          </div>
          <div>
            <h2 className='text-sm font-bold text-white'>{cfg!.label}</h2>
            <p className='text-[10px] flex items-center gap-1.5 font-medium uppercase tracking-wider text-white/40'>
              <Circle
                size={8}
                className={`fill-current ${connected ? "text-[#39d98a]" : "text-red-400"}`}
              />
              {connected ? "En línea" : "Desconectado"}
              {conversationId && (
                <span className='text-white/20'>
                  | ID: {conversationId.slice(0, 8)}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <span
            className={`hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${cfg!.accentBorder} ${cfg!.accentText} bg-white/5`}
          >
            {context === "posgrados" ? "Posgrados" : "Mesa de Ayuda"}
          </span>
          <button
            onClick={resetChat}
            className='p-2 hover:bg-white/5 rounded-full text-white/30 hover:text-red-400 transition-all'
            title='Reiniciar conversación'
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      {/* Mensajes */}
      <div className='flex-1 overflow-y-auto p-4 md:p-6 bg-[#0f0a1e]'>
        <div className='w-full max-w-2xl mx-auto space-y-6 pb-4'>
          {messages.map((msg, index) => {
            // ── Burbuja de confirmación de datos ────────────────────────────
            if (msg.type === "confirmation") {
              const isDisabled =
                msg.answered || isInputDisabled || chatExpired || escalated;
              return (
                <div key={msg.id} className='flex gap-4 flex-row'>
                  <div
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${cfg!.avatarBot}`}
                  >
                    <Bot size={16} />
                  </div>
                  <div className='bg-[#1e1040] border border-white/10 rounded-2xl rounded-tl-none px-5 py-4 max-w-[85%]'>
                    <p className='text-[15px] text-white/80 mb-3'>
                      Antes de continuar, confirma tus datos:
                    </p>
                    <div className='text-sm text-white/70 mb-4 space-y-1'>
                      <p>
                        👤 <strong className='text-white'>Nombre:</strong> {msg.nombre}
                      </p>
                      <p>
                        📧 <strong className='text-white'>Correo:</strong> {msg.correo}
                      </p>
                      <p>
                        💬 <strong className='text-white'>Motivo:</strong> {msg.motivo}
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
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${cfg!.avatarBot}`}
                  >
                    <Bot size={16} />
                  </div>
                  <div className='bg-[#1e1040] border border-white/10 rounded-2xl rounded-tl-none px-5 py-4 max-w-[85%]'>
                    <p className='text-[15px] text-white/80 mb-3'>
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
                                ? "opacity-30 cursor-not-allowed border-white/10 bg-white/5 text-white/40"
                                : opt.confirmed
                                  ? "border-[#39d98a]/60 bg-[#39d98a]/10 text-[#39d98a] hover:bg-[#39d98a]/20"
                                  : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/25"
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
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? "bg-white/10 text-white/60" : cfg!.avatarBot}`}
                >
                  {isUser ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className='flex flex-col gap-2 max-w-[85%]'>
                  <div
                    className={`relative px-5 py-4 rounded-2xl text-[15px] leading-relaxed
                    ${
                      isUser
                        ? `${cfg!.userBubble} rounded-tr-none`
                        : "bg-[#1e1040] text-white/85 border border-white/10 rounded-tl-none"
                    }`}
                  >
                    <ReactMarkdown
                      components={{
                        h2: ({ node, ...props }) => (
                          <h3
                            className={`text-sm font-bold uppercase tracking-wider mt-4 mb-2 border-b pb-1 border-white/10 ${cfg!.heading}`}
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
                            className={`font-semibold underline underline-offset-2 transition-colors ${isUser ? "text-white/90 hover:text-white" : cfg!.heading}`}
                          />
                        ),
                        strong: ({ node, ...props }) => (
                          <span
                            className={`font-bold ${isUser ? "" : cfg!.accentText}`}
                            {...props}
                          />
                        ),
                        hr: ({ node, ...props }) => (
                          <hr
                            className='my-4 border-white/10 border-dashed'
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
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm mt-1 ${cfg?.avatarBot ?? "bg-white/10 text-white/50"}`}
              >
                <Bot size={16} />
              </div>
              <div className='flex items-center gap-1.5 px-4 py-3 bg-[#1e1040] border border-white/10 rounded-2xl rounded-tl-none'>
                <span className='w-2 h-2 rounded-full bg-white/30 animate-bounce [animation-delay:-0.3s]' />
                <span className='w-2 h-2 rounded-full bg-white/30 animate-bounce [animation-delay:-0.15s]' />
                <span className='w-2 h-2 rounded-full bg-white/30 animate-bounce' />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat expirado */}
      {chatExpired && (
        <div className='mx-auto max-w-3xl mt-3 px-4'>
          <div className='bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3'>
            <div className='text-sm'>
              ⏱️ La conversación finalizó por inactividad. Puedes iniciar una
              nueva sesión.
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className='p-4 bg-[#1a0a2e] border-t border-white/10'>
        <div className='max-w-2xl mx-auto space-y-2'>
          {!chatExpired && !escalated && !showEscalatePrompt && (
            <div className='flex flex-wrap gap-2'>
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  disabled={isInputDisabled}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10
                    bg-white/5 text-white/60 text-xs font-medium ${cfg!.chipHover}
                    disabled:opacity-30 disabled:cursor-not-allowed transition-all`}
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
              className={`w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-5 pr-14
                text-sm text-white focus:ring-2 focus:ring-white/10 focus:border-white/25 outline-none
                disabled:opacity-40 transition-all placeholder:text-white/25`}
            />
            <button
              type='submit'
              disabled={isInputDisabled || !input.trim()}
              className={`absolute right-2 top-2 bottom-2 aspect-square ${cfg!.sendBtn}
                rounded-lg disabled:bg-white/10 disabled:text-white/20
                flex items-center justify-center transition-all
                ${context === "mesa_ayuda" ? "text-[#0f0a1e]" : "text-white"}`}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
        <div className='text-center mt-2 space-y-0.5'>
          <p className='text-[10px] text-white/25'>
            Universidad Santo Tomás • Tunja{" · "}
            <span className={cfg!.accentText}>{cfg!.sublabel}</span>
          </p>
          <p className='text-[10px] text-white/20'>
            El asistente puede cometer errores. Verifica la información importante.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
