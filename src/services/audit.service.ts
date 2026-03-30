import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export class AuditService {
    /**
     * Registra un evento de auditoría en la base de datos de manera silenciosa (no arroja error para no bloquear la app).
     */
    static async logAction(
        id_gerente: number | bigint,
        accion: string,
        entidad: string,
        entidad_id: string,
        detalle?: any
    ) {
        try {
            const currentHeaders = await headers();
            const ip_origen = currentHeaders.get("x-forwarded-for") || currentHeaders.get("x-real-ip") || null;
            const user_agent = currentHeaders.get("user-agent") || null;

            await prisma.auditoria_eventos.create({
                data: {
                    id_gerente: BigInt(id_gerente),
                    accion: accion.toUpperCase(),
                    entidad: entidad.toUpperCase(),
                    entidad_id: String(entidad_id),
                    detalle: detalle ? JSON.parse(JSON.stringify(detalle, (key, value) =>
                        typeof value === 'bigint' ? value.toString() : value
                    )) : null,
                    ip_origen: ip_origen ? ip_origen.substring(0, 255) : null,
                    user_agent: user_agent ? user_agent.substring(0, 255) : null,
                }
            });
        } catch (error) {
            console.error("[AuditService] Error registrando auditoría:", error);
        }
    }
}
