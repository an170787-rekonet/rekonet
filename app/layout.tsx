export const metadata = {
  title: 'Rekonet — 90 Day Plan',
  description: 'Automated support tool for Individuals, Businesses, and Employability Advisors.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
