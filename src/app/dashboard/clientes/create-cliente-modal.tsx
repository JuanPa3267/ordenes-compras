"use client";

import { useState, useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { crearClienteAction } from "@/actions/clientes.actions";

function CreateClienteForm({ onSuccess }: { onSuccess: () => void }) {
    const [state, formAction, isPending] = useActionState(crearClienteAction, { success: false, message: "" });
    
    useEffect(() => {
        if (state.success) onSuccess();
    }, [state.success, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="nit">NIT</Label>
                <Input id="nit" name="nit" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="nombre">Razón Social</Label>
                <Input id="nombre" name="nombre" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input id="direccion" name="direccion" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" name="telefono" />
            </div>
            {state?.message && (
                <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-500'}`}>
                    {state.message}
                </p>
            )}
            <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Guardando..." : "Crear Cliente"}
            </Button>
        </form>
    );
}

export function CreateClienteModal() {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <Button onClick={() => setIsOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Crear Cliente
            </Button>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Crear Cliente" description="Añade un nuevo cliente a la base de datos.">
                <CreateClienteForm onSuccess={() => setTimeout(() => setIsOpen(false), 1500)} />
            </Modal>
        </>
    );
}
