import "next-auth";
import { Role, UserRole } from "@prisma/client";

declare module "next-auth" {
    interface User {
        role: Role;
        roleExplicitlyChosen: boolean;
        userRole?: UserRole;
    }

    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            image: string;
            role: Role;
            roleExplicitlyChosen: boolean;
            userRole?: UserRole;
        }
    }
}