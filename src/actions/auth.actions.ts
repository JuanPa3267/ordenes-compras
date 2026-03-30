"use server";

import { cookies } from "next/headers";
import { AuthService } from "@/services/auth.service";

export type ActionResponse = {
    success: boolean;
    message: string;
};

export async function loginAction(
    prevState: ActionResponse,
    formData: FormData
): Promise<ActionResponse> {
    let email = formData.get("email")?.toString() || "";
    const password = formData.get("password")?.toString();

    if (!email || !password) {
        return {
            success: false,
            message: "Por favor, completa todos los campos.",
        };
    }

    // Formatting constraints on email: remove spaces and enforce lowercase
    email = email.replace(/\s+/g, "").toLowerCase();

    try {
        // 1. Authenticate via Service layer
        const user = await AuthService.authenticateUser(email, password);

        // 2. Create session (Simplified for now using a cookie)
        // In a real production app, you would create a JWT token or a Session ID in DB
        const cookieStore = await cookies();

        // We store the user ID in a generic session cookie
        cookieStore.set("session_token", user.id_gerente.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/",
            sameSite: "lax",
        });

        return {
            success: true,
            message: "Inicio de sesión exitoso",
        };
    } catch (error: any) {
        // Return the error message safely to the client
        return {
            success: false,
            message: error.message || "Ocurrió un error al iniciar sesión.",
        };
    }
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete("session_token");
}

export async function getCurrentUserAction() {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
        return null;
    }

    try {
        const userId = parseInt(token);
        // Note: Prisma should be imported if not already. Let's check imports. Wait, it's not imported here yet. Let's use the AuthService or import Prisma directly.
        // It's safer to import prisma.
        const { default: prisma } = await import("@/lib/prisma");

        const user = await prisma.gerentes_cuenta.findUnique({
            where: { id_gerente: userId },
            select: { 
                nombre_completo: true, 
                correo: true,
                activo: true,
                cargos: { select: { descripcion: true } }
            },
        });

        if (!user) return null;

        return {
            id_gerente: userId,
            nombre_completo: user.nombre_completo,
            correo: user.correo,
            cargo: user.cargos?.descripcion || "N/A",
            activo: user.activo
        };
    } catch (error) {
        console.error("Error getting current user:", error);
        return null;
    }
}

export async function changePasswordAction(
    prevState: ActionResponse,
    formData: FormData
): Promise<ActionResponse> {
    const currentPassword = formData.get("currentPassword")?.toString();
    const newPassword = formData.get("newPassword")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { success: false, message: "Todos los campos son obligatorios." };
    }

    if (newPassword !== confirmPassword) {
        return { success: false, message: "Las contraseñas nuevas no coinciden." };
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
        return { success: false, message: "No hay sesión activa." };
    }

    try {
        const userId = parseInt(token);
        const { default: prisma } = await import("@/lib/prisma");

        const user = await prisma.gerentes_cuenta.findUnique({
            where: { id_gerente: userId },
        });

        if (!user || !user.password) {
            return { success: false, message: "Usuario no encontrado o sin contraseña." };
        }

        if (!user.activo) {
            return { success: false, message: "Tu cuenta ha sido desactivada. No puedes realizar esta acción." };
        }

        const { default: bcrypt } = await import("bcryptjs");

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return { success: false, message: "La contraseña actual es incorrecta." };
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        await prisma.gerentes_cuenta.update({
            where: { id_gerente: userId },
            data: { password: hashedPassword }
        });

        const { AuditService } = await import("@/services/audit.service");
        await AuditService.logAction(userId, "PASSWORD_CHANGE", "gerentes_cuenta", userId.toString(), "Contraseña actualizada por el usuario");

        return { success: true, message: "Contraseña actualizada exitosamente." };
    } catch (error: any) {
        return { success: false, message: "Ocurrió un error al actualizar la contraseña." };
    }
}
