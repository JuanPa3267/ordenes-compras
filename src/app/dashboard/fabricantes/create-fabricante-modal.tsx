"use client";

import { useState, useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { crearFabricanteAction } from "@/actions/fabricantes.actions";

function CreateFabricanteForm({ onSuccess }: { onSuccess: () => void }) {
    const [state, formAction, isPending] = useActionState(crearFabricanteAction, { success: false, message: "" });
    
    useEffect(() => {
        if (state.success) onSuccess();
    }, [state.success, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Fabricante</Label>
                <Input id="nombre" name="nombre" required />
            </div>
            {state?.message && (
                <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-500'}`}>
                    {state.message}
                </p>
            )}
            <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Guardando..." : "Registrar Fabricante"}
            </Button>
        </form>
    );
}

export function CreateFabricanteModal() {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <Button onClick={() => setIsOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Crear Fabricante
            </Button>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Registrar Fabricante" description="Añade un nuevo fabricante al sistema.">
                <CreateFabricanteForm onSuccess={() => setTimeout(() => setIsOpen(false), 1500)} />
            </Modal>
        </>
    );
}
