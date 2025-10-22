"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Smile } from "lucide-react";
import { cn } from "@/utils/styles";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EmojiPicker, { Theme, EmojiClickData } from "emoji-picker-react";
import { useTheme } from "next-themes";

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  onTyping?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSendMessage,
  onTyping,
  disabled = false,
  placeholder = "Напишете съобщение...",
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { theme } = useTheme();

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSendMessage(trimmedMessage);
      setMessage("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }

    // Notify typing
    if (onTyping && message.length > 0) {
      onTyping();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    // Insert emoji at cursor position
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newMessage = message.slice(0, start) + emojiData.emoji + message.slice(end);
      setMessage(newMessage);

      // Move cursor after emoji
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + emojiData.emoji.length;
          textareaRef.current.focus();
        }
      }, 0);
    }

    // Close emoji picker
    setIsEmojiPickerOpen(false);
  };

  return (
    <div className="border-t border-border bg-background p-4 flex-shrink-0">
      <div className="flex items-end gap-2">
        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSending}
            rows={1}
            className={cn(
              "w-full resize-none rounded-xl border border-border bg-muted/50 px-4 py-3 pr-12 text-sm",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all duration-200",
              "max-h-32 overflow-y-auto"
            )}
            style={{ minHeight: "44px" }}
          />

          {/* Emoji button inside textarea */}
          <div className="absolute right-2 bottom-2">
            <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-lg hover:bg-muted",
                    "transition-all duration-200",
                    isEmojiPickerOpen && "bg-muted"
                  )}
                  disabled={disabled || isSending}
                >
                  <Smile className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="end"
                className="w-auto p-0 border-0 shadow-xl"
              >
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
                  width={350}
                  height={450}
                  searchPlaceHolder="Търсене на емоджи..."
                  previewConfig={{ showPreview: false }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || isSending || disabled}
          size="icon"
          className={cn(
            "h-11 w-11 rounded-xl flex-shrink-0",
            "bg-gradient-to-br from-blue-600 to-cyan-500",
            "hover:from-blue-700 hover:to-cyan-600",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all duration-200 hover:scale-105 active:scale-95",
            "shadow-md hover:shadow-lg"
          )}
        >
          {isSending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Hint text */}
      <p className="text-xs text-muted-foreground mt-2 px-1">
        Enter за изпращане, Shift + Enter за нов ред
      </p>
    </div>
  );
}
