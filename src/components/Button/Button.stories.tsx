import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: { type: "select" },
      options: ["primary", "secondary", "tertiary", "danger"],
      description: "Button color style",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Button size",
    },
    fullWidth: {
      control: "boolean",
      description:
        "Whether the button takes up the full width of its container",
    },
    isLoading: {
      control: "boolean",
      description: "Shows a loading indicator and disables the button",
    },
    disabled: {
      control: "boolean",
      description: "Disables the button",
    },
    type: {
      control: { type: "select" },
      options: ["button", "submit", "reset"],
      description: "HTML button type",
    },
    children: {
      control: "text",
      description: "Button content",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    color: "primary",
    children: "Primary Button",
    size: "md",
  },
};

export const Secondary: Story = {
  args: {
    color: "secondary",
    children: "Secondary Button",
    size: "md",
  },
};

export const Tertiary: Story = {
  args: {
    color: "tertiary",
    children: "Tertiary Button",
    size: "md",
  },
};

export const Danger: Story = {
  args: {
    color: "danger",
    children: "Danger Button",
    size: "md",
  },
};

export const Small: Story = {
  args: {
    children: "Small Button",
    size: "sm",
    color: "primary",
  },
};

export const Medium: Story = {
  args: {
    children: "Medium Button",
    size: "md",
    color: "primary",
  },
};

export const Large: Story = {
  args: {
    children: "Large Button",
    size: "lg",
    color: "primary",
  },
};

export const FullWidth: Story = {
  args: {
    children: "Full Width Button",
    fullWidth: true,
    color: "primary",
  },
};

export const Loading: Story = {
  args: {
    children: "Loading Button",
    isLoading: true,
    color: "primary",
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled Button",
    disabled: true,
    color: "primary",
  },
};
