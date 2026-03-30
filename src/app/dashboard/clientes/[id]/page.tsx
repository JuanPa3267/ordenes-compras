import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getClienteByIdAction, getContactosClienteAction } from "@/actions/clientes.actions";
import { CreateContactoModal } from "./create-contacto-modal";
import { EditContactoModal } from "./edit-contacto-button";
import { ToggleContactoButton } from "./toggle-contacto-button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function ClienteDetallePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    const cliente = await getClienteByIdAction(id);
    
    if (!cliente) {
        notFound();
    }

    const contactos = await getContactosClienteAction(id);

    return (
        <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/clientes">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">{cliente.nombre}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        NIT: {cliente.nit} | {cliente.direccion} {cliente.telefono ? `| Tel: ${cliente.telefono}` : ""}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between mt-8 mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Contactos Asociados</h3>
                <CreateContactoModal idCliente={id} />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre Completo</TableHead>
                            <TableHead>Correo</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Cargo</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contactos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-sm text-gray-500">
                                    No hay contactos registrados para este cliente.
                                </TableCell>
                            </TableRow>
                        ) : (
                            contactos.map((contacto) => (
                                <TableRow key={contacto.id_contacto_cliente}>
                                    <TableCell className="font-medium text-gray-900">{contacto.nombre_completo}</TableCell>
                                    <TableCell className="text-gray-500">{contacto.correo}</TableCell>
                                    <TableCell className="text-gray-500">{contacto.telefono || "N/A"}</TableCell>
                                    <TableCell className="text-gray-500">{contacto.cargo || "N/A"}</TableCell>
                                    <TableCell>
                                        <Badge variant={contacto.activo ? "success" : "destructive" as any} className={contacto.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                            {contacto.activo ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <EditContactoModal contacto={contacto} />
                                        <ToggleContactoButton idContacto={contacto.id_contacto_cliente} idCliente={id} isActive={contacto.activo} />
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
