import { UpdateProvider } from '@/contexts/UpdateContext';

export default function UpdateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UpdateProvider>{children}</UpdateProvider>;
}
