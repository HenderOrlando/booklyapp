import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

const meta: Meta<typeof Popover> = {
  title: "Atoms/Popover",
  component: Popover,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Abrir Popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Opciones</h4>
          <p className="text-sm text-muted-foreground">
            Contenido contextual del popover.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  ),
};
