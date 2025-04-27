import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "./Select";
import { useState } from "react";

const meta = {
  title: "Components/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    options: {
      control: "object",
      description: "Array of options with value, label, and optional disabled state",
    },
    value: {
      control: "text",
      description: "The currently selected value",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text when no option is selected",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Size of the select",
    },
    disabled: {
      control: "boolean",
      description: "Whether the select is disabled",
    },
    error: {
      control: "boolean",
      description: "Whether to show an error state",
    },
    errorMessage: {
      control: "text",
      description: "Error message to display when error is true",
    },
    label: {
      control: "text",
      description: "Label text for the select",
    },
    fullWidth: {
      control: "boolean",
      description: "Whether the select takes up the full width of its container",
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample options for all stories
const options = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
  { value: "option4", label: "Option 4 (Disabled)", disabled: true },
  { value: "option5", label: "Option 5" },
];

export const Default: Story = {
  args: {
    options,
    placeholder: "Select an option",
  },
};

export const WithLabel: Story = {
  args: {
    options,
    label: "Select an option",
    placeholder: "Choose one",
  },
};

export const PreSelected: Story = {
  args: {
    options,
    value: "option2",
    label: "Preselected option",
  },
};

export const Small: Story = {
  args: {
    options,
    size: "sm",
    label: "Small select",
  },
};

export const Medium: Story = {
  args: {
    options,
    size: "md",
    label: "Medium select",
  },
};

export const Large: Story = {
  args: {
    options,
    size: "lg",
    label: "Large select",
  },
};

export const Disabled: Story = {
  args: {
    options,
    disabled: true,
    label: "Disabled select",
    value: "option1",
  },
};

export const WithError: Story = {
  args: {
    options,
    error: true,
    errorMessage: "Please select a valid option",
    label: "Select with error",
  },
};

export const FullWidth: Story = {
  args: {
    options,
    fullWidth: true,
    label: "Full width select",
  },
  parameters: {
    layout: "padded",
  },
};

export const Interactive: Story = {
  render: () => {
    // This is needed for Storybook to handle state properly
    const [value, setValue] = useState<string>("");
    
    return (
      <div style={{ width: "250px" }}>
        <Select
          label="Interactive select"
          options={options}
          value={value}
          onChange={(newValue) => setValue(newValue)}
        />
        {value && (
          <div style={{ marginTop: "16px" }}>
            Selected value: <strong>{value}</strong>
          </div>
        )}
      </div>
    );
  },
};

export const ManyOptions: Story = {
  args: {
    label: "Many options",
    options: [
      { value: "option1", label: "Option 1" },
      { value: "option2", label: "Option 2" },
      { value: "option3", label: "Option 3" },
      { value: "option4", label: "Option 4" },
      { value: "option5", label: "Option 5" },
      { value: "option6", label: "Option 6" },
      { value: "option7", label: "Option 7" },
      { value: "option8", label: "Option 8" },
      { value: "option9", label: "Option 9" },
      { value: "option10", label: "Option 10" },
      { value: "option11", label: "Option 11" },
      { value: "option12", label: "Option 12" },
    ],
  },
};
