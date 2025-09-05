const os = require("os");
const { execSync } = require("child_process");

function getSystemSpecs() {
	// Initialize system info object with only auto-detectable technical specs
	const systemInfo = {
		// Hardware specs
		cpuName: "",
		cpuSpeed: "",
		cpuCores: "",
		ram: "",
		ramSpeed: "",
		hersteller: "", // Manufacturer
		modell: "", // Model
		seriennummer: "", // Serial Number
		diskStorage: [],

		// System specs
		hostname: "",
		osType: "",
		osVersion: "",
		platform: "",
		architecture: "",
		uptime: "",
		nodeVersion: "",
	};

	// Get basic system information
	const cpus = os.cpus();
	systemInfo.cpuName = cpus[0].model;
	systemInfo.cpuSpeed = `${(cpus[0].speed / 1000).toFixed(2)} GHz`;
	systemInfo.cpuCores = cpus.length;
	systemInfo.ram = `${(os.totalmem() / 1000 / 1000 / 1000).toFixed(1)} GB`;
	systemInfo.hostname = os.hostname();
	systemInfo.osType = os.type();
	systemInfo.osVersion = os.release();
	systemInfo.platform = os.platform();
	systemInfo.architecture = os.arch();
	systemInfo.uptime = `${Math.floor(os.uptime() / 3600)}h ${Math.floor((os.uptime() % 3600) / 60)}m`;
	systemInfo.nodeVersion = process.version;

	// Platform-specific information
	try {
		if (os.platform() === "linux") {
			// Linux-specific info
			try {
				const distro = execSync(
					"lsb_release -d 2>/dev/null || cat /etc/os-release | grep PRETTY_NAME",
					{ encoding: "utf8" },
				).trim();
				systemInfo.osVersion =
					distro.split(":")[1]?.trim() ||
					distro.split("=")[1]?.replace(/"/g, "");
			} catch (e) {}

			// Serial Number (Linux)
			try {
				const serial = execSync(
					"dmidecode -s system-serial-number 2>/dev/null || cat /sys/class/dmi/id/product_serial 2>/dev/null",
					{ encoding: "utf8" },
				).trim();
				systemInfo.seriennummer = serial;
			} catch (e) {
				systemInfo.seriennummer = "Requires access";
			}

			// Manufacturer (Linux)
			try {
				const manufacturer = execSync(
					"dmidecode -s system-manufacturer 2>/dev/null || cat /sys/class/dmi/id/sys_vendor 2>/dev/null",
					{ encoding: "utf8" },
				).trim();
				systemInfo.hersteller = manufacturer;
			} catch (e) {}

			// Model (Linux)
			try {
				const model = execSync(
					"dmidecode -s system-product-name 2>/dev/null || cat /sys/class/dmi/id/product_name 2>/dev/null",
					{ encoding: "utf8" },
				).trim();
				systemInfo.modell = model;
			} catch (e) {}

			// Disk Size (Linux)
			try {
				const diskInfo = execSync(
					'lsblk -b -d -o NAME,SIZE | grep -E "^(sd|nvme|hd)"',
					{ encoding: "utf8" },
				)
					.trim()
					.split("\n");
				diskInfo.forEach((line) => {
					const parts = line.trim().split(/\s+/);
					if (parts.length >= 2) {
						const size = parseInt(parts[1]);
						systemInfo.diskStorage.push({
							device: parts[0],
							size: `${(size / 1000 / 1000 / 1000).toFixed(1)} GB`,
						});
					}
				});
			} catch (e) {}

			// RAM Speed (Linux)
			try {
				const ramSpeed = execSync(
					'dmidecode -t memory | grep "Speed:" | head -1',
					{ encoding: "utf8" },
				).trim();
				if (ramSpeed) {
					systemInfo.ramSpeed = ramSpeed.split(":")[1]?.trim();
				}
			} catch (e) {}
		} else if (os.platform() === "darwin") {
			// macOS-specific info
			try {
				const macVersion = execSync("sw_vers -productVersion", {
					encoding: "utf8",
				}).trim();
				systemInfo.osVersion = `macOS ${macVersion}`;
			} catch (e) {}

			// Serial Number (macOS)
			try {
				const serial = execSync(
					'system_profiler SPHardwareDataType | grep "Serial Number" | cut -d: -f2',
					{ encoding: "utf8" },
				).trim();
				systemInfo.seriennummer = serial;
			} catch (e) {}

			// Manufacturer & Model (macOS)
			try {
				const modelInfo = execSync(
					'system_profiler SPHardwareDataType | grep "Model Name\\|Model Identifier"',
					{ encoding: "utf8" },
				).trim();
				systemInfo.hersteller = "Apple";
				systemInfo.modell =
					modelInfo.split("\n")[0]?.split(":")[1]?.trim() || "Unknown";
			} catch (e) {}

			// Disk Size (macOS)
			try {
				const diskInfo = execSync(
					'diskutil list | grep "/dev/disk" | grep -E "(internal|physical)"',
					{ encoding: "utf8" },
				).trim();
				const lines = diskInfo.split("\n");
				lines.forEach((line) => {
					const sizeMatch = line.match(/(\d+\.\d+)\s*(GB|TB)/);
					const diskMatch = line.match(/\/dev\/(disk\d+)/);
					if (sizeMatch && diskMatch) {
						systemInfo.diskStorage.push({
							device: diskMatch[1],
							size: `${sizeMatch[1]} ${sizeMatch[2]}`,
						});
					}
				});
			} catch (e) {}
		} else if (os.platform() === "win32") {
			// Windows-specific info
			try {
				const winVersion = execSync(
					'wmic os get Caption /value | findstr "="',
					{ encoding: "utf8" },
				).trim();
				systemInfo.osVersion = winVersion.split("=")[1];
			} catch (e) {}

			// Serial Number (Windows)
			try {
				const serial = execSync(
					'wmic bios get serialnumber /value | findstr "="',
					{ encoding: "utf8" },
				).trim();
				systemInfo.seriennummer = serial.split("=")[1];
			} catch (e) {}

			// Manufacturer & Model (Windows)
			try {
				const manufacturer = execSync(
					'wmic computersystem get Manufacturer /value | findstr "="',
					{ encoding: "utf8" },
				).trim();
				const model = execSync(
					'wmic computersystem get Model /value | findstr "="',
					{ encoding: "utf8" },
				).trim();
				systemInfo.hersteller = manufacturer.split("=")[1];
				systemInfo.modell = model.split("=")[1];
			} catch (e) {}

			// Disk Size (Windows)
			try {
				const diskInfo = execSync(
					'wmic diskdrive get size,model /format:csv | findstr -v "^$"',
					{ encoding: "utf8" },
				).trim();
				const lines = diskInfo.split("\n").slice(1);
				lines.forEach((line) => {
					const parts = line.split(",");
					if (parts.length >= 3 && parts[2]) {
						const size = parseInt(parts[2]);
						systemInfo.diskStorage.push({
							device: parts[1],
							size: `${(size / 1000 / 1000 / 1000).toFixed(1)} GB`,
						});
					}
				});
			} catch (e) {}

			// RAM Speed (Windows)
			try {
				const ramSpeed = execSync(
					'wmic memorychip get speed /value | findstr "=" | head -1',
					{ encoding: "utf8" },
				).trim();
				if (ramSpeed) {
					systemInfo.ramSpeed = `${ramSpeed.split("=")[1]} MHz`;
				}
			} catch (e) {}
		}
	} catch (error) {
		console.log("Some platform-specific information could not be retrieved");
	}

	return systemInfo;
}

// Usage example:
const specs = getSystemSpecs();

// Display the detectable technical specifications
console.log("DETECTABLE SYSTEM SPECIFICATIONS");
console.log("=".repeat(40));
console.log(`CPU: ${specs.cpuName}`);
console.log(`CPU Speed: ${specs.cpuSpeed}`);
console.log(`CPU Cores: ${specs.cpuCores}`);
console.log(`RAM: ${specs.ram}`);
console.log(`RAM Speed: ${specs.ramSpeed || "Not detected"}`);
console.log(`Manufacturer: ${specs.hersteller || "Not detected"}`);
console.log(`Model: ${specs.modell || "Not detected"}`);
console.log(`Serial Number: ${specs.seriennummer || "Not detected"}`);
console.log(`Hostname: ${specs.hostname}`);
console.log(`OS: ${specs.osType}`);
console.log(`OS Version: ${specs.osVersion}`);
console.log(`Platform: ${specs.platform}`);
console.log(`Architecture: ${specs.architecture}`);
console.log(`Uptime: ${specs.uptime}`);
console.log(`Node.js: ${specs.nodeVersion}`);

if (specs.diskStorage.length > 0) {
	console.log("Disk Storage:");
	specs.diskStorage.forEach((disk) => {
		console.log(`  ${disk.device}: ${disk.size}`);
	});
}

// Export the function and data
module.exports = { getSystemSpecs, specs };
