import { getCurrentUserAction } from "@/actions/auth.actions";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AuditoriaPage() {
    const user = await getCurrentUserAction();

    // Verificamos explícitamente que el usuario exista y esté activo
    if (!user || !user.activo) {
        return (
            <div className="flex-1 p-8 overflow-auto flex items-center justify-center">
                <div className="p-8 max-w-lg w-full bg-red-50 text-red-600 rounded-lg shadow text-center border border-red-200">
                    <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
                    <p>No tienes permiso para ver este módulo o tu cuenta está inactiva.</p>
                </div>
            </div>
        );
    }

    // Consulta de los logs a la base de datos (últimos 100 eventos)
    const logs = await prisma.auditoria_eventos.findMany({
        orderBy: {
            fecha_evento: 'desc'
        },
        include: {
            gerentes_cuenta: {
                select: {
                    nombre_completo: true
                }
            }
        },
        take: 100
    });

    return (
        <div className="flex-1 p-8 overflow-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Registro de Auditoría</h1>
            
            <div className="bg-white rounded-md shadow border border-gray-200 mt-6 overflow-hidden outline-none">
                <div className="overflow-x-auto block">
                    <Table>
                        <TableHeader className="bg-gray-100">
                            <TableRow>
                                <TableHead className="w-48">Fecha</TableHead>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Acción</TableHead>
                                <TableHead>Entidad</TableHead>
                                <TableHead>ID Entidad</TableHead>
                                <TableHead>Detalles</TableHead>
                                <TableHead>IP</TableHead>
                                <TableHead>Navegador</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id_evento.toString()} className="hover:bg-gray-50">
                                    <TableCell className="whitespace-nowrap font-medium text-gray-700">
                                        {new Date(log.fecha_evento).toLocaleString("es-CO")}
                                    </TableCell>
                                    <TableCell className="text-gray-900">
                                        {log.gerentes_cuenta?.nombre_completo || "Desconocido"}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            log.accion.toUpperCase() === 'CREATE' || log.accion.toUpperCase() === 'INSERT' ? 'bg-green-100 text-green-800' :
                                            log.accion.toUpperCase() === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                                            log.accion.toUpperCase() === 'DELETE' ? 'bg-red-100 text-red-800' :
                                            log.accion.toUpperCase() === 'LOGIN' ? 'bg-purple-100 text-purple-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {log.accion}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-gray-600">{log.entidad}</TableCell>
                                    <TableCell className="text-gray-600 font-mono text-xs">{log.entidad_id}</TableCell>
                                    <TableCell className="max-w-[200px] truncate text-gray-500 text-sm" title={log.detalle ? JSON.stringify(log.detalle) : ""}>
                                        {log.detalle ? JSON.stringify(log.detalle) : "-"}
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-400 font-mono">
                                        {log.ip_origen ? log.ip_origen.replace('::ffff:', '') : "-"}
                                    </TableCell>
                                    <TableCell className="max-w-[150px] truncate text-xs text-gray-400" title={log.user_agent || ""}>
                                        {log.user_agent || "-"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                
                {logs.length === 0 && (
                    <div className="p-8 text-center text-gray-500 bg-white">
                        No hay registros de auditoría disponibles en la base de datos.
                    </div>
                )}
            </div>
        </div>
    );
}
