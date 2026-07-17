import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import logo1 from "@/assets/logo1.jpeg";

function normalizeErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message.toLowerCase().includes("credenciales")) {
      return "No pudimos iniciar sesión con esos datos. Revisa el correo y la contraseña.";
    }
    return error.message;
  }

  return "No pudimos iniciar sesión en este momento. Intenta nuevamente.";
}

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success("Sesión iniciada correctamente");
      navigate("/app");
    } catch (error) {
      const friendlyMessage = normalizeErrorMessage(error);
      setErrorMessage(friendlyMessage);
      toast.error(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_26%),linear-gradient(180deg,_#f6fbf8_0%,_#edf7f2_36%,_#f8fbff_100%)] text-slate-900">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="login-ambient absolute left-[-8rem] top-16 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="login-ambient absolute bottom-[-5rem] right-[-4rem] h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="login-glow absolute left-[26%] top-[56%] h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/14 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.05fr_460px]">
          <section className="login-form-fade hidden space-y-8 lg:block">
            <div className="flex items-center gap-4">
              <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-2 shadow-[0_20px_45px_rgba(15,23,42,0.08)] backdrop-blur-md">
                <img
                  src={logo1}
                  alt="Logo Solar Monitor"
                  className="h-16 w-16 rounded-2xl object-cover ring-1 ring-emerald-100"
                />
              </div>
              <div>
                <p className="font-display text-3xl leading-none text-slate-950">Solar Monitor</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.28em] text-emerald-700">Energy Platform</p>
              </div>
            </div>

            <div className="max-w-2xl space-y-5">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-700">Monitoreo fotovoltaico</p>
              <h1 className="max-w-2xl text-5xl font-black leading-[1.02] tracking-tight text-slate-950 xl:text-6xl">
                Control visual y claro para generación, consumo e históricos solares.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-600">
                Una interfaz simple para supervisar dispositivos IoT, comparar comportamiento energético y revisar el estado del sistema en tiempo real.
              </p>
            </div>

            <div className="grid max-w-2xl gap-4 sm:grid-cols-3">
              <FeatureCard title="Tiempo real" description="Lecturas actualizadas desde cada monitor solar conectado." />
              <FeatureCard title="Comparativa" description="Balance visual entre generación y consumo cuando existan ambos datos." />
              <FeatureCard title="Históricos" description="Seguimiento resumido por hora, día y mes para un análisis rápido." />
            </div>
          </section>

          <section className="flex justify-center">
            <form
              className="login-panel-reveal w-full max-w-md rounded-[2rem] border border-white/70 bg-white/88 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8"
              onSubmit={handleSubmit}
            >
              <div className="mb-8">
                <div className="mb-5 flex items-center gap-4">
                  <div className="rounded-[1.4rem] border border-emerald-100 bg-white p-2 shadow-[0_18px_35px_rgba(16,185,129,0.12)]">
                    <img
                      src={logo1}
                      alt="Logo Solar Monitor"
                      className="h-14 w-14 rounded-[1rem] object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-display text-2xl leading-none text-slate-950">Solar Monitor</p>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-700">Acceso seguro</p>
                  </div>
                </div>

                <h2 className="text-3xl font-black tracking-tight text-slate-950">Iniciar sesión</h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Accede al dashboard para revisar generación, consumo y estado del monitoreo solar.
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">
                    Correo
                  </Label>
                  <div className="group relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-700" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (errorMessage) setErrorMessage("");
                      }}
                      className="h-12 rounded-2xl border-slate-200 bg-white pl-11 text-slate-900 shadow-sm"
                      placeholder="usuario@solarmonitor.local"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="password" className="text-slate-700">
                      Contraseña
                    </Label>
                    <button
                      type="button"
                      className="text-xs font-bold text-slate-500 transition hover:text-slate-900"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                  <div className="group relative">
                    <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-700" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        if (errorMessage) setErrorMessage("");
                      }}
                      className="h-12 rounded-2xl border-slate-200 bg-white pl-11 pr-12 text-slate-900 shadow-sm"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {errorMessage ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
                    {errorMessage}
                  </div>
                ) : null}

                <Button
                  type="submit"
                  className="login-submit h-12 w-full overflow-hidden rounded-2xl bg-emerald-500 text-base font-black text-slate-950 shadow-[0_16px_35px_rgba(16,185,129,0.24)] hover:bg-emerald-400"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Ingresando...
                    </>
                  ) : (
                    "Entrar al dashboard"
                  )}
                </Button>
              </div>

            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <article className="rounded-3xl border border-white/60 bg-white/60 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(15,23,42,0.1)]">
      <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">{title}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}
