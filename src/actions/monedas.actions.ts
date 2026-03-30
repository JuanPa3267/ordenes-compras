"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getMonedasAction() {
    try {
        const data = await prisma.monedas.findMany({
            orderBy: { nombre: 'asc' }
        });
        return data.map(d => ({
            ...d,
            id_moneda: d.id_moneda.toString()
        }));
    } catch (error) {
        console.error("Error al obtener monedas:", error);
        return [];
    }
}

export async function crearMonedaAction(prevState: any, formData: FormData) {
    try {
        const { getCurrentUserAction } = await import("@/actions/auth.actions");
        const currentUser = await getCurrentUserAction();
        
        if (!currentUser || !currentUser.activo) {
            return { success: false, message: "Tu cuenta ha sido desactivada." };
        }

        const codigo = formData.get("codigo")?.toString().trim().toUpperCase();
        const nombre = formData.get("nombre")?.toString().trim();

        if (!codigo || !nombre) {
            return { success: false, message: "El código ISO y nombre son obligatorios." };
        }

        const nuevaMoneda = await prisma.monedas.create({
            data: { codigo, nombre }
        });
        
        const { AuditService } = await import("@/services/audit.service");
        await AuditService.logAction(currentUser.id_gerente, "CREATE", "monedas", nuevaMoneda.id_moneda.toString(), { codigo, nombre });
        
        revalidatePath("/dashboard/monedas");
        return { success: true, message: "Moneda registrada exitosamente." };
    } catch (error: any) {
        if (error.code === 'P2002') return { success: false, message: "Ya existe una moneda registrada con ese código." };
        return { success: false, message: error.message || "Ocurrió un error al crear." };
    }
}

export async function editarMonedaAction(prevState: any, formData: FormData) {
    try {
        const { getCurrentUserAction } = await import("@/actions/auth.actions");
        const currentUser = await getCurrentUserAction();
        
        if (!currentUser || !currentUser.activo) {
            return { success: false, message: "Tu cuenta ha sido desactivada." };
        }

        const id_moneda = formData.get("id_moneda")?.toString();
        const codigo = formData.get("codigo")?.toString().trim().toUpperCase();
        const nombre = formData.get("nombre")?.toString().trim();

        if (!id_moneda || !codigo || !nombre) {
            return { success: false, message: "El código y nombre son obligatorios." };
        }

        await prisma.monedas.update({
            where: { id_moneda: BigInt(id_moneda) },
            data: { codigo, nombre }
        });
        
        const { AuditService } = await import("@/services/audit.service");
        await AuditService.logAction(currentUser.id_gerente, "UPDATE", "monedas", id_moneda, { codigo, nombre });
        
        revalidatePath("/dashboard/monedas");
        return { success: true, message: "Moneda actualizada exitosamente." };
    } catch (error: any) {
        if (error.code === 'P2002') return { success: false, message: "Ya existe otra moneda registrada con ese código." };
        return { success: false, message: error.message || "Ocurrió un error al actualizar." };
    }
}
