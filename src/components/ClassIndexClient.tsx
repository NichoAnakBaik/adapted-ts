"use client";

import React, { useState } from "react";
import { Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export interface ClassData {
  id: string;
  name: string;
  type: string;
  _count?: {
    exams: number;
    enrollments: number;
  };
}

interface ClassIndexClientProps {
  title: string;
  subtitle: string;
  headerIcon: React.ElementType;
  cardIcon: React.ElementType;
  countLabel: string;
  countIcon: React.ElementType;
  actionLabel: string;
  basePath: string;
  classes: ClassData[];
  emptyMessage: string;
  themeColor?: "orange" | "indigo" | "yellow" | "blue" | "purple";
}

export default function ClassIndexClient({
  title,
  subtitle,
  headerIcon: HeaderIcon,
  cardIcon: CardIcon,
  countLabel,
  countIcon: CountIcon,
  actionLabel,
  basePath,
  classes,
  emptyMessage,
  themeColor = "orange"
}: ClassIndexClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Theme mapping
  const themes = {
    orange: {
      bgLight: "bg-red-50",
      textPrimary: "text-namsan-primary",
      bgCardIcon: "bg-orange-50",
      textCardIcon: "text-orange-600",
      borderHover: "hover:border-namsan-primary",
      btnBg: "bg-namsan-soft",
      btnHover: "hover:bg-namsan-primary",
      btnText: "text-namsan-primary",
      btnTextHover: "hover:text-white"
    },
    indigo: {
      bgLight: "bg-indigo-50",
      textPrimary: "text-indigo-600",
      bgCardIcon: "bg-indigo-50",
      textCardIcon: "text-indigo-600",
      borderHover: "hover:border-indigo-500",
      btnBg: "bg-indigo-50",
      btnHover: "hover:bg-indigo-600",
      btnText: "text-indigo-700",
      btnTextHover: "hover:text-white"
    },
    yellow: {
      bgLight: "bg-yellow-50",
      textPrimary: "text-yellow-600",
      bgCardIcon: "bg-yellow-50",
      textCardIcon: "text-yellow-600",
      borderHover: "hover:border-yellow-500",
      btnBg: "bg-yellow-50",
      btnHover: "hover:bg-yellow-500",
      btnText: "text-yellow-700",
      btnTextHover: "hover:text-white"
    },
    blue: {
      bgLight: "bg-blue-50",
      textPrimary: "text-blue-600",
      bgCardIcon: "bg-blue-50",
      textCardIcon: "text-blue-600",
      borderHover: "hover:border-blue-500",
      btnBg: "bg-blue-50",
      btnHover: "hover:bg-blue-600",
      btnText: "text-blue-700",
      btnTextHover: "hover:text-white"
    },
    purple: {
      bgLight: "bg-purple-50",
      textPrimary: "text-purple-600",
      bgCardIcon: "bg-purple-50",
      textCardIcon: "text-purple-600",
      borderHover: "hover:border-purple-500",
      btnBg: "bg-purple-50",
      btnHover: "hover:bg-purple-600",
      btnText: "text-purple-700",
      btnTextHover: "hover:text-white"
    }
  };

  const theme = themes[themeColor];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className={`p-3 ${theme.bgLight} rounded-xl`}>
            <HeaderIcon className={`w-8 h-8 ${theme.textPrimary}`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-namsan-text">{title}</h1>
            <p className="text-sm text-namsan-text-muted">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <input 
          type="text" 
          placeholder="Cari nama kelas..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full md:max-w-md p-2.5 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-gray-300 outline-none transition-colors`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((c) => (
          <div key={c.id} className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col ${theme.borderHover} transition-colors group`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 ${theme.bgCardIcon} rounded-xl flex items-center justify-center ${theme.textCardIcon}`}>
                <CardIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`font-bold text-lg text-namsan-text group-hover:${theme.textPrimary} transition-colors`}>{c.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 uppercase tracking-wider">
                  {c.type}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <CountIcon className="w-4 h-4 text-gray-400" />
                {c._count?.exams || 0} {countLabel}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Users className="w-4 h-4 text-gray-400" />
                {c._count?.enrollments || 0} Siswa
              </div>
            </div>

            <Link href={`${basePath}/${c.id}`} className={`mt-auto w-full ${theme.btnBg} ${theme.btnHover} ${theme.btnText} ${theme.btnTextHover} font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors`}>
              {actionLabel} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}

        {filteredClasses.length === 0 && (
          <div className="col-span-full text-center p-8 text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
            {searchQuery ? "Tidak ada kelas yang sesuai pencarian." : emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
}
