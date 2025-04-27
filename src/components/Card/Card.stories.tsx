import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";
import { Button } from "../Button/Button";

const meta = {
  title: "Components/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    header: {
      control: "text",
      description: "Content for the card header",
    },
    footer: {
      control: "text",
      description: "Content for the card footer",
    },
    children: {
      control: "text",
      description: "Content for the card body",
    },
    isLoading: {
      control: "boolean",
      description: "Shows a loading overlay on the card",
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "This is a basic card component with default styling.",
  },
};

export const WithHeader: Story = {
  args: {
    header: "Card Header",
    children: "This card has a header section that can contain any content, like titles or actions.",
  },
};

export const WithFooter: Story = {
  args: {
    children: "This card has a footer section that typically contains actions or metadata.",
    footer: "Card Footer",
  },
};

export const WithHeaderAndFooter: Story = {
  args: {
    header: "Card Header",
    children: "This card has both a header and footer for a complete card layout.",
    footer: "Card Footer",
  },
};

export const Loading: Story = {
  args: {
    header: "Loading Card",
    children: "This card is in a loading state with an overlay and animation.",
    isLoading: true,
  },
};

export const WithActions: Story = {
  args: {
    header: "Card with Actions",
    children: "This card demonstrates how to include interactive elements like buttons in a card layout.",
    footer: (
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
        <Button size="sm" color="tertiary">Cancel</Button>
        <Button size="sm" color="primary">Save</Button>
      </div>
    ),
  },
};

export const ComplexContent: Story = {
  args: {
    header: (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>User Profile</span>
        <Button size="sm">Edit</Button>
      </div>
    ),
    children: (
      <div>
        <div style={{ marginBottom: "16px" }}>
          <strong>Name:</strong> John Doe
        </div>
        <div style={{ marginBottom: "16px" }}>
          <strong>Email:</strong> john.doe@example.com
        </div>
        <div>
          <strong>Role:</strong> Administrator
        </div>
      </div>
    ),
    footer: "Last updated: Today",
  },
};
