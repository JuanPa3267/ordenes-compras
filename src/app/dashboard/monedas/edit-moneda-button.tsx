"use client";

import { useState, useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2 } from "lucide-react";
import { editarMonedaAction } from "@/actions/monedas.actions";

type MonedaData = {
    id_moneda: string;
    codigo: string;
    nombre: string;
};

export function EditMonedaModal({ moneda }: { moneda: MonedaData }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setIsOpen(true)} variant="outline" size="sm" className="gap-2 text-gray-700">
                <Edit2 className="h-4 w-4" />
                Editar
            </Button>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Editar Moneda" description="Actualiza los datos de la moneda seleccionada.">
                <EditMonedaForm moneda={moneda} onSuccess={() => setTimeout(() => setIsOpen(false), 1500)} />
            </Modal>
        </>
    );
}

function EditMonedaForm({ moneda, onSuccess }: { moneda: MonedaData, onSuccess: () => void }) {
    const [state, formAction, isPending] = useActionState(editarMonedaAction, { success: false, message: "" });
    
    useEffect(() => {
        if (state.success) onSuccess();
    }, [state.success, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            <input type="hidden" name="id_moneda" value={moneda.id_moneda} />
            <div className="space-y-2">
                <Label htmlFor="codigo">Código ISO (Ej. USD, COP, EUR)</Label>
                <Input id="codigo" name="codigo" defaultValue={moneda.codigo} maxLength={10} required className="uppercase" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la Moneda</Label>
                <Input id="nombre" name="nombre" defaultValue={moneda.nombre} required />
            </div>
            {state?.message && (
                <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-500'}`}>
                    {state.message}
                </p>
            )}
            <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Guardando..." : "Actualizar Moneda"}
            </Button>
        </form>
    );
}
