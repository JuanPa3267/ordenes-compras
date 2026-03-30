"use client";

import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { OrdenCompraPDF } from "./orden-compra-pdf";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";

export function PDFViewerWrapper({ orden }: { orden: any }) {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    if (!isClient) {
        return (
            <div className="flex items-center justify-center h-full p-12 text-gray-500">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <span>Cargando procesador de PDF...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full min-h-[calc(100vh-80px)]">
            <div className="flex justify-between items-center bg-gray-50 p-4 border-b border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-700">Previsualización del Documento</h3>
                <PDFDownloadLink document={<OrdenCompraPDF orden={orden} />} fileName={`OC-${orden.id_oc.padStart(4, '0')}.pdf`}>
                    {({ loading }) => (
                        <Button disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                            <Download className="mr-2 h-4 w-4" />
                            {loading ? "Generando documento..." : "Descargar Constancia PDF"}
                        </Button>
                    )}
                </PDFDownloadLink>
            </div>
            <div className="flex-1 p-4 bg-gray-200">
                <PDFViewer className="w-full h-full min-h-[800px] border-none rounded-lg shadow-md">
                    <OrdenCompraPDF orden={orden} />
                </PDFViewer>
            </div>
        </div>
    );
}
