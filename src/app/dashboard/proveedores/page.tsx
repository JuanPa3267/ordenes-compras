import { getProveedoresAction } from "@/actions/proveedores.actions";
import { CreateProveedorModal } from "./create-proveedor-modal";
import { EditProveedorModal } from "./edit-proveedor-button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default async function ProveedoresPage() {
    const proveedores = await getProveedoresAction();

    return (
        <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Catálogo de Proveedores</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Consulta y registra los proveedores autorizados del sistema.
                    </p>
                </div>
                <CreateProveedorModal />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Nombre / Razón Social</TableHead>
                            <TableHead>Dirección</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Correo</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {proveedores.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-sm text-gray-500">
                                    No hay proveedores registrados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            proveedores.map((proveedor) => (
                                <TableRow key={proveedor.id_proveedor}>
                                    <TableCell className="font-medium text-gray-500">#{proveedor.id_proveedor}</TableCell>
                                    <TableCell>{proveedor.nombre}</TableCell>
                                    <TableCell className="text-gray-500">{proveedor.direccion}</TableCell>
                                    <TableCell className="text-gray-500">{proveedor.telefono || "N/A"}</TableCell>
                                    <TableCell className="text-gray-500">{proveedor.correo || "N/A"}</TableCell>
                                    <TableCell className="text-right">
                                        <EditProveedorModal proveedor={proveedor} />
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
