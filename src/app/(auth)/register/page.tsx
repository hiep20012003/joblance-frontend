// app/(auth)/register/page.tsx
import {Metadata} from "next";
import AuthForm from "@/components/features/auth/AuthForm";

export const metadata: Metadata = {
    title: "Register | JobLance",
    description: "Create a new JobLance account",
};

export default function RegisterPage() {
    return <AuthForm formType="signup"/>;
}
