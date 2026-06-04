import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Lock, Mail, ShieldCheck, Sun } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState("admin@solarmonitor.local");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success("Sesion iniciada con datos simulados");
      navigate("/app/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo iniciar sesion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 bg-slate-900 lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(52,211,153,0.28),transparent_32%),radial-gradient(circle_at_80%_70%,rgba(56,189,248,0.18),transparent_30%)]" />
          <div className="relative flex h-full flex-col justify-between p-12">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950">
                <Sun className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xl font-black">SolarMonitor</p>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Photovoltaic SaaS</p>
              </div>
            </div>
            <div className="max-w-xl">
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-emerald-300">Frontend Platform</p>
              <h1 className="mt-4 text-5xl font-black tracking-tight">Monitoreo solar moderno, simulado y listo para API.</h1>
              <p className="mt-5 text-lg leading-8 text-slate-300">
                Dashboard profesional para energia generada, consumo, potencia, estadisticas historicas y comparacion
                entre sistemas fotovoltaicos.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["Dark mode", "Mock API", "Roles JWT"].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-bold text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10">
          <motion.form
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur"
            onSubmit={handleSubmit}
          >
            <div className="mb-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950 lg:hidden">
                <Sun className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">Acceso a la plataforma</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Usa las credenciales demo. El flujo queda preparado para autenticacion JWT real.
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Correo
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-11 border-white/10 bg-slate-950/60 pl-10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Contrasena
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-11 border-white/10 bg-slate-950/60 pl-10 text-white"
                  />
                </div>
              </div>

              <Button type="submit" className="h-11 w-full bg-emerald-400 font-black text-slate-950 hover:bg-emerald-300" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar al dashboard"}
              </Button>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-300" />
              <p className="text-xs leading-5 text-slate-300">
                Sesion mock con permisos por rol. No existe backend, hardware, ESP32 ni sensores en esta fase.
              </p>
            </div>
          </motion.form>
        </section>
      </div>
    </main>
  );
}
