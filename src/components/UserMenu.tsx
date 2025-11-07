import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, History, Archive, LogOut, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const UserMenu = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Выход выполнен",
      description: "До скорой встречи!",
    });
    navigate("/auth");
  };

  if (!user) {
    return (
      <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
        Войти
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => navigate("/analytics")}>
          <BarChart3 className="mr-2 h-4 w-4" />
          Дашборд аналитики
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Настройки
        </DropdownMenuItem>
        <DropdownMenuItem>
          <History className="mr-2 h-4 w-4" />
          История обработки
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Archive className="mr-2 h-4 w-4" />
          Архив документов
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Выход
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
