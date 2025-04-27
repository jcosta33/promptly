import type { Meta, StoryObj } from "@storybook/react";
import { Box } from "./Box";

const meta = {
  title: "Components/Box",
  component: Box,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    children: {
      control: "text",
      description: "Content within the box",
    },
    as: {
      control: { type: "select" },
      options: [
        "div",
        "section",
        "article",
        "main",
        "aside",
        "header",
        "footer",
      ],
      description: "HTML element to render as",
      defaultValue: "div",
    },
    p: {
      control: { type: "select" },
      options: ["xxs", "xs", "sm", "md", "lg", "xl"],
      description: "Padding size",
    },
    m: {
      control: { type: "select" },
      options: ["xxs", "xs", "sm", "md", "lg", "xl"],
      description: "Margin size",
    },
    elevation: {
      control: { type: "select" },
      options: ["1", "2"],
      description: "Shadow elevation level",
    },
    bg: {
      control: { type: "select" },
      options: ["primary", "secondary", "tertiary", "transparent"],
      description: "Background color",
    },
    radius: {
      control: { type: "select" },
      options: ["sm", "md", "lg", "full"],
      description: "Border radius size",
    },
    inset: {
      control: "boolean",
      description: "Apply inset shadow effect",
    },
    outset: {
      control: "boolean",
      description: "Apply outset shadow effect",
    },
    interactive: {
      control: "boolean",
      description: "Make the box interactive with hover effects",
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
    },
  },
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "This is a box with default styling",
    p: "md",
  },
};

export const WithElevation: Story = {
  args: {
    children: "This is a box with elevation",
    p: "md",
    elevation: "1",
  },
};

export const WithPrimaryBackground: Story = {
  args: {
    children: "This is a box with primary background",
    p: "md",
    bg: "primary",
  },
};

export const WithSecondaryBackground: Story = {
  args: {
    children: "This is a box with secondary background",
    p: "md",
    bg: "secondary",
  },
};

export const WithTertiaryBackground: Story = {
  args: {
    children: "This is a box with tertiary background",
    p: "md",
    bg: "tertiary",
  },
};

export const WithBorderRadius: Story = {
  args: {
    children: "This is a box with border radius",
    p: "md",
    radius: "md",
  },
};

export const InsetBox: Story = {
  args: {
    children: "This is a box with inset effect",
    p: "md",
    inset: true,
  },
};

export const OutsetBox: Story = {
  args: {
    children: "This is a box with outset effect",
    p: "md",
    outset: true,
  },
};

export const InteractiveBox: Story = {
  args: {
    children: "This is an interactive box (hover me)",
    p: "md",
    interactive: true,
  },
};

export const ElevationVariations: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Box p="md" {...args}>
        No Elevation (flat)
      </Box>
      <Box p="md" elevation="1" {...args}>
        Elevation 1
      </Box>
      <Box p="md" elevation="2" {...args}>
        Elevation 2
      </Box>
    </div>
  ),
};

export const PaddingVariations: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Box p="xxs" {...args}>
        Padding XXS
      </Box>
      <Box p="xs" {...args}>
        Padding XS
      </Box>
      <Box p="sm" {...args}>
        Padding SM
      </Box>
      <Box p="md" {...args}>
        Padding MD
      </Box>
      <Box p="lg" {...args}>
        Padding LG
      </Box>
      <Box p="xl" {...args}>
        Padding XL
      </Box>
    </div>
  ),
};

export const BorderRadius: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Box p="md" {...args}>
        No Border Radius
      </Box>
      <Box p="md" radius="sm" {...args}>
        Border Radius SM
      </Box>
      <Box p="md" radius="md" {...args}>
        Border Radius MD
      </Box>
      <Box p="md" radius="lg" {...args}>
        Border Radius LG
      </Box>
      <Box p="md" radius="full" {...args}>
        Border Radius Full
      </Box>
    </div>
  ),
};
