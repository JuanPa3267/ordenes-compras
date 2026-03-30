"use client";

import { useTransition } from "react";
import { toggleContactoStatusAction } from "@/actions/clientes.actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Power, PowerOff } from "lucide-react";

interface ToggleButtonProps {
    idContacto: string;
    idCliente: string;
    isActive: boolean;
}

export function ToggleContactoButton({ idContacto, idCliente, isActive }: ToggleButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        startTransition(async () => {
            const res = await toggleContactoStatusAction(idContacto, idCliente, isActive);
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
             disabled={isPending}
             className={cn(
                 isActive ? "text-red-500 hover:text-red-600 hover:bg-red-50" : "bg-green-600 hover:bg-green-700 text-white"
             )}
         >
             {isActive ? (
                 <>
                     <PowerOff className="mr-2 h-4 w-4" />
                     Inactivar
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
