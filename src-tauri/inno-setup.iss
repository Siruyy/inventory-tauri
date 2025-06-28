#define MyAppName "CICS"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "CICS Team"
#define MyAppURL "https://cics.inventory.com"
#define MyAppExeName "cics-inventory.exe"
#define SourceDir "target\release"

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
AppId={{com.cics.inventory}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
; Set the output directory for the installer
OutputDir=target\inno
; Set the output filename for the installer
OutputBaseFilename=CICS-Setup-Inno
; Set the icon for the installer
SetupIconFile=public\icons\app_icon\icon_trans.ico
Compression=lzma
SolidCompression=yes
; Require admin privileges for installation
PrivilegesRequired=admin
; Allow the user to select the installation directory
DisableDirPage=no
; Allow the user to select the start menu folder
DisableProgramGroupPage=no

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"
Name: "startmenuicon"; Description: "Create a Start Menu shortcut"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
; Copy the executable and all required files
Source: "src-tauri\{#SourceDir}\cics-inventory.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "public\icons\app_icon\icon_trans.ico"; DestDir: "{app}"; DestName: "app_icon.ico"; Flags: ignoreversion
Source: "src-tauri\{#SourceDir}\*.dll"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\app_icon.ico"; Tasks: startmenuicon
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\app_icon.ico"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Dirs]
Name: "{app}\data"; Permissions: everyone-full

[UninstallDelete]
Type: filesandordirs; Name: "{app}\data" 