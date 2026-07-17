import { FormEvent, useState } from "react";
import { Plus, Trash2, UserRound, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useUsers } from "@/hooks/useUsers";
import { api } from "@/services/api";

const initialForm = {
  name: "",
  email: "",
  password: "",
};

export function SettingsPage() {
  const { user: currentUser } = useAuth();
  const { data: users = [], mutate } = useUsers();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string; email: string } | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      toast.error("Completa los datos y usa una contraseña de al menos 6 caracteres");
      return;
    }

    if (users.some((user) => user.email.toLowerCase() === form.email.toLowerCase())) {
      toast.error("Ya existe un usuario con ese correo");
      return;
    }

    setIsSaving(true);
    try {
      await api.createUser(form);
      await mutate();
      setForm(initialForm);
      setShowForm(false);
      toast.success("Usuario creado correctamente");
    } catch {
      toast.error("No se pudo crear el usuario");
    } finally {
      setIsSaving(false);
    }
  };

  const requestDeleteUser = (user: { id: string; name: string; email: string }) => {
    if (user.id === currentUser?.id) {
      toast.error("No puedes eliminar tu propia cuenta mientras estas conectado");
      return;
    }

    setUserToDelete(user);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setDeletingUserId(userToDelete.id);
    try {
      await api.deleteUser(userToDelete.id);
      await mutate();
      setUserToDelete(null);
      toast.success("Usuario eliminado correctamente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar el usuario");
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Administración"
        title="Usuarios"
        description="El administrador únicamente crea cuentas. Los usuarios acceden al monitoreo de consumo y generación."
        action={
          <Button onClick={() => setShowForm((current) => !current)}>
            <Plus className="h-4 w-4" />
            Nuevo usuario
          </Button>
        }
      />

      {showForm && (
        <form className="rounded-2xl border border-slate-200 bg-white p-6" onSubmit={handleSubmit}>
          <h2 className="text-lg font-bold text-slate-900">Crear usuario operativo</h2>
          <p className="mt-1 text-sm text-slate-500">La cuenta tendrá acceso a dashboard, dispositivos y monitoreo.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input id="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="password">Contraseña temporal</Label>
              <Input
                id="password"
                type="password"
                minLength={6}
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? "Creando..." : "Crear usuario"}</Button>
          </div>
        </form>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
          <Users className="h-5 w-5 text-slate-600" />
          <div>
            <h2 className="font-bold text-slate-900">Cuentas registradas</h2>
            <p className="text-sm text-slate-500">{users.length} usuarios registrados en la base de datos</p>
          </div>
        </div>
        <div className="divide-y divide-slate-200">
          {users.map((user) => (
            <article key={user.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-slate-100 p-2.5 text-slate-600">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-fit rounded-full border px-3 py-1 text-xs font-bold uppercase ${
                  user.role === "admin"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                }`}>
                  {user.role === "admin" ? "Administrador" : "Operador"}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-2xl border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                  disabled={deletingUserId === user.id || user.id === currentUser?.id}
                  onClick={() => requestDeleteUser(user)}
                  aria-label={`Eliminar usuario ${user.name}`}
                  title={user.id === currentUser?.id ? "No puedes eliminar tu propia cuenta" : "Eliminar usuario"}
                >
                  <Trash2 className="h-4 w-4" />
                  {deletingUserId === user.id ? "Eliminando..." : "Eliminar"}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {userToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-rose-50 p-3 text-rose-700">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-black text-slate-950">Eliminar cuenta</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Vas a eliminar la cuenta de <strong className="text-slate-950">{userToDelete.name}</strong>.
                  Esta acción no se puede deshacer.
                </p>
                <p className="mt-2 break-all rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-500">
                  {userToDelete.email}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                disabled={deletingUserId === userToDelete.id}
                onClick={() => setUserToDelete(null)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="rounded-2xl bg-rose-600 text-white hover:bg-rose-700"
                disabled={deletingUserId === userToDelete.id}
                onClick={confirmDeleteUser}
              >
                <Trash2 className="h-4 w-4" />
                {deletingUserId === userToDelete.id ? "Eliminando..." : "Eliminar cuenta"}
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
