"use client";

import Link from "next/link";

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-green mb-4">
            <span className="text-white text-xl font-bold">F</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Download FoodShare</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Your account is ready. Download the FoodShare mobile app to start donating and making food pledges to Winnipeg charities.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm space-y-4">
          <p className="text-xs font-medium text-gray-500 text-center">Available soon on</p>
          <div className="space-y-3">
            <div className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl text-sm font-medium opacity-40 cursor-not-allowed select-none text-center">
              Download on the App Store
            </div>
            <div className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl text-sm font-medium opacity-40 cursor-not-allowed select-none text-center">
              Get it on Google Play
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            The FoodShare mobile app is launching soon in Winnipeg. We will notify you by email when it is available.
          </p>
        </div>

        <p className="text-center mt-6">
          <Link href="/login" className="text-sm text-brand-green hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
