import { Database, KeyRound, Lock, ShieldCheck, ToggleLeft, Users } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusPill } from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { api } from "@/services/api";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/context/AuthContext";

export function SettingsPage() {
  const { user, can } = useAuth();
  const { data: users = [] } = useUsers();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="Arquitectura preparada"
        title="Configuracion de plataforma"
        description="Ajustes frontend para APIs futuras, autenticacion JWT, permisos, usuarios y comportamiento mock."
      />

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                  <Database className="h-5 w-5 text-emerald-300" />
                  API futura
                </h2>
                <p className="mt-1 text-sm text-slate-400">Contrato desacoplado del backend.</p>
              </div>
              <StatusPill status={api.config.useMockData ? "attention" : "online"} />
            </div>

            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Base URL</Label>
                <Input value={api.config.baseUrl} readOnly className="border-white/10 bg-slate-950/60 text-slate-300" />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/50 p-4">
                <div>
                  <p className="font-bold text-white">Modo mock</p>
                  <p className="text-sm text-slate-400">Usa datos simulados para todas las vistas.</p>
                </div>
                <Switch checked={api.config.useMockData} />
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <KeyRound className="h-5 w-5 text-blue-300" />
              Seguridad
            </h2>
            <div className="mt-5 space-y-3">
              <SecurityItem icon={Lock} label="JWT Authentication" enabled />
              <SecurityItem icon={ShieldCheck} label="Roles de usuario" enabled />
              <SecurityItem icon={ToggleLeft} label="Permisos por modulo" enabled />
            </div>
          </article>
        </div>

        <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <Users className="h-5 w-5 text-emerald-300" />
                Usuarios y permisos
              </h2>
              <p className="mt-1 text-sm text-slate-400">Datos simulados para preparar multiusuario.</p>
            </div>
            <Button disabled={!can("users:manage")} className="bg-emerald-400 font-black text-slate-950 hover:bg-emerald-300">
              Nuevo usuario
            </Button>
          </div>

          <div className="mt-5 space-y-3">
            {users.map((item) => (
              <div key={item.id} className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-white">{item.name}</p>
                    <p className="text-sm text-slate-400">{item.email}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-wider text-slate-300">
                    {item.role}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.permissions.map((permission) => (
                    <span key={permission} className="rounded-full bg-white/5 px-2 py-1 text-xs text-slate-400">
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-blue-400/20 bg-blue-400/10 p-4 text-sm leading-6 text-blue-100/80">
            Usuario actual: <span className="font-bold text-white">{user?.name}</span>. La autorizacion ya puede
            conectarse a claims reales cuando exista backend.
          </div>
        </article>
      </section>
    </div>
  );
}

function SecurityItem({ icon: Icon, label, enabled }: { icon: typeof Lock; label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/50 p-4">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-slate-400" />
        <span className="text-sm font-bold text-slate-200">{label}</span>
      </div>
      <span className="text-xs font-black uppercase tracking-wider text-emerald-300">{enabled ? "Preparado" : "Pendiente"}</span>
    </div>
  );
}
