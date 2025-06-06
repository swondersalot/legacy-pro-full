import React, { useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { registerPushToken, onPushMessage } from "../utils/firebase";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  useEffect(() => {
    registerPushToken();
    onPushMessage((payload) => {
      // Optionally handle in-app push notifications, e.g., alert or toast
      console.log("Push message:", payload);
    });
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
