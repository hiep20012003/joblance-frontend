'use client';

import {FormEvent, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useValidation} from "@/lib/hooks/useValidation";
import {SignUpPayload, signUpSchema} from "@/lib/schemas/auth.schema";
import FormLabel from "@/components/shared/FormLabel";
import Input from "@/components/shared/Input";
import PasswordInput from "@/components/shared/PasswordInput";
import DropdownInput from "@/components/shared/DropdownInput";
import {countries, getCountryCode} from "countries-list";
import {signUp} from "@/lib/services/client/user.client";
import Link from "next/link";
import {useFetchMutation} from "@/lib/hooks/useFetchMutation";

export default function SignUpForm() {
    const router = useRouter();

    const [userInfo, setUserInfo] = useState<SignUpPayload>({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        sex: '' as "male" | "female" | "other",
        country: ''
    });

    const countryOptions = Object.entries(countries).map(([, value]) => ({
        label: value.name,
        value: String(getCountryCode(value.name))
    }));

    const genderOptions = [
        {label: "Male", value: "male"},
        {label: "Female", value: "female"},
        {label: "Other", value: "other"}
    ];

    const [validate, errors] = useValidation(signUpSchema);

    const {mutate, loading: isLoading} = useFetchMutation(signUp, {
        onSuccess: () => {
            router.push("/verify-email?reason=signup");
        },
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validate(userInfo)) return;
        await mutate(userInfo);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-transparent flex flex-col gap-2 px-8 py-10 w-144 mx-auto"
        >
            {/* Header */}
            <div className="text-center mb-2">
                <h2 className="text-3xl font-bold text-gray-800 mb-1">Welcome to Joblance</h2>
                <p className="text-gray-500 text-sm">Create your account</p>
            </div>

            {/* Email */}
            <div className={'flex-2'}>
                <FormLabel label="Email" htmlFor="email"/>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                    placeholder="email@example.com"
                    error={errors.email?.[0]}
                    required
                />
            </div>

            {/* Username */}
            <div className={'flex-2'}>
                <FormLabel label="Username" htmlFor="username"/>
                <Input
                    id="username"
                    name="username"
                    type="text"
                    value={userInfo.username}
                    onChange={(e) => setUserInfo({...userInfo, username: e.target.value})}
                    placeholder="Enter username"
                    error={errors.username?.[0]}
                    required
                />
            </div>

            {/* Country & Gender */}
            <div className="flex flex-row gap-4">
                <div className={'flex-2'}>
                    <FormLabel label="Country"/>
                    <DropdownInput
                        options={countryOptions}
                        name="country"
                        value={userInfo.country ? {label: userInfo.country, value: userInfo.country} : null}
                        onChange={(opt) => setUserInfo({...userInfo, country: opt.value})}
                        placeholder="Select country"
                        error={errors.country?.[0]}
                        required
                    />
                </div>

                <div className={'flex-2'}>
                    <FormLabel label="Gender"/>
                    <DropdownInput
                        options={genderOptions}
                        name="gender"
                        value={
                            userInfo.sex
                                ? {
                                    label: userInfo.sex.charAt(0).toUpperCase() + userInfo.sex.slice(1),
                                    value: userInfo.sex
                                }
                                : null
                        }
                        onChange={(opt) => setUserInfo({...userInfo, sex: opt.value as "male" | "female" | "other"})}
                        placeholder="Select gender"
                        error={errors.sex?.[0]}
                        required
                    />
                </div>
            </div>

            {/* Password */}
            <div>
                <FormLabel label="Password" htmlFor="password"/>
                <PasswordInput
                    id="password"
                    name="password"
                    value={userInfo.password}
                    onChange={(e) => setUserInfo({...userInfo, password: e.target.value})}
                    required
                    error={errors.password?.[0]}
                />
            </div>

            {/* Confirm Password */}
            <div>
                <FormLabel label="Confirm Password" htmlFor="confirmPassword"/>
                <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    value={userInfo.confirmPassword}
                    onChange={(e) => setUserInfo({...userInfo, confirmPassword: e.target.value})}
                    required
                    error={errors.confirmPassword?.[0]}
                />
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isLoading}
                className="btn w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-3.5 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mt-4"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4zm2 5.29A7.96 7.96 0 014 12H0c0 3.04 1.13 5.82 3 7.94l3-2.65z"/>
                        </svg>
                        Signing up...
                    </>
                ) : (
                    <>Sign Up</>
                )}
            </button>

            {/* Sign In Link */}
            <p className="text-center text-gray-600 text-sm mt-1">
                Already have an account?{' '}
                <Link
                    href={'/login'}
                    className="text-primary-600 hover:text-primary-700 font-semibold transition-colors cursor-pointer"
                >
                    Sign In
                </Link>
            </p>
        </form>
    );
}
