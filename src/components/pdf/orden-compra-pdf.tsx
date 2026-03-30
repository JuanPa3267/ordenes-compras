import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Formateador de moneda (Ej: USD 100)
const formatCurrency = (val: number, cur: string) => {
  return `${cur.substring(0, 3)} ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(val || 0)}`;
};

const hoy = new Date().toLocaleDateString('es-ES', { 
  day: '2-digit', 
  month: 'short', 
  year: '2-digit' 
}).replace(/ /g, '-').replace(/\./g, '');

const styles = StyleSheet.create({
  page: { 
    padding: 30, 
    fontSize: 8, 
    fontFamily: 'Helvetica', 
    color: '#000' 
  },
  // --- HEADER ---
  headerContainer: { flexDirection: 'row', marginBottom: 10 },
  headerLeft: { width: '50%' },
  logo: { width: 140, objectFit: 'contain', marginBottom: 5 },
  companyName: { fontWeight: 'bold', fontSize: 10, marginTop: 4 },
  headerRight: { width: '50%' },
  ocBadge: { 
    backgroundColor: '#FFC000', 
    color: 'white', 
    padding: 8, 
    textAlign: 'center', 
    fontSize: 14, 
    fontWeight: 'bold',
    marginBottom: 5  
  }, 
  ocMetaRow: { flexDirection: 'row', paddingVertical: 2 }, 
  ocMetaLabel: { width: '40%', paddingLeft: 5 }, 
  ocMetaValue: { width: '60%', textAlign: 'center' }, 
  ocMetaRowGray: { backgroundColor: '#f2f2f2' }, 
 
  // --- SECCIONES DE INFORMACIÓN --- 
  infoGrid: { flexDirection: 'row', gap: 15, marginBottom: 5 }, 
  infoCol: { flex: 1 }, 
  yellowBar: { 
    backgroundColor: '#FFC000', 
    color: 'white', 
    padding: 3, 
    fontWeight: 'bold', 
    fontSize: 9,
    marginBottom: 2 
  },
  dataRow: { flexDirection: 'row', paddingVertical: 1 },
  dataLabel: { width: '30%', fontWeight: 'bold' },
  dataValue: { width: '70%' },
  dataRowGray: { backgroundColor: '#f2f2f2' },

  // --- TABLA PRINCIPAL ---
  tableHeader: { 
    flexDirection: 'row', 
    backgroundColor: '#FFC000', 
    color: 'white', 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },
  tableRow: { flexDirection: 'row', borderBottom: '0.5pt solid #d1d5db', borderLeft: '0.5pt solid #d1d5db', borderRight: '0.5pt solid #d1d5db' },
  cell: { padding: 4, borderRight: '0.5pt solid #d1d5db', display: 'flex', justifyContent: 'center' },
  
  colItem: { width: '10%', textAlign: 'center' },
  colDesc: { width: '50%' },
  colCant: { width: '10%', textAlign: 'center' },
  colUnit: { width: '15%', textAlign: 'right' },
  colTotal: { width: '15%', textAlign: 'right' },

  // --- USUARIO FINAL ---
  userFinalBox: { alignItems: 'center', marginVertical: 10 },
  userFinalRow: { flexDirection: 'row', width: '60%' },
  userFinalLabel: { border: '0.5pt solid #000', borderRight: 'none', padding: 2, width: '20%', textAlign: 'center', fontWeight: 'bold' },
  userFinalValue: { border: '0.5pt solid #000', padding: 2, width: '80%', textAlign: 'center' },

  // --- TOTALES Y FIRMAS ---
  bottomSection: { flexDirection: 'row', marginTop: 10, justifyContent: 'space-between' },
  leftBottom: { width: '35%' },
  rightBottom: { width: '50%' },
  
  pricesBox: { border: '0.5pt solid #000', marginBottom: 5 },
  pricesHeader: { backgroundColor: '#FFC000', color: 'white', padding: 2, textAlign: 'center', fontWeight: 'bold' },
  pricesRow: { flexDirection: 'row' },
  pricesCellLeft: { flex: 1, textAlign: 'center', padding: 2, borderRight: '0.5pt solid #000' },
  pricesCellRight: { flex: 1, textAlign: 'center', padding: 2 },

  authBox: { border: '0.5pt solid #000' },
  authTitle: { backgroundColor: '#FFC000', color: 'white', padding: 2, textAlign: 'center', fontWeight: 'bold' },
  authValue: { padding: 4, textAlign: 'center', minHeight: 15 },

  totalsTable: { alignSelf: 'flex-end', width: '100%' },
  totalRow: { flexDirection: 'row', marginBottom: 2, justifyContent: 'flex-end' },
  totalLabel: { width: 100, textAlign: 'right', paddingRight: 5 },
  totalValue: { width: 60, backgroundColor: '#f2f2f2', textAlign: 'right', padding: 2 },
  totalMiddleSpan: { width: 40, textAlign: 'center', padding: 2 },
  totalFinal: { fontWeight: 'bold', fontSize: 9 }
});

