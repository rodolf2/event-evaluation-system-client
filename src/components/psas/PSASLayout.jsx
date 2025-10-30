import Layout from "../shared/Layout";
import { layoutConfig } from "./config";

function PSASLayout({ children, isModalOpen, pageLoading = false }) {
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