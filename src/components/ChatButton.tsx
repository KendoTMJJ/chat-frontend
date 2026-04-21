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
          ? "opacity-30 cursor-not-allowed border-white/10 bg-white/5 text-white/40"
          : variant === "confirm"
            ? "border-usta-green/60 bg-usta-green/10 text-usta-green hover:bg-usta-green/20"
            : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/25"
      }`}
  >
    {label}
  </button>
);

export default ChatButton;