export const OrdenCompraPDF = ({ orden }: { orden: any }) => {
  const allItems = orden.oc_proveedores?.flatMap((p: any) => p.oc_items) || [];
  const currency = orden.monedas?.codigo || 'USD';

const dateObj = new Date(orden.fecha_emision);

// Usamos los métodos getUTC para evitar el desfase del navegador/servidor
const dia = dateObj.getUTCDate().toString().padStart(2, '0');
const mes = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
const anio = dateObj.getUTCFullYear();

const emisionDate = `${dia}/${mes}/${anio}`;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        
        {/* HEADER SUPERIOR */}
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <Image src="/TAK Main Logo.png" style={styles.logo} />
            <Text style={styles.companyName}>TECH AND KNOWLEDGE S A S</Text>
            <Text>NIT: 900529191-5</Text>
            <Text>Calle 127 No. 68 G 72</Text>
            <Text>Teléfonos: 60177014865</Text>
            <Text>Bogotá D.C. Colombia</Text>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.ocBadge}><Text>ORDEN DE COMPRA</Text></View>
            <View>
              <View style={styles.ocMetaRow}>
                <Text style={styles.ocMetaLabel}>CODIGO</Text>
                <Text style={{ width: '30%', textAlign: 'center' }}>TAK- # {orden.id_oc || '...'}</Text>
                <Text style={{ width: '30%', textAlign: 'center' }}>{hoy}</Text>
              </View>
              <View style={[styles.ocMetaRow, styles.ocMetaRowGray]}>
                <Text style={styles.ocMetaLabel}>Fecha</Text>
                <Text style={{ width: '60%', textAlign: 'center' }}>{emisionDate}</Text>
              </View>
              <View style={styles.ocMetaRow}>
                <Text style={styles.ocMetaLabel}>Versión</Text>
                <Text style={{ width: '60%', textAlign: 'center' }}>1.1</Text>
              </View>
              <View style={[styles.ocMetaRow, styles.ocMetaRowGray]}>
                <Text style={styles.ocMetaLabel}>Página</Text>
                <Text style={{ width: '60%', textAlign: 'center' }}>1</Text>
              </View>
            </View>
          </View>
        </View>

        {/* BLOQUES DE DATOS CON BARRAS AMARILLAS */}
        <View style={styles.infoGrid}>
          {/* Proveedor */}
          <View style={styles.infoCol}>
            <Text style={styles.yellowBar}>Proveedor y/o Contratista:</Text>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Nombre:</Text>
              <Text style={styles.dataValue}>{orden.oc_proveedores?.[0]?.proveedores?.nombre || ''}</Text>
            </View>
            <View style={[styles.dataRow, styles.dataRowGray]}>
              <Text style={styles.dataLabel}>NIT:</Text>
              <Text style={styles.dataValue}>{orden.oc_proveedores?.[0]?.proveedores?.nit || 'N/A'}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Dirección:</Text>
              <Text style={styles.dataValue}>{orden.oc_proveedores?.[0]?.proveedores?.direccion || ''}</Text>
            </View>
            <View style={[styles.dataRow, styles.dataRowGray]}>
              <Text style={styles.dataLabel}>Teléfono:</Text>
              <Text style={styles.dataValue}>{orden.oc_proveedores?.[0]?.proveedores?.telefono || ''}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Ciudad:</Text>
              <Text style={styles.dataValue}></Text>
            </View>
            
            <Text style={[styles.yellowBar, { marginTop: 5 }]}>Servicio ordenado por:</Text>
          </View>

          {/* Detalles Orden */}
          <View style={styles.infoCol}>
            <Text style={styles.yellowBar}>Detalle de orden:</Text>
            <View style={styles.dataRow}>
              <Text style={{width: '45%'}}>Fecha de la Orden:</Text>
              <Text style={{width: '55%'}}>{emisionDate}</Text>
            </View>
            <View style={[styles.dataRow, styles.dataRowGray]}>
              <Text style={{width: '45%'}}>Vigencia de la orden:</Text>
              <Text style={{width: '55%'}}></Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={{width: '45%'}}>Forma de pago:</Text>
              <Text style={{width: '55%'}}>{orden.forma_pago || ''}</Text>
            </View>
            <View style={[styles.dataRow, styles.dataRowGray]}>
              <Text style={{width: '45%'}}>Detalle:</Text>
              <Text style={{width: '55%'}}></Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={{width: '45%'}}>Plazo de pago:</Text>
              <Text style={{width: '55%'}}>Inmediato</Text>
            </View>
            <View style={[styles.dataRow, { marginTop: 3, alignItems: 'center' }]}>
              <Text style={[styles.yellowBar, { marginBottom: 0, padding: 3, width: '45%' }]}>email recepcion facturas:</Text>
              <Text style={{ marginLeft: 5, borderBottom: '1pt solid #000', width: '55%' }}>facturacion@takcolombia.com</Text>
            </View>
          </View>
        </View>

        {/* TABLA PRINCIPAL */}
        <View style={{ marginTop: 5 }}>
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.cell, ...styles.colItem, borderLeft: '0.5pt solid #d1d5db' }}>Item</Text>
            <Text style={{ ...styles.cell, ...styles.colDesc }}>Descripción del Artículo</Text>
            <Text style={{ ...styles.cell, ...styles.colCant }}>Cantidad</Text>
            <Text style={{ ...styles.cell, ...styles.colUnit }}>Vlr unitario</Text>
            <Text style={{ ...styles.cell, ...styles.colTotal, borderRight: '0.5pt solid #d1d5db' }}>
              Total{'\n'}Dolares
            </Text>
          </View>

          {allItems.length > 0 ? allItems.map((item: any, index: number) => (
            <View style={styles.tableRow} key={index}>
              <Text style={{ ...styles.cell, ...styles.colItem }}>{index + 1}</Text>
              <Text style={{ ...styles.cell, ...styles.colDesc }}>{item.descripcion}</Text>
              <Text style={{ ...styles.cell, ...styles.colCant }}>{item.cantidad}</Text>
              <Text style={{ ...styles.cell, ...styles.colUnit }}>{formatCurrency(item.valor_unitario, currency)}</Text>
              <Text style={{ ...styles.cell, ...styles.colTotal, borderRight: 0 }}>{formatCurrency(item.subtotal || item.total || 0, currency)}</Text>
            </View>
          )) : (
            <View style={styles.tableRow}>
              <Text style={{ ...styles.cell, ...styles.colItem }}>1</Text>
              <Text style={{ ...styles.cell, ...styles.colDesc }}> </Text>
              <Text style={{ ...styles.cell, ...styles.colCant }}>1</Text>
              <Text style={{ ...styles.cell, ...styles.colUnit }}>USD 100</Text>
              <Text style={{ ...styles.cell, ...styles.colTotal, borderRight: 0 }}>USD 100</Text>
            </View>
          )}
          
          {/* Filas vacías adicionales para relleno estético */}
          {Array.from({ length: Math.max(0, 3 - allItems.length) }).map((_, i) => (
            <View style={styles.tableRow} key={`empty-${i}`}>
              <Text style={{ ...styles.cell, ...styles.colItem, minHeight: 15 }}> </Text>
              <Text style={{ ...styles.cell, ...styles.colDesc }}> </Text>
              <Text style={{ ...styles.cell, ...styles.colCant }}> </Text>
              <Text style={{ ...styles.cell, ...styles.colUnit }}> </Text>
              <Text style={{ ...styles.cell, ...styles.colTotal, borderRight: 0 }}> </Text>
            </View>
          ))}
        </View>

        {/* USUARIO FINAL */}
        <View style={styles.userFinalBox}>
          <Text style={{ textAlign: 'center', marginBottom: 2 }}>Usuario Final</Text>
          <View style={styles.userFinalRow}>
            <Text style={styles.userFinalLabel}>Nombre:</Text>
            <Text style={styles.userFinalValue}>RUNT</Text>
          </View>
        </View>

        {/* SECCIÓN INFERIOR */}
        <View style={styles.bottomSection}>
          <View style={styles.leftBottom}>
            <View style={styles.pricesBox}>
              <Text style={styles.pricesHeader}>Precios de la orden expresados en:</Text>
              <View style={styles.pricesRow}>
                <Text style={styles.pricesCellLeft}>Pesos</Text>
                <Text style={styles.pricesCellRight}>Dolares</Text>
              </View>
            </View>

            <View style={styles.authBox}>
              <Text style={styles.authTitle}>Autorizado por:</Text>
              <Text style={styles.authValue}>{orden.gerentes_cuenta?.nombre_completo || 'Carlos Garzon'}</Text>
            </View>
          </View>

          <View style={styles.rightBottom}>
            <View style={styles.totalsTable}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalMiddleSpan}></Text>
                <Text style={styles.totalValue}>{formatCurrency(orden.totales_oc?.subtotal, currency)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Descuento</Text>
                <Text style={styles.totalMiddleSpan}>0%</Text>
                <Text style={styles.totalValue}>- {formatCurrency(0, currency)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total con Descuento</Text>
                <Text style={styles.totalMiddleSpan}></Text>
                <Text style={styles.totalValue}>{formatCurrency(orden.totales_oc?.subtotal, currency)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>IVA</Text>
                <Text style={styles.totalMiddleSpan}>19%</Text>
                <Text style={styles.totalValue}>{formatCurrency(orden.totales_oc?.iva_total, currency)}</Text>
              </View>
              <View style={{ ...styles.totalRow, marginTop: 4 }}>
                <Text style={{ ...styles.totalLabel, ...styles.totalFinal }}>TOTAL</Text>
                <Text style={styles.totalMiddleSpan}></Text>
                <Text style={{ ...styles.totalValue, ...styles.totalFinal }}>{formatCurrency(orden.totales_oc?.total, currency)}</Text>
              </View>
            </View>
          </View>
        </View>

      </Page>
    </Document>
  );
};