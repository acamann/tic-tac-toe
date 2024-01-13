import type { Metadata } from 'next'
 
export const metadata: Metadata = {
  title: 'Tic-Tac-Toe',
  description: 'Multiplayer Tic-Tac-Toe game',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}