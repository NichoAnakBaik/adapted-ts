"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import * as Hangul from "hangul-js";
import koreanLayout from "simple-keyboard-layouts/build/layouts/korean";

import "react-simple-keyboard/build/css/index.css";

const Keyboard = dynamic(() => import("react-simple-keyboard"), { ssr: false });

export default function KoreanVirtualKeyboard({ 
  value, 
  onChange,
  onClose
}: { 
  value: string; 
  onChange: (val: string) => void;
  onClose?: () => void;
}) {
  const [layoutName, setLayoutName] = useState("default");
  const textRef = React.useRef(value);

  // Sync if value changes from outside (e.g. physical keyboard typing)
  React.useEffect(() => {
    textRef.current = value;
  }, [value]);
  
  const onKeyPress = (button: string) => {
    if (button === "{shift}" || button === "{lock}") {
      setLayoutName(layoutName === "default" ? "shift" : "default");
      return;
    }
    
    let jamoList = Hangul.disassemble(textRef.current);
    
    if (button === "{bksp}") {
      jamoList.pop();
    } else if (button === "{space}") {
      jamoList.push(" ");
    } else if (button === "{enter}") {
      jamoList.push("\n");
    } else if (button === "{tab}") {
      jamoList.push("  ");
    } else {
      jamoList.push(button);
      if (layoutName === "shift" && button !== "{lock}") {
        setLayoutName("default");
      }
    }
    
    const newText = Hangul.assemble(jamoList);
    textRef.current = newText; // Mutasi langsung agar klik cepat tidak pernah memori usang
    onChange(newText); // Beri tahu komponen induk
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl p-4 rounded-3xl border border-gray-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] relative animate-in fade-in zoom-in-95 duration-200">
      <style>{`
        .premium-keyboard {
          background-color: transparent !important;
          padding: 8px 0 0 0 !important;
        }
        .premium-keyboard .hg-row {
          margin-bottom: 10px !important;
        }
        .premium-keyboard .hg-button {
          background: #ffffff !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 0 #e5e7eb !important;
          color: #374151 !important;
          font-family: inherit !important;
          font-weight: 700 !important;
          font-size: 1.1rem !important;
          transition: transform 0.1s, box-shadow 0.1s, background-color 0.1s !important;
          height: 48px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .premium-keyboard .hg-button:hover {
          background: #f9fafb !important;
        }
        .premium-keyboard .hg-button:active {
          transform: translateY(4px) !important;
          box-shadow: 0 0px 0 #e5e7eb !important;
          background: #f3f4f6 !important;
        }
        .premium-keyboard .hg-button-bksp,
        .premium-keyboard .hg-button-enter,
        .premium-keyboard .hg-button-shift,
        .premium-keyboard .hg-button-lock,
        .premium-keyboard .hg-button-tab {
          background: #f3f4f6 !important;
          box-shadow: 0 4px 0 #d1d5db !important;
          color: #4b5563 !important;
          font-size: 0.75rem !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }
        .premium-keyboard .hg-button-bksp:active,
        .premium-keyboard .hg-button-enter:active,
        .premium-keyboard .hg-button-shift:active,
        .premium-keyboard .hg-button-lock:active,
        .premium-keyboard .hg-button-tab:active {
          transform: translateY(4px) !important;
          box-shadow: 0 0px 0 #d1d5db !important;
        }
      `}</style>
      <div className="flex justify-between items-center mb-3 px-1 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-namsan-primary/10 flex items-center justify-center">
            <span className="text-namsan-primary font-bold text-xs">KR</span>
          </div>
          <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">Keyboard Korea</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-xs font-bold bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-500 py-1.5 px-3 rounded-lg transition-colors">
            Tutup
          </button>
        )}
      </div>
      <div className="text-black">
        <Keyboard
          layout={koreanLayout.layout}
          layoutName={layoutName}
          onKeyPress={onKeyPress}
          display={{
            "{bksp}": "⌫ Hapus",
            "{enter}": "↵ Enter",
            "{shift}": "⇧ Shift",
            "{space}": "Spasi",
            "{lock}": "Caps",
            "{tab}": "Tab"
          }}
          theme={"hg-theme-default premium-keyboard"}
        />
      </div>
    </div>
  );
}
