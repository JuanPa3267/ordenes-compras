"use client";

import { useState, useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2 } from "lucide-react";
import { editarFabricanteAction } from "@/actions/fabricantes.actions";

type FabricanteData = {
    id_fabricante: string;
    nombre: string;
};

export function EditFabricanteModal({ fabricante }: { fabricante: FabricanteData }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setIsOpen(true)} variant="outline" size="sm" className="gap-2 text-gray-700">
                <Edit2 className="h-4 w-4" />
                Editar
            </Button>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Editar Fabricante" description="Actualiza el nombre de este fabricante (marca).">
                <EditFabricanteForm fabricante={fabricante} onSuccess={() => setTimeout(() => setIsOpen(false), 1500)} />
            </Modal>
        </>
    );
}

function EditFabricanteForm({ fabricante, onSuccess }: { fabricante: FabricanteData, onSuccess: () => void }) {
    const [state, formAction, isPending] = useActionState(editarFabricanteAction, { success: false, message: "" });
    
    useEffect(() => {
        if (state.success) onSuccess();
    }, [state.success, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            <input type="hidden" name="id_fabricante" value={fabricante.id_fabricante} />
            <div className="space-y-2">
                <Label htmlFor="nombre">Nombre / Marca</Label>
                <Input id="nombre" name="nombre" defaultValue={fabricante.nombre} required />
            </div>
            {state?.message && (
                <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-500'}`}>
                    {state.message}
                </p>
            )}
            <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Guardando..." : "Actualizar Fabricante"}
            </Button>
        </form>
    );
}
