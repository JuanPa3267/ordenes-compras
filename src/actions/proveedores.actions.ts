"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProveedoresAction() {
    try {
        const proveedores = await prisma.proveedores.findMany({
            orderBy: { nombre: 'asc' }
        });
        return proveedores.map(p => ({
            ...p,
            id_proveedor: p.id_proveedor.toString(),
            correo: p.correo || ""
        }));
    } catch (error) {
        console.error("Error al obtener proveedores:", error);
        return [];
    }
}

export async function crearProveedorAction(prevState: any, formData: FormData) {
    try {
        const { getCurrentUserAction } = await import("@/actions/auth.actions");
        const currentUser = await getCurrentUserAction();
        
        if (!currentUser || !currentUser.activo) {
            return { success: false, message: "Tu cuenta ha sido desactivada. No puedes realizar esta acción." };
        }

        const nombre = formData.get("nombre")?.toString().trim();
        const direccion = formData.get("direccion")?.toString().trim();
        const telefono = formData.get("telefono")?.toString().trim();
        const correo = formData.get("correo")?.toString().trim().toLowerCase();

        if (!nombre || !direccion || !correo) {
            return { success: false, message: "Nombre, dirección y correo electrónico son obligatorios." };
        }

        const nuevoProv = await prisma.proveedores.create({
            data: {
                nombre,
                direccion,
                telefono: telefono || null,
                correo
            }
        });
        
        const { AuditService } = await import("@/services/audit.service");
        await AuditService.logAction(currentUser.id_gerente, "CREATE", "proveedores", nuevoProv.id_proveedor.toString(), { nombre });
        
        revalidatePath("/dashboard/proveedores");
        return { success: true, message: "Proveedor registrado exitosamente." };
    } catch (error: any) {
        if (error.code === 'P2002') return { success: false, message: "Ya existe un proveedor registrado con ese NIT/ID." };
        return { success: false, message: error.message || "Ocurrió un error al crear." };
    }
}

export async function editarProveedorAction(prevState: any, formData: FormData) {
    try {
        const { getCurrentUserAction } = await import("@/actions/auth.actions");
        const currentUser = await getCurrentUserAction();
        
        if (!currentUser || !currentUser.activo) {
            return { success: false, message: "Tu cuenta ha sido desactivada." };
        }

        const id_proveedor = formData.get("id_proveedor")?.toString();
        const nombre = formData.get("nombre")?.toString().trim();
        const direccion = formData.get("direccion")?.toString().trim();
        const telefono = formData.get("telefono")?.toString().trim();
        const correo = formData.get("correo")?.toString().trim().toLowerCase();

        if (!id_proveedor || !nombre || !direccion || !correo) {
            return { success: false, message: "Nombre, dirección y correo electrónico son obligatorios." };
        }

        // @ts-ignore: cached prisma client thinks BigInt is string
        await prisma.proveedores.update({
            where: { id_proveedor: BigInt(id_proveedor) },
            data: {
                nombre,
                direccion,
                telefono: telefono || null,
                correo
            }
        });
        
        const { AuditService } = await import("@/services/audit.service");
        await AuditService.logAction(currentUser.id_gerente, "UPDATE", "proveedores", id_proveedor, { nombre });
        
        revalidatePath("/dashboard/proveedores");
        return { success: true, message: "Proveedor actualizado exitosamente." };
    } catch (error: any) {
        return { success: false, message: error.message || "Ocurrió un error al actualizar." };
    }
}
