"use client";

import { useState, useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { crearTipoItemAction } from "@/actions/items.actions";

function CreateItemForm({ onSuccess }: { onSuccess: () => void }) {
    const [state, formAction, isPending] = useActionState(crearTipoItemAction, { success: false, message: "" });
    
    useEffect(() => {
        if (state.success) onSuccess();
    }, [state.success, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Ítem</Label>
                <Input id="nombre" name="nombre" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción (Opcional)</Label>
                <Input id="descripcion" name="descripcion" />
            </div>
            {state?.message && (
                <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-500'}`}>
                    {state.message}
                </p>
            )}
            <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Guardando..." : "Registrar Ítem"}
            </Button>
        </form>
    );
}

export function CreateItemModal() {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <Button onClick={() => setIsOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Crear Ítem
            </Button>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Registrar Ítem" description="Añade un nuevo tipo de ítem al catálogo.">
                <CreateItemForm onSuccess={() => setTimeout(() => setIsOpen(false), 1500)} />
            </Modal>
        </>
    );
}
