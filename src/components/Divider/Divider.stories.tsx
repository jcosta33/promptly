import type { Meta, StoryObj } from "@storybook/react";
import { Divider } from "./Divider";

const meta = {
  title: "Components/Divider",
  component: Divider,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["solid", "dashed", "dotted", "groove", "ridge", "double"],
      description: "Visual style of the divider",
    },
    orientation: {
      control: { type: "select" },
      options: ["horizontal", "vertical"],
      description: "Orientation of the divider",
    },
    thickness: {
      control: { type: "select" },
      options: ["thin", "medium", "thick"],
      description: "Thickness of the divider",
    },
    label: {
      control: "text",
      description: "Optional label to display in the middle of the divider",
    },
    color: {
      control: { type: "select" },
      options: ["default", "primary", "secondary", "tertiary"],
      description: "Color of the divider",
    },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "solid",
    orientation: "horizontal",
    thickness: "medium",
  },
};

export const WithLabel: Story = {
  args: {
    variant: "solid",
    orientation: "horizontal",
    thickness: "medium",
    label: "Section",
  },
};

export const Dashed: Story = {
  args: {
    variant: "dashed",
    orientation: "horizontal",
    thickness: "medium",
  },
};

export const Dotted: Story = {
  args: {
    variant: "dotted",
    orientation: "horizontal",
    thickness: "medium",
  },
};

export const Groove: Story = {
  args: {
    variant: "groove",
    orientation: "horizontal",
    thickness: "medium",
  },
};

export const Ridge: Story = {
  args: {
    variant: "ridge",
    orientation: "horizontal",
    thickness: "medium",
  },
};

export const Double: Story = {
  args: {
    variant: "double",
    orientation: "horizontal",
    thickness: "medium",
  },
};

export const PrimaryColor: Story = {
  args: {
    variant: "solid",
    orientation: "horizontal",
    thickness: "medium",
    color: "primary",
  },
};

export const SecondaryColor: Story = {
  args: {
    variant: "solid",
    orientation: "horizontal",
    thickness: "medium",
    color: "secondary",
  },
};

export const Vertical: Story = {
  args: {
    variant: "solid",
    orientation: "vertical",
    thickness: "medium",
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100px', display: 'flex', alignItems: 'center' }}>
        <div>Left Content</div>
        {Story()}
        <div>Right Content</div>
      </div>
    ),
  ],
};

export const ThicknessVariations: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <p>Thin</p>
        <Divider {...args} thickness="thin" />
      </div>
      <div>
        <p>Medium</p>
        <Divider {...args} thickness="medium" />
      </div>
      <div>
        <p>Thick</p>
        <Divider {...args} thickness="thick" />
      </div>
    </div>
  ),
};
