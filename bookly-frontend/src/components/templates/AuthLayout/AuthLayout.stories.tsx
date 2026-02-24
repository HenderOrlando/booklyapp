import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent, CardHeader, CardTitle } from "../../atoms/Card";
import { Button } from "../../atoms/Button";
import { Input } from "../../atoms/Input";
import { Label } from "../../atoms/Label";

const meta: Meta = {
  title: "Templates/AuthLayout",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const LoginForm: Story = {
  render: () => (
    <div className="flex min-h-[600px] items-center justify-center bg-gradient-to-br from-blue-50 to-white p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <p className="text-sm text-muted-foreground">Ingresa a tu cuenta Bookly</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" placeholder="usuario@ufps.edu.co" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <Button className="w-full">Iniciar Sesión</Button>
          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes cuenta? <a href="#" className="text-blue-600 hover:underline">Regístrate</a>
          </p>
        </CardContent>
      </Card>
    </div>
  ),
};
