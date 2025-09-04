const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");

module.exports = {
	packagerConfig: {
		asar: true,
		executableName: "LiforraTest",
		icon: "./icon", // base name, Forge will find .ico/.icns/.png
	},
	rebuildConfig: {},
	makers: [
		// Windows installer
		{
			name: "@electron-forge/maker-squirrel",
			platforms: ["win32"],
			config: {
				name: "LiforraTest",
				setupExe: "LiforraTest-Installer.exe",
				noMsi: true,
				//certificateFile: "./cert.pfx",
				//certificatePassword: process.env.CERTIFICATE_PASSWORD,
			},
		},
		// Windows portable
		{
			name: "@electron-forge/maker-zip",
			platforms: ["win32"],
			config: {
				name: "LiforraTest-Portable",
			},
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
					command: "LiforraTest",
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
					bin: "LiforraTest",
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
