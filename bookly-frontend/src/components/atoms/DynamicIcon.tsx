import * as LucideIcons from 'lucide-react';
export const DynamicIcon = ({ name, ...props }: { name: string; [key: string]: any }) => {
  const Icon = LucideIcons[name as keyof typeof LucideIcons] as React.ElementType;
  return Icon ? <Icon {...props} /> : <LucideIcons.HelpCircle {...props} />;
};