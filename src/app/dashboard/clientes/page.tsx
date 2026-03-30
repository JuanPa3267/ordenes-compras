import Link from "next/link";
import { getClientesAction } from "@/actions/clientes.actions";
import { CreateClienteModal } from "./create-cliente-modal";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default async function ClientesPage() {
    const clientes = await getClientesAction();

    return (
        <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Directorio de Clientes</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Gestiona los clientes y sus contactos asociados.
                    </p>
                </div>
                <CreateClienteModal />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>NIT</TableHead>
                            <TableHead>Razón Social</TableHead>
                            <TableHead>Dirección</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clientes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-sm text-gray-500">
                                    No hay clientes registrados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            clientes.map((cliente) => (
                                <TableRow key={cliente.id_cliente}>
                                    <TableCell className="font-medium text-gray-900">{cliente.nit}</TableCell>
                                    <TableCell>{cliente.nombre}</TableCell>
                                    <TableCell className="text-gray-500">{cliente.direccion}</TableCell>
                                    <TableCell className="text-gray-500">{cliente.telefono || "N/A"}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/dashboard/clientes/${cliente.id_cliente}`}>
                                                Ver y Añadir Contactos
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
