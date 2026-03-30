"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Package, LayoutDashboard, Users, Settings, LogOut, Bell, Truck, Factory, Network, Tag, Coins, ClipboardList } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getCurrentUserAction } from "@/actions/auth.actions";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();

    const [user, setUser] = useState<{ nombre_completo: string; correo: string } | null>(null);

    useEffect(() => {
        getCurrentUserAction().then((data) => {
            if (data) {
                if (!data.activo) {
                    // Kick out if inactive
                    import("@/actions/auth.actions").then((m) => {
                        m.logoutAction().then(() => router.push("/login?error=inactive"));
                    });
                } else {
                    setUser(data);
                }
            } else {
                router.push("/login");
            }
        });
    }, [router]);

    const navigation = [
        { name: "Resumen", href: "/dashboard", icon: LayoutDashboard },
        { name: "Clientes", href: "/dashboard/clientes", icon: Users },
        { name: "Proveedores", href: "/dashboard/proveedores", icon: Truck },
        { name: "Distribuidores", href: "/dashboard/distribuidores", icon: Network },
        { name: "Fabricantes", href: "/dashboard/fabricantes", icon: Factory },
        { name: "Ítems", href: "/dashboard/items", icon: Tag },
        { name: "Monedas", href: "/dashboard/monedas", icon: Coins },
        { name: "Auditoría", href: "/dashboard/auditoria", icon: ClipboardList },
        { name: "Configuración", href: "/dashboard/settings", icon: Settings },
    ];

    const getInitials = (name: string) => {
        return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    };

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            {/* Sidebar Desktop */}
            <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white sm:flex">
                <div className="flex h-16 items-center border-b border-gray-200 px-6">
                    <Package className="h-6 w-6 mr-2 text-black" />
                    <span className="font-semibold tracking-tight text-lg">Sistema OC</span>
                </div>
                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="space-y-1 px-3">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-gray-100 text-gray-900"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="border-t border-gray-200 p-4">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="h-9 w-9 rounded-full bg-gray-900 text-white flex items-center justify-center font-medium text-sm">
                            {user ? getInitials(user.nombre_completo) : "..."}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">{user ? user.nombre_completo : "Cargando..."}</span>
                            <span className="text-xs text-gray-500">{user ? user.correo : "..."}</span>
                        </div>
                    </div>
                    <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100" asChild>
                        <Link href="/login">
                            <LogOut className="mr-3 h-5 w-5" />
                            Cerrar Sesión
                        </Link>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen">
                <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-1 items-center">
                        {/* Search bar removed */}
                    </div>
                    <div className="ml-4 flex items-center md:ml-6">
                        <Button variant="ghost" size="icon" className="relative rounded-full text-gray-500 hover:text-gray-900">
                            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                            <Bell className="h-5 w-5" />
                        </Button>
                    </div>
                </header>

                {children}
            </main>
        </div>
    );
}
