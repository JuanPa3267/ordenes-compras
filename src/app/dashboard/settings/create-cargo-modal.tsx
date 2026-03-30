"use client";

import { useState, useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { crearCargoAction } from "@/actions/gerentes.actions";

function CreateCargoForm({ onSuccess }: { onSuccess: () => void }) {
    const [state, formAction, isPending] = useActionState(crearCargoAction, { success: false, message: "" });
    
    useEffect(() => {
        if (state.success) onSuccess();
    }, [state.success, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción del Cargo</Label>
                <Input id="descripcion" name="descripcion" placeholder="Ej. VENTAS" required />
            </div>
            {state?.message && (
                <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-500'}`}>
                    {state.message}
                </p>
            )}
            <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Guardando..." : "Crear Cargo"}
            </Button>
        </form>
    );
}

export function CreateCargoModal() {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <Button onClick={() => setIsOpen(true)} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Crear Cargo
            </Button>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Crear Cargo" description="Añade un nuevo cargo al sistema.">
                <CreateCargoForm onSuccess={() => setTimeout(() => setIsOpen(false), 1500)} />
            </Modal>
        </>
    );
}
