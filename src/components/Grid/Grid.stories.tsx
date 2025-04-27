import type { Meta, StoryObj } from "@storybook/react";
import { Grid } from "./Grid";
import { Box } from "../Box/Box";

const meta = {
  title: "Layout/Grid",
  component: Grid,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    columns: {
      control: { type: "select" },
      options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, "auto-fill", "auto-fit"],
      description: "Number of columns or auto-fill/auto-fit",
    },
    rows: {
      control: { type: "select" },
      options: [1, 2, 3, 4, 5, "auto-fill", "auto-fit"],
      description: "Number of rows or auto-fill/auto-fit",
    },
    gap: {
      control: { type: "select" },
      options: ["xxs", "xs", "sm", "md", "lg", "xl"],
      description: "Gap between grid items",
    },
    rowGap: {
      control: { type: "select" },
      options: ["xxs", "xs", "sm", "md", "lg", "xl"],
      description: "Gap between grid rows",
    },
    columnGap: {
      control: { type: "select" },
      options: ["xxs", "xs", "sm", "md", "lg", "xl"],
      description: "Gap between grid columns",
    },
    align: {
      control: { type: "select" },
      options: ["start", "end", "center", "stretch"],
      description: "Alignment of grid items",
    },
    justify: {
      control: { type: "select" },
      options: ["start", "end", "center", "stretch"],
      description: "Justification of grid items",
    },
    minItemWidth: {
      control: "text",
      description: "Minimum width of grid items (e.g., '100px')",
    },
    inline: {
      control: "boolean",
      description: "Whether to use inline-grid display",
    },
  },
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper Box style for demo purposes
const boxStyle = {
  padding: '12px',
  textAlign: 'center' as const,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '80px'
};

export const Default: Story = {
  args: {
    columns: 2,
    gap: "md",
    children: (
      <>
        <Box bg="primary" style={boxStyle}>1</Box>
        <Box bg="secondary" style={boxStyle}>2</Box>
        <Box bg="tertiary" style={boxStyle}>3</Box>
        <Box bg="primary" style={boxStyle}>4</Box>
      </>
    ),
  },
};

export const ThreeColumns: Story = {
  args: {
    columns: 3,
    gap: "md",
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

export const ResponsiveGrid: Story = {
  args: {
    columns: "auto-fill",
    minItemWidth: "150px",
    gap: "md",
    children: (
      <>
        <Box bg="primary" style={boxStyle}>1</Box>
        <Box bg="secondary" style={boxStyle}>2</Box>
        <Box bg="tertiary" style={boxStyle}>3</Box>
        <Box bg="primary" style={boxStyle}>4</Box>
        <Box bg="secondary" style={boxStyle}>5</Box>
        <Box bg="tertiary" style={boxStyle}>6</Box>
        <Box bg="primary" style={boxStyle}>7</Box>
        <Box bg="secondary" style={boxStyle}>8</Box>
      </>
    ),
  },
};

export const WithExplicitRows: Story = {
  args: {
    columns: 3,
    rows: 2,
    gap: "md",
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

export const DifferentGaps: Story = {
  args: {
    columns: 3,
    rowGap: "lg",
    columnGap: "sm",
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

export const CenteredItems: Story = {
  args: {
    columns: 3,
    gap: "md",
    align: "center",
    justify: "center",
    children: (
      <>
        <Box bg="primary" style={{...boxStyle, width: '80%', height: '60px'}}>1</Box>
        <Box bg="secondary" style={{...boxStyle, width: '60%', height: '80px'}}>2</Box>
        <Box bg="tertiary" style={{...boxStyle, width: '70%', height: '100px'}}>3</Box>
        <Box bg="primary" style={{...boxStyle, width: '50%', height: '70px'}}>4</Box>
        <Box bg="secondary" style={{...boxStyle, width: '90%', height: '50px'}}>5</Box>
        <Box bg="tertiary" style={{...boxStyle, width: '75%', height: '90px'}}>6</Box>
      </>
    ),
  },
};
