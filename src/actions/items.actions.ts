"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTiposItemAction() {
    try {
        const data = await prisma.tipos_item.findMany({
            orderBy: { nombre: 'asc' }
        });
        return data.map(d => ({
            ...d,
            id_tipo_item: d.id_tipo_item.toString(),
            descripcion: d.descripcion || ""
        }));
    } catch (error) {
        console.error("Error al obtener tipos de ítem:", error);
        return [];
    }
}

export async function crearTipoItemAction(prevState: any, formData: FormData) {
    try {
        const { getCurrentUserAction } = await import("@/actions/auth.actions");
        const currentUser = await getCurrentUserAction();
        
        if (!currentUser || !currentUser.activo) {
            return { success: false, message: "Tu cuenta ha sido desactivada." };
        }

        const nombre = formData.get("nombre")?.toString().trim();
        const descripcion = formData.get("descripcion")?.toString().trim();

        if (!nombre) {
            return { success: false, message: "El nombre es obligatorio." };
        }

        const nuevoTipoItem = await prisma.tipos_item.create({
            data: { 
                nombre,
                descripcion: descripcion || null
            }
        });
        
        const { AuditService } = await import("@/services/audit.service");
        await AuditService.logAction(currentUser.id_gerente, "CREATE", "tipos_item", nuevoTipoItem.id_tipo_item.toString(), { nombre });
        
        revalidatePath("/dashboard/items");
        return { success: true, message: "Tipo de ítem registrado exitosamente." };
    } catch (error: any) {
        if (error.code === 'P2002') return { success: false, message: "Ya existe un tipo de ítem con ese nombre." };
        return { success: false, message: error.message || "Ocurrió un error al crear." };
    }
}

export async function editarTipoItemAction(prevState: any, formData: FormData) {
    try {
        const { getCurrentUserAction } = await import("@/actions/auth.actions");
        const currentUser = await getCurrentUserAction();
        
        if (!currentUser || !currentUser.activo) {
            return { success: false, message: "Tu cuenta ha sido desactivada." };
        }

        const id_tipo_item = formData.get("id_tipo_item")?.toString();
        const nombre = formData.get("nombre")?.toString().trim();
        const descripcion = formData.get("descripcion")?.toString().trim();

        if (!id_tipo_item || !nombre) {
            return { success: false, message: "El nombre es obligatorio." };
        }

        await prisma.tipos_item.update({
            where: { id_tipo_item: BigInt(id_tipo_item) },
            data: { 
                nombre,
                descripcion: descripcion || null
            }
        });
        
        const { AuditService } = await import("@/services/audit.service");
        await AuditService.logAction(currentUser.id_gerente, "UPDATE", "tipos_item", id_tipo_item, { nombre });
        
        revalidatePath("/dashboard/items");
        return { success: true, message: "Ítem actualizado exitosamente." };
    } catch (error: any) {
        return { success: false, message: error.message || "Ocurrió un error al actualizar." };
    }
}
