import { getMonedasAction } from "@/actions/monedas.actions";
import { CreateMonedaModal } from "./create-moneda-modal";
import { EditMonedaModal } from "./edit-moneda-button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default async function MonedasPage() {
    const monedas = await getMonedasAction();

    return (
        <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Catálogo de Monedas</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Consulta y registra las diferentes monedas.
                    </p>
                </div>
                <CreateMonedaModal />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Código ISO</TableHead>
                            <TableHead>Nombre / Descripción</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {monedas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-sm text-gray-500">
                                    No hay monedas registradas.
                                </TableCell>
                            </TableRow>
                        ) : (
                            monedas.map((item) => (
                                <TableRow key={item.id_moneda}>
                                    <TableCell className="font-medium text-gray-500">#{item.id_moneda}</TableCell>
                                    <TableCell className="font-bold text-gray-900">{item.codigo}</TableCell>
                                    <TableCell className="text-gray-900">{item.nombre}</TableCell>
                                    <TableCell className="text-right">
                                        <EditMonedaModal moneda={item} />
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
