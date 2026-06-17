"use client";

import React, { useState, useRef, useEffect } from "react";
import { Keyboard as KeyboardIcon } from "lucide-react";
import * as Hangul from "hangul-js";
import KoreanVirtualKeyboard from "./KoreanVirtualKeyboard";

export function KoreanInput({ onValueChange, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { onValueChange?: (val: string) => void }) {
  const [internalValue, setInternalValue] = useState(props.defaultValue || "");
  const [showKeyboard, setShowKeyboard] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowKeyboard(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentValue = props.value !== undefined ? props.value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
    if (props.onChange) props.onChange(e);
    if (onValueChange) onValueChange(e.target.value);
  };

  const handleKeyboardChange = (val: string) => {
    setInternalValue(val);
    if (onValueChange) onValueChange(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Hanya aktif jika Virtual Keyboard sedang dibuka
    if (!showKeyboard) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    
    // Ignore non-character keys (except Backspace)
    if (e.key.length > 1 && e.key !== 'Backspace') return;

    const engToKor: Record<string, string> = {
      'q': 'ㅂ', 'w': 'ㅈ', 'e': 'ㄷ', 'r': 'ㄱ', 't': 'ㅅ', 'y': 'ㅛ', 'u': 'ㅕ', 'i': 'ㅑ', 'o': 'ㅐ', 'p': 'ㅔ',
      'a': 'ㅁ', 's': 'ㄴ', 'd': 'ㅇ', 'f': 'ㄹ', 'g': 'ㅎ', 'h': 'ㅗ', 'j': 'ㅓ', 'k': 'ㅏ', 'l': 'ㅣ',
      'z': 'ㅋ', 'x': 'ㅌ', 'c': 'ㅊ', 'v': 'ㅍ', 'b': 'ㅠ', 'n': 'ㅜ', 'm': 'ㅡ',
      'Q': 'ㅃ', 'W': 'ㅉ', 'E': 'ㄸ', 'R': 'ㄲ', 'T': 'ㅆ', 'O': 'ㅒ', 'P': 'ㅖ'
    };

    if (engToKor[e.key]) {
      e.preventDefault();
      const jamoList = Hangul.disassemble(String(currentValue));
      jamoList.push(engToKor[e.key]);
      handleKeyboardChange(Hangul.assemble(jamoList));
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      const jamoList = Hangul.disassemble(String(currentValue));
      jamoList.pop();
      handleKeyboardChange(Hangul.assemble(jamoList));
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative flex items-center">
        <input 
          {...props} 
          value={currentValue}
          onChange={handleChange}
          // onKeyDown={handleKeyDown} // DISEMBUNYIKAN SEMENTARA
          className={`${props.className || ""} pr-3`} // Dulu pr-10
        />
        {/* DISEMBUNYIKAN SEMENTARA: Tombol Keyboard Virtual
        <button 
          type="button"
          onClick={() => setShowKeyboard(!showKeyboard)}
          className="absolute right-2 p-1.5 text-gray-400 hover:text-namsan-primary transition-colors bg-white/80 rounded-md"
        >
          <KeyboardIcon className="w-5 h-5" />
        </button>
        */}
      </div>
      {showKeyboard && (
        <div className="absolute z-50 top-full left-0 mt-2 w-[calc(100vw-32px)] sm:w-[500px] max-w-[90vw]">
          <KoreanVirtualKeyboard 
            value={String(currentValue)} 
            onChange={handleKeyboardChange} 
            onClose={() => setShowKeyboard(false)}
          />
        </div>
      )}
    </div>
  );
}

export function KoreanTextarea({ onValueChange, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { onValueChange?: (val: string) => void }) {
  const [internalValue, setInternalValue] = useState(props.defaultValue || "");
  const [showKeyboard, setShowKeyboard] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowKeyboard(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentValue = props.value !== undefined ? props.value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInternalValue(e.target.value);
    if (props.onChange) props.onChange(e);
    if (onValueChange) onValueChange(e.target.value);
  };

  const handleKeyboardChange = (val: string) => {
    setInternalValue(val);
    if (onValueChange) onValueChange(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showKeyboard) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key.length > 1 && e.key !== 'Backspace' && e.key !== 'Enter') return;

    const engToKor: Record<string, string> = {
      'q': 'ㅂ', 'w': 'ㅈ', 'e': 'ㄷ', 'r': 'ㄱ', 't': 'ㅅ', 'y': 'ㅛ', 'u': 'ㅕ', 'i': 'ㅑ', 'o': 'ㅐ', 'p': 'ㅔ',
      'a': 'ㅁ', 's': 'ㄴ', 'd': 'ㅇ', 'f': 'ㄹ', 'g': 'ㅎ', 'h': 'ㅗ', 'j': 'ㅓ', 'k': 'ㅏ', 'l': 'ㅣ',
      'z': 'ㅋ', 'x': 'ㅌ', 'c': 'ㅊ', 'v': 'ㅍ', 'b': 'ㅠ', 'n': 'ㅜ', 'm': 'ㅡ',
      'Q': 'ㅃ', 'W': 'ㅉ', 'E': 'ㄸ', 'R': 'ㄲ', 'T': 'ㅆ', 'O': 'ㅒ', 'P': 'ㅖ'
    };

    if (engToKor[e.key]) {
      e.preventDefault();
      const jamoList = Hangul.disassemble(String(currentValue));
      jamoList.push(engToKor[e.key]);
      handleKeyboardChange(Hangul.assemble(jamoList));
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      const jamoList = Hangul.disassemble(String(currentValue));
      jamoList.pop();
      handleKeyboardChange(Hangul.assemble(jamoList));
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <textarea 
          {...props} 
          value={currentValue}
          onChange={handleChange}
          // onKeyDown={handleKeyDown} // DISEMBUNYIKAN SEMENTARA
          className={`${props.className || ""} pr-3`} // Dulu pr-10
        />
        {/* DISEMBUNYIKAN SEMENTARA
        <button 
          type="button"
          onClick={() => setShowKeyboard(!showKeyboard)}
          className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-namsan-primary transition-colors bg-white/80 rounded-md"
        >
          <KeyboardIcon className="w-5 h-5" />
        </button>
        */}
      </div>
      {showKeyboard && (
        <div className="absolute z-50 top-full left-0 mt-2 w-[calc(100vw-32px)] sm:w-[500px] max-w-[90vw]">
          <KoreanVirtualKeyboard 
            value={String(currentValue)} 
            onChange={handleKeyboardChange} 
            onClose={() => setShowKeyboard(false)}
          />
        </div>
      )}
    </div>
  );
}
