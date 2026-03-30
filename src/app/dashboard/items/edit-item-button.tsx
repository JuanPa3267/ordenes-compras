"use client";

import { useState, useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2 } from "lucide-react";
import { editarTipoItemAction } from "@/actions/items.actions";

type ItemData = {
    id_tipo_item: string;
    nombre: string;
    descripcion: string;
};

export function EditItemModal({ item }: { item: ItemData }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setIsOpen(true)} variant="outline" size="sm" className="gap-2 text-gray-700">
                <Edit2 className="h-4 w-4" />
                Editar
            </Button>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Editar Ítem" description="Actualiza los datos del tipo de ítem seleccionado.">
                <EditItemForm item={item} onSuccess={() => setTimeout(() => setIsOpen(false), 1500)} />
            </Modal>
        </>
    );
}

function EditItemForm({ item, onSuccess }: { item: ItemData, onSuccess: () => void }) {
    const [state, formAction, isPending] = useActionState(editarTipoItemAction, { success: false, message: "" });
    
    useEffect(() => {
        if (state.success) onSuccess();
    }, [state.success, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            <input type="hidden" name="id_tipo_item" value={item.id_tipo_item} />
            <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Ítem</Label>
                <Input id="nombre" name="nombre" defaultValue={item.nombre} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción (Opcional)</Label>
                <Input id="descripcion" name="descripcion" defaultValue={item.descripcion} />
            </div>
            {state?.message && (
                <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-500'}`}>
                    {state.message}
                </p>
            )}
            <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Guardando..." : "Actualizar Ítem"}
            </Button>
        </form>
    );
}
