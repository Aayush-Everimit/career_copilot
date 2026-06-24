import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#E9F1FA] dark:bg-gray-950">
      <SignIn />
    </div>
  );
}
