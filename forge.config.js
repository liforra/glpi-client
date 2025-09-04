const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");

module.exports = {
	packagerConfig: {
		asar: true,
		executableName: "liforratest",
		icon: "./icon", // base name, Forge will find .ico/.icns/.png
	},
	rebuildConfig: {},
	makers: [
		// Windows only
		{
			name: "@electron-forge/maker-squirrel",
			platforms: ["win32"],
			config: {
				name: "liforratest",
				setupExe: "liforratest-Setup-${version}.exe",
				noMsi: true, // disable MSI to reduce file conflicts
				//certificateFile: "./cert.pfx",
				//certificatePassword: process.env.CERTIFICATE_PASSWORD,
			},
		},
		// macOS only
		{
			name: "@electron-forge/maker-zip",
			platforms: ["darwin"],
		},
		// Linux only
		{
			name: "@electron-forge/maker-deb",
			platforms: ["linux"],
			config: {},
		},
		{
			name: "@electron-forge/maker-rpm",
			platforms: ["linux"],
			config: {},
		},
		{
			name: "@electron-forge/maker-flatpak",
			platforms: ["linux"],
			config: {
				options: {
					id: "de.liforra.liforratest",
					runtime: "org.freedesktop.Platform",
					runtimeVersion: "23.08",
					sdk: "org.freedesktop.Sdk",
					command: "liforratest",
					icon: "./icon.png",
					finishArgs: [
						"--share=network",
						"--socket=fallback-x11",
						"--socket=wayland",
						"--device=dri",
					],
				},
			},
		},
		{
			name: "@reforged/maker-appimage",
			platforms: ["linux"],
			config: {
				options: {
					categories: ["Network"],
					icon: "icon.png",
				},
			},
		},
	],
	plugins: [
		{
			name: "@electron-forge/plugin-auto-unpack-natives",
			config: {},
		},
		new FusesPlugin({
			version: FuseVersion.V1,
			[FuseV1Options.RunAsNode]: false,
			[FuseV1Options.EnableCookieEncryption]: true,
			[FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
			[FuseV1Options.EnableNodeCliInspectArguments]: false,
			[FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
			[FuseV1Options.OnlyLoadAppFromAsar]: true,
		}),
	],
};
