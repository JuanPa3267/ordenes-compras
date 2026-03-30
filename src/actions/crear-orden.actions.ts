"use server";

import prisma from "@/lib/prisma";

export async function getFormDependenciesAction() {
    try {
        const [
            clientes,
            contactos,
            gerentes,
            monedas,
            proveedores,
            tiposItem,
            fabricantes,
            distribuidores
        ] = await Promise.all([
            prisma.clientes.findMany({ orderBy: { nombre: 'asc' } }),
            prisma.contactos_cliente.findMany({ where: { activo: true }, orderBy: { nombre_completo: 'asc' } }),
            prisma.gerentes_cuenta.findMany({ where: { activo: true }, orderBy: { nombre_completo: 'asc' } }),
            prisma.monedas.findMany({ orderBy: { codigo: 'asc' } }),
            prisma.proveedores.findMany({ orderBy: { nombre: 'asc' } }),
            prisma.tipos_item.findMany({ orderBy: { nombre: 'asc' } }),
            prisma.fabricantes.findMany({ orderBy: { nombre: 'asc' } }),
            prisma.distribuidores.findMany({ orderBy: { nombre: 'asc' } })
        ]);

        return {
            clientes: clientes.map(c => ({ id: c.id_cliente.toString(), label: c.nombre })),
            contactos: contactos.map(c => ({ id: c.id_contacto_cliente.toString(), id_cliente: c.id_cliente.toString(), label: c.nombre_completo })),
            gerentes: gerentes.map(g => ({ id: g.id_gerente.toString(), label: g.nombre_completo })),
            monedas: monedas.map(m => ({ id: m.id_moneda.toString(), label: `${m.codigo} - ${m.nombre}` })),
            proveedores: proveedores.map(p => ({ id: p.id_proveedor.toString(), label: p.nombre })),
            tiposItem: tiposItem.map(t => ({ id: t.id_tipo_item.toString(), label: t.nombre })),
            fabricantes: fabricantes.map(f => ({ id: f.id_fabricante.toString(), label: f.nombre })),
            distribuidores: distribuidores.map(d => ({ id: d.id_distribuidor.toString(), label: d.nombre }))
        };
    } catch (error) {
        console.error("Error cargando dependencias del formulario:", error);
        throw new Error("No se pudieron cargar los datos necesarios para el formulario.");
    }
}

// Interfaz para la data de entrada estructurada desde el frontend
export type OrdenCompraPayload = {
    id_oc?: string;
    id_cliente: string;
    id_moneda: string;
    descripcion_proyecto: string;
    oportunidad: string;
    id_contacto_cliente?: string | null;
    forma_pago: string;
    contacto_mayorista?: string | null;
    proveedores: {
        id_oc_proveedor?: string;
        id_proveedor: string;
        notas?: string | null;
        items: {
            id_oc_item?: string;
            descripcion: string;
            id_tipo_item: string;
            id_fabricante?: string | null;
            id_distribuidor?: string | null;
            parte?: string | null;
            modelo?: string | null;
            cantidad: number;
            valor_unitario: number;
            iva: boolean;
            porcentaje_iva: number;
        }[];
    }[];
};

