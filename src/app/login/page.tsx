"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/actions/auth.actions";

export default function LoginPage() {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(loginAction, {
        success: false,
        message: "",
    });

    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast.success(state.message);
                router.push("/dashboard");
            } else {
                toast.error(state.message);
            }
        }
    }, [state, router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-900/5 sm:p-10">
                <div className="mb-8 flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white shadow-sm">
                        <Package className="h-6 w-6" />
                    </div>
                    <h1 className="mt-4 text-2xl font-semibold tracking-tight text-gray-900">
                        Iniciar Sesión
                    </h1>
                    <p className="mt-2 text-sm text-gray-500 text-center">
                        Ingresa tus credenciales para acceder al sistema de Órdenes de Compra.
                    </p>
                </div>

                <form action={formAction} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="admin@empresa.com"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Contraseña</Label>
                            <a href="#" className="text-xs font-medium text-blue-600 hover:underline">
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? "Ingresando..." : "Ingresar"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
