// 檔案路徑：resources/js/Pages/Profile/Edit.jsx

import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Navbar'; // 🌟 引入你的商城導覽列

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Head title="個人資料設定 - PinkPick" />

            {/* 🌟 換成我們自己的 Navbar，保持全站一致 */}
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {/* 🌟 新增：返回商城首頁的動線 */}
                <div className="mb-6">
                    <Link href={route('shop')} className="text-sm text-gray-500 hover:text-pink-600 transition">
                        ← 返回商城首頁
                    </Link>
                </div>

                <div className="space-y-6">
                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}