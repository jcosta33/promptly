import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";

const meta = {
  title: "Components/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "Label text for the input",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Size of the input",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text",
    },
    error: {
      control: "boolean",
      description: "Whether the input has an error",
    },
    errorMessage: {
      control: "text",
      description: "Error message to display when error is true",
    },
    disabled: {
      control: "boolean",
      description: "Whether the input is disabled",
    },
    type: {
      control: { type: "select" },
      options: ["text", "password", "email", "number", "tel", "url"],
      description: "Type of the input",
    },
    fullWidth: {
      control: "boolean",
      description: "Whether the input takes up the full width of its container",
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Enter text",
  },
};

export const WithLabel: Story = {
  args: {
    label: "Username",
    placeholder: "Enter your username",
  },
};

export const Small: Story = {
  args: {
    label: "Small Input",
    placeholder: "Small size",
    size: "sm",
  },
};

export const Medium: Story = {
  args: {
    label: "Medium Input",
    placeholder: "Medium size",
    size: "md",
  },
};

export const Large: Story = {
  args: {
    label: "Large Input",
    placeholder: "Large size",
    size: "lg",
  },
};

export const WithError: Story = {
  args: {
    label: "Password",
    placeholder: "Enter your password",
    type: "password",
    error: true,
    errorMessage: "Password must be at least 8 characters",
  },
};

export const FullWidth: Story = {
  args: {
    label: "Full Width",
    placeholder: "This input takes up the full width",
    fullWidth: true,
  },
  parameters: {
    layout: "padded",
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled Input",
    placeholder: "This input is disabled",
    disabled: true,
  },
};

export const WithAdornments: Story = {
  args: {
    label: "Price",
    placeholder: "0.00",
    startAdornment: "$",
    endAdornment: "USD",
  },
};

export const NumberInput: Story = {
  args: {
    label: "Quantity",
    placeholder: "0",
    type: "number",
    min: 0,
    max: 100,
  },
};
