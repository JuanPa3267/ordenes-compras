"use client";

import { Eye, Edit, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateEstadoOrdenAction } from "@/actions/crear-orden.actions";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";

export function OrderActions({ ordenId, currentStatus }: { ordenId: string, currentStatus: string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isStatusModalOpen, setStatusModalOpen] = useState(false);
    const [newStatus, setNewStatus] = useState<"BORRADOR" | "ENVIADO" | "CANCELADO">(currentStatus as any);

    const handleView = () => router.push(`/dashboard/view/${ordenId}`);
    const handleEdit = () => router.push(`/dashboard/edit/${ordenId}`);

    const handleChangeStatus = () => {
        startTransition(async () => {
            const res = await updateEstadoOrdenAction(ordenId, newStatus);
            if (res.success) {
                toast.success(res.message);
                setStatusModalOpen(false);
                router.refresh(); // Refresh page data to grab new status
            } else {
                toast.error(res.message);
            }
        });
    };

    return (
        <>
            <div className="flex items-center justify-end gap-1">
                <Button onClick={handleView} variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                    <Eye className="h-4 w-4 mr-1" /> Ver
                </Button>
                <Button onClick={handleEdit} variant="ghost" size="sm" className="h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                    <Edit className="h-4 w-4 mr-1" /> Editar
                </Button>
                <Button onClick={() => setStatusModalOpen(true)} variant="ghost" size="sm" className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50">
                    <Activity className="h-4 w-4 mr-1" /> Estado
                </Button>
            </div>

            <Modal isOpen={isStatusModalOpen} onClose={() => setStatusModalOpen(false)} title={`Cambiar Estado (OC-${ordenId.padStart(4, '0')})`}>
                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Nuevo Estado:</label>
                        <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value as any)}>
                            <option value="BORRADOR">Borrador</option>
                            <option value="ENVIADO">Enviado</option>
                            <option value="CANCELADO">Cancelado</option>
                        </Select>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setStatusModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleChangeStatus} disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {isPending ? "Guardando..." : "Guardar Estado"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