export async function createOrdenCompraAction(payload: OrdenCompraPayload) {
    try {
        const { getCurrentUserAction } = await import("@/actions/auth.actions");
        const currentUser = await getCurrentUserAction();
        
        if (!currentUser || !currentUser.activo) {
            return { success: false, message: "Tu cuenta está inactiva y no puede crear órdenes." };
        }

        // Delegamos los subtotales, IVAs y totales a los Triggers de la Base de Datos.
        // Hacemos un Insert Anidado masivo aprovechando las relaciones de Prisma.
        const nuevaOrden = await prisma.ordenes_compra.create({
            data: {
                id_cliente: BigInt(payload.id_cliente),
                id_moneda: BigInt(payload.id_moneda),
                descripcion_proyecto: payload.descripcion_proyecto,
                oportunidad: payload.oportunidad,
                id_contacto_cliente: payload.id_contacto_cliente ? BigInt(payload.id_contacto_cliente) : null,
                id_gerente: BigInt(currentUser.id_gerente),
                forma_pago: payload.forma_pago,
                contacto_mayorista: payload.contacto_mayorista || null,
                estado: "BORRADOR",
                oc_proveedores: {
                    create: payload.proveedores.map(prov => ({
                        // Nota: revisando schema.prisma vemos: id_proveedor BigInt en oc_proveedores
                        // Utilizamos objetos de connect para satisfacer el tipado estricto de Prisma
                        proveedores: { connect: { id_proveedor: BigInt(prov.id_proveedor) } },
                        notas: prov.notas || null,
                        oc_items: {
                            create: prov.items.map(item => ({
                                descripcion: item.descripcion,
                                tipos_item: { connect: { id_tipo_item: BigInt(item.id_tipo_item) } },
                                fabricantes: item.id_fabricante ? { connect: { id_fabricante: BigInt(item.id_fabricante) } } : undefined,
                                distribuidores: item.id_distribuidor ? { connect: { id_distribuidor: BigInt(item.id_distribuidor) } } : undefined,
                                parte: item.parte || null,
                                modelo: item.modelo || null,
                                cantidad: item.cantidad,
                                valor_unitario: item.valor_unitario,
                                iva: item.iva,
                                porcentaje_iva: item.porcentaje_iva
                                // no enviamos ni porcentaje_iva, ni subtotal, valor_iva o total, 
                                // pues los triggers calc y recalcular se encargan.
                            }))
                        }
                    }))
                }
            }
        });

        const { AuditService } = await import("@/services/audit.service");
        await AuditService.logAction(currentUser.id_gerente, "CREATE", "ordenes_compra", nuevaOrden.id_oc.toString(), { estado: "BORRADOR" });

        return { success: true, message: "Orden creada exitosamente como borrador.", id_oc: nuevaOrden.id_oc.toString() };
    } catch (error: any) {
        console.error("Error al crear la orden de compra:", error);
        return { success: false, message: error.message || "Error desconocido al guardar la orden." };
    }
}

export async function getOrdenCompraByIdAction(id_oc_str: string) {
    try {
        const { getCurrentUserAction } = await import("@/actions/auth.actions");
        const currentUser = await getCurrentUserAction();
        
        if (!currentUser || !currentUser.activo) {
            console.warn("Intento de acceso denegado a getOrdenCompraByIdAction: Usuario inactivo");
            return null;
        }

        const orden = await prisma.ordenes_compra.findUnique({
            where: { id_oc: BigInt(id_oc_str) },
            include: {
                clientes: true,
                monedas: true,
                gerentes_cuenta: true,
                totales_oc: true,
                oc_proveedores: {
                    include: {
                        proveedores: true,
                        oc_items: {
                            include: {
                                tipos_item: true
                            }
                        }
                    }
                }
            }
        });

        if (!orden) return null;

        return {
            ...orden,
            id_oc: orden.id_oc.toString(),
            id_cliente: orden.id_cliente.toString(),
            id_moneda: orden.id_moneda.toString(),
            id_contacto_cliente: orden.id_contacto_cliente?.toString() || null,
            id_gerente: orden.id_gerente.toString(),
            
            clientes: { ...orden.clientes, id_cliente: orden.clientes.id_cliente.toString() },
            monedas: { ...orden.monedas, id_moneda: orden.monedas.id_moneda.toString() },
            gerentes_cuenta: { ...orden.gerentes_cuenta, id_gerente: orden.gerentes_cuenta.id_gerente.toString() },
            totales_oc: orden.totales_oc ? {
                ...orden.totales_oc,
                id_totales: orden.totales_oc.id_totales.toString(),
                id_oc: orden.totales_oc.id_oc.toString(),
                subtotal: Number(orden.totales_oc.subtotal),
                iva_total: Number(orden.totales_oc.iva_total),
                total: Number(orden.totales_oc.total)
            } : null,

            oc_proveedores: orden.oc_proveedores.map(prov => ({
                ...prov,
                id_oc_proveedor: prov.id_oc_proveedor.toString(),
                id_oc: prov.id_oc.toString(),
                id_proveedor: prov.id_proveedor.toString(),
                proveedores: { ...prov.proveedores, id_proveedor: prov.proveedores.id_proveedor.toString() },
                oc_items: prov.oc_items.map(item => ({
                    ...item,
                    id_oc_item: item.id_oc_item.toString(),
                    id_oc_proveedor: item.id_oc_proveedor.toString(),
                    id_tipo_item: item.id_tipo_item.toString(),
                    id_fabricante: item.id_fabricante?.toString() || null,
                    id_distribuidor: item.id_distribuidor?.toString() || null,
                    cantidad: Number(item.cantidad),
                    valor_unitario: Number(item.valor_unitario),
                    subtotal: Number(item.subtotal),
                    porcentaje_iva: Number(item.porcentaje_iva),
                    valor_iva: Number(item.valor_iva),
                    total: Number(item.total),
                    tipos_item: { ...item.tipos_item, id_tipo_item: item.tipos_item.id_tipo_item.toString() }
                }))
            }))
        };
    } catch (error) {
        console.error("Error fetching orden compra by ID:", error);
        return null; // Handle silently on the frontend or throw
    }
}

