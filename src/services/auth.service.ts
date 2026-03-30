import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export class AuthService {
    /**
     * Authenticates a user (manager) by email and password.
     * Returns the user object (without password) if successful, or null if it fails.
     */
    static async authenticateUser(email: string, passwordPlana: string) {
        try {
            // 1. Validate inputs basic format
            if (!email || !passwordPlana) {
                throw new Error("El correo y la contraseña son obligatorios");
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error("El formato del correo electrónico no es válido");
            }

            // 2. Find user in the database
            const user = await prisma.gerentes_cuenta.findUnique({
                where: { correo: email },
            });

            // 3. User exists?
            if (!user) {
                // We throw a generic error to not reveal if the email exists or not
                throw new Error("Credenciales inválidas");
            }

            // 4. Is user active?
            if (!user.activo) {
                throw new Error("El usuario se encuentra inactivo. Contacte al administrador.");
            }

            // 5. Does the user have a password set?
            if (!user.password) {
                throw new Error("El usuario no tiene una contraseña configurada.");
            }

            // 6. Verify password using bcrypt
            const isPasswordValid = await bcrypt.compare(passwordPlana, user.password);

            if (!isPasswordValid) {
                throw new Error("Credenciales inválidas");
            }

            // 7. Successful login: Return user data without password
            const { password: _, ...userWithoutPassword } = user;

            return userWithoutPassword;

        } catch (error: any) {
            console.error("AuthService Error:", error.message);
            // Re-throw to be handled by the Server Action
            throw new Error(error.message);
        }
    }

    /**
     * Utility to hash a new password. 
     * Useful for seeding or password reset features.
     */
    static async hashPassword(passwordPlana: string): Promise<string> {
        const saltRounds = 10;
        return await bcrypt.hash(passwordPlana, saltRounds);
    }
}
