import { User } from './types';

// In a real app, this would be a secure database lookup.
// FIX: Export the 'users' array to make it available for import.
export const users: User[] = [
    // Admins
    { email: 'brettae221@gmail.com', password: 'password', role: 'Admin', name: 'Brett', dept: 'Development', appPosition: 'Owner' },
    { email: 'bedwards@pecofoods.com', password: 'Magick08', role: 'Admin', name: 'brett', dept: 'ops trainee', appPosition: 'Admin' },
    { email: 'geno@pecofoods.com', password: '1122', role: 'Admin' },
    { email: 'caleb@pecofoods.com', password: '6969', role: 'Admin' },
];

/**
 * Simulates an authentication request.
 * @param email The email to authenticate.
 * @param password The password to authenticate.
 * @returns A promise that resolves to a User object (without password) or null.
 */
export const authenticate = (email: string, password: string): Promise<Omit<User, 'password'> | null> => {
    return new Promise((resolve) => {
        setTimeout(() => { // Simulate network delay
            const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
            if (foundUser) {
                // Return user object without the password
                const { password: _, ...userToReturn } = foundUser;
                resolve(userToReturn);
            } else {
                resolve(null);
            }
        }, 500);
    });
};
