import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send } from "lucide-react";

interface GroupChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  documentCount: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const GroupChatModal = ({
  open,
  onOpenChange,
  groupName,
  documentCount,
}: GroupChatModalProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Здравствуйте! Я готов ответить на ваши вопросы по ${documentCount} документам из группы "${groupName}".`,
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { role: "user" as const, content: input },
      {
        role: "assistant" as const,
        content: "Спасибо за ваш вопрос! Я проанализирую документы группы и отвечу на него.",
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
            <MessageSquare className="h-5 w-5" />
            Чат по группе: {groupName} ({documentCount} документов)
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
            placeholder="Задайте вопрос о документах группы..."
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
