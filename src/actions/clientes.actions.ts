"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ----------------------
// CLIENTES
// ----------------------

export async function getClientesAction() {
    try {
        const clientes = await prisma.clientes.findMany({
            orderBy: { nombre: 'asc' },
            select: {
                id_cliente: true,
                nit: true,
                nombre: true,
                direccion: true,
                telefono: true,
            }
        });
        
        return clientes.map(c => ({
            ...c,
            id_cliente: c.id_cliente.toString(),
            telefono: c.telefono || ""
        }));
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        return [];
    }
}

export async function getClienteByIdAction(id_cliente: string) {
    try {
        const cliente = await prisma.clientes.findUnique({
            where: { id_cliente: BigInt(id_cliente) }
        });
        
        if (!cliente) return null;
        
        return {
            ...cliente,
            id_cliente: cliente.id_cliente.toString(),
            telefono: cliente.telefono || ""
        };
    } catch (error) {
        console.error("Error al obtener cliente:", error);
        return null;
    }
}

export async function crearClienteAction(prevState: any, formData: FormData) {
    try {
        const { getCurrentUserAction } = await import("@/actions/auth.actions");
        const currentUser = await getCurrentUserAction();
        
        if (!currentUser || !currentUser.activo) {
            return { success: false, message: "Tu cuenta ha sido desactivada. No puedes realizar esta acción." };
        }

        const nit = formData.get("nit")?.toString().trim();
        const nombre = formData.get("nombre")?.toString().trim();
        const direccion = formData.get("direccion")?.toString().trim();
        const telefono = formData.get("telefono")?.toString().trim();

        if (!nit || !nombre || !direccion) {
            return { success: false, message: "Nit, nombre y dirección son requeridos." };
        }

        const nuevoCliente = await prisma.clientes.create({
            data: {
                nit,
                nombre,
                direccion,
                telefono: telefono || null
            }
        });
        
        const { AuditService } = await import("@/services/audit.service");
        await AuditService.logAction(currentUser.id_gerente, "CREATE", "clientes", nuevoCliente.id_cliente.toString(), { nombre, nit });

        revalidatePath("/dashboard/clientes");
        return { success: true, message: "Cliente creado exitosamente." };
    } catch (error: any) {
        // Handle common PG errors like unique constraint on NIT
        if (error.code === 'P2002') return { success: false, message: "Ya existe un cliente con ese NIT." };
        return { success: false, message: error.message || "Error al crear cliente." };
    }
}

// ----------------------
// CONTACTOS
// ----------------------

export async function getContactosClienteAction(id_cliente: string) {
    try {
        const contactos = await prisma.contactos_cliente.findMany({
            where: { id_cliente: BigInt(id_cliente) },
            orderBy: { nombre_completo: 'asc' }
        });
        
        return contactos.map(c => ({
            ...c,
            id_contacto_cliente: c.id_contacto_cliente.toString(),
            id_cliente: c.id_cliente.toString(),
            telefono: c.telefono || "",
            cargo: c.cargo || ""
        }));
    } catch (error) {
        console.error("Error al obtener contactos:", error);
        return [];
    }
}

export async function crearContactoClienteAction(prevState: any, formData: FormData) {
    try {
        const { getCurrentUserAction } = await import("@/actions/auth.actions");
        const currentUser = await getCurrentUserAction();
        
        if (!currentUser || !currentUser.activo) {
            return { success: false, message: "Tu cuenta ha sido desactivada. No puedes realizar esta acción." };
        }

        const id_cliente = formData.get("id_cliente")?.toString();
        const nombre_completo = formData.get("nombre_completo")?.toString().trim();
        const correo = formData.get("correo")?.toString().trim().toLowerCase();
        const telefono = formData.get("telefono")?.toString().trim();
        const cargo = formData.get("cargo")?.toString().trim();

        if (!id_cliente || !nombre_completo || !correo) {
            return { success: false, message: "Nombre y correo son requeridos." };
        }

        const nuevoContacto = await prisma.contactos_cliente.create({
            data: {
                id_cliente: BigInt(id_cliente),
                nombre_completo,
                correo,
                telefono: telefono || null,
                cargo: cargo || null,
                activo: true
            }
        });
        
        const { AuditService } = await import("@/services/audit.service");
        await AuditService.logAction(currentUser.id_gerente, "CREATE", "contactos_cliente", nuevoContacto.id_contacto_cliente.toString(), { nombre: nombre_completo, id_cliente });

        revalidatePath(`/dashboard/clientes/${id_cliente}`);
        return { success: true, message: "Contacto creado exitosamente." };
    } catch (error: any) {
        return { success: false, message: error.message || "Error al crear contacto." };
    }
}

export async function editarContactoClienteAction(prevState: any, formData: FormData) {
    try {
        const { getCurrentUserAction } = await import("@/actions/auth.actions");
        const currentUser = await getCurrentUserAction();
        
        if (!currentUser || !currentUser.activo) {
            return { success: false, message: "Tu cuenta ha sido desactivada. No puedes realizar esta acción." };
        }

        const id_contacto = formData.get("id_contacto")?.toString();
        const id_cliente = formData.get("id_cliente")?.toString(); // Used for revalidation
        const nombre_completo = formData.get("nombre_completo")?.toString().trim();
        const correo = formData.get("correo")?.toString().trim().toLowerCase();
        const telefono = formData.get("telefono")?.toString().trim();
        const cargo = formData.get("cargo")?.toString().trim();

        if (!id_contacto || !nombre_completo || !correo || !id_cliente) {
            return { success: false, message: "Datos incompletos y correo/nombre son requeridos." };
        }

        await prisma.contactos_cliente.update({
            where: { id_contacto_cliente: BigInt(id_contacto) },
            data: {
                nombre_completo,
                correo,
                telefono: telefono || null,
                cargo: cargo || null
            }
        });
        
        const { AuditService } = await import("@/services/audit.service");
        await AuditService.logAction(currentUser.id_gerente, "UPDATE", "contactos_cliente", id_contacto, { nombre: nombre_completo });

        revalidatePath(`/dashboard/clientes/${id_cliente}`);
        return { success: true, message: "Contacto actualizado exitosamente." };
    } catch (error: any) {
        return { success: false, message: error.message || "Error al actualizar contacto." };
    }
}

export async function toggleContactoStatusAction(id_contacto: string, id_cliente: string, currentStatus: boolean) {
    try {
        const { getCurrentUserAction } = await import("@/actions/auth.actions");
        const currentUser = await getCurrentUserAction();
        
        if (!currentUser || !currentUser.activo) {
            return { success: false, message: "Tu cuenta ha sido desactivada." };
        }

        await prisma.contactos_cliente.update({
            where: { id_contacto_cliente: BigInt(id_contacto) },
            data: { activo: !currentStatus }
        });
        
        const { AuditService } = await import("@/services/audit.service");
        await AuditService.logAction(currentUser.id_gerente, "UPDATE_ESTADO", "contactos_cliente", id_contacto, { activo: !currentStatus });

        revalidatePath(`/dashboard/clientes/${id_cliente}`);
        return { success: true, message: `Contacto ${!currentStatus ? 'activado' : 'inactivado'}.` };
    } catch (error: any) {
        return { success: false, message: error.message || "Error al cambiar estado." };
    }
}
