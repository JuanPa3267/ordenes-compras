import { getFormDependenciesAction } from "@/actions/crear-orden.actions";
import CreateOrderClientForm from "./create-form";
import { AlertCircle } from "lucide-react";

export default async function CreateOrderPage() {
    try {
        const dependencies = await getFormDependenciesAction();

        return (
            <div className="flex-1 w-full relative">
                <CreateOrderClientForm initialData={dependencies} />
            </div>
        );
    } catch (error) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-red-600">
                <AlertCircle className="h-10 w-10 mb-4" />
                <h2 className="text-xl font-bold">Error al cargar datos</h2>
                <p>No se pudieron recuperar las listas de base de datos para construir el formulario.</p>
            </div>
        );
    }
}
