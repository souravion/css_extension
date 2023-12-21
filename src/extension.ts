import * as vscode from 'vscode';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    console.log('CSS Class Autocomplete extension is activated');
    
    const cssClasses: CSSClass[] = loadJSONFile(context.asAbsolutePath('src/assets/cssClass.json')) || [];
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            'html', new CSSClassCompletionProvider(cssClasses)
        )
    );
}

class CSSClassCompletionProvider implements vscode.CompletionItemProvider {
    private cssClasses: CSSClass[];

    constructor(cssClasses: CSSClass[]) {
        this.cssClasses = cssClasses;
    }

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.CompletionItem[] {
        //'css' section
        const linePrefix = document.lineAt(position).text.substr(0, position.character);
        const match = linePrefix.match(/class=["']([^"']*)$/);

        if (match) {
            const currentClasses = match[1].split(' ');
            const suggestions = this.getCSSClassSuggestions(currentClasses);

            return suggestions.map(cls => {
                const item = new vscode.CompletionItem(cls.name, vscode.CompletionItemKind.Variable);
                item.detail = `Value: ${cls.value}`;
                item.documentation = cls.description;
                return item;
            });
        }
        //'color' section
        const colorMatch = linePrefix.match(/color=["']([^"']*)$/);
        if (colorMatch) {
            const colorSuggestions = this.getColorSuggestions();
            
            return colorSuggestions.map(color => {
                const item = new vscode.CompletionItem(color.name, vscode.CompletionItemKind.Color);
                item.documentation = `Theme: ${JSON.stringify(color.theme, null, 2)}`;
                // item.range = new vscode.Range(position.translate(0, -colorMatch[1].length), position);
                return item;
            });
        }
        return [];
    }

    private getColorSuggestions(): Color[] {
        return [
            { name: 'red', theme: { lightHexCode: '#ff0000', darkHexCode: '#ff000f' } }

        ];
    }



    private getCSSClassSuggestions(currentClasses: string[]): CSSClass[] {
        return this.cssClasses.filter(cls => !currentClasses.includes(cls.name));
    }
}

function loadJSONFile(filePath: string): CSSClass[] | null {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error:any) {
        console.error(`Error loading JSON file ${filePath}: ${error.message}`);
        return null;
    }
}

interface CSSClass {
    name: string;
    value: string;
    description: string;
}

interface Color {
    name: string;
    theme: {
        lightHexCode: string;
        darkHexCode: string;
    }
}