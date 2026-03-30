"use client";

import { useTransition } from "react";
import { toggleGerenteStatusAction } from "@/actions/gerentes.actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Power, PowerOff } from "lucide-react";

interface ToggleButtonProps {
    idGerente: string;
    isActive: boolean;
    isAdmin: boolean;
}

export function ToggleGerenteButton({ idGerente, isActive, isAdmin }: ToggleButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        startTransition(async () => {
            const res = await toggleGerenteStatusAction(idGerente, isActive);
            if (res.success) {
                toast.success(res.message);
            } else {
                toast.error(res.message);
            }
        });
    };

    return (
        <Button 
            variant={isActive ? "outline" : "default"} 
            size="sm" 
            onClick={handleToggle}
            disabled={isPending || !isAdmin}
            className={cn(
                isActive ? "text-red-500 hover:text-red-600 hover:bg-red-50" : "bg-green-600 hover:bg-green-700 text-white",
                !isAdmin && "opacity-50 cursor-not-allowed hidden" // hide button completely if not admin
            )}
        >
            {isActive ? (
                <>
                    <PowerOff className="mr-2 h-4 w-4" />
                    Desactivar
                </>
            ) : (
                <>
                    <Power className="mr-2 h-4 w-4" />
                    Activar
                </>
            )}
        </Button>
    );
}
