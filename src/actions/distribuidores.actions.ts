"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getDistribuidoresAction() {
    try {
        const data = await prisma.distribuidores.findMany({
            orderBy: { nombre: 'asc' }
        });
        return data.map(d => ({
            ...d,
            id_distribuidor: d.id_distribuidor.toString()
        }));
    } catch (error) {
        console.error("Error al obtener distribuidores:", error);
        return [];
    }
}

export async function crearDistribuidorAction(prevState: any, formData: FormData) {
    try {
        const { getCurrentUserAction } = await import("@/actions/auth.actions");
        const currentUser = await getCurrentUserAction();
        
        if (!currentUser || !currentUser.activo) {
            return { success: false, message: "Tu cuenta ha sido desactivada." };
        }

        const nombre = formData.get("nombre")?.toString().trim();

        if (!nombre) {
            return { success: false, message: "El nombre es obligatorio." };
        }

        const nuevoDist = await prisma.distribuidores.create({
            data: { nombre }
        });
        
        const { AuditService } = await import("@/services/audit.service");
        await AuditService.logAction(currentUser.id_gerente, "CREATE", "distribuidores", nuevoDist.id_distribuidor.toString(), { nombre });
        
        revalidatePath("/dashboard/distribuidores");
        return { success: true, message: "Distribuidor registrado exitosamente." };
    } catch (error: any) {
        if (error.code === 'P2002') return { success: false, message: "Ya existe un distribuidor registrado con ese nombre." };
        return { success: false, message: error.message || "Ocurrió un error al crear." };
    }
}

export async function editarDistribuidorAction(prevState: any, formData: FormData) {
    try {
        const { getCurrentUserAction } = await import("@/actions/auth.actions");
        const currentUser = await getCurrentUserAction();
        
        if (!currentUser || !currentUser.activo) {
            return { success: false, message: "Tu cuenta ha sido desactivada." };
        }

        const id_distribuidor = formData.get("id_distribuidor")?.toString();
        const nombre = formData.get("nombre")?.toString().trim();

        if (!id_distribuidor || !nombre) {
            return { success: false, message: "El nombre es obligatorio." };
        }

        await prisma.distribuidores.update({
            where: { id_distribuidor: BigInt(id_distribuidor) },
            data: { nombre }
        });
        
        const { AuditService } = await import("@/services/audit.service");
        await AuditService.logAction(currentUser.id_gerente, "UPDATE", "distribuidores", id_distribuidor, { nombre });
        
        revalidatePath("/dashboard/distribuidores");
        return { success: true, message: "Distribuidor actualizado exitosamente." };
    } catch (error: any) {
        return { success: false, message: error.message || "Ocurrió un error al actualizar." };
    }
}
