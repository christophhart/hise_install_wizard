# Feature Ideas

This file contains ideas about new features / changes to the web app and should be used as guideline when implementing these.

## Feature 1: AI Agent mode

In addition to the user running the generated script files in the Powershell / terminal, it can also output a prompt that the user can paste into an AI coding agent which will perform the same steps but with guidance from the agent. This will help spot trivial mistakes and automatically fix it without having to troubleshoot manually.

### User Flow

At the beginning of the setup page, the user can switch between Terminal / AI agent mode. This setting will then be used across the web app to determine the style of the output:

- All commands in the setup page that query the current system stats will use either the CLI command for the given OS (Terminal mode) or a simple prompt (eg. "Check if GIT is installed and print out a simple "Yes" or "No" as response).

- The autodetect components mode will show a prompt that checks all tickboxes (just like the terminal command) and then prints out a response with the same format as the terminal command.

> Note that the agent is supposed to be run with the HISE repository as work directory so this should somehow be validated before doing any work.

- on the generate script page, the instructions will not show how to run the script in the terminal, but how to setup the AI agent to perform these steps:
  - must validate that the AI agent is in the HISE repo as work directory
  - must validate that the AI agent has admin read & write privilege and is not in
    plan (read-only) mode

- The script preview should not contain a terminal script, but the exact prompt that the user can paste into the AI agent. This should then use a simple markdown syntax highlighter. The download option should be greyed out in this case as we're only using the paste workflow

## Feature 2: IDE Toolset Installation workflow

Installing the IDE toolset (VS2026 / Xcode) is a very long process that requires a lot of user interaction. I would like to move that out of the automatic script process and offer the user a download link with a simple instruction to just download & install the IDE toolkit **before** running the script. It can use the UI component that shows the planned steps and instead of "Will run" you can add a download / external link button to the URL of the download. This should be used for installing these tools:

- VS2026 Community Edition (Windows)
- IPP (Windows)
- XCode / command line tools (macOS)

Then the instruction list should be updated and tell the user to download & run the installers before proceeding with executing the automated part. Ideally it should add the UI component that checks the availability of the IDE tools from the setup page again so people can confirm this before moving on.

## Feature 3: Easy mode / Dev mode

I would like to optimize the wording of the explanations of each step a bit. Ideally we would have two modes:

1. Easy mode. Assume that the developer does not have experience with setting up development environments or terminal usage so explain these steps more thoroughly.
2. Dev mode. Assume that the developer already has used terminal commands and give precise information about what each step will doo.

These modes should be switchable at the beginning of the setup page.

## Feature 4: Consistent page layout

I noticed that the UI components that give additional information are not consistently styled (eg. the Tip with the File explorer looks differently than than the "How it works" for the Auto-Detect Component feature). Also I notice that the order in the page layout is sometimes backwards - eg. the Hint to check all components on the setup page is at the bottom while I would expect to read it before looking at the tick boxes.



