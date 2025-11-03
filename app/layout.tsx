import "./globals.css"

export const metadata = {
  title: "FastCourt - Agility & Reaction Training",
  description: "Enhance your reaction and agility for racket sports.",
  icons: {
    icon: "/court.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: any
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-white to-slate-100">
        {children}
      </body>
    </html>
  )
}
