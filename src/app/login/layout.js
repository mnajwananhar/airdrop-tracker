export const metadata = {
  title: "Login - Airdrop Tracker",
  description: "Sign in to your Airdrop Tracker account",
};

export default function LoginLayout({ children }) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-gray-900 z-0"></div>
      <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow delay-1000"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow delay-2000"></div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