export async function updateEstadoOrdenAction(id_oc_str: string, nuevoEstado: "BORRADOR" | "ENVIADO" | "CANCELADO") {
    try {
        const { getCurrentUserAction } = await import("@/actions/auth.actions");
        const currentUser = await getCurrentUserAction();
        
        if (!currentUser || !currentUser.activo) {
            return { success: false, message: "Tu cuenta está inactiva y no puede cambiar estados." };
        }

        await prisma.ordenes_compra.update({
            where: { id_oc: BigInt(id_oc_str) },
            data: { estado: nuevoEstado }
        });

        const { AuditService } = await import("@/services/audit.service");
        await AuditService.logAction(currentUser.id_gerente, "UPDATE_ESTADO", "ordenes_compra", id_oc_str, { nuevoEstado });

        return { success: true, message: `Estado actualizado a ${nuevoEstado}` };
    } catch (error: any) {
        console.error("Update Estado Error:", error);
        return { success: false, message: "Error al actualizar estado." };
    }
}

export async function updateOrdenCompraAction(id_oc_str: string, payload: OrdenCompraPayload) {
    try {
        const { getCurrentUserAction } = await import("@/actions/auth.actions");
        const currentUser = await getCurrentUserAction();
        
        if (!currentUser || !currentUser.activo) {
            return { success: false, message: "Tu cuenta está inactiva y no puede editar órdenes." };
        }

        const idOc = BigInt(id_oc_str);

        await prisma.$transaction(async (tx) => {
            // 1. Update main order info
            await tx.ordenes_compra.update({
                where: { id_oc: idOc },
                data: {
                    id_cliente: BigInt(payload.id_cliente),
                    id_moneda: BigInt(payload.id_moneda),
                    descripcion_proyecto: payload.descripcion_proyecto,
                    oportunidad: payload.oportunidad,
                    id_contacto_cliente: payload.id_contacto_cliente ? BigInt(payload.id_contacto_cliente) : null,
                    forma_pago: payload.forma_pago,
                    contacto_mayorista: payload.contacto_mayorista || null,
                }
            });

            // 2. Fetch original providers and items
            const originales = await tx.oc_proveedores.findMany({
                where: { id_oc: idOc },
                include: { oc_items: true }
            });

            const idsProveedoresOriginales = originales.map(p => p.id_oc_proveedor);
            
            // Build the sets for surgical diff
            const proveedoresRecibidosIds = payload.proveedores
                .filter(p => p.id_oc_proveedor)
                .map(p => BigInt(p.id_oc_proveedor!));
                
            const setProveedoresRecibidos = new Set(proveedoresRecibidosIds);
            
            // 3. Delete missing providers
            const idsProveedoresABorrar = idsProveedoresOriginales.filter(id => !setProveedoresRecibidos.has(id));
            if (idsProveedoresABorrar.length > 0) {
                await tx.oc_proveedores.deleteMany({
                    where: { id_oc_proveedor: { in: idsProveedoresABorrar } }
                });
            }

            // 4. Process each provider conceptually
            for (const provPayload of payload.proveedores) {
                if (!provPayload.id_oc_proveedor) {
                    // NEW PROVIDER: We create it and its nested items entirely.
                    await tx.oc_proveedores.create({
                        data: {
                            id_oc: idOc,
                            id_proveedor: BigInt(provPayload.id_proveedor),
                            notas: provPayload.notas || null,
                            oc_items: {
                                create: provPayload.items.map(item => ({
                                    descripcion: item.descripcion,
                                    tipos_item: { connect: { id_tipo_item: BigInt(item.id_tipo_item) } },
                                    fabricantes: item.id_fabricante ? { connect: { id_fabricante: BigInt(item.id_fabricante) } } : undefined,
                                    distribuidores: item.id_distribuidor ? { connect: { id_distribuidor: BigInt(item.id_distribuidor) } } : undefined,
                                    parte: item.parte || null,
                                    modelo: item.modelo || null,
                                    cantidad: item.cantidad,
                                    valor_unitario: item.valor_unitario,
                                    iva: item.iva,
                                    porcentaje_iva: item.porcentaje_iva
                                }))
                            }
                        }
                    });
                } else {
                    // EXISTING PROVIDER: Surgical Diff for Items
                    const currentProvId = BigInt(provPayload.id_oc_proveedor);
                    
                    // Update Provider Notes/Details
                    await tx.oc_proveedores.update({
                        where: { id_oc_proveedor: currentProvId },
                        data: {
                            id_proveedor: BigInt(provPayload.id_proveedor),
                            notas: provPayload.notas || null
                        }
                    });

                    // Item reconciliation
                    const origProv = originales.find(o => o.id_oc_proveedor === currentProvId);
                    const origItemIds = origProv ? origProv.oc_items.map(i => i.id_oc_item) : [];
                    
                    const newItemIds = provPayload.items.filter(i => i.id_oc_item).map(i => BigInt(i.id_oc_item!));
                    const setNuevosItems = new Set(newItemIds);
                    
                    const idsItemsABorrar = origItemIds.filter(id => !setNuevosItems.has(id));
                    
                    if (idsItemsABorrar.length > 0) {
                        await tx.oc_items.deleteMany({
                            where: { id_oc_item: { in: idsItemsABorrar } }
                        });
                    }

                    const itemsParaCrear = [];
                    const itemsParaActualizar = [];

                    for (const item of provPayload.items) {
                        if (item.id_oc_item) {
                            itemsParaActualizar.push(item);
                        } else {
                            // Inject FK parent id_oc_proveedor manually
                            itemsParaCrear.push({
                                id_oc_proveedor: currentProvId,
                                descripcion: item.descripcion,
                                id_tipo_item: BigInt(item.id_tipo_item),
                                id_fabricante: item.id_fabricante ? BigInt(item.id_fabricante) : null,
                                id_distribuidor: item.id_distribuidor ? BigInt(item.id_distribuidor) : null,
                                parte: item.parte || null,
                                modelo: item.modelo || null,
                                cantidad: item.cantidad,
                                valor_unitario: item.valor_unitario,
                                iva: item.iva,
                                porcentaje_iva: item.porcentaje_iva
                            });
                        }
                    }

                    if (itemsParaCrear.length > 0) {
                        await tx.oc_items.createMany({ data: itemsParaCrear });
                    }

                    for (const item of itemsParaActualizar) {
                        await tx.oc_items.update({
                            where: { id_oc_item: BigInt(item.id_oc_item!) },
                            data: {
                                descripcion: item.descripcion,
                                id_tipo_item: BigInt(item.id_tipo_item),
                                id_fabricante: item.id_fabricante ? BigInt(item.id_fabricante) : null,
                                id_distribuidor: item.id_distribuidor ? BigInt(item.id_distribuidor) : null,
                                parte: item.parte || null,
                                modelo: item.modelo || null,
                                cantidad: item.cantidad,
                                valor_unitario: item.valor_unitario,
                                iva: item.iva,
                                porcentaje_iva: item.porcentaje_iva
                            }
                        });
                    }
                }
            }
        });

        const { AuditService } = await import("@/services/audit.service");
        await AuditService.logAction(currentUser.id_gerente, "UPDATE", "ordenes_compra", id_oc_str, "Actualización completa de la Orden de Compra");

        return { success: true, message: "Orden de Compra actualizada." };
    } catch (error: any) {
        console.error("Surgical Update Order Error:", error);
        return { success: false, message: error.message || "Error desconocido al actualizar." };
    }
}
