"use client";

import { useState, useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { crearProveedorAction } from "@/actions/proveedores.actions";

function CreateProveedorForm({ onSuccess }: { onSuccess: () => void }) {
    const [state, formAction, isPending] = useActionState(crearProveedorAction, { success: false, message: "" });
    
    useEffect(() => {
        if (state.success) onSuccess();
    }, [state.success, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="nombre">Razón Social o Nombre</Label>
                <Input id="nombre" name="nombre" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="direccion">Dirección Física</Label>
                <Input id="direccion" name="direccion" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono (Opcional)</Label>
                <Input id="telefono" name="telefono" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="correo">Correo Electrónico</Label>
                <Input id="correo" name="correo" type="email" required />
            </div>
            {state?.message && (
                <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-500'}`}>
                    {state.message}
                </p>
            )}
            <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Guardando..." : "Registrar Proveedor"}
            </Button>
        </form>
    );
}

export function CreateProveedorModal() {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <Button onClick={() => setIsOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Crear Proveedor
            </Button>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Registrar Proveedor" description="Añade un nuevo proveedor al catálogo del sistema.">
                <CreateProveedorForm onSuccess={() => setTimeout(() => setIsOpen(false), 1500)} />
            </Modal>
        </>
    );
}
