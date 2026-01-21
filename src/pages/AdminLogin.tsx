import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { checkAdminCredentials } from "@/lib/localStorage";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/contexts/LocaleContext";
import { Lock, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLocale();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (checkAdminCredentials(username, password)) {
      sessionStorage.setItem("admin_logged_in", "true");
      toast({
        title: t("loginSuccessTitle"),
        description: t("loginSuccessDesc"),
      });
      navigate("/super-secret-admin-panel-x99/dashboard");
    } else {
      toast({
        title: t("loginFailedTitle"),
        description: t("loginFailedDesc"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-4">
            <ShoppingBag className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-3xl font-heading font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {t("siteTitleShort")}
            </span>
          </Link>
        </div>

        <Card className="shadow-card-hover border-border/50">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-heading">
              {t("adminLoginTitle")}
            </CardTitle>
            <CardDescription>{t("adminLoginDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t("usernameLabel")}</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="أدخل اسم المستخدم"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("passwordLabel")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                {t("login")}
              </Button>
            </form>

            <div className="mt-6 p-3 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                <strong>بيانات الدخول التجريبية:</strong>
                <br />
                اسم المستخدم: admin | كلمة المرور: admin123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
