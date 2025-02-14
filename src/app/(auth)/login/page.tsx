'use client';

import { AuthForm, AuthFormData } from '@/components/auth/shared/AuthForm';
import { AuthWrapper } from '@/components/auth/shared/AuthWrapper';
import { AUTH_ROUTES, useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const { login, isLoading } = useAuth();
    const router = useRouter();

    const fields = [
        {
            id: 'email',
            label: 'Email',
            type: 'email',
            required: true,
        },
        {
            id: 'password',
            label: 'Password',
            type: 'password',
            required: true,
        },
    ];

    const handleSubmit = async (data: { email: string; password: string }) => {
        try {
            await login(data.email, data.password);
            router.push('/dashboard');
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <AuthWrapper
            title="Welcome Back"
            subtitle="Sign in to continue to your account"
            footerText="Don't have an account?"
            footerLink={AUTH_ROUTES.REGISTER}
            footerLinkText="Sign up"
        >
            <AuthForm
                fields={fields}
                onSubmit={handleSubmit as (data: AuthFormData) => Promise<void>}
                submitText="Sign In"
                isLoading={isLoading}
            />
        </AuthWrapper>
    );
}
