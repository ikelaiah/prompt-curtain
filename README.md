# PromptCurtain

A self-contained website for masking or redacting personal information before sharing a prompt with an AI tool. Open **index.html** in a browser; no build, dependency installation, or server required.

Text is processed locally and kept in page memory. No external scripts, fonts, analytics, API calls, cookies, or browser storage are used. A Content Security Policy blocks network connections.

## Use

1. Paste a prompt or try the fictional example.
2. Choose categories and review detections. Add custom names or phrases for anything missed.
3. Choose **Mask** for consistent numbered placeholders or **Redact** to partially hide values with asterisks.
4. Copy the protected text into your AI tool. This also saves the original-value mapping in this page’s memory.
5. Paste the AI response into **AI reply**. Review and copy the **Restored reply**, with original details reinserted locally.

Panels **01 Original text** and **03 AI reply** accept Markdown in **Edit** and render it in **Preview**. Panels **02 Protected text** and **04 Restored reply** render Markdown automatically, including headings, bold/italic text, lists, tables, blockquotes, and code blocks. Both copy buttons copy the underlying Markdown source, preserving its syntax while applying protection or restoration. If clipboard access fails, a read-only field selects that Markdown source for manual copying.

HTML is displayed literally. Markdown links and images show their labels and destinations as text; previews do not navigate or load images. The MIT-licensed Marked 18.0.14 parser and its license are embedded in `index.html` to keep the page self-contained and offline. Protected values remain literal and highlighted in the rendered preview.

For `ivan.kolalah@gmail.com`, Mask gives `[EMAIL_1]`; Redact gives `iv********ah@gmail.com`. Redact retains email domains, the last four digits of phones/cards/SSNs, some name characters, and parts of network paths. Mask replaces the entire detected value.

Restoration uses the last copied prompt’s mapping, even if you switch modes or edit the source. Before a prompt has been copied, it uses the current preview. Keep the page open: there is no saved history. **Clear text** clears the original text, AI reply, restoration mapping, and custom phrases; loading a fictional example starts a fresh mapping too.

Numbered Mask labels are the most reliable way to restore. Exact partial redactions can also be restored when they identify one original value. Unknown placeholders, ambiguous partial redactions, and values fully hidden behind asterisks remain unchanged. Common Markdown escapes in placeholders or asterisks are supported. Replacements happen once, so the original content cannot trigger another restoration. The restored reply contains original personal details.

The AI may return some, all, or none of the protected fields. Restoration replaces only matching fields present in its reply. It never adds omitted details or guesses what the AI meant. Replies with no matching fields show **Reply unchanged** and can be copied as received; mixed replies preserve all surrounding content while restoring the matches.

Use the header’s theme button to switch between light and dark. The initial theme follows your device preference; theme choices stay in page memory. Fictional examples are available for IT technicians, educators, and payroll staff, with custom phrases demonstrating protection of device, student, and employee identifiers.

**Network & drive paths** covers Windows UNC shares (`\\server\share\file.txt`), SMB URLs (`smb://server/share/file.txt`), and Windows drive paths (`P:\Payroll\staff.csv`). Both mapped and local drive paths are protected because text alone cannot tell which a drive letter represents. Paths use consistent `[PATH_1]` placeholders in Mask mode. Redact partially hides each path segment while retaining separators and drive/scheme prefixes. Put paths containing spaces in quotes so the full path is captured, for example `"\\school-server\Student Records\Jamie Smith.docx"`. Unquoted paths end at whitespace or punctuation; review any remaining details.

Detection uses patterns, not a language model. It covers emails, common phone formats, English street addresses, Luhn-valid card numbers, US SSNs, IPv4 addresses, network/drive paths, and names following cues such as `Name:`, `Student:`, `Employee:`, or `My name is`. It can miss personal details and identify false positives. Use custom phrases for school names, device names, student/employee IDs, bank accounts, tax identifiers outside the US, and other work-specific details. Review all output before sharing.

## Verification

Run the dependency-free redaction tests with Node.js:

```powershell
node --test tests/*.test.cjs
```

The optional browser test uses a dedicated headless Chrome instance with remote debugging on port 9223. With that running, use `node tests/browser.cjs`. It checks the main workflow, Markdown rendering in all four panels, Markdown clipboard preservation, literal handling of HTML, runtime errors, external requests, and horizontal overflow at 320, 768, 1024, and 1440 pixels. Screenshots are saved to the ignored `tests/artifacts` directory.
