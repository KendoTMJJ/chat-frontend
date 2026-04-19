// src/components/ChatButton.tsx

interface ChatButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "confirm" | "default";
}

const ChatButton = ({
  label,
  onClick,
  disabled = false,
  variant = "default",
}: ChatButtonProps) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all
      ${
        disabled
          ? "opacity-40 cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
          : variant === "confirm"
            ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
      }`}
  >
    {label}
  </button>
);

export default ChatButton;
