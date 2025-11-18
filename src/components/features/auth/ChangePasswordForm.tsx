'use client'

import {FormEvent, useState} from 'react';
import PasswordInput from "@/components/shared/PasswordInput";
import FormLabel from "@/components/shared/FormLabel";
import {useValidation} from "@/lib/hooks/useValidation";
import {ChangePasswordPayload, changePasswordSchema} from "@/lib/schemas/auth.schema";
import {Lock} from 'lucide-react';
import {changePassword} from "@/lib/services/client/user.client";
import LoadingWrapper from "@/components/shared/LoadingWrapper";
import {useFetchMutation} from "@/lib/hooks/useFetchMutation";

export default function ChangePasswordForm({onClose}: { onClose: () => void }) {

    const [changePasswordInfo, setChangePasswordInfo] = useState<ChangePasswordPayload>({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });

    const [validate, errors] = useValidation(changePasswordSchema);

    const {mutate, loading: isLoading} = useFetchMutation(changePassword, {
        successMessage: 'Change password successfully',
        redirectOnUnauthorized: true,
        onSuccess: () => {
            setChangePasswordInfo({
                currentPassword: "",
                newPassword: "",
                confirmNewPassword: "",
            });
            onClose();
        },
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validate(changePasswordInfo)) return;
        await mutate(changePasswordInfo);
    };

    return (
        <LoadingWrapper isLoading={isLoading}>
            <form
                onSubmit={handleSubmit}
                className="w-full flex flex-col gap-4 max-w-md mx-auto relative p-6"
            >
                <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-primary-600"/>
                        Change Password
                    </h3>
                    <p className="text-sm text-gray-500">
                        Update your password to keep your account secure. Make sure it’s strong and unique.
                    </p>
                </div>

                <div>
                    <FormLabel label="Current Password" htmlFor="currentPassword"/>
                    <PasswordInput
                        id="currentPassword"
                        value={changePasswordInfo.currentPassword}
                        onChange={e => setChangePasswordInfo({
                            ...changePasswordInfo,
                            currentPassword: e.currentTarget.value
                        })}
                        error={errors?.currentPassword?.[0]}
                        placeholder="Enter current password"
                        required
                    />
                </div>

                <div>
                    <FormLabel label="New Password" htmlFor="newPassword"/>
                    <PasswordInput
                        id="newPassword"
                        value={changePasswordInfo.newPassword}
                        onChange={e => setChangePasswordInfo({
                            ...changePasswordInfo,
                            newPassword: e.currentTarget.value
                        })}
                        placeholder="Enter new password"
                        error={errors?.newPassword?.[0]}
                        required
                    />
                </div>

                <div>
                    <FormLabel label="Confirm New Password" htmlFor="confirmNewPassword"/>
                    <PasswordInput
                        id="confirmNewPassword"
                        value={changePasswordInfo.confirmNewPassword}
                        onChange={e => setChangePasswordInfo({
                            ...changePasswordInfo,
                            confirmNewPassword: e.currentTarget.value
                        })}
                        placeholder="Confirm new password"
                        error={errors?.confirmNewPassword?.[0]}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn mt-2 w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-3.5 rounded-lg font-semibold gap-2 flex justify-center items-center"
                >
                    Change Password
                </button>
            </form>
        </LoadingWrapper>
    );
}
