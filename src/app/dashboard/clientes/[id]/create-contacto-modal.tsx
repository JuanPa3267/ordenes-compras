"use client";

import { useState, useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { crearContactoClienteAction } from "@/actions/clientes.actions";

export function CreateContactoModal({ idCliente }: { idCliente: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setIsOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Agregar Contacto
            </Button>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Agregar Contacto" description="Asocia un nuevo contacto a este cliente.">
                <CreateContactoForm idCliente={idCliente} onSuccess={() => setTimeout(() => setIsOpen(false), 1500)} />
            </Modal>
        </>
    );
}

function CreateContactoForm({ idCliente, onSuccess }: { idCliente: string, onSuccess: () => void }) {
    const [state, formAction, isPending] = useActionState(crearContactoClienteAction, { success: false, message: "" });
    
    useEffect(() => {
        if (state.success) onSuccess();
    }, [state.success, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            <input type="hidden" name="id_cliente" value={idCliente} />
            <div className="space-y-2">
                <Label htmlFor="nombre_completo">Nombre Completo</Label>
                <Input id="nombre_completo" name="nombre_completo" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="correo">Correo Electrónico</Label>
                <Input id="correo" name="correo" type="email" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono (Opcional)</Label>
                <Input id="telefono" name="telefono" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="cargo">Cargo (Opcional)</Label>
                <Input id="cargo" name="cargo" placeholder="Ej. Comprador TI" />
            </div>
            {state?.message && (
                <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-500'}`}>
                    {state.message}
                </p>
            )}
            <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Guardando..." : "Crear Contacto"}
            </Button>
        </form>
    );
}
