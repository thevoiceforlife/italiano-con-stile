import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata = {
  title: "Italiano con Stile",
  description: "Impara l'italiano con i tuoi 5 compagni napoletani",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={nunito.variable}>
      <body
        style={{ margin: 0, padding: 0, fontFamily: "var(--font-nunito), sans-serif" }}
      >
        <div className="app-shell">
          {children}
        </div>
      </body>
    </html>
  );
}
