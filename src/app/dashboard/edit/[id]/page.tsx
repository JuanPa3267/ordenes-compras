import { getFormDependenciesAction, getOrdenCompraByIdAction } from "@/actions/crear-orden.actions";
import CreateOrderClientForm from "../../create/create-form";
import { notFound } from "next/navigation";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function EditOrderPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const orden = await getOrdenCompraByIdAction(id);
    
    if (!orden) {
        notFound();
    }
    
    const data = await getFormDependenciesAction();

    return (
        <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                <Button variant="ghost" size="icon" asChild className="hover:bg-gray-100 flex-shrink-0">
                    <Link href="/dashboard">
                        <MoveLeft className="h-5 w-5 text-gray-600" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 leading-tight">
                        Editar OC-{orden.id_oc.padStart(4, '0')}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Estás en la vista de edición. Los cambios se guardarán preservando historial interno de renglones.
                    </p>
                </div>
            </div>

            <CreateOrderClientForm 
                initialData={data} 
                initialOrder={orden} 
            />
        </div>
    );
}
