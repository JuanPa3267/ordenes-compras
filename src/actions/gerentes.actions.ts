"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getGerentesAction() {
    try {
        const gerentes = await prisma.gerentes_cuenta.findMany({
            orderBy: { nombre_completo: 'asc' },
            select: {
                id_gerente: true,
                nombre_completo: true,
                correo: true,
                cargos: { select: { descripcion: true } },
                activo: true,
            }
        });
        
        // Convert BigInt to string to avoid serialization issues
        return gerentes.map(g => {
            const { cargos, ...rest } = g;
            return {
                ...rest,
                id_gerente: rest.id_gerente.toString(),
                cargo: cargos?.descripcion || "N/A"
            };
        });
    } catch (error) {
        console.error("Error al obtener gerentes:", error);
        return [];
    }
}

export async function toggleGerenteStatusAction(idGerente: string, currentStatus: boolean) {
    try {
        const { getCurrentUserAction } = await import("@/actions/auth.actions");
        const currentUser = await getCurrentUserAction();
        
        if (!currentUser) {
            return { success: false, message: "No autenticado." };
        }
        
        if (!currentUser.activo) {
            return { success: false, message: "Tu cuenta ha sido desactivada. No puedes realizar esta acción." };
        }

        if (currentUser.cargo !== "ADMINISTRADOR") {
            return { success: false, message: "Permisos denegados. Solo un Administrador puede realizar esta acción." };
        }

        await prisma.gerentes_cuenta.update({
            where: { id_gerente: BigInt(idGerente) },
            data: { activo: !currentStatus }
        });
        
        const { AuditService } = await import("@/services/audit.service");
        await AuditService.logAction(currentUser.id_gerente, "UPDATE_ESTADO", "gerentes_cuenta", idGerente, { activo: !currentStatus });
        
        revalidatePath("/dashboard/settings");
        return { success: true, message: "Estado de gerente actualizado." };
    } catch (error: any) {
        console.error("Error al cambiar estado:", error);
        return { success: false, message: error.message || "Ocurrió un error." };
    }
}

export async function getCargosAction() {
    try {
        const cargos = await prisma.cargos.findMany({
            orderBy: { descripcion: 'asc' },
            select: { id_cargo: true, descripcion: true }
        });
        return cargos.map(c => ({ id_cargo: c.id_cargo.toString(), descripcion: c.descripcion }));
    } catch (error) {
        console.error("Error al obtener cargos:", error);
        return [];
    }
}

export async function crearCargoAction(prevState: any, formData: FormData) {
    try {
        const { getCurrentUserAction } = await import("@/actions/auth.actions");
        const currentUser = await getCurrentUserAction();
        
        if (!currentUser || !currentUser.activo || currentUser.cargo !== "ADMINISTRADOR") {
            return { success: false, message: "Permisos denegados." };
        }

        let descripcion = formData.get("descripcion")?.toString().trim();
        if (!descripcion) return { success: false, message: "La descripción es requerida." };
        
        descripcion = descripcion.toUpperCase();

        const nuevoCargo = await prisma.cargos.create({
            data: { descripcion }
        });
        
        const { AuditService } = await import("@/services/audit.service");
        await AuditService.logAction(currentUser.id_gerente, "CREATE", "cargos", nuevoCargo.id_cargo.toString(), { descripcion });
        
        revalidatePath("/dashboard/settings");
        return { success: true, message: "Cargo creado exitosamente." };
    } catch (error: any) {
        return { success: false, message: error.message || "Error al crear cargo." };
    }
}

export async function crearGerenteAction(prevState: any, formData: FormData) {
    try {
        const { getCurrentUserAction } = await import("@/actions/auth.actions");
        const currentUser = await getCurrentUserAction();
        
        if (!currentUser || !currentUser.activo || currentUser.cargo !== "ADMINISTRADOR") {
            return { success: false, message: "Permisos denegados." };
        }

        const nombre = formData.get("nombre")?.toString().trim();
        const correo = formData.get("correo")?.toString().trim().toLowerCase();
        const idCargo = formData.get("idCargo")?.toString();
        const password = formData.get("password")?.toString();
        const confirmPassword = formData.get("confirmPassword")?.toString();

        if (!nombre || !correo || !idCargo || !password || !confirmPassword) {
            return { success: false, message: "Todos los campos son requeridos." };
        }
        
        if (password !== confirmPassword) {
            return { success: false, message: "Las contraseñas no coinciden." };
        }

        const { default: bcrypt } = await import("bcryptjs");
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const nuevoGerente = await prisma.gerentes_cuenta.create({
            data: {
                nombre_completo: nombre,
                correo,
                id_cargo: BigInt(idCargo),
                password: hashedPassword,
                activo: true
            }
        });
        
        const { AuditService } = await import("@/services/audit.service");
        await AuditService.logAction(currentUser.id_gerente, "CREATE", "gerentes_cuenta", nuevoGerente.id_gerente.toString(), { nombre, correo });
        
        revalidatePath("/dashboard/settings");
        return { success: true, message: "Gerente creado exitosamente." };
    } catch (error: any) {
        return { success: false, message: error.message || "Error al crear gerente." };
    }
}
