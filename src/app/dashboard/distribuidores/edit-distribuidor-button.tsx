"use client";

import { useState, useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2 } from "lucide-react";
import { editarDistribuidorAction } from "@/actions/distribuidores.actions";

type DistribuidorData = {
    id_distribuidor: string;
    nombre: string;
};

export function EditDistribuidorModal({ distribuidor }: { distribuidor: DistribuidorData }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setIsOpen(true)} variant="outline" size="sm" className="gap-2 text-gray-700">
                <Edit2 className="h-4 w-4" />
                Editar
            </Button>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Editar Distribuidor" description="Actualiza el nombre del distribuidor seleccionado.">
                <EditDistribuidorForm distribuidor={distribuidor} onSuccess={() => setTimeout(() => setIsOpen(false), 1500)} />
            </Modal>
        </>
    );
}

function EditDistribuidorForm({ distribuidor, onSuccess }: { distribuidor: DistribuidorData, onSuccess: () => void }) {
    const [state, formAction, isPending] = useActionState(editarDistribuidorAction, { success: false, message: "" });
    
    useEffect(() => {
        if (state.success) onSuccess();
    }, [state.success, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            <input type="hidden" name="id_distribuidor" value={distribuidor.id_distribuidor} />
            <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Distribuidor</Label>
                <Input id="nombre" name="nombre" defaultValue={distribuidor.nombre} required />
            </div>
            {state?.message && (
                <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-500'}`}>
                    {state.message}
                </p>
            )}
            <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Guardando..." : "Actualizar Distribuidor"}
            </Button>
        </form>
    );
}
