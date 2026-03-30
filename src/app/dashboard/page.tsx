import Link from "next/link";
import { Plus, Filter, FileText, Eye, Edit, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { OrderActions } from "./order-actions";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const ordenes = await prisma.ordenes_compra.findMany({
        include: {
            clientes: true,
            gerentes_cuenta: true,
            totales_oc: true,
            monedas: true
        },
        orderBy: { fecha_emision: 'desc' },
        take: 50
    });

    const getBadgeVariant = (status: string) => {
        switch (status) {
            case "ENVIADO": return "success";
            case "BORRADOR": return "gray";
            case "CANCELADO": return "destructive";
            default: return "default";
        }
    };

    const formatCurrency = (val: any, cur: string) => {
        try {
            return Number(val).toLocaleString("en-US", { style: "currency", currency: cur.substring(0,3), minimumFractionDigits: 2 });
        } catch(e) {
            return Number(val).toLocaleString("es-MX", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
        }
    };

    return (
        <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Órdenes de Compra</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Gestiona y visualiza todas tus órdenes de compra generadas.
                    </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                    <Link href="/dashboard/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Crear OC
                    </Link>
                </Button>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-gray-50/50">
                    <div className="flex flex-1 items-center gap-2 flex-wrap">
                        <div className="w-full sm:max-w-xs relative text-gray-500">
                            <Input placeholder="Buscar OC o Cliente..." className="h-9 w-full" />
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="hidden sm:flex text-gray-600">
                        <Filter className="mr-2 h-4 w-4" />
                        Filtros
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50/80">
                            <TableRow>
                                <TableHead className="w-[100px]">ID OC</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Gerente</TableHead>
                                <TableHead>Fecha Emisión</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Monto Total</TableHead>
                                <TableHead className="w-[60px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100">
                            {ordenes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-40 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <FileText className="h-10 w-10 text-gray-300 mb-3" />
                                            <p className="text-base font-medium text-gray-900">No hay órdenes creadas</p>
                                            <p className="text-sm mt-1">Comienza agregando una nueva orden de compra.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                ordenes.map((orden) => (
                                    <TableRow key={orden.id_oc.toString()} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell className="font-medium text-gray-900">
                                            OC-{orden.id_oc.toString().padStart(4, '0')}
                                        </TableCell>
                                        <TableCell>
                                            <div className="truncate max-w-[200px] text-gray-900 font-medium whitespace-nowrap">
                                                {orden.clientes.nombre}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate max-w-[200px] whitespace-nowrap mt-0.5">
                                                {orden.descripcion_proyecto}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-500 text-sm whitespace-nowrap">
                                            {orden.gerentes_cuenta.nombre_completo.split(" ")[0]}
                                        </TableCell>
                                        <TableCell className="text-gray-500 text-sm whitespace-nowrap">
                                            {new Date(orden.fecha_emision).toLocaleDateString("es-ES", {
                                                year: "numeric", month: "short", day: "numeric"
                                            })}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <Badge variant={getBadgeVariant(orden.estado) as any} className="text-[10px] uppercase font-bold tracking-wider">
                                                {orden.estado}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-gray-900 whitespace-nowrap">
                                            {formatCurrency(orden.totales_oc?.total || 0, orden.monedas.codigo)}
                                        </TableCell>
                                        <TableCell className="text-right whitespace-nowrap">
                                            <OrderActions ordenId={orden.id_oc.toString()} currentStatus={orden.estado} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
