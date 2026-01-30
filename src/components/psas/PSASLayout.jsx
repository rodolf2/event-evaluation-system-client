import Layout from "../shared/Layout";
import { getLayoutConfig } from "./config";
import { useAuth } from "../../contexts/useAuth";

function PSASLayout({ children, isModalOpen, pageLoading = false, backgroundColor }) {
  const { user } = useAuth();
  const layoutConfig = getLayoutConfig(user);

  const mergedConfig = {
    ...layoutConfig,
    ...(backgroundColor ? { backgroundColor } : {}),
  };

  return (
    <Layout
      children={children}
      isModalOpen={isModalOpen}
      pageLoading={pageLoading}
      config={mergedConfig}
    />
  );
}

export default PSASLayout;
