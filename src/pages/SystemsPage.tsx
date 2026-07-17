import { FormEvent, useMemo, useState } from "react";
import { Copy, Cpu, KeyRound, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDevices } from "@/hooks/useDevices";
import { api } from "@/services/api";
import { CreatedDevice, CreateDeviceInput, DeviceType } from "@/types";

const initialForm: CreateDeviceInput = {
  name: "",
  type: "esp32",
  model: "",
  sampleIntervalSeconds: 5,
};

export function SystemsPage() {
  const { data: devices = [], isLoading, mutate } = useDevices();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateDeviceInput>(initialForm);
  const [createdDevice, setCreatedDevice] = useState<CreatedDevice | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const deviceCredentials = useMemo(
    () => createdDevice ? buildDeviceCredentials(createdDevice) : "",
    [createdDevice],
  );
  const dispositivoActivo = devices.length
    ? [...devices].sort((a, b) => {
        if (!a.lastSeen) return 1;
        if (!b.lastSeen) return -1;
        return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
      })[0]
    : null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Escribe un nombre para el dispositivo");
      return;
    }

    setIsSaving(true);
    try {
      const device = await api.createDevice({
        ...form,
        model: form.model?.trim() || form.type.toUpperCase(),
        sampleIntervalSeconds: Number(form.sampleIntervalSeconds || 5),
      });
      setCreatedDevice(device);
      setForm(initialForm);
      setShowForm(false);
      await mutate();
      toast.success("Dispositivo registrado. Guarda la clave de conexión.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo registrar el dispositivo");
    } finally {
      setIsSaving(false);
    }
  };

  const copyGuide = async () => {
    if (!deviceCredentials) return;
    try {
      await navigator.clipboard.writeText(deviceCredentials);
      toast.success("Credenciales copiadas");
    } catch {
      toast.error("No se pudieron copiar las credenciales. Intenta copiarlas manualmente.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="Fuentes de datos"
        title="Dispositivos"
        description="Registra el cerebro del monitor solar. Un ESP32 o Raspberry Pi lee el panel, sensores de consumo y envía los datos reales a la plataforma."
        action={
          <Button onClick={() => setShowForm((current) => !current)}>
            <Plus className="h-4 w-4" />
            Nuevo dispositivo
          </Button>
        }
      />

      <div className="surface-panel rounded-[1.75rem] border border-emerald-200/80 bg-emerald-50/85 p-4 text-sm text-emerald-900 shadow-[0_18px_35px_rgba(16,185,129,0.08)]">
        Flujo recomendado: conecta el panel solar y los sensores al ESP32 o Raspberry Pi, registra el dispositivo,
        copia el DEVICE_ID y DEVICE_KEY, envía las lecturas reales por HTTP y revisa generación, consumo e históricos en el dashboard.
      </div>

      {showForm && (
        <form className="surface-card rounded-[1.75rem] p-6" onSubmit={handleSubmit}>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 shadow-sm">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Registrar fuente IoT</h2>
              <p className="text-sm text-slate-500">Cada dispositivo funciona como cerebro del monitor solar: lee sensores del panel y del consumo, luego envía las mediciones.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="device-name">Nombre</Label>
              <Input
                id="device-name"
                value={form.name}
                placeholder="Ej. ESP32 panel principal"
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="device-model">Modelo</Label>
              <Input
                id="device-model"
                value={form.model ?? ""}
                placeholder="Ej. ESP32 DevKit"
                onChange={(event) => setForm({ ...form, model: event.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="device-type">Tipo</Label>
              <select
                id="device-type"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                value={form.type}
                onChange={(event) => setForm({ ...form, type: event.target.value as DeviceType })}
              >
                <option value="esp32">ESP32</option>
                <option value="raspberry">Raspberry Pi</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm text-emerald-900 shadow-sm">
              <p className="font-bold">Lecturas del monitor</p>
              <p className="mt-1">Este dispositivo puede enviar generación, consumo o ambos según los sensores conectados. La app comparará cambios y guardará históricos.</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="sample-interval">Intervalo de envio en segundos</Label>
              <Input
                id="sample-interval"
                type="number"
                min={1}
                max={3600}
                value={form.sampleIntervalSeconds}
                onChange={(event) => setForm({ ...form, sampleIntervalSeconds: Number(event.target.value) })}
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <Button type="button" variant="outline" className="rounded-2xl" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" className="rounded-2xl" disabled={isSaving}>{isSaving ? "Registrando..." : "Registrar dispositivo"}</Button>
          </div>
        </form>
      )}

      {createdDevice && (
        <section className="surface-card rounded-[1.75rem] border-emerald-200/70 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 shadow-sm">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Clave generada para {createdDevice.name}</h2>
                  <p className="text-sm text-slate-500">
                    Copia estos dos valores en tu código. El DEVICE_KEY solo se muestra una vez por seguridad.
                  </p>
                </div>
              </div>
            </div>
            <Button variant="outline" className="rounded-2xl" onClick={copyGuide}>
              <Copy className="h-4 w-4" />
              Copiar DEVICE_ID y DEVICE_KEY
            </Button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <CredentialCard
              label="DEVICE_ID"
              value={createdDevice.id}
              description="Identifica este ESP32 o Raspberry Pi en la base de datos."
            />
            <CredentialCard
              label="DEVICE_KEY"
              value={createdDevice.ingestion.key}
              description="Clave privada para que el backend acepte lecturas de este dispositivo."
            />
          </div>
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/90 p-4 text-sm text-slate-600">
            <p className="font-bold text-slate-900">Endpoint de envio</p>
            <p className="mt-2 font-mono text-xs text-slate-700">{createdDevice.ingestion.method ?? "POST"} {createdDevice.ingestion.endpoint}</p>
            <p className="mt-3">
              En el código del ESP32 o Raspberry Pi reemplaza <strong>TU_DEVICE_ID</strong> por el DEVICE_ID
              y <strong> TU_DEVICE_KEY</strong> por el DEVICE_KEY. Guarda esta clave ahora: no se vuelve a mostrar.
            </p>
          </div>
        </section>
      )}

      {isLoading ? (
        <section className="grid gap-4 md:grid-cols-2">
          <div className="surface-card h-48 animate-pulse rounded-[1.75rem]" />
          <div className="surface-card h-48 animate-pulse rounded-[1.75rem]" />
        </section>
      ) : (
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <article className="surface-card rounded-[1.75rem] p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Dispositivos registrados</p>
            <p className="mt-2 text-sm text-slate-600">
              Estos dispositivos quedan guardados aunque salgas de esta pantalla. El DEVICE_ID se mantiene visible; el DEVICE_KEY solo aparece al crearlo.
            </p>
            {devices.length ? (
              <div className="mt-5 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white/80">
                {devices.map((device) => (
                  <article key={device.id} className="px-4 py-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-black text-slate-950">{device.name}</p>
                        <p className="text-sm text-slate-500">
                          {device.type === "esp32"
                            ? "ESP32"
                            : device.type === "raspberry"
                              ? "Raspberry Pi"
                              : "Otro dispositivo"}
                          {" "}· Última lectura: {formatLastSeen(device.lastSeen)}
                        </p>
                      </div>
                      <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                        device.status === "online"
                          ? "bg-emerald-50 text-emerald-700"
                          : device.status === "attention"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                      }`}>
                        {device.status === "online" ? "Conectado" : device.status === "attention" ? "Atención" : "Sin conexión"}
                      </span>
                    </div>
                    <div className="mt-3 rounded-xl bg-slate-950 px-3 py-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">DEVICE_ID</p>
                      <p className="mt-1 break-all font-mono text-xs text-emerald-100">{device.id}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Aún no hay dispositivos registrados.</p>
            )}
          </article>

          <article className="surface-card rounded-[1.75rem] p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Clave de ingesta</p>
            <p className="mt-2 text-sm text-slate-600">
              Para conectar tu ESP32 o Raspberry Pi necesitas dos datos: DEVICE_ID y DEVICE_KEY.
              Si perdiste el DEVICE_KEY, registra un dispositivo nuevo y guarda la clave.
            </p>
            {dispositivoActivo ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/90 p-4 text-sm text-slate-600">
                <p className="font-bold text-slate-900">Último dispositivo creado o activo</p>
                <p className="mt-1">{dispositivoActivo.name}</p>
                <p className="mt-3 break-all font-mono text-xs text-slate-700">{dispositivoActivo.id}</p>
              </div>
            ) : null}
            {createdDevice ? (
              <Button variant="outline" className="mt-4 rounded-2xl" onClick={copyGuide}>
                <Copy className="h-4 w-4" />
                Copiar ultimas credenciales generadas
              </Button>
            ) : (
              <Button className="mt-4 rounded-2xl" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" />
                Registrar dispositivo
              </Button>
            )}
          </article>
        </section>
      )}
    </div>
  );
}

function buildDeviceCredentials(device: CreatedDevice) {
  return `DEVICE_ID=${device.id}
DEVICE_KEY=${device.ingestion.key}
HEADER=${device.ingestion.header}
ENDPOINT=${device.ingestion.endpoint}`;
}

function formatLastSeen(value: string | null) {
  return value ? new Date(value).toLocaleString("es-EC") : "Sin lecturas";
}

function CredentialCard({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">{label}</p>
      <p className="mt-3 break-all rounded-xl bg-slate-950 px-3 py-2 font-mono text-sm text-emerald-100">
        {value}
      </p>
      <p className="mt-3 text-xs leading-5 text-slate-500">{description}</p>
    </article>
  );
}
