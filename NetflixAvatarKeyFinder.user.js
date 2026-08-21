// ==UserScript==
// @name         Netflix Avatar Key Finder
// @namespace    https://www.netflix.com/
// @version      1.3
// @description  Finds Netflix avatar keys and allows you to copy them.
// @author       starwarsdan3000 + Claude
// @match        https://www.netflix.com/settings/profile/edit/*
// @grant        none
// ==/UserScript==

(function () {
    console.log("Netflix Avatar Finder script loaded.");

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '10px';
    container.style.right = '10px';
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    container.style.color = 'white';
    container.style.padding = '10px';
    container.style.zIndex = '9999';
    container.style.borderRadius = '8px';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';

    const executeButton = document.createElement('button');
    executeButton.innerHTML = 'Grab Avatar Key';
    executeButton.style.padding = '10px';
    executeButton.style.border = 'none';
    executeButton.style.backgroundColor = '#007bff';
    executeButton.style.color = 'white';
    executeButton.style.cursor = 'pointer';
    executeButton.style.borderRadius = '4px';

    const openRedditButton = document.createElement('button');
    openRedditButton.innerHTML = 'Join the Avatar Key Compilation';
    openRedditButton.style.padding = '10px';
    openRedditButton.style.border = 'none';
    openRedditButton.style.backgroundColor = '#ff0000';
    openRedditButton.style.color = 'white';
    openRedditButton.style.cursor = 'pointer';
    openRedditButton.style.borderRadius = '4px';
    openRedditButton.style.marginTop = '10px';

    const copyrightText = document.createElement('p');
    copyrightText.innerHTML = 'Made by starwarsdan3000 &copy; 2025.';
    copyrightText.style.fontSize = '12px';
    copyrightText.style.color = '#bbb';
    copyrightText.style.marginTop = '10px';

    container.appendChild(executeButton);
    container.appendChild(openRedditButton);
    container.appendChild(copyrightText);
    document.body.appendChild(container);

    // Generic JS-string-escape decoder. Handles \xHH, \uHHHH, and simple
    // single-char escapes, regardless of how many of them appear or how
    // long the run is — unlike a fixed "strip 3 chars after every
    // backslash" rule, this doesn't break when the layout shifts.
    function jsUnescape(str) {
        return str.replace(/\\u([0-9a-fA-F]{4})|\\x([0-9a-fA-F]{2})|\\(.)/g, (m, u, x, c) => {
            if (u) return String.fromCharCode(parseInt(u, 16));
            if (x) return String.fromCharCode(parseInt(x, 16));
            switch (c) {
                case 'n': return '\n';
                case 't': return '\t';
                case '"': return '"';
                case "'": return "'";
                case '\\': return '\\';
                default: return c;
            }
        });
    }

    async function findAvatarAndModify() {
        const pageHTML = document.documentElement.innerHTML.trim();
        const searchPhrase = document.querySelector('input[name="profile-name"]').value;

        console.log("Searching for profile name:", searchPhrase);

        let matches = [];
        if (searchPhrase.includes(' ')) {
            const inputPhrase = searchPhrase.replaceAll(/ /g, '\\\\x20');
            const regex = new RegExp(inputPhrase, 'g');
            matches = [...pageHTML.matchAll(regex)];
        } else {
            const regex = new RegExp(searchPhrase, 'g');
            matches = [...pageHTML.matchAll(regex)];
        }

        if (!matches.length) {
            alert('Could not find the profile name in the page HTML.');
            return;
        }

        const occurrenceIndex = matches[matches.length - 1];
        const position = occurrenceIndex.index;
        console.log("Occurrence found at position:", position);

        const avatarPosition = pageHTML.lastIndexOf('AVATAR', position);
        if (avatarPosition === -1) {
            console.log('Could not find "AVATAR" before the profile name.');
            return;
        }
        console.log('"AVATAR" found at position:', avatarPosition);

        // Grab a generous raw window — big enough to comfortably contain
        // the whole escaped key even if Netflix's layout shifts a bit.
        // We no longer depend on this being an exact length: we decode
        // everything first, then extract the key by shape.
        const rawWindow = pageHTML.substring(avatarPosition, avatarPosition + 400);
        console.log("Raw window grabbed:", rawWindow);

        const decoded = jsUnescape(rawWindow);
        console.log("Decoded window:", decoded);

        // Pull the key out by its actual shape instead of trusting offsets.
        const keyMatch = decoded.match(
            /AVATAR\|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\|\w{2}\|\w{2}\|\d+/
        );

        if (!keyMatch) {
            alert('Could not locate a key of the expected shape in the decoded window.\nCheck the console for the "Decoded window" log and share it if this keeps failing — the escape format may differ from what this script expects.');
            return;
        }

        const modifiedString = keyMatch[0];
        console.log("Extracted key:", modifiedString);

        const alertContainer = document.createElement('div');
        alertContainer.style.position = 'fixed';
        alertContainer.style.top = '50%';
        alertContainer.style.left = '50%';
        alertContainer.style.transform = 'translate(-50%, -50%)';
        alertContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        alertContainer.style.color = 'white';
        alertContainer.style.padding = '20px';
        alertContainer.style.borderRadius = '8px';
        alertContainer.style.zIndex = '10000';
        alertContainer.style.textAlign = 'center';

        const alertMessage = document.createElement('p');
        alertMessage.innerHTML = `Found Avatar Key: <br><strong>${modifiedString}</strong>`;
        alertMessage.style.marginBottom = '15px';
        alertContainer.appendChild(alertMessage);

        const copyBtn = document.createElement('button');
        copyBtn.innerText = 'Copy to Clipboard & Close';
        copyBtn.style.padding = '10px';
        copyBtn.style.border = 'none';
        copyBtn.style.backgroundColor = '#007bff';
        copyBtn.style.color = 'white';
        copyBtn.style.cursor = 'pointer';
        copyBtn.style.borderRadius = '4px';
        alertContainer.appendChild(copyBtn);

        document.body.appendChild(alertContainer);

        copyBtn.addEventListener('click', () => {
            const tempInput = document.createElement('input');
            tempInput.value = modifiedString;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            alert("Copied!");
            document.body.removeChild(alertContainer);
        });
    }

    executeButton.addEventListener('click', findAvatarAndModify);

    openRedditButton.addEventListener('click', () => {
        window.open('https://www.reddit.com/r/netflix/comments/13h9uhr/netflix_profile_icons_compilation_project/', '_blank');
    });
})();
