"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { ChangePasswordForm } from "./change-password-form"
import { KeyRound } from "lucide-react"

export function ChangePasswordModal() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <Button onClick={() => setIsOpen(true)} variant="outline" className="gap-2">
                <KeyRound className="h-4 w-4" />
                Cambiar Contraseña
            </Button>
            
            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Cambiar Contraseña"
                description="Ingresa tu contraseña actual y la nueva contraseña para actualizar tu acceso."
            >
                <ChangePasswordForm onSuccess={() => {
                    setTimeout(() => setIsOpen(false), 2000)
                }} />
            </Modal>
        </>
    )
}
