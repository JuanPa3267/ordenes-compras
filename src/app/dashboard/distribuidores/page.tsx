import { getDistribuidoresAction } from "@/actions/distribuidores.actions";
import { CreateDistribuidorModal } from "./create-distribuidor-modal";
import { EditDistribuidorModal } from "./edit-distribuidor-button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default async function DistribuidoresPage() {
    const distribuidores = await getDistribuidoresAction();

    return (
        <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Catálogo de Distribuidores</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Consulta y registra los distribuidores autorizados en el sistema.
                    </p>
                </div>
                <CreateDistribuidorModal />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {distribuidores.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={2} className="h-24 text-center text-sm text-gray-500">
                                    No hay distribuidores registrados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            distribuidores.map((item) => (
                                <TableRow key={item.id_distribuidor}>
                                    <TableCell className="font-medium text-gray-500">#{item.id_distribuidor}</TableCell>
                                    <TableCell className="font-medium text-gray-900">{item.nombre}</TableCell>
                                    <TableCell className="text-right">
                                        <EditDistribuidorModal distribuidor={item} />
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
