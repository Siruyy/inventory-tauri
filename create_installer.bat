@echo off
echo Creating Inno Setup installer...

REM Create output directory
mkdir target\inno 2>nul

REM Copy the custom icon to the release directory
copy public\icons\app_icon\icon_trans.ico src-tauri\target\release\app_icon.ico

REM Create the Inno Setup script
echo #define MyAppName "CICS" > inno_setup_temp.iss
echo #define MyAppVersion "1.0.0" >> inno_setup_temp.iss
echo #define MyAppPublisher "CICS Team" >> inno_setup_temp.iss
echo #define MyAppURL "https://cics.inventory.com" >> inno_setup_temp.iss
echo #define MyAppExeName "cics-inventory.exe" >> inno_setup_temp.iss
echo. >> inno_setup_temp.iss
echo [Setup] >> inno_setup_temp.iss
echo AppId={{com.cics.inventory}} >> inno_setup_temp.iss
echo AppName={#MyAppName} >> inno_setup_temp.iss
echo AppVersion={#MyAppVersion} >> inno_setup_temp.iss
echo AppPublisher={#MyAppPublisher} >> inno_setup_temp.iss
echo AppPublisherURL={#MyAppURL} >> inno_setup_temp.iss
echo AppSupportURL={#MyAppURL} >> inno_setup_temp.iss
echo AppUpdatesURL={#MyAppURL} >> inno_setup_temp.iss
echo DefaultDirName={autopf}\{#MyAppName} >> inno_setup_temp.iss
echo DefaultGroupName={#MyAppName} >> inno_setup_temp.iss
echo AllowNoIcons=yes >> inno_setup_temp.iss
echo OutputDir=target\inno >> inno_setup_temp.iss
echo OutputBaseFilename=CICS-Setup-Inno >> inno_setup_temp.iss
echo SetupIconFile=public\icons\app_icon\icon_trans.ico >> inno_setup_temp.iss
echo Compression=lzma >> inno_setup_temp.iss
echo SolidCompression=yes >> inno_setup_temp.iss
echo PrivilegesRequired=admin >> inno_setup_temp.iss
echo DisableDirPage=no >> inno_setup_temp.iss
echo DisableProgramGroupPage=no >> inno_setup_temp.iss
echo. >> inno_setup_temp.iss
echo [Languages] >> inno_setup_temp.iss
echo Name: "english"; MessagesFile: "compiler:Default.isl" >> inno_setup_temp.iss
echo. >> inno_setup_temp.iss
echo [Tasks] >> inno_setup_temp.iss
echo Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}" >> inno_setup_temp.iss
echo Name: "startmenuicon"; Description: "Create a Start Menu shortcut"; GroupDescription: "{cm:AdditionalIcons}" >> inno_setup_temp.iss
echo. >> inno_setup_temp.iss
echo [Files] >> inno_setup_temp.iss
echo Source: "src-tauri\target\release\cics-inventory.exe"; DestDir: "{app}"; Flags: ignoreversion >> inno_setup_temp.iss
echo Source: "src-tauri\target\release\app_icon.ico"; DestDir: "{app}"; Flags: ignoreversion >> inno_setup_temp.iss
echo. >> inno_setup_temp.iss
echo [Icons] >> inno_setup_temp.iss
echo Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\app_icon.ico"; Tasks: startmenuicon >> inno_setup_temp.iss
echo Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}" >> inno_setup_temp.iss
echo Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\app_icon.ico"; Tasks: desktopicon >> inno_setup_temp.iss
echo. >> inno_setup_temp.iss
echo [Run] >> inno_setup_temp.iss
echo Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent >> inno_setup_temp.iss
echo. >> inno_setup_temp.iss
echo [Dirs] >> inno_setup_temp.iss
echo Name: "{app}\data"; Permissions: everyone-full >> inno_setup_temp.iss
echo. >> inno_setup_temp.iss
echo [UninstallDelete] >> inno_setup_temp.iss
echo Type: filesandordirs; Name: "{app}\data" >> inno_setup_temp.iss

REM Run Inno Setup
"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" inno_setup_temp.iss

REM Clean up
del inno_setup_temp.iss

echo Installer created at target\inno\CICS-Setup-Inno.exe 