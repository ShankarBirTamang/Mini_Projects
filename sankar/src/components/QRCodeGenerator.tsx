import React, { useState, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Listbox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/24/solid";
import {
  QRType,
  QRSize,
  QRData,
  WebsiteData,
  TextData,
  WifiData,
  ContactData,
  sampleData,
} from "../types/qr-types";

interface QRState {
  type: QRType;
  size: QRSize;
  color: string;
  data: QRData;
}

const QR_TYPES: { id: QRType; name: string }[] = [
  { id: "website", name: "Website Link" },
  { id: "text", name: "Text Message" },
  { id: "wifi", name: "WiFi Password" },
  { id: "contact", name: "Contact Card" },
];

const QR_SIZES: { id: QRSize; name: string; value: number }[] = [
  { id: "small", name: "Small", value: 160 },
  { id: "medium", name: "Medium", value: 200 },
  { id: "large", name: "Large", value: 256 },
];

export const QRCodeGenerator: React.FC = () => {
  const [formData, setFormData] = useState<QRState>({
    type: "website",
    size: "medium",
    color: "#000000",
    data: {
      website: { url: "" },
      text: { message: "" },
      wifi: { networkName: "", password: "", securityType: "WPA" },
      contact: { name: "", phone: "", email: "" },
    },
  });

  const getQRValue = useCallback(
    (type: QRType, data: QRState["data"]): string => {
      switch (type) {
        case "website":
          return data.website.url;
        case "text":
          return data.text.message;
        case "wifi":
          const { networkName, password, securityType } = data.wifi;
          return `WIFI:T:${securityType};S:${networkName};P:${password};;`;
        case "contact":
          const { name, phone, email } = data.contact;
          return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
        default:
          return "";
      }
    },
    []
  );

  const handleTypeChange = (type: QRType) => {
    setFormData((prev) => ({
      ...prev,
      type,
      data: {
        ...prev.data,
        [type]: { ...sampleData[type] },
      },
    }));
  };

  const handleDataChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [prev.type]: {
          ...prev.data[prev.type],
          [name]: value,
        },
      },
    }));
  };

  const handleFillSample = () => {
    setFormData((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [prev.type]: { ...sampleData[prev.type] },
      },
    }));
  };

  const handleDownload = () => {
    const svg = document.querySelector("#qr-code svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-code-${formData.type}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const renderForm = () => {
    switch (formData.type) {
      case "website":
        return (
          <input
            type="url"
            name="url"
            value={formData.data.website.url}
            onChange={handleDataChange}
            placeholder="Enter website URL"
            className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-150"
          />
        );
      case "text":
        return (
          <textarea
            name="message"
            value={formData.data.text.message}
            onChange={handleDataChange}
            placeholder="Enter your message"
            className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-150 h-32 resize-none"
          />
        );
      case "wifi":
        return (
          <div className="space-y-4">
            <input
              type="text"
              name="networkName"
              value={formData.data.wifi.networkName}
              onChange={handleDataChange}
              placeholder="Network Name"
              className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-150"
            />
            <input
              type="password"
              name="password"
              value={formData.data.wifi.password}
              onChange={handleDataChange}
              placeholder="Password"
              className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-150"
            />
            <select
              name="securityType"
              value={formData.data.wifi.securityType}
              onChange={handleDataChange}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-150"
              aria-label="WiFi Security Type"
            >
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">No Password</option>
            </select>
          </div>
        );
      case "contact":
        return (
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              value={formData.data.contact.name}
              onChange={handleDataChange}
              placeholder="Full Name"
              className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-150"
            />
            <input
              type="tel"
              name="phone"
              value={formData.data.contact.phone}
              onChange={handleDataChange}
              placeholder="Phone Number"
              className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-150"
            />
            <input
              type="email"
              name="email"
              value={formData.data.contact.email}
              onChange={handleDataChange}
              placeholder="Email Address"
              className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-150"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const currentSize =
    QR_SIZES.find((size) => size.id === formData.size)?.value || 256;

  return (
    <div className="w-full min-h-screen px-4 sm:px-6 md:px-8 py-6 sm:py-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            QR Code Generator Studio
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Create beautiful QR codes for websites, messages, WiFi, and contact
            cards
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Panel - Form */}
            <div className="p-4 sm:p-6 md:p-8 bg-gray-50">
              <div className="space-y-6 sm:space-y-8">
                {/* QR Type Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    What type of QR code do you need?
                  </label>
                  <Listbox value={formData.type} onChange={handleTypeChange}>
                    <div className="relative mt-1">
                      <Listbox.Button className="relative w-full py-2.5 sm:py-3 pl-3 sm:pl-4 pr-10 text-left bg-white border border-gray-300 rounded-lg cursor-default focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-150">
                        <span className="block truncate font-medium">
                          {
                            QR_TYPES.find((type) => type.id === formData.type)
                              ?.name
                          }
                        </span>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
                        </span>
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-lg shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {QR_TYPES.map((type) => (
                          <Listbox.Option
                            key={type.id}
                            value={type.id}
                            className={({ active }) =>
                              `cursor-default select-none relative py-2.5 sm:py-3 pl-3 sm:pl-4 pr-9 ${
                                active
                                  ? "text-blue-900 bg-blue-50"
                                  : "text-gray-900"
                              }`
                            }
                          >
                            {type.name}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>

                {/* Dynamic Form */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Enter the details
                  </label>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    {renderForm()}
                  </div>
                </div>

                {/* Customization Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Size Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      QR Code Size
                    </label>
                    <select
                      value={formData.size}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          size: e.target.value as QRSize,
                        }))
                      }
                      className="w-full py-2.5 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-150"
                      aria-label="QR Code Size"
                    >
                      {QR_SIZES.map((size) => (
                        <option key={size.id} value={size.id}>
                          {size.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Color Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      QR Code Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            color: e.target.value,
                          }))
                        }
                        className="h-10 w-20 p-1 rounded cursor-pointer"
                        aria-label="QR Code Color"
                      />
                      <span className="text-sm text-gray-500">
                        {formData.color.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:space-x-4 pt-4">
                  <button
                    onClick={handleFillSample}
                    className="w-full sm:flex-1 bg-gray-100 text-gray-800 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-gray-200 font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Fill Sample Data
                  </button>
                  <button
                    onClick={handleDownload}
                    className="w-full sm:flex-1 bg-blue-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-blue-700 font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Download QR Code
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="text-center mb-4 sm:mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  Live Preview
                </h3>
                <p className="text-sm text-gray-500">
                  Your QR code will update as you type
                </p>
              </div>
              <div
                id="qr-code"
                className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg flex items-center justify-center"
                style={{
                  width: `${Math.min(
                    currentSize + 48,
                    window.innerWidth - 32
                  )}px`,
                  height: `${Math.min(
                    currentSize + 48,
                    window.innerWidth - 32
                  )}px`,
                  maxWidth: "100%",
                }}
              >
                <QRCodeSVG
                  value={getQRValue(formData.type, formData.data)}
                  size={Math.min(currentSize, window.innerWidth - 80)}
                  level="H"
                  fgColor={formData.color}
                  includeMargin={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
