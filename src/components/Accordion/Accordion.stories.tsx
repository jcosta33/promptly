import type { Meta, StoryObj } from "@storybook/react";
import { Accordion } from "./Accordion";

const meta = {
  title: "Components/Accordion",
  component: Accordion,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    items: {
      control: "object",
      description:
        "Array of accordion items containing id, title, content, and optional disabled state",
    },
    defaultExpandedId: {
      control: "text",
      description: "ID of the item that should be expanded by default",
    },
    allowMultiple: {
      control: "boolean",
      description:
        "Whether multiple accordion items can be expanded simultaneously",
    },
    iconPosition: {
      control: { type: "select" },
      options: ["left", "right"],
      description: "Position of the expand/collapse icon",
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample items for all stories
const items = [
  {
    id: "item1",
    title: "What is Promptly?",
    content: (
      <div>
        <p>
          Promptly is a powerful tool that helps you work with selected text on
          websites. It provides inline actions for text processing and analysis.
        </p>
        <p>
          All processing is done locally on your device, ensuring privacy and
          speed.
        </p>
      </div>
    ),
  },
  {
    id: "item2",
    title: "How do I use Promptly?",
    content: (
      <div>
        <p>
          Simply select text on any webpage and a floating action button will
          appear. Click it to see available options.
        </p>
        <p>
          You can summarize text, simplify complex content, or check facts
          without leaving the page.
        </p>
      </div>
    ),
  },
  {
    id: "item3",
    title: "Is Promptly free to use?",
    content: (
      <div>
        <p>
          Yes, Promptly is completely free to use and does not require any
          subscriptions or payments.
        </p>
        <p>
          Since all processing happens on your device, there are no usage limits
          or hidden costs.
        </p>
      </div>
    ),
  },
  {
    id: "item4",
    title: "Disabled Section (Cannot Expand)",
    content:
      "This content should not be accessible because the section is disabled.",
    disabled: true,
  },
];

export const Default: Story = {
  args: {
    items,
  },
};

export const WithDefaultExpanded: Story = {
  args: {
    items,
    defaultExpandedId: "item2",
  },
};

export const AllowMultiple: Story = {
  args: {
    items,
    allowMultiple: true,
  },
};

export const IconOnLeft: Story = {
  args: {
    items,
    iconPosition: "left",
  },
};

export const IconOnRight: Story = {
  args: {
    items,
    iconPosition: "right",
  },
};

export const WithDisabledItem: Story = {
  args: {
    items,
    defaultExpandedId: "item1",
  },
};
