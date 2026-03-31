import { Outlet } from "react-router";
import { ChatProvider } from "../contexts/ChatContext";
import { PermissionsProvider } from "../contexts/PermissionsContext";
import { FavoritesProvider } from "../contexts/FavoritesContext";

export default function RootLayout() {
  return (
    <PermissionsProvider>
      <ChatProvider>
        <FavoritesProvider>
          <Outlet />
        </FavoritesProvider>
      </ChatProvider>
    </PermissionsProvider>
  );
}