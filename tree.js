const fs = require('fs');
const path = require('path');

// Add directories you want to ignore here
const IGNORED_DIRS = ['node_modules', '.next', '.git'];

function generateDirectoryTree(rootPath) {
    const rootName = path.basename(rootPath);
    let tree = `${rootName}\n`;
    
    function traverseDirectory(currentPath, prefix = '', isLast = true) {
        const entries = fs.readdirSync(currentPath, { withFileTypes: true });
        
        // Filter and sort entries
        const validEntries = entries
            .filter(entry => !IGNORED_DIRS.includes(entry.name))
            .sort((a, b) => {
                // Sort directories first, then files
                if (a.isDirectory() && !b.isDirectory()) return -1;
                if (!a.isDirectory() && b.isDirectory()) return 1;
                return a.name.localeCompare(b.name);
            });

        validEntries.forEach((entry, index) => {
            const isLastEntry = index === validEntries.length - 1;
            const connector = isLast ? '└── ' : '├── ';
            const newPrefix = isLast ? '    ' : '│   ';

            tree += `${prefix}${connector}${entry.name}\n`;

            if (entry.isDirectory()) {
                const nextPath = path.join(currentPath, entry.name);
                traverseDirectory(
                    nextPath,
                    `${prefix}${newPrefix}`,
                    isLastEntry
                );
            }
        });
    }

    traverseDirectory(rootPath);
    return tree;
}

// Usage: node script.js (run from project root)
const projectRoot = process.cwd();
console.log(generateDirectoryTree(projectRoot));