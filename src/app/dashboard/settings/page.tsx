import { getGerentesAction, getCargosAction } from "@/actions/gerentes.actions";
import { getCurrentUserAction } from "@/actions/auth.actions";
import { ToggleGerenteButton } from "./toggle-button";
import { ChangePasswordModal } from "./change-password-modal";
import { CreateCargoModal } from "./create-cargo-modal";
import { CreateGerenteModal } from "./create-gerente-modal";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default async function SettingsPage() {
    const gerentes = await getGerentesAction();
    const currentUser = await getCurrentUserAction();
    const cargos = await getCargosAction();
    const isAdmin = currentUser?.cargo === "ADMINISTRADOR";

    return (
        <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Configuración de Gerentes</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Visualiza y administra el acceso de los gerentes de cuenta en el sistema.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <ChangePasswordModal />
                    {isAdmin && (
                        <>
                            <CreateCargoModal />
                            <CreateGerenteModal cargos={cargos} />
                        </>
                    )}
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre Completo</TableHead>
                            <TableHead>Correo Electrónico</TableHead>
                            <TableHead>Cargo</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {gerentes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-sm text-gray-500">
                                    No hay gerentes registrados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            gerentes.map((gerente) => (
                                <TableRow key={gerente.id_gerente}>
                                    <TableCell className="font-medium text-gray-900">{gerente.nombre_completo}</TableCell>
                                    <TableCell className="text-gray-500">{gerente.correo}</TableCell>
                                    <TableCell className="text-gray-500">{gerente.cargo}</TableCell>
                                    <TableCell>
                                        <Badge variant={gerente.activo ? "success" : "destructive" as any} className={gerente.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                            {gerente.activo ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ToggleGerenteButton idGerente={gerente.id_gerente} isActive={gerente.activo} isAdmin={isAdmin} />
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
