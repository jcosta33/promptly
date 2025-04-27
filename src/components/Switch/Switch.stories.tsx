import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "./Switch";
import { useState } from "react";

const meta = {
  title: "Components/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "Label text for the switch",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Size of the switch",
    },
    disabled: {
      control: "boolean",
      description: "Whether the switch is disabled",
    },
    checked: {
      control: "boolean",
      description: "Whether the switch is checked",
    },
    labelPosition: {
      control: { type: "select" },
      options: ["left", "right"],
      description: "Position of the label relative to the switch",
    },
    error: {
      control: "boolean",
      description: "Whether to show an error state",
    },
    errorMessage: {
      control: "text",
      description: "Error message to display when error is true",
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Toggle feature",
  },
};

export const Checked: Story = {
  args: {
    label: "Feature enabled",
    checked: true,
  },
};

export const Small: Story = {
  args: {
    label: "Small switch",
    size: "sm",
  },
};

export const Medium: Story = {
  args: {
    label: "Medium switch",
    size: "md",
  },
};

export const Large: Story = {
  args: {
    label: "Large switch",
    size: "lg",
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled switch",
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: "Disabled checked switch",
    disabled: true,
    checked: true,
  },
};

export const LabelOnLeft: Story = {
  args: {
    label: "Label on left",
    labelPosition: "left",
  },
};

export const WithError: Story = {
  args: {
    label: "Switch with error",
    error: true,
    errorMessage: "This setting requires permission",
  },
};

export const Interactive: Story = {
  render: () => {
    // This is needed for Storybook to handle state properly
    const [checked, setChecked] = useState(false);
    
    return (
      <Switch
        label={checked ? "Feature enabled" : "Feature disabled"}
        checked={checked}
        onChange={() => setChecked(!checked)}
      />
    );
  },
};

export const SizeComparison: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Switch label="Small switch" size="sm" />
      <Switch label="Medium switch" size="md" />
      <Switch label="Large switch" size="lg" />
    </div>
  ),
};
