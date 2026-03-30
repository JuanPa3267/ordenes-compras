"use client";

import { useState, useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2 } from "lucide-react";
import { editarProveedorAction } from "@/actions/proveedores.actions";

type ProveedorData = {
    id_proveedor: string;
    nombre: string;
    direccion: string;
    telefono: string | null;
    correo: string;
};

export function EditProveedorModal({ proveedor }: { proveedor: ProveedorData }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setIsOpen(true)} variant="outline" size="sm" className="gap-2 text-gray-700">
                <Edit2 className="h-4 w-4" />
                Editar
            </Button>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Editar Proveedor" description="Actualiza los datos del proveedor seleccionado.">
                <EditProveedorForm proveedor={proveedor} onSuccess={() => setTimeout(() => setIsOpen(false), 1500)} />
            </Modal>
        </>
    );
}

function EditProveedorForm({ proveedor, onSuccess }: { proveedor: ProveedorData, onSuccess: () => void }) {
    const [state, formAction, isPending] = useActionState(editarProveedorAction, { success: false, message: "" });
    
    useEffect(() => {
        if (state.success) onSuccess();
    }, [state.success, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            <input type="hidden" name="id_proveedor" value={proveedor.id_proveedor} />
            <div className="space-y-2">
                <Label htmlFor="nombre">Razón Social o Nombre</Label>
                <Input id="nombre" name="nombre" defaultValue={proveedor.nombre} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="direccion">Dirección Física</Label>
                <Input id="direccion" name="direccion" defaultValue={proveedor.direccion} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono (Opcional)</Label>
                <Input id="telefono" name="telefono" defaultValue={proveedor.telefono || ""} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="correo">Correo Electrónico</Label>
                <Input id="correo" name="correo" type="email" defaultValue={proveedor.correo} required />
            </div>
            {state?.message && (
                <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-500'}`}>
                    {state.message}
                </p>
            )}
            <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Guardando..." : "Actualizar Proveedor"}
            </Button>
        </form>
    );
}
