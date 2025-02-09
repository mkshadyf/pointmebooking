import { PublicLayout } from '@/layouts/PublicLayout';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicLayout>{children}</PublicLayout>;
} 