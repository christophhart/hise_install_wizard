import { NukeProvider } from '@/contexts/NukeContext';

export default function NukeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NukeProvider>{children}</NukeProvider>;
}
