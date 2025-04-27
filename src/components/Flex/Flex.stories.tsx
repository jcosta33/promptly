import type { Meta, StoryObj } from "@storybook/react";
import { Flex } from "./Flex";
import { Box } from "../Box/Box";

const meta = {
  title: "Layout/Flex",
  component: Flex,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    direction: {
      control: { type: "select" },
      options: ["row", "column", "row-reverse", "column-reverse"],
      description: "Direction of the flex container",
    },
    wrap: {
      control: { type: "select" },
      options: ["nowrap", "wrap", "wrap-reverse"],
      description: "Wrap behavior of flex items",
    },
    justify: {
      control: { type: "select" },
      options: ["start", "end", "center", "between", "around", "evenly"],
      description: "Justify content behavior",
    },
    align: {
      control: { type: "select" },
      options: ["start", "end", "center", "stretch", "baseline"],
      description: "Align items behavior",
    },
    gap: {
      control: { type: "select" },
      options: ["xxs", "xs", "sm", "md", "lg", "xl"],
      description: "Gap between flex items",
    },
    inline: {
      control: "boolean",
      description: "Whether to use inline-flex display",
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
    },
  },
} satisfies Meta<typeof Flex>;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper Box style for demo purposes
const boxStyle = {
  padding: '12px',
  textAlign: 'center' as const,
  width: '80px',
  height: '80px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const Row: Story = {
  args: {
    direction: "row",
    gap: "md",
    children: (
      <>
        <Box bg="primary" style={boxStyle}>1</Box>
        <Box bg="secondary" style={boxStyle}>2</Box>
        <Box bg="tertiary" style={boxStyle}>3</Box>
      </>
    ),
  },
};

export const Column: Story = {
  args: {
    direction: "column",
    gap: "md",
    children: (
      <>
        <Box bg="primary" style={boxStyle}>1</Box>
        <Box bg="secondary" style={boxStyle}>2</Box>
        <Box bg="tertiary" style={boxStyle}>3</Box>
      </>
    ),
  },
};

export const JustifyCenter: Story = {
  args: {
    justify: "center",
    gap: "md",
    children: (
      <>
        <Box bg="primary" style={boxStyle}>1</Box>
        <Box bg="secondary" style={boxStyle}>2</Box>
        <Box bg="tertiary" style={boxStyle}>3</Box>
      </>
    ),
  },
};

export const AlignCenter: Story = {
  args: {
    align: "center",
    gap: "md",
    children: (
      <>
        <Box bg="primary" style={{...boxStyle, height: '60px'}}>1</Box>
        <Box bg="secondary" style={{...boxStyle, height: '80px'}}>2</Box>
        <Box bg="tertiary" style={{...boxStyle, height: '100px'}}>3</Box>
      </>
    ),
  },
};

export const JustifySpaceBetween: Story = {
  args: {
    justify: "between",
    style: { width: '400px' },
    children: (
      <>
        <Box bg="primary" style={boxStyle}>1</Box>
        <Box bg="secondary" style={boxStyle}>2</Box>
        <Box bg="tertiary" style={boxStyle}>3</Box>
      </>
    ),
  },
};

export const Wrap: Story = {
  args: {
    wrap: "wrap",
    gap: "md",
    style: { width: '200px' },
    children: (
      <>
        <Box bg="primary" style={boxStyle}>1</Box>
        <Box bg="secondary" style={boxStyle}>2</Box>
        <Box bg="tertiary" style={boxStyle}>3</Box>
        <Box bg="primary" style={boxStyle}>4</Box>
        <Box bg="secondary" style={boxStyle}>5</Box>
        <Box bg="tertiary" style={boxStyle}>6</Box>
      </>
    ),
  },
};
