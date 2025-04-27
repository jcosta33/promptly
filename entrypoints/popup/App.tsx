import React from "react";
import "../../src/theme";
import "@/src/normalize.css";
import { SettingsPanel } from "$/modules/settings/presentations/views/SettingsPanel";

/**
 * Main App component for the extension popup
 */
const App: React.FC = () => {
  return <SettingsPanel />;
};

export default App;
