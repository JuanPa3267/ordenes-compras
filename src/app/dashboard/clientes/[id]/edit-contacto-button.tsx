"use client";

import { useState, useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2 } from "lucide-react";
import { editarContactoClienteAction } from "@/actions/clientes.actions";

type ContactoData = {
    id_contacto_cliente: string;
    id_cliente: string;
    nombre_completo: string;
    correo: string;
    telefono: string;
    cargo: string;
};

export function EditContactoModal({ contacto }: { contacto: ContactoData }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setIsOpen(true)} variant="outline" size="sm" className="gap-2 text-gray-700">
                <Edit2 className="h-4 w-4" />
                Editar
            </Button>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Editar Contacto" description="Modifica los datos del contacto seleccionado.">
                <EditContactoForm contacto={contacto} onSuccess={() => setTimeout(() => setIsOpen(false), 1500)} />
            </Modal>
        </>
    );
}

function EditContactoForm({ contacto, onSuccess }: { contacto: ContactoData, onSuccess: () => void }) {
    const [state, formAction, isPending] = useActionState(editarContactoClienteAction, { success: false, message: "" });
    
    useEffect(() => {
        if (state.success) onSuccess();
    }, [state.success, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            <input type="hidden" name="id_contacto" value={contacto.id_contacto_cliente} />
            <input type="hidden" name="id_cliente" value={contacto.id_cliente} />
            <div className="space-y-2">
                <Label htmlFor="nombre_completo">Nombre Completo</Label>
                <Input id="nombre_completo" name="nombre_completo" defaultValue={contacto.nombre_completo} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="correo">Correo Electrónico</Label>
                <Input id="correo" name="correo" type="email" defaultValue={contacto.correo} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono (Opcional)</Label>
                <Input id="telefono" name="telefono" defaultValue={contacto.telefono} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="cargo">Cargo (Opcional)</Label>
                <Input id="cargo" name="cargo" defaultValue={contacto.cargo} />
            </div>
            {state?.message && (
                <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-500'}`}>
                    {state.message}
                </p>
            )}
            <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Guardando..." : "Actualizar Contacto"}
            </Button>
        </form>
    );
}
