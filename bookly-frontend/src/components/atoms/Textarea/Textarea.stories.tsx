import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./Textarea";

const meta: Meta<typeof Textarea> = {
  title: "Atoms/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    error: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: { placeholder: "Escribe una descripción..." },
};

export const WithValue: Story = {
  args: { defaultValue: "Sala equipada con proyector, pizarra y aire acondicionado." },
};

export const WithError: Story = {
  args: {
    id: "textarea-err",
    error: "La descripción es obligatoria",
    placeholder: "Descripción del recurso",
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Contenido no editable" },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4 max-w-md">
      <Textarea placeholder="Default" />
      <Textarea defaultValue="Con valor" />
      <Textarea id="err" error="Campo obligatorio" />
      <Textarea disabled defaultValue="Deshabilitado" />
    </div>
  ),
};
