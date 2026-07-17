import { CloudSun, Gauge, ThermometerSun, Wind } from "lucide-react";

const futureItems = [
  {
    icon: ThermometerSun,
    title: "Temperatura y humedad",
    description: "Variables ambientales para relacionar el clima y el rendimiento fotovoltaico.",
  },
  {
    icon: Gauge,
    title: "Irradiancia solar",
    description: "Medición futura para comparar la radiación disponible con la generación real.",
  },
  {
    icon: Wind,
    title: "Viento y condiciones externas",
    description: "Datos de apoyo para el análisis técnico del entorno del sistema.",
  },
];

export function WeatherStationPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="surface-card overflow-hidden rounded-[1.75rem] p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-700">Módulo futuro</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
              Estación meteorológica
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              Este apartado queda preparado para documentar una futura integracion meteorologica.
              En esta versión no consulta el backend, no registra mediciones y no procesa datos climáticos.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/80 p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-[0_16px_34px_rgba(16,185,129,0.22)]">
              <CloudSun className="h-7 w-7" />
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Estado</p>
            <p className="mt-2 text-2xl font-black text-slate-950">Pendiente</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Sin endpoint activo. Sin ingesta meteorologica implementada.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {futureItems.map((item) => (
          <article key={item.title} className="surface-card rounded-[1.5rem] p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <item.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-black text-slate-950">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="surface-card rounded-[1.75rem] p-6">
        <h2 className="text-lg font-black text-slate-950">Alcance definido para esta versión</h2>
        <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-600 md:grid-cols-2">
          <p className="rounded-2xl border border-slate-200 bg-white/80 p-4">
            La aplicación principal sigue centrada en generación, consumo, balance, históricos y dispositivos IoT.
          </p>
          <p className="rounded-2xl border border-slate-200 bg-white/80 p-4">
            La estación meteorológica se mantiene como extensión futura para la tesis, sin funcionamiento backend en esta entrega.
          </p>
        </div>
      </section>
    </div>
  );
}
