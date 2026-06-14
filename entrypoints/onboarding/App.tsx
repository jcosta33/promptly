import type { FC } from "react";
import { SettingsPanel } from "$/modules/configuration/presentations/views/SettingsPanel";
import { Flex } from "$/components/Flex/Flex";
import { Text } from "$/components/Text/Text";

const App: FC = () => {
  return (
    <Flex direction="column" align="center" style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      <Text as="h1">Welcome to Promptly</Text>
      <Text>Please download a model to get started. You can also customize your settings below.</Text>
      <SettingsPanel />
    </Flex>
  );
};

export default App;
