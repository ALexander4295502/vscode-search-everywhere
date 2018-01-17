"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import {
  StatusBarItem,
  window,
  StatusBarAlignment,
  TextDocument,
  commands,
  Disposable
} from "vscode";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "vscode-search-everywhere" is now active!'
  );

  let wordCounter = new WordCounter();
  let controller = new WordCounterController(wordCounter);
  context.subscriptions.push(controller);
  context.subscriptions.push(wordCounter);
}

class WordCounter {
  private _statusBarItem: StatusBarItem;

  public updateWordCount() {
    if (!this._statusBarItem) {
      this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
    }
    let editor = window.activeTextEditor;
    if (!editor) {
      this._statusBarItem.hide();
      return;
    }
    let doc = editor.document;
    if (doc.languageId === "markdown") {
      let wordCount = this._getWordCount(doc);
      this._statusBarItem.text =
        wordCount !== 1 ? `${wordCount} Words` : "1 Word";
      this._statusBarItem.show();
    } else {
      this._statusBarItem.hide();
    }
  }

  public _getWordCount(doc: TextDocument): number {
    let docContent = doc.getText();
    docContent = docContent.replace(/(< ([^>]+)<)/g, "").replace(/\s+/g, " ");
    docContent = docContent.replace(/^\s\s*/, "").replace(/\s\s*$/, "");
    let wordCount = 0;
    if (docContent !== "") {
      wordCount = docContent.split(" ").length;
    }
    return wordCount;
  }

  dispose() {
    this._statusBarItem.dispose();
  }
}

class WordCounterController {
    private _wordCounter: WordCounter;
    private _disposable: Disposable;

    constructor(wordCounter: WordCounter){
        this._wordCounter = wordCounter;
        let subscriptions: Disposable[] = [];
        window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
        window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);

        this._wordCounter.updateWordCount();
        this._disposable = Disposable.from(...subscriptions);
    }

    dispose() {
        this._disposable.dispose();
    }

    private _onEvent() {
        this._wordCounter.updateWordCount();
    }
}

// this method is called when your extension is deactivated
export function deactivate() {}
