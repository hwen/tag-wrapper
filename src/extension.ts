'use strict';
import {commands, window, TextDocument, TextEditorEdit, ExtensionContext, Position, SnippetString, Selection} from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

    let disposable = commands.registerCommand('extension.wrapTag', ()=> {

        let editor = window.activeTextEditor;
        if (!editor || !(editor.document.languageId === 'html') ) return;


        let selection = editor.selection;
        let selectedText = editor.document.getText(selection);
        let wrapper = new TagWrapper(selectedText, selection);

        if (wrapper.isAvaliableTag) {
            editor.insertSnippet(wrapper.snippet); //insert snippet to replace the selection text
        }

    })

    context.subscriptions.push(disposable);
}


// this method is called when your extension is deactivated
export function deactivate() {
}


class TagWrapper {
    private replacementTag = 'div';
    private selectedText: string;

    constructor(selectedText: string, selection: Selection) {
        this.selectedText = this.formatSelectedText(selectedText, selection); 
    }

    get snippet(): SnippetString {
        return this.generateSnippet();
    }

    get isAvaliableTag(): boolean {
        return /\<(.|\n)*\>/g.test(this.selectedText);
    }

    private generateSnippet(): SnippetString {
        let sn = new SnippetString();

        sn.appendText('<')
        sn.appendTabstop(1)
        sn.appendPlaceholder(`${this.replacementTag}`, 1)
        sn.appendText(`>\n${this.selectedText}</`)
        sn.appendPlaceholder(`${this.replacementTag}`, 1)
        sn.appendText('>')  

        return sn;
    }

    //format multi line selected text
    private formatSelectedText(selectedText: string, selection: Selection): string {
        let start = selection.start.character,
            textArr = selectedText.split('\n');

        let formated = '';    
        textArr.forEach((line, index)=> {

            formated += index === 0 ? `\t${line}\n` : `\t${line.substr(start)}\n`;

        })

        return formated;
    };    
}
