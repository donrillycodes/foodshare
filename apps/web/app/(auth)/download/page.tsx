"use client";

import Link from "next/link";

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-green mb-6">
          <span className="text-white text-2xl font-bold">F</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Download FoodShare
        </h1>
        <p className="text-gray-500 mb-8">
          Your account has been created. Download the FoodShare mobile app to
          start donating and making food pledges to Winnipeg charities.
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-4">
          <p className="text-sm font-medium text-gray-700">Available soon on</p>
          <div className="space-y-3">
            <div className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl text-sm font-medium opacity-50 cursor-not-allowed select-none">
              Download on the App Store
            </div>
            <div className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl text-sm font-medium opacity-50 cursor-not-allowed select-none">
              Get it on Google Play
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            The FoodShare mobile app is launching soon in Winnipeg. We will
            notify you by email when it is available.
          </p>
        </div>

        <Link
          href="/login"
          className="text-sm text-brand-green hover:underline mt-6 inline-block"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
