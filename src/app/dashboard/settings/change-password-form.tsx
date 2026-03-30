"use client";

import { useActionState, useEffect } from "react";
import { changePasswordAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
    onSuccess?: () => void;
}

export function ChangePasswordForm({ onSuccess }: Props = {}) {
    const [state, formAction, isPending] = useActionState(changePasswordAction, {
        success: false,
        message: "",
    });

    useEffect(() => {
        if (state.success && onSuccess) {
            onSuccess();
        }
    }, [state.success, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                />
            </div>

            {state?.message && (
                <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-500'}`}>
                    {state.message}
                </p>
            )}

            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                {isPending ? "Actualizando..." : "Cambiar Contraseña"}
            </Button>
        </form>
    );
}
