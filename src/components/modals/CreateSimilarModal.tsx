import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles } from "lucide-react";
import { Document } from "@/types/document";

interface CreateSimilarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const CreateSimilarModal = ({ open, onOpenChange, document }: CreateSimilarModalProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Здравствуйте! Я помогу вам создать подобный документ. Расскажите, какие основные требования у вас к новому документу?",
    },
  ]);
  const [input, setInput] = useState("");

  if (!document) return null;

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { role: "user" as const, content: input },
      {
        role: "assistant" as const,
        content: "Спасибо за информацию! Я учту ваши требования при создании нового документа. Есть ли еще какие-то детали, которые нужно учесть?",
      },
    ];

    setMessages(newMessages);
    setInput("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Создать подобный документ: {document.name}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4 bg-muted/20 rounded-lg">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4 border-t">
          <Input
            placeholder="Опишите ваши требования..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="flex-1"
          />
          <Button onClick={handleSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
