# PromptCurtain

**Keep the useful context in your AI prompts. Hide the personal details.**

PromptCurtain is a portable, offline tool for reviewing, protecting and restoring everyday AI prompts—with Markdown support and no installation.

Open a single HTML file in your browser, review the sensitive details, and copy the protected prompt into your AI tool. Paste the AI's reply back to restore matching values. Your text stays on your device, with no accounts, model downloads, telemetry or browser storage.

## 🚀 Get started

1. [Download PromptCurtain](https://github.com/ikelaiah/prompt-curtain/archive/refs/heads/main.zip) and unzip it, or clone this repository.
2. Open `index.html` in a current browser. There’s nothing to install and no account to create.
3. Paste your text, review the highlighted details, and copy the protected version into your AI tool.
4. Paste the AI’s reply into **AI reply** to restore matching details on your device.

Try one of the fictional IT, education, or payroll examples to see how it works.

## 🎭 Choose how details are hidden

| Mode | What happens | Example |
| --- | --- | --- |
| **Mask** | Replaces a value with a consistent label, which can be restored in the reply. | `alex.morgan@example.com` → `[EMAIL_1]` |
| **Redact** | Hides some characters and keeps others visible. | `alex.morgan@example.test` → `al*******an@example.test` |

Mask is usually the better choice when you want the AI’s reply to refer to a detail that you can restore later. Redact leaves some information visible, such as an email domain or the last digits of some numbers.

If PromptCurtain misses something, select it in **Original text** and choose **Protect selection**. You can also add a phrase to protect every matching occurrence. Manual selections are cleared when you edit the source text, so old selections can’t accidentally point to the wrong words.

## ✍️ Work with Markdown

The original prompt and AI reply accept Markdown. Switch between **Edit** and **Preview** in either input panel. The protected prompt and restored reply are formatted automatically. Copy buttons preserve the Markdown source while applying protection or restoration.

HTML is shown as text. Links and images show their label and destination without navigating or loading the image.

## 🔐 Credentials and secrets

PromptCurtain fully masks private key blocks, `Bearer` authorization values, and values following common password, token, API key, and secret labels. Detected credentials stay masked in both modes and aren’t restored in the reply. This covers common formats, not every kind of secret; check your text before sharing.

## 🛡️ Your text stays on your device

**Your text never leaves the page, and the browser enforces it.** PromptCurtain is one HTML file with no backend.

| Question | Answer |
| --- | --- |
| Is text sent anywhere? | No. Detection, masking, previews and restoration run in the page. |
| What stops it from sending? | The page’s Content Security Policy: `default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'`. The browser blocks network requests, form posts and every remote script, style, font or image. Inline code is allowed because the whole app is one file. |
| Third-party code? | None. No external scripts, fonts, CDN, analytics or trackers. |
| Accounts, cookies, telemetry? | None. |
| What is stored? | Nothing. No cookies, `localStorage` or IndexedDB. Text and the restoration mapping live in page memory only. |
| What can leave the page? | Only what you copy to the clipboard. |
| Who sees the page load? | The host (GitHub Pages, or your own server) logs a normal file request. Save `index.html` and open it from disk to avoid even that. |

Reload the page and everything is gone. **Clear text** clears the current prompt, reply, mapping and custom phrases.

### Verify it yourself

1. Open DevTools (**F12**) → **Network**, reload, then clear the list.
2. Paste a prompt, protect it, restore a reply. The list stays empty.
3. Go offline. Everything still works.
4. View source: the CSP `<meta>` tag is on line 4. The automated browser test also fails on any external request.

When you copy a protected prompt, PromptCurtain keeps its mapping in the open page so it can restore matching values in the reply. It only restores protected values the AI actually returns. If the AI omits a detail, PromptCurtain won’t add it back.

## ⚠️ Know the limits

PromptCurtain uses patterns and context cues; it doesn’t understand every document or language. It can miss personal information or flag ordinary text by mistake. Review the highlighted text and the final prompt before sharing. Add custom phrases or protect a selected span when needed.

Names are most likely to be detected after cues such as `Name:`, `Student:`, or `Employee:`. Network and drive paths are supported; put paths containing spaces in quotes, for example `"\\school-server\Student Records\report.docx"`. Unquoted paths end at a space or punctuation. Review the entire path before copying.

Restoration works most reliably with numbered Mask labels. If a placeholder is changed, unknown, or ambiguous, it stays as written. Redacted values can only be restored when the returned value still matches one original detail.

## 🧑‍💻 For contributors

The app is a standalone `index.html` file. Node.js is needed only to run the checks. Pull requests run the unit tests and synthetic detection benchmark through GitHub Actions.

```powershell
node --test tests/*.test.cjs
node scripts/evaluate.js
```

The benchmark uses a small set of fictional examples to track exact detection spans. It helps catch regressions; its scores do not predict accuracy on real prompts.

An optional Chrome browser check is available in `tests/browser.cjs`. It needs an isolated headless Chrome instance with remote debugging enabled on port 9223; see the comments at the top of that file for setup details.
