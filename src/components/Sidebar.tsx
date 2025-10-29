'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, ShoppingCart, BarChart2, Shield, Settings, Gem, Store } from 'lucide-react';


const navLinks = [
    { name: 'Accueil', href: '/dashboard', icon: Home },
    { name: 'Inventaire', href: '/dashboard/inventory', icon: ShoppingCart },
    { name: 'Classement', href: '/dashboard/classement', icon: BarChart2 },
    { name: 'Magasin', href: '/dashboard/shop', icon: Gem },
    { name: 'Marché', href: '/dashboard/market', icon: Store },
    { name: 'ParamÃ¨tres', href: '/dashboard/settings', icon: Settings },
    { name: 'Admin', href: '/dashboard/admin', icon: Shield, adminOnly: true },
];

export function Sidebar({ userRole }: { userRole?: string }) {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col">
            <h1 className="text-2xl font-bold mb-10 text-center">Dashboard</h1>
            <nav className="flex flex-col space-y-2">
                {navLinks.map((link) => {
                    if (link.adminOnly && userRole !== 'admin') {
                        return null;
                    }

                    const isActive = pathname === link.href;

                    return (
                        <Link 
                            key={link.name} // Correction: Ajout de la clÃ© unique
                            href={link.href}
                            className={`flex items-center py-3 px-4 rounded-lg transition-colors text-lg ${
                                isActive 
                                ? 'bg-blue-600 text-white' 
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            <link.icon className="mr-3 h-6 w-6" />
                            <span>{link.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
