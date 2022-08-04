'use strict';
import { commands, window, TextDocument, TextEditorEdit, ExtensionContext, Position, SnippetString, Selection } from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

  let wrapTag = commands.registerCommand('extension.wrapTag', () => {
    const editor = window.activeTextEditor;
    // if (!editor || !(editor.document.languageId === 'html')) return;
    if (!editor)
        return;
    let selection = editor.selection;
    let selectedText = editor.document.getText(selection);
    let wrapper = new TagWrapper(selectedText, selection);
    if (wrapper.isAvaliableTag) {
        editor.insertSnippet(wrapper.snippet); //insert snippet to replace the selection text
    }
  });

  let wrapTagNewLine = commands.registerCommand('extension.wrapTagNewLine', () => {
      const editor = window.activeTextEditor;
      // if (!editor || !(editor.document.languageId === 'html')) return;
      if (!editor)
          return;
      let selection = editor.selection;
      let selectedText = editor.document.getText(selection);
      let wrapper = new TagWrapper(selectedText, selection, true);

      // turned off availableTag check because i still cant find its uses
      // and personally i think it's better this way
      
      // if (wrapper.isAvaliableTag) {
          editor.insertSnippet(wrapper.snippet); //insert snippet to replace the selection text
      // }
  });

  context.subscriptions.push(wrapTag, wrapTagNewLine);
}


// this method is called when your extension is deactivated
export function deactivate() {
}


class TagWrapper {
  private replacementTag = 'div';
  private selectedText: string;

  constructor(selectedText: string, selection: Selection, addNewLine : boolean = false) {
    this.selectedText = this.formatSelectedText(selectedText, selection, addNewLine);
  }

  get snippet(): SnippetString {
    return this.generateSnippet();
  }

  get isAvaliableTag(): boolean {
    return /\<(.|\n)*\>/g.test(this.selectedText);
  }

  private generateSnippet(): SnippetString {
    let sn = new SnippetString();

    sn.appendText('<');
    // sn.appendTabstop(1)
    sn.appendPlaceholder(`${this.replacementTag}`, 1);
    sn.appendText(`>${this.selectedText}</`);
    sn.appendPlaceholder(`${this.replacementTag}`, 1) // [the said above]
    //sn.appendText(`${this.replacementTag}`); // i use this one instead of [the above] since i use "auto rename tag" extension
    sn.appendText('>');
    
    return sn;
  }

  //format multi line selected text
  private formatSelectedText(selectedText: string, selection: Selection, addNewLine : boolean): string {
    let start = selection.start.character;
    let textArr;
    let endLine;
    let formated;

    if (!addNewLine){
        if (selectedText.indexOf('\n') > -1) {
            textArr = selectedText.split('\n');
            endLine = '\n';
        }
        else {
            textArr = selectedText.split('\r');
            endLine = '\r';
        }
        formated = '';
        textArr.forEach((line, index) => {
            formated += index === 0 ? `${line}` : `\t${line.substr(start)}`;
            if (index+1 < textArr.length){
                formated += `${endLine}`
            }
        });
    } else {
        if (selectedText.indexOf('\n') > -1) {
            textArr = selectedText.split('\n');
            endLine = '\n';
        }
        else {
            textArr = selectedText.split('\r');
            endLine = '\r';
        }
        formated = `${endLine}`
        textArr.forEach((line, index) => {
            formated += index === 0 ? `\t${line}${endLine}` : `\t${line.substr(start)}${endLine}`;
        });
    }

    return formated;
  };

  dispose() {
    // do nothing
  }
}
