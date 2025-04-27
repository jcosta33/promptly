import { type FC } from "react";
import "$/theme";
import "$/normalize.css";
import { SettingsPanel } from "$/modules/configuration/presentations/views/SettingsPanel";

/**
 * Main App component for the extension popup
 */
const App: FC = () => {
  return <SettingsPanel />;
};

export default App;
