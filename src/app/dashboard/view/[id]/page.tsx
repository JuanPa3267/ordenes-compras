import { getOrdenCompraByIdAction } from "@/actions/crear-orden.actions";
import { notFound } from "next/navigation";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PDFViewerWrapper } from "@/components/pdf/pdf-viewer-wrapper";

export default async function ViewOrderPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const orden = await getOrdenCompraByIdAction(id);
    
    if (!orden) {
        notFound();
    }

    return (
        <div className="flex flex-col h-full bg-white min-h-[calc(100vh-20px)]">
            <div className="flex items-center gap-4 border-b border-gray-200 p-4 shrink-0 shadow-sm">
                <Button variant="outline" size="icon" asChild className="hover:bg-gray-100 flex-shrink-0">
                    <Link href="/dashboard">
                        <MoveLeft className="h-5 w-5 text-gray-600" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-gray-900 leading-tight">
                        Visor de Orden: OC-{orden.id_oc.padStart(4, '0')}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Este documento es solo lectura. Para alterarlo usa el botón Editar del panel anterior.</p>
                </div>
            </div>

            <div className="flex-1 bg-gray-50">
                <PDFViewerWrapper orden={orden} />
            </div>
        </div>
    );
}
