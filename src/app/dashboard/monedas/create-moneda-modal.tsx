"use client";

import { useState, useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { crearMonedaAction } from "@/actions/monedas.actions";

function CreateMonedaForm({ onSuccess }: { onSuccess: () => void }) {
    const [state, formAction, isPending] = useActionState(crearMonedaAction, { success: false, message: "" });
    
    useEffect(() => {
        if (state.success) onSuccess();
    }, [state.success, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="codigo">Código ISO (Ej. USD, COP, EUR)</Label>
                <Input id="codigo" name="codigo" maxLength={10} required placeholder="USD" className="uppercase" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la Moneda</Label>
                <Input id="nombre" name="nombre" required placeholder="Dólar Estadounidense" />
            </div>
            {state?.message && (
                <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-500'}`}>
                    {state.message}
                </p>
            )}
            <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Guardando..." : "Registrar Moneda"}
            </Button>
        </form>
    );
}

export function CreateMonedaModal() {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <Button onClick={() => setIsOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Crear Moneda
            </Button>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Registrar Moneda" description="Añade una nueva moneda para usar en las órdenes de compra.">
                <CreateMonedaForm onSuccess={() => setTimeout(() => setIsOpen(false), 1500)} />
            </Modal>
        </>
    );
}
