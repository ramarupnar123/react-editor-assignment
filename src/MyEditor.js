import React, { useState, useEffect, useRef } from 'react';
import { Editor, EditorState, RichUtils, Modifier, convertToRaw, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';

function MyEditor() {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const editorRef = useRef(null); // Create a ref for the Editor

  // Load saved content from localStorage on component mount
  useEffect(() => {
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
      const contentState = convertFromRaw(JSON.parse(savedContent));
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, []);

  // Handle editor state change and apply custom styling
  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  // Apply custom styles based on first character in each line
  const handleBeforeInput = (chars) => {
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const blockKey = selection.getStartKey();
    const block = currentContent.getBlockForKey(blockKey);
    const blockText = block.getText();

    // Apply "header" style if line starts with "# "
    if (chars === ' ' && blockText === '#') {
      setEditorState(RichUtils.toggleBlockType(editorState, 'header-one'));
      return 'handled';
    }

    // Apply "bold" style if line starts with "* "
    if (chars === ' ' && blockText === '*') {
      setEditorState(RichUtils.toggleInlineStyle(editorState, 'BOLD'));
      return 'handled';
    }

    // Apply "red" style if line starts with "** "
    if (chars === ' ' && blockText === '**') {
      const contentState = Modifier.applyInlineStyle(
        currentContent,
        selection,
        'RED'
      );
      setEditorState(EditorState.push(editorState, contentState, 'change-inline-style'));
      return 'handled';
    }

    // Apply "underline" style if line starts with "*** "
    if (chars === ' ' && blockText === '***') {
      setEditorState(RichUtils.toggleInlineStyle(editorState, 'UNDERLINE'));
      return 'handled';
    }

    return 'not-handled';
  };

  // Save content to localStorage
  const saveContent = () => {
    const contentState = editorState.getCurrentContent();
    localStorage.setItem('editorContent', JSON.stringify(convertToRaw(contentState)));
    alert('Content saved!');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Demo editor by Your Name</h1> {/* Displaying "Your Name" directly */}
      <div
        style={{ border: '1px solid #ddd', padding: '10px', minHeight: '200px' }}
        onClick={() => editorRef.current.focus()} // Focus the editor on div click
      >
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          handleKeyCommand={handleKeyCommand}
          handleBeforeInput={handleBeforeInput}
          customStyleMap={{
            RED: { color: 'red' },
          }}
          ref={editorRef} // Assign the ref to the Editor
        />
      </div>
      <button onClick={saveContent} style={{ marginTop: '10px' }}>
        Save
      </button>
    </div>
  );
}

export default MyEditor;
