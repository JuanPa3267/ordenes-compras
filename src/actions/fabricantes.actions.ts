"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getFabricantesAction() {
    try {
        const data = await prisma.fabricantes.findMany({
            orderBy: { nombre: 'asc' }
        });
        return data.map(d => ({
            ...d,
            id_fabricante: d.id_fabricante.toString()
        }));
    } catch (error) {
        console.error("Error al obtener fabricantes:", error);
        return [];
    }
}

export async function crearFabricanteAction(prevState: any, formData: FormData) {
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

        const nuevoFab = await prisma.fabricantes.create({
            data: { nombre }
        });
        
        const { AuditService } = await import("@/services/audit.service");
        await AuditService.logAction(currentUser.id_gerente, "CREATE", "fabricantes", nuevoFab.id_fabricante.toString(), { nombre });
        
        revalidatePath("/dashboard/fabricantes");
        return { success: true, message: "Fabricante registrado exitosamente." };
    } catch (error: any) {
        if (error.code === 'P2002') return { success: false, message: "Ya existe un fabricante registrado con ese nombre." };
        return { success: false, message: error.message || "Ocurrió un error al crear." };
    }
}

export async function editarFabricanteAction(prevState: any, formData: FormData) {
    try {
        const { getCurrentUserAction } = await import("@/actions/auth.actions");
        const currentUser = await getCurrentUserAction();
        
        if (!currentUser || !currentUser.activo) {
            return { success: false, message: "Tu cuenta ha sido desactivada." };
        }

        const id_fabricante = formData.get("id_fabricante")?.toString();
        const nombre = formData.get("nombre")?.toString().trim();

        if (!id_fabricante || !nombre) {
            return { success: false, message: "El nombre es obligatorio." };
        }

        await prisma.fabricantes.update({
            where: { id_fabricante: BigInt(id_fabricante) },
            data: { nombre }
        });

        const { AuditService } = await import("@/services/audit.service");
        await AuditService.logAction(currentUser.id_gerente, "UPDATE", "fabricantes", id_fabricante, { nombre });
        
        revalidatePath("/dashboard/fabricantes");
        return { success: true, message: "Fabricante actualizado exitosamente." };
    } catch (error: any) {
        return { success: false, message: error.message || "Ocurrió un error al actualizar." };
    }
}
