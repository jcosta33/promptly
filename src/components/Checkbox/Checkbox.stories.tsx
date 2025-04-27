import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./Checkbox";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "Label text for the checkbox",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Size of the checkbox",
    },
    disabled: {
      control: "boolean",
      description: "Whether the checkbox is disabled",
    },
    checked: {
      control: "boolean",
      description: "Whether the checkbox is checked",
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
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Default checkbox",
    size: "md",
  },
};

export const Checked: Story = {
  args: {
    label: "Checked checkbox",
    checked: true,
  },
};

export const Small: Story = {
  args: {
    label: "Small checkbox",
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    label: "Large checkbox",
    size: "lg",
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled checkbox",
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: "Disabled checked checkbox",
    disabled: true,
    checked: true,
  },
};

export const WithError: Story = {
  args: {
    label: "Checkbox with error",
    error: true,
    errorMessage: "This field is required",
  },
};

export const WithoutLabel: Story = {
  args: {
    // No label provided
  },
};

export const CheckboxGroup: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Checkbox label="Option 1" name="group" value="1" />
      <Checkbox label="Option 2" name="group" value="2" />
      <Checkbox label="Option 3" name="group" value="3" />
      <Checkbox label="Disabled option" name="group" value="4" disabled />
    </div>
  ),
};
