"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { createOrdenCompraAction } from "@/actions/crear-orden.actions";

type FormDependencies = {
    clientes: { id: string; label: string }[];
    contactos: { id: string; id_cliente: string; label: string }[];
    gerentes: { id: string; label: string }[];
    monedas: { id: string; label: string }[];
    proveedores: { id: string; label: string }[];
    tiposItem: { id: string; label: string }[];
    fabricantes: { id: string; label: string }[];
    distribuidores: { id: string; label: string }[];
};

type FormItem = {
    id: string; // temp unique string
    id_oc_item?: string;
    descripcion: string;
    id_tipo_item: string;
    id_fabricante: string;
    id_distribuidor: string;
    parte: string;
    modelo: string;
    cantidad: number | string;
    valor_unitario: number | string;
    iva: boolean;
    porcentaje_iva: number | string;
};

type FormProvider = {
    id: string; // temp unique string
    id_oc_proveedor?: string;
    id_proveedor: string;
    notas: string;
    items: FormItem[];
};

export default function CreateOrderClientForm({ initialData, initialOrder }: { initialData: FormDependencies, initialOrder?: any }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Headers
    const [idCliente, setIdCliente] = useState(initialOrder?.id_cliente || "");
    const [idContactoCliente, setIdContactoCliente] = useState(initialOrder?.id_contacto_cliente || "");
    const [idMoneda, setIdMoneda] = useState(initialOrder?.id_moneda || (initialData.monedas.length > 0 ? initialData.monedas[0].id : ""));
    const [descripcionProyecto, setDescripcionProyecto] = useState(initialOrder?.descripcion_proyecto || "");
    const [oportunidad, setOportunidad] = useState(initialOrder?.oportunidad || "");
    const [formaPago, setFormaPago] = useState(initialOrder?.forma_pago || "");
    const [contactoMayorista, setContactoMayorista] = useState(initialOrder?.contacto_mayorista || "");

    // Detail Array
    const [proveedores, setProveedores] = useState<FormProvider[]>(() => {
        if (initialOrder && initialOrder.oc_proveedores && initialOrder.oc_proveedores.length > 0) {
            return initialOrder.oc_proveedores.map((prov: any) => ({
                id: crypto.randomUUID(), 
                id_oc_proveedor: prov.id_oc_proveedor,
                id_proveedor: prov.id_proveedor,
                notas: prov.notas || "",
                items: prov.oc_items.map((item: any) => ({
                    id: crypto.randomUUID(),
                    id_oc_item: item.id_oc_item,
                    descripcion: item.descripcion,
                    id_tipo_item: item.id_tipo_item,
                    id_fabricante: item.id_fabricante || "",
                    id_distribuidor: item.id_distribuidor || "",
                    parte: item.parte || "",
                    modelo: item.modelo || "",
                    cantidad: Number(item.cantidad),
                    valor_unitario: Number(item.valor_unitario),
                    iva: item.iva,
                    porcentaje_iva: Number(item.porcentaje_iva) * 100 // % Visual
                }))
            }));
        }
        return [{
            id: Date.now().toString(),
            id_proveedor: "",
            notas: "",
            items: [{
                id: Date.now().toString() + "-item",
                descripcion: "",
                id_tipo_item: "",
                id_fabricante: "",
                id_distribuidor: "",
                parte: "",
                modelo: "",
                cantidad: "1",
                valor_unitario: "",
                iva: true,
                porcentaje_iva: "19"
            }]
        }];
    });

    // Computed filtered lists
    const contactosFiltrados = useMemo(() => {
        if (!idCliente) return [];
        return initialData.contactos.filter(c => c.id_cliente === idCliente);
    }, [idCliente, initialData.contactos]);

    // Helpers Provider
    const handleAddProvider = () => {
        setProveedores([...proveedores, {
            id: Date.now().toString(),
            id_proveedor: "",
            notas: "",
            items: [{
                id: Date.now().toString() + "-item",
                descripcion: "",
                id_tipo_item: "",
                id_fabricante: "",
                id_distribuidor: "",
                parte: "",
                modelo: "",
                cantidad: "1",
                valor_unitario: "",
                iva: true,
                porcentaje_iva: "19"
            }]
        }]);
    };

    const handleRemoveProvider = (provId: string) => {
        setProveedores(proveedores.filter(p => p.id !== provId));
    };

    const handleProviderChange = (provId: string, field: keyof FormProvider, value: string) => {
        setProveedores(proveedores.map(p => p.id === provId ? { ...p, [field]: value } : p));
    };

    // Helpers Items
    const handleAddItem = (provId: string) => {
        setProveedores(proveedores.map(p => {
            if (p.id === provId) {
                return {
                    ...p,
                    items: [...p.items, {
                        id: Date.now().toString() + "-item",
                        descripcion: "",
                        id_tipo_item: "",
                        id_fabricante: "",
                        id_distribuidor: "",
                        parte: "",
                        modelo: "",
                        cantidad: "1",
                        valor_unitario: "",
                        iva: true,
                        porcentaje_iva: "19"
                    }]
                };
            }
            return p;
        }));
    };

    const handleRemoveItem = (provId: string, itemId: string) => {
        setProveedores(proveedores.map(p => {
            if (p.id === provId) {
                return { ...p, items: p.items.filter(i => i.id !== itemId) };
            }
            return p;
        }));
    };

    const handleItemChange = (provId: string, itemId: string, field: keyof FormItem, value: any) => {
        setProveedores(proveedores.map(p => {
            if (p.id === provId) {
                return {
                    ...p,
                    items: p.items.map(i => i.id === itemId ? { ...i, [field]: value } : i)
                };
            }
            return p;
        }));
    };

    // Client-side visual calculations (just for show, db computes real ones)
    let totalOC = 0;
    
    // Auto-select contact cleaner when client changes
    const onClienteChange = (val: string) => {
        setIdCliente(val);
        setIdContactoCliente(""); // reset contact
    };

    const handleSubmit = async () => {
        // Basic validation
        if (!idCliente || !idMoneda || !descripcionProyecto || !oportunidad || !formaPago) {
            toast.error("Por favor completa todos los campos requeridos del encabezado.");
            return;
        }

        if (proveedores.length === 0) {
            toast.error("Debes agregar al menos un proveedor.");
            return;
        }

        // Validate Providers Details
        for (const p of proveedores) {
            if (!p.id_proveedor) {
                toast.error("Selecciona un nombre de proveedor para cada renglón superior.");
                return;
            }
            if (p.items.length === 0) {
                toast.error(`El proveedor necesita al menos un ítem.`);
                return;
            }
            for (const i of p.items) {
                if (!i.descripcion || !i.id_tipo_item || Number(i.cantidad || 0) <= 0) {
                    toast.error("Verifica que los ítems tengan descripción, tipo seleccionado y cantidad mayor a cero.");
                    return;
                }
            }
        }

        startTransition(async () => {
            const payload = {
                id_cliente: idCliente,
                id_moneda: idMoneda,
                descripcion_proyecto: descripcionProyecto,
                oportunidad: oportunidad,
                id_contacto_cliente: idContactoCliente || null,
                forma_pago: formaPago,
                contacto_mayorista: contactoMayorista || null,
                proveedores: proveedores.map(p => ({
                    id_oc_proveedor: p.id_oc_proveedor,
                    id_proveedor: p.id_proveedor,
                    notas: p.notas || null,
                    items: p.items.map(i => ({
                        id_oc_item: i.id_oc_item,
                        descripcion: i.descripcion,
                        id_tipo_item: i.id_tipo_item,
                        id_fabricante: i.id_fabricante || null,
                        id_distribuidor: i.id_distribuidor || null,
                        parte: i.parte || null,
                        modelo: i.modelo || null,
                        cantidad: Number(i.cantidad || 0),
                        valor_unitario: Number(i.valor_unitario || 0),
                        iva: i.iva,
                        porcentaje_iva: Number(i.porcentaje_iva || 19) / 100
                    }))
                }))
            };

            const { createOrdenCompraAction, updateOrdenCompraAction } = await import("@/actions/crear-orden.actions");

            let result;
            if (initialOrder) {
                result = await updateOrdenCompraAction(initialOrder.id_oc, payload);
            } else {
                result = await createOrdenCompraAction(payload);
            }

            if (result.success) {
                toast.success(result.message);
                router.push("/dashboard");
            } else {
                toast.error(result.message);
            }
        });
    };

    const formatCurrency = (val: number, cur: string) => {
        try {
            return val.toLocaleString("en-US", { style: "currency", currency: cur.substring(0,3), minimumFractionDigits: 2 });
        } catch(e) {
            return val.toLocaleString("es-MX", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
        }
    };

    // Moneda activa name para currency formater
    const activeCurrencyLabel = initialData.monedas.find(m => m.id === idMoneda)?.label || "USD";

    return (
        <div className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8 pb-32">
            <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Crear Orden de Compra</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Complete los campos obligatorios (*) y seleccione los diferentes roles para asignar la orden.
                    </p>
                </div>
            </div>

            {/* Header Form */}
            <div className="grid gap-6 md:grid-cols-3 xl:grid-cols-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                
                <div className="space-y-2">
                    <Label>Cliente *</Label>
                    <SearchableSelect 
                        options={initialData.clientes} 
                        value={idCliente} 
                        onChange={onClienteChange} 
                        placeholder="Buscar cliente..." 
                    />
                </div>

                <div className="space-y-2">
                    <Label>Contacto del Cliente</Label>
                    <SearchableSelect 
                        options={contactosFiltrados} 
                        value={idContactoCliente} 
                        onChange={setIdContactoCliente} 
                        placeholder={idCliente ? "Selecciona contacto..." : "Primero elige un cliente"}
                        disabled={!idCliente}
                    />
                </div>

                <div className="space-y-2 col-span-1 md:col-span-2">
                    <Label>Descripción del Proyecto *</Label>
                    <Input 
                        placeholder="Ej. Renovación Licenciamiento Microsoft..." 
                        value={descripcionProyecto}
                        onChange={(e) => setDescripcionProyecto(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Oportunidad (CRM) *</Label>
                    <Input 
                        placeholder="OP-12345" 
                        value={oportunidad}
                        onChange={(e) => setOportunidad(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Forma de Pago *</Label>
                    <Input 
                        placeholder="Ej. 30 días netos" 
                        value={formaPago}
                        onChange={(e) => setFormaPago(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Contacto Mayorista (Revendedor)</Label>
                    <Input 
                        placeholder="Nombre de ejecutivo si aplica..." 
                        value={contactoMayorista}
                        onChange={(e) => setContactoMayorista(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Moneda *</Label>
                    <SearchableSelect 
                        options={initialData.monedas} 
                        value={idMoneda} 
                        onChange={setIdMoneda} 
                    />
                </div>
            </div>

            {/* Providers and Items */}
            <div className="space-y-6">
                <div className="border-b border-gray-200 pb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Sección de Proveedores e Ítems</h3>
                </div>

                {proveedores.map((prov, index) => {
                    let provTotal = 0;

                    return (
                        <div key={prov.id} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-6">
                            <div className="bg-gray-50 px-6 py-3 border-b flex justify-between items-center">
                                <h4 className="font-semibold text-gray-800">Proveedor {index + 1}</h4>
                                <Button onClick={() => handleRemoveProvider(prov.id)} variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8">
                                    <Trash2 className="h-4 w-4 mr-2" /> Eliminar Proveedor
                                </Button>
                            </div>

                            <div className="p-4 sm:p-6 space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Nombre Proveedor *</Label>
                                        <SearchableSelect 
                                            options={initialData.proveedores} 
                                            value={prov.id_proveedor} 
                                            onChange={(val) => handleProviderChange(prov.id, "id_proveedor", val)} 
                                            placeholder="Buscar proveedor..." 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Instrucciones/Notas p/Proveedor</Label>
                                        <Input 
                                            placeholder="Instrucciones al facturar o entregar..." 
                                            value={prov.notas}
                                            onChange={(e) => handleProviderChange(prov.id, "notas", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="overflow-visible rounded-lg border border-gray-200 mt-4">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-600 bg-gray-50 border-b">
                                            <tr>
                                                <th className="px-3 py-3 font-medium min-w-[150px]">Descripción</th>
                                                <th className="px-3 py-3 font-medium min-w-[150px]">Tipo de Item</th>
                                                <th className="px-3 py-3 font-medium min-w-[150px]">Fabricante</th>
                                                <th className="px-3 py-3 font-medium min-w-[150px]">Distribuidor</th>
                                                <th className="px-3 py-3 font-medium min-w-[100px]">Parte</th>
                                                <th className="px-3 py-3 font-medium min-w-[100px]">Modelo</th>
                                                <th className="px-3 py-3 font-medium w-[80px]">Cant.</th>
                                                <th className="px-3 py-3 font-medium min-w-[120px]">V. Unitario</th>
                                                <th className="px-3 py-3 font-medium w-[70px] text-center">% IVA</th>
                                                <th className="px-3 py-3 font-medium w-[50px] text-center">IVA</th>
                                                <th className="px-3 py-3 font-medium min-w-[120px] text-right">Aprox.</th>
                                                <th className="px-2 py-3 w-[40px]"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {prov.items.map((item) => {
                                                const lineSubtotal = Number(item.cantidad || 0) * Number(item.valor_unitario || 0);
                                                const pctIva = Number(item.porcentaje_iva || 0) / 100;
                                                const lineTotal = lineSubtotal * (item.iva ? (1 + pctIva) : 1);
                                                provTotal += lineTotal;
                                                
                                                return (
                                                    <tr key={item.id} className="bg-white hover:bg-gray-50/50 transition-colors">
                                                        <td className="p-2">
                                                            <Input className="h-8 text-xs px-2" value={item.descripcion} onChange={(e) => handleItemChange(prov.id, item.id, "descripcion", e.target.value)} />
                                                        </td>
                                                        <td className="p-2">
                                                            <SearchableSelect className="h-8 text-xs [&>button]:h-8 [&>button]:px-2" options={initialData.tiposItem} value={item.id_tipo_item} onChange={(val) => handleItemChange(prov.id, item.id, "id_tipo_item", val)} placeholder="Tipo..." />
                                                        </td>
                                                        <td className="p-2">
                                                            <SearchableSelect className="h-8 text-xs [&>button]:h-8 [&>button]:px-2" options={initialData.fabricantes} value={item.id_fabricante} onChange={(val) => handleItemChange(prov.id, item.id, "id_fabricante", val)} placeholder="Fabricante..." />
                                                        </td>
                                                        <td className="p-2">
                                                            <SearchableSelect className="h-8 text-xs [&>button]:h-8 [&>button]:px-2" options={initialData.distribuidores} value={item.id_distribuidor} onChange={(val) => handleItemChange(prov.id, item.id, "id_distribuidor", val)} placeholder="Distri..." />
                                                        </td>
                                                        <td className="p-2">
                                                            <Input className="h-8 text-xs px-2" value={item.parte} onChange={(e) => handleItemChange(prov.id, item.id, "parte", e.target.value)} />
                                                        </td>
                                                        <td className="p-2">
                                                            <Input className="h-8 text-xs px-2" value={item.modelo} onChange={(e) => handleItemChange(prov.id, item.id, "modelo", e.target.value)} />
                                                        </td>
                                                        <td className="p-2">
                                                            <Input type="number" min="0" step="0.01" className="h-8 text-xs px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={item.cantidad} onChange={(e) => handleItemChange(prov.id, item.id, "cantidad", e.target.value)} />
                                                        </td>
                                                        <td className="p-2">
                                                            <Input type="number" min="0" step="0.01" className="h-8 text-xs px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={item.valor_unitario} onChange={(e) => handleItemChange(prov.id, item.id, "valor_unitario", e.target.value)} />
                                                        </td>
                                                        <td className="p-2">
                                                            <Input type="number" min="0" step="1" className="h-8 text-xs px-2 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={item.porcentaje_iva} onChange={(e) => handleItemChange(prov.id, item.id, "porcentaje_iva", e.target.value)} disabled={!item.iva} title="Ej. 19 para 19%" />
                                                        </td>
                                                        <td className="p-2 text-center align-middle">
                                                            <input type="checkbox" className="h-4 w-4 cursor-pointer" checked={item.iva} onChange={(e) => handleItemChange(prov.id, item.id, "iva", e.target.checked)} />
                                                        </td>
                                                        <td className="p-2 text-right font-medium text-gray-500 text-xs">
                                                            {formatCurrency(lineTotal, activeCurrencyLabel)}
                                                        </td>
                                                        <td className="p-2 text-center">
                                                            <button onClick={() => handleRemoveItem(prov.id, item.id)} disabled={prov.items.length === 1} className="text-gray-400 hover:text-red-500 disabled:opacity-50 cursor-pointer">
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot className="bg-gray-50 border-t border-gray-200">
                                            <tr>
                                                <td colSpan={10} className="px-3 py-2 text-right font-medium text-gray-600 text-xs">TOTAL APROX. PROVEEDOR (PRE-CALC DB):</td>
                                                <td className="px-3 py-2 text-right font-bold text-gray-900">{formatCurrency(provTotal, activeCurrencyLabel)}</td>
                                                <td></td>
                                                <td className="hidden">{totalOC += provTotal}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                <Button variant="outline" size="sm" onClick={() => handleAddItem(prov.id)} className="text-blue-600 border-blue-200 bg-blue-50/50 hover:bg-blue-50 mt-3">
                                    <Plus className="h-4 w-4 mr-2" /> Agregar Item a este Proveedor
                                </Button>
                            </div>
                        </div>
                    );
                })}
                
                <div className="pt-2">
                    <Button onClick={handleAddProvider} variant="outline" className="w-full border-dashed border-2 py-6 text-gray-500 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-400 transition-colors">
                        <Plus className="h-5 w-5 mr-2" /> Agregar Proveedor Adicional
                    </Button>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-gray-200 p-6 -mx-4 sm:-mx-6 lg:-mx-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] mt-8 sticky bottom-0 z-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm">

                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex gap-4 items-center bg-gray-50 px-6 py-3 rounded-xl border border-gray-100">
                            <span className="text-gray-600 font-medium">Gran Total Est.</span>
                            <span className="text-2xl font-bold text-gray-900 tracking-tight">{formatCurrency(totalOC, activeCurrencyLabel)}</span>
                        </div>

                        <Button 
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium h-12 px-8 min-w-[200px]" 
                            disabled={isPending} 
                            onClick={handleSubmit}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5 mr-2" />
                                    {initialOrder ? 'Actualizar Orden' : 'Guardar y Emitir'}
                                </>
                            )}
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
}
