import React, { useCallback, useMemo, useRef, useState } from 'react';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import { Button } from 'components/shadcn/ui/button';
import { htmlContent, markdownContent } from './data';
import { Mic, Sparkles } from 'lucide-react';
import { Input } from 'components/shadcn/input';
interface ITextEditor {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
}
const TextEditor = ({ value, setValue }: ITextEditor) => {
  const [tooltip, setTooltip] = useState({
    visible: false,
    position: { top: 0, left: 0, right: 0, bottom: 0 },
    text: '',
  });
  const quill = useRef<ReactQuill | null>(null);
  function handler() {
    console.log(value);
  }

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const imageUrl = reader.result as string;
          if (quill.current && typeof quill.current.getEditor === 'function') {
            const quillEditor = quill.current.getEditor();
            const range = quillEditor.getSelection(true);
            quillEditor.insertEmbed(range.index, 'image', imageUrl);
          }
        };
      }
    };
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [2, 3, 4, false] }],
          ['bold', 'italic', 'underline', 'blockquote'],
          [{ color: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          // ["link", "image"],
          ['clean'],
        ],
        handlers: {
          image: imageHandler,
        },
      },
      clipboard: {
        matchVisual: true,
      },
    }),
    [imageHandler],
  );

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'color',
  ];

  return (
    <div className='relative py-4'>
      <ReactQuill
        theme='snow'
        value={value}
        onChange={setValue}
        ref={quill}
        modules={modules}
        formats={formats}
        className=' my-6 h-[500px]'
      />
    </div>
  );
};

export default TextEditor;
