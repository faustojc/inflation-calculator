import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerLicense } from "@syncfusion/ej2-base";
import App from "@/App.tsx";

import "./index.css";
import "@syncfusion/ej2-base/styles/material.css";

const syncfusionLicenseKey = import.meta.env.VITE_SYNCFUSION_LICENSE_KEY;
if (syncfusionLicenseKey) {
	registerLicense(syncfusionLicenseKey);
} else {
	console.warn("Syncfusion license key is missing in environment variables.");
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
