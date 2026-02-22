import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./Tooltip";

const meta: Meta<typeof Tooltip> = {
  title: "Atoms/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover para ver tooltip</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Información adicional</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const Positions: Story = {
  render: () => (
    <div className="flex gap-8 p-16 justify-center">
      <Tooltip>
        <TooltipTrigger asChild><Button variant="outline">Top</Button></TooltipTrigger>
        <TooltipContent side="top"><p>Tooltip arriba</p></TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild><Button variant="outline">Bottom</Button></TooltipTrigger>
        <TooltipContent side="bottom"><p>Tooltip abajo</p></TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild><Button variant="outline">Left</Button></TooltipTrigger>
        <TooltipContent side="left"><p>Tooltip izquierda</p></TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild><Button variant="outline">Right</Button></TooltipTrigger>
        <TooltipContent side="right"><p>Tooltip derecha</p></TooltipContent>
      </Tooltip>
    </div>
  ),
};
