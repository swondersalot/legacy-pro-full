import React from "react";
import Link from "next/link";
import {
  Home,
  FileText,
  FileArchive,
  Users,
  Settings,
  Shield,
  Activity,
  Bell,
  Briefcase,
  File,
} from "lucide-react";

const Sidebar: React.FC = () => {
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Trust Builder", href: "/trust-builder", icon: Briefcase },
    { name: "Entity Builder", href: "/entity-builder", icon: Users },
    { name: "Legacy Letter", href: "/legacy-letter", icon: FileText },
    { name: "Vault", href: "/vault", icon: FileArchive },
    { name: "Protection Score", href: "/protection-score", icon: Shield },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Admin", href: "/admin", icon: Activity },
  ];

  return (
    <aside className="w-64 bg-white border-r">
      <nav className="mt-6">
        {navItems.map((item) => (
          <Link key={item.name} href={item.href}>
            <a className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200">
              <item.icon className="w-5 h-5 mr-3" />
              <span className="text-sm">{item.name}</span>
            </a>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
