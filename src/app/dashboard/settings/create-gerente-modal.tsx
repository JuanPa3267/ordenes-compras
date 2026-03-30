"use client";

import { useState, useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { crearGerenteAction } from "@/actions/gerentes.actions";

function CreateGerenteForm({ cargos, onSuccess }: { cargos: {id_cargo: string, descripcion: string}[], onSuccess: () => void }) {
    const [state, formAction, isPending] = useActionState(crearGerenteAction, { success: false, message: "" });

    useEffect(() => {
        if (state.success) onSuccess();
    }, [state.success, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input id="nombre" name="nombre" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="correo">Correo Electrónico</Label>
                <Input id="correo" name="correo" type="email" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="idCargo">Cargo</Label>
                <select id="idCargo" name="idCargo" className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" required>
                    <option value="">Selecciona un cargo</option>
                    {cargos.map(c => (
                        <option key={c.id_cargo} value={c.id_cargo}>{c.descripcion}</option>
                    ))}
                </select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" name="password" type="password" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" required />
            </div>
            {state?.message && (
                <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-500'}`}>
                    {state.message}
                </p>
            )}
            <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Guardando..." : "Crear Gerente"}
            </Button>
        </form>
    );
}

export function CreateGerenteModal({ cargos }: { cargos: {id_cargo: string, descripcion: string}[] }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <Button onClick={() => setIsOpen(true)} variant="outline" className="gap-2 text-blue-600 border-blue-200">
                <Plus className="h-4 w-4" />
                Crear Gerente
            </Button>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Crear Gerente" description="Registra un nuevo gerente de cuenta en el sistema.">
                <CreateGerenteForm cargos={cargos} onSuccess={() => setTimeout(() => setIsOpen(false), 1500)} />
            </Modal>
        </>
    );
}
