import { useRoutes } from "react-router-dom";
import LogIn from "../../pages/auth/log-in";


const appRoutes = [
  { path: "/", element: <LogIn /> },
];

function AppRoutes() {
  return useRoutes(appRoutes);
}

export default AppRoutes;
