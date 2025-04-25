import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import { Balloon } from "../components/Header";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "Airdrop Tracker",
  description: "Pantau airdrop kripto dengan efisien",
};

// Generate SVG favicon dynamically
const generateFaviconSvg = () => {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C7.58172 2 4 5.58172 4 10C4 13.3894 6.05452 16.2698 9 17.3833V19H15V17.3833C17.9455 16.2698 20 13.3894 20 10C20 5.58172 16.4183 2 12 2Z" fill="#60a5fa" fill-opacity="0.2" stroke="#60a5fa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M8 3.5V14" stroke="#60a5fa" stroke-width="1.5" stroke-linecap="round" />
      <path d="M12 2V17" stroke="#60a5fa" stroke-width="1.5" stroke-linecap="round" />
      <path d="M16 3.5V14" stroke="#60a5fa" stroke-width="1.5" stroke-linecap="round" />
      <rect x="9" y="19" width="6" height="3" rx="1" stroke="#60a5fa" stroke-width="1.5" />
      <line x1="10" y1="17" x2="9.5" y2="19" stroke="#60a5fa" stroke-width="1.5" stroke-linecap="round" />
      <line x1="14" y1="17" x2="14.5" y2="19" stroke="#60a5fa" stroke-width="1.5" stroke-linecap="round" />
    </svg>
  `;
};

const svgFaviconData = generateFaviconSvg();
const svgBase64 = Buffer.from(svgFaviconData).toString("base64");

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link
          rel="icon"
          href={`data:image/svg+xml;base64,${svgBase64}`}
          type="image/svg+xml"
        />
      </head>
      <body className="bg-gray-900 text-white">
        <AuthProvider>
          <NotificationProvider>
            <main className="min-h-screen">{children}</main>
            <Analytics />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
