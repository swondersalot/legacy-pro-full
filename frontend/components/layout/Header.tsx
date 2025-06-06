import React from "react";
import { useSession, signOut } from "next-auth/react";

const Header: React.FC = () => {
  const { data: session } = useSession();

  return (
    <header className="flex items-center justify-between bg-white shadow px-4 h-16">
      <h1 className="text-xl font-semibold text-gray-800">Legacy Pro</h1>
      <div className="flex items-center">
        {session?.user?.name && (
          <span className="mr-4 text-gray-600">Hello, {session.user.name}</span>
        )}
        {session ? (
          <button
            onClick={() => signOut()}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Sign Out
          </button>
        ) : (
          <a href="/auth/signin" className="text-sm text-blue-600 hover:text-blue-800">
            Sign In
          </a>
        )}
      </div>
    </header>
  );
};

export default Header;
