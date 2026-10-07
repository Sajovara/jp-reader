/*
 * Static reading page for texts generated in the Anki Japanese
 * Highlighter extension. It's a normal web page (unlike the
 * extension's own reader), so other extensions such as Yomitan work
 * here too, and the highlighter's content script treats it like any
 * page.
 *
 * The text arrives in the URL fragment as base64url-encoded UTF-8
 * JSON {title, text, meta, theme, accent} and is only ever decoded and
 * rendered here, in the browser. theme is the extension's UI theme,
 * since this page can't read the extension's storage itself.
 */
function decodeFragment(
    fragment
) {
    const base64 =
        fragment
            .replace(/-/g, "+")
            .replace(/_/g, "/");

    const bytes =
        Uint8Array.from(
            atob(base64),
            character =>
                character.charCodeAt(0)
        );

    return JSON.parse(
        new TextDecoder().decode(
            bytes
        )
    );
}


function render() {
    const article =
        document.getElementById(
            "reader-article"
        );

    const missing =
        document.getElementById(
            "reader-missing"
        );

    const title =
        document.getElementById(
            "reader-title"
        );

    const container =
        document.getElementById(
            "reader-text"
        );

    const meta =
        document.getElementById(
            "reader-meta"
        );

    let entry = null;

    try {
        entry =
            decodeFragment(
                location.hash.slice(1)
            );
    } catch {
        entry = null;
    }

    container.replaceChildren();

    if (
        !entry ||
        typeof entry.text !== "string"
    ) {
        article.hidden = true;
        missing.hidden = false;
        meta.textContent = "";
        document.title = "Reader";

        return;
    }

    article.hidden = false;
    missing.hidden = true;

    if (
        ["warm", "light", "terminal"].includes(
            entry.theme
        )
    ) {
        document.documentElement.dataset.theme =
            entry.theme;
    }

    if (
        typeof entry.accent === "string"
    ) {
        document.documentElement.dataset.accent =
            entry.accent;
    }

    document.title =
        entry.title || "Reader";

    title.textContent =
        entry.title || "";

    meta.textContent =
        entry.meta || "";

    for (
        const paragraph
        of entry.text
            .split(/\n\s*\n/)
            .map(
                block =>
                    block.trim()
            )
            .filter(Boolean)
    ) {
        const element =
            document.createElement(
                "p"
            );

        element.textContent =
            paragraph;

        container.appendChild(
            element
        );
    }
}


render();

window.addEventListener(
    "hashchange",
    render
);
