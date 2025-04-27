import { useState, useEffect } from "react";

import { ProgressBar } from "./ProgressBar";

import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/ProgressBar",
  component: ProgressBar,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Current progress value (0-100)",
    },
    max: {
      control: { type: "number", min: 1 },
      description: "Maximum value for progress calculation",
    },
    showPercentage: {
      control: "boolean",
      description: "Whether to show the percentage text",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Size of the progress bar",
    },
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "tertiary"],
      description: "Color variant of the progress bar",
    },
    indeterminate: {
      control: "boolean",
      description: "Whether to show an indeterminate loading state",
    },
    label: {
      control: "text",
      description: "Label text displayed above the progress bar",
    },
    helperText: {
      control: "text",
      description: "Helper text displayed below the progress bar",
    },
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 50,
  },
};

export const WithLabel: Story = {
  args: {
    value: 75,
    label: "Loading model...",
  },
};

export const WithHelperText: Story = {
  args: {
    value: 35,
    label: "Downloading...",
    helperText: "This may take a few minutes",
  },
};

export const ShowPercentage: Story = {
  args: {
    value: 65,
    showPercentage: true,
  },
};

export const Small: Story = {
  args: {
    value: 50,
    size: "sm",
  },
};

export const Medium: Story = {
  args: {
    value: 50,
    size: "md",
  },
};

export const Large: Story = {
  args: {
    value: 50,
    size: "lg",
  },
};

export const PrimaryVariant: Story = {
  args: {
    value: 50,
    variant: "primary",
  },
};

export const SecondaryVariant: Story = {
  args: {
    value: 50,
    variant: "secondary",
  },
};

export const TertiaryVariant: Story = {
  args: {
    value: 50,
    variant: "tertiary",
  },
};

export const Indeterminate: Story = {
  args: {
    value: 50,
    indeterminate: true,
    label: "Processing...",
  },
};

export const CompleteProgress: Story = {
  args: {
    value: 100,
    label: "Download complete",
  },
};

export const AllSizes: Story = {
  render: () => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <ProgressBar value={70} size="sm" label="Small" />
        <ProgressBar value={70} size="md" label="Medium" />
        <ProgressBar value={70} size="lg" label="Large" />
      </div>
    );
  },
};

export const AllVariants: Story = {
  render: () => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <ProgressBar value={70} variant="primary" label="Primary" />
        <ProgressBar value={70} variant="secondary" label="Secondary" />
        <ProgressBar value={70} variant="tertiary" label="Tertiary" />
      </div>
    );
  },
};

export const Animated: Story = {
  render: () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            return 0;
          }
          return prev + 5;
        });
      }, 500);

      return () => {
        return clearInterval(interval);
      };
    }, []);

    return (
      <ProgressBar
        value={progress}
        showPercentage
        label="Real-time progress"
        helperText={`Current progress: ${progress}%`}
      />
    );
  },
};
