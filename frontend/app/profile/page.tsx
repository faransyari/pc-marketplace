"use client";

import { useState } from 'react';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';

function Accordion({ title, children, isOpen, toggle }: { title: string; children: React.ReactNode; isOpen: boolean; toggle: () => void }) {
  return (
    <div className="border border-gray-200 rounded-lg shadow-md">
      <button
        className="w-full text-left px-4 py-2 bg-gray-100 text-gray-800 font-medium rounded-t-lg hover:bg-gray-200 transition"
        onClick={toggle}
      >
        {title}
      </button>
      {isOpen && <div className="p-4 bg-white rounded-b-lg">{children}</div>}
    </div>
  );
}

export default function ProfilePage() {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const toggleAccordion = (accordion: string) => {
    setOpenAccordion(openAccordion === accordion ? null : accordion);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 via-white to-gray-50 text-gray-900">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-16">
                <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <ProfileCard title="Personal Information" className="md:col-span-2">
            <div className="flex items-center justify-center mb-6">
              <img
                alt="Profile"
                className="w-60 h-60 rounded-full border-4 border-purple-200 shadow-md object-cover"
              />
            </div>
            <div className="flex justify-center mb-6">
              <button
                type="button"
                className="px-4 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 transition"
              >
                Change Profile Photo
              </button>
            </div>
            <FormInput label="Username" defaultValue="johndoe" />
            <FormInput label="Email" type="email" defaultValue="johndoe@example.com" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="First Name" defaultValue="John" />
              <FormInput label="Last Name" defaultValue="Doe" />
            </div>
          </ProfileCard>

          <div className="space-y-6 md:col-span-1">
            <Accordion
              title="Payment Details"
              isOpen={openAccordion === "payment"}
              toggle={() => toggleAccordion("payment")}
            >
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Payment Methods</label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm">
                    <span className="text-sm text-gray-800">Visa •••• 1234</span>
                    <button className="text-xs text-red-600 hover:underline transition" type="button">Remove</button>
                  </div>
                  <div className="flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm">
                    <span className="text-sm text-gray-800">MasterCard •••• 5678</span>
                    <button className="text-xs text-red-600 hover:underline transition" type="button">Remove</button>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-300 my-6"></div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Add New Payment Method</label>
                <FormSelect label="Card Type" defaultValue="Visa" options={["Visa", "MasterCard", "American Express"]} />
                <FormInput label="Card Number" defaultValue="" />
                <FormInput label="Expiry Date" defaultValue="" />
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 transition"
                >
                  Save Payment Details
                </button>
              </div>
            </Accordion>

            <Accordion
              title="Address"
              isOpen={openAccordion === "address"}
              toggle={() => toggleAccordion("address")}
            >
              <div className="space-y-4">
                <FormInput label="Street" defaultValue="123 Main St" />
                <FormInput label="City" defaultValue="Springfield" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput label="State" defaultValue="IL" />
                  <FormInput label="Zip Code" defaultValue="62704" />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 transition"
                >
                  Save Address
                </button>
              </div>
            </Accordion>
          </div>
        </div>

        <div className="md:col-span-3 rounded-xl border border-gray-300 bg-white backdrop-blur-md shadow p-8 transition mt-6">
          <h2 className="text-lg font-semibold mb-5 text-gray-800">Purchase History</h2>
          <div className="space-y-4">
            <PurchaseItem
              title="Gaming PC"
              amount="$1200"
              date="01 Jan 2025"
              description="High-performance desktop with RGB setup"
            />
            <PurchaseItem
              title="Keyboard"
              amount="$100"
              date="15 Feb 2025"
              description="Mechanical keyboard with backlight"
            />
            <PurchaseItem
              title="Monitor"
              amount="$300"
              date="10 Mar 2025"
              description="27-inch 4K UHD display"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProfileCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

function ProfileCard({ title, children, className }: ProfileCardProps) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white/70 backdrop-blur shadow-md p-6 ${className}`}>
      <h2 className="text-lg font-semibold mb-4 text-gray-800">{title}</h2>
      <form className="space-y-4">
        {children}
        <button
          type="submit"
          className="w-full mt-4 px-4 py-2 bg-purple-600 border border-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}

interface FormInputProps {
  label: string;
  type?: string;
  defaultValue?: string;
}

function FormInput({ label, type = 'text', defaultValue }: FormInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 shadow-sm focus:ring-1 focus:ring-black focus:outline-none bg-white/90"
      />
    </div>
  );
}

interface FormSelectProps {
  label: string;
  defaultValue?: string;
  options: string[];
}

function FormSelect({ label, defaultValue, options }: FormSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        defaultValue={defaultValue}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 shadow-sm focus:ring-1 focus:ring-black focus:outline-none bg-white/90"
      >
        {options.map((option, idx) => (
          <option key={idx} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

interface PurchaseItemProps {
  title: string;
  amount: string;
  date: string;
  description: string;
}

function PurchaseItem({ title, amount, date, description }: PurchaseItemProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white/90 shadow-sm hover:shadow transition">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-base font-medium text-gray-900">{title}</h3>
        <span className="text-sm text-gray-800 font-medium">{amount}</span>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
      <p className="text-xs text-gray-400 mt-1">Purchased on {date}</p>
    </div>
  );
}