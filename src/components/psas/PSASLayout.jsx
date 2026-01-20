import Layout from "../shared/Layout";
import { getLayoutConfig } from "./config";
import { useAuth } from "../../contexts/useAuth";

function PSASLayout({ children, isModalOpen, pageLoading = false }) {
  const { user } = useAuth();
  const layoutConfig = getLayoutConfig(user);

  return (
    <Layout
      children={children}
      isModalOpen={isModalOpen}
      pageLoading={pageLoading}
      config={layoutConfig}
    />
  );
}

export default PSASLayout;
