import { getTiposItemAction } from "@/actions/items.actions";
import { CreateItemModal } from "./create-item-modal";
import { EditItemModal } from "./edit-item-button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default async function ItemsPage() {
    const items = await getTiposItemAction();

    return (
        <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Catálogo de Ítems</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Consulta y registra los tipos de ítems en el sistema.
                    </p>
                </div>
                <CreateItemModal />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-sm text-gray-500">
                                    No hay ítems registrados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id_tipo_item}>
                                    <TableCell className="font-medium text-gray-500">#{item.id_tipo_item}</TableCell>
                                    <TableCell className="font-medium text-gray-900">{item.nombre}</TableCell>
                                    <TableCell className="text-gray-500">{item.descripcion || "N/A"}</TableCell>
                                    <TableCell className="text-right">
                                        <EditItemModal item={item} />
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
